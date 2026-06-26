import { firebaseEnabled, loadFirebase, getFb } from "./firebase.js";

let currentUser = null;
let currentProfile = null;
let authReady = false;
const listeners = new Set();

/* ---- Demo storage (works without Firebase) ---- */
const DEMO_USERS_KEY = "campus.demoUsers";
const SESSION_KEY    = "campus.demoSession";
const PROFILE_KEY    = "campus.profile";
const readDemo  = () => { try { return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "{}"); } catch { return {}; } };
const writeDemo = (u) => localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(u));

export const onUser = (cb) => { listeners.add(cb); cb(currentUser); return () => listeners.delete(cb); };
const notify = () => listeners.forEach(l => l(currentUser));

export const isAuthReady = () => authReady;
export const onAuthReady = (cb) => {
  if (authReady) cb(currentUser);
  else {
    const t = setInterval(() => {
      if (authReady) { clearInterval(t); cb(currentUser); }
    }, 30);
  }
};

/* ---- Profile helpers ---- */
const cacheProfile = (p) => {
  currentProfile = p || null;
  if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  else   localStorage.removeItem(PROFILE_KEY);
};
const loadCachedProfile = () => {
  try { currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { currentProfile = null; }
};
export const getProfile = () => currentProfile;
export const isAdminUser = () => currentProfile?.role === "admin";
export const isModeratorUser = () => currentProfile?.role === "moderator" || currentProfile?.role === "admin";
export const canModerate = () => isModeratorUser();
export const isBlockedUser = () => !!currentProfile?.blocked;
export const assertNotBlocked = () => {
  if (isBlockedUser()) throw new Error("ანგარიში დაბლოკილია — წერა და შეფასებები შეზღუდულია");
};

const fetchProfileFB = async (uid) => {
  const fb = getFb(); if (!fb) return null;
  try {
    const snap = await fb.getDoc(fb.doc(fb.db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.warn("profile fetch failed", e); return null; }
};

/* ---- Pending profile (between register and email verification) ---- */
const PENDING_PROFILE_KEY = (email) => `campus.pendingProfile.${(email || "").toLowerCase()}`;
const readPendingProfile  = (email) => { try { return JSON.parse(localStorage.getItem(PENDING_PROFILE_KEY(email)) || "null"); } catch { return null; } };
const writePendingProfile = (email, data) => { try { localStorage.setItem(PENDING_PROFILE_KEY(email), JSON.stringify(data)); } catch {} };
const clearPendingProfile = (email) => { try { localStorage.removeItem(PENDING_PROFILE_KEY(email)); } catch {} };

/** Create Firestore users/{uid} on first verified sign-in (not at register-time). */
const bootstrapProfileIfMissing = async (fb, user) => {
  if (!fb || !user) return null;
  const existing = await fetchProfileFB(user.uid);
  if (existing) return existing;
  const email = (user.email || "").toLowerCase();
  const pending = readPendingProfile(email);
  const ADMIN_BOOTSTRAP = "nika.gogokhiya27@gmail.com";
  const role = email === ADMIN_BOOTSTRAP ? "admin" : (pending?.role || "student");
  const [fnGuess, lnGuess] = (user.displayName || "").trim().split(/\s+/);
  const full = {
    role,
    firstName: pending?.firstName || fnGuess || "",
    lastName:  pending?.lastName  || lnGuess || "",
    email,
    personalId: pending?.personalId || "",
    phone:      pending?.phone || "",
    uid: user.uid,
    blocked: false,
    createdAt: fb.serverTimestamp(),
    lastLoginAt: null,
    photoURL: user.photoURL || null,
  };
  try {
    await fb.setDoc(fb.doc(fb.db, "users", user.uid), full);
    try {
      await fb.addDoc(fb.collection(fb.db, "logs"), {
        type: "register",
        actorUid: user.uid,
        actorEmail: email,
        meta: { role, source: "post-verify" },
        createdAt: fb.serverTimestamp(),
      });
    } catch {}
    clearPendingProfile(email);
    return full;
  } catch (e) {
    console.warn("profile bootstrap failed", e);
    return null;
  }
};

/* ---- System logging ---- */
export const logEvent = async (type, meta = {}) => {
  if (!firebaseEnabled) return;
  const fb = getFb(); if (!fb) return;
  try {
    await fb.addDoc(fb.collection(fb.db, "logs"), {
      type,
      actorUid: currentUser?.uid || null,
      actorEmail: currentUser?.email || null,
      meta,
      createdAt: fb.serverTimestamp(),
    });
  } catch (e) { console.warn("log failed", e); }
};

/* ---- Init ---- */
const fallbackToDemo = (reason) => {
  if (authReady) return;
  if (reason) console.warn("Auth fallback to demo:", reason);
  try { currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch {}
  loadCachedProfile();
  authReady = true;
  notify();
};

if (firebaseEnabled) {
  const failsafe = setTimeout(() => fallbackToDemo("timeout"), 4000);
  loadFirebase().then((fb) => {
    fb.onAuthStateChanged(fb.auth, async (u) => {
      clearTimeout(failsafe);
      // Block unverified users from being treated as signed-in
      if (u && !u.emailVerified) {
        currentUser = null;
        cacheProfile(null);
        authReady = true;
        notify();
        return;
      }
      currentUser = u;
      if (u) {
        let p = await fetchProfileFB(u.uid);
        if (!p) p = await bootstrapProfileIfMissing(fb, u);
        cacheProfile(p);
      } else {
        cacheProfile(null);
      }
      authReady = true;
      notify();
    });
  }).catch((err) => {
    clearTimeout(failsafe);
    fallbackToDemo(err);
  });
} else {
  fallbackToDemo();
}

/* ---- Profile smart refresh: refetch on window focus (session-based, throttled) ---- */
let _lastProfileFetch = 0;
const PROFILE_REFETCH_THROTTLE = 60 * 1000; // 1 minute minimum between refetches
const refreshProfileFromServer = async () => {
  if (!firebaseEnabled || !currentUser?.uid) return;
  if (Date.now() - _lastProfileFetch < PROFILE_REFETCH_THROTTLE) return;
  _lastProfileFetch = Date.now();
  try {
    const p = await fetchProfileFB(currentUser.uid);
    if (!p) return;
    // Detect change before triggering notify
    const prev = JSON.stringify(currentProfile || {});
    const next = JSON.stringify(p);
    if (prev !== next) {
      cacheProfile(p);
      notify();
    }
  } catch (e) { console.warn("profile refresh failed", e); }
};
if (typeof window !== "undefined") {
  window.addEventListener("focus", refreshProfileFromServer);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshProfileFromServer(); });
}


export const getUser = () => currentUser;

export const getDisplayName = () => {
  const p = currentProfile;
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(" ");
  const u = currentUser;
  return u?.displayName || u?.email?.split("@")[0] || "სტუდენტო";
};

export const getFirstName = () => {
  const p = currentProfile;
  if (p?.firstName) return p.firstName.trim();
  const u = currentUser;
  const dn = u?.displayName?.trim();
  if (dn) return dn.split(/\s+/)[0];
  return u?.email?.split("@")[0] || "სტუდენტო";
};

export const setDisplayName = (name) => {
  const displayName = (name || "").trim();
  if (!displayName) return;
  currentUser = currentUser || { uid: "demo-local", email: "demo@campus.local" };
  currentUser = { ...currentUser, displayName };
  currentProfile = { ...(currentProfile || {}), firstName: displayName, lastName: "" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
  notify();
};

export const updateProfileData = async (patch) => {
  currentProfile = { ...(currentProfile || {}), ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
  if (currentUser?.email) {
    const users = readDemo();
    if (users[currentUser.email]) {
      users[currentUser.email].profile = { ...users[currentUser.email].profile, ...patch };
      writeDemo(users);
    }
  }
  if (firebaseEnabled && currentUser?.uid) {
    const fb = getFb();
    if (fb) {
      try { await fb.updateDoc(fb.doc(fb.db, "users", currentUser.uid), patch); } catch (e) { console.warn("profile update sync failed", e); }
    }
  }
  notify();
};

/* ---- Validation ---- */
const GEORGIAN_RX = /^[\u10D0-\u10FA\u10FC\u10FD\u10FE\u10FF\s\-]+$/;
const PID_RX      = /^\d{11}$/;
const PHONE_RX    = /^[\d+\-\s()]{6,20}$/;
const EMAIL_RX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDU_GE_RX   = /^[^\s@]+@[^\s@]+\.edu\.ge$/i;
const ADMIN_BOOTSTRAP_EMAILS = ["nika.gogokhiya27@gmail.com"];
export const isEduGeEmail = (email) => {
  const e = (email || "").trim().toLowerCase();
  if (!e) return false;
  if (ADMIN_BOOTSTRAP_EMAILS.includes(e)) return true;
  return EDU_GE_RX.test(e);
};

export const validateProfile = (p) => {
  const errors = {};
  if (!p.firstName || !GEORGIAN_RX.test(p.firstName.trim()))
    errors.firstName = "სახელი მხოლოდ ქართული ასოებით";
  if (!p.lastName || !GEORGIAN_RX.test(p.lastName.trim()))
    errors.lastName = "გვარი მხოლოდ ქართული ასოებით";
  if (!p.email || !EMAIL_RX.test(p.email.trim()))
    errors.email = "არასწორი ელფოსტა";
  else if (!isEduGeEmail(p.email))
    errors.email = "რეგისტრაცია შესაძლებელია მხოლოდ საგანმანათლებლო ელფოსტით (edu.ge)";
  if (!p.personalId || !PID_RX.test(p.personalId.trim()))
    errors.personalId = "პირადი ნომერი — ზუსტად 11 ციფრი";
  if (!p.phone || !PHONE_RX.test(p.phone.trim()))
    errors.phone = "არასწორი ტელეფონის ნომერი";
  if (!p.password || p.password.length < 6)
    errors.password = "პაროლი მინ. 6 სიმბოლო";
  return errors;
};

/* ---- Email verification error class ---- */
export class EmailNotVerifiedError extends Error {
  constructor(email) {
    super("გთხოვ, დაადასტურე ელფოსტა — შემოწმე საფოსტო ყუთი (და Spam) და დააჭირე ბმულს.");
    this.code = "auth/email-not-verified";
    this.email = email;
  }
}

let _pendingVerifyEmail = null;
let _pendingVerifyPassword = null;
export const getPendingVerifyEmail = () => _pendingVerifyEmail;

/* ---- Login ---- */
export const login = async (email, password) => {
  email = (email || "").trim().toLowerCase();
  if (!isEduGeEmail(email)) {
    throw new Error("შესვლა შესაძლებელია მხოლოდ საგანმანათლებლო ელფოსტით (edu.ge)");
  }
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    const cred = await fb.signInWithEmailAndPassword(fb.auth, email, password);
    if (!cred.user.emailVerified) {
      _pendingVerifyEmail = email;
      _pendingVerifyPassword = password;
      await fb.signOut(fb.auth);
      throw new EmailNotVerifiedError(email);
    }
    // Fetch profile — or create it on first verified login
    let p = await fetchProfileFB(cred.user.uid);
    if (!p) p = await bootstrapProfileIfMissing(fb, cred.user);
    if (!p) {
      await fb.signOut(fb.auth);
      throw new Error("ანგარიში ვერ შეიქმნა — სცადე თავიდან");
    }
    // Update lastLoginAt
    try {
      await fb.updateDoc(fb.doc(fb.db, "users", cred.user.uid), {
        lastLoginAt: fb.serverTimestamp(),
      });
    } catch {}
    cacheProfile({ ...p, lastLoginAt: new Date().toISOString() });
    _pendingVerifyEmail = null;
    _pendingVerifyPassword = null;
    await logEvent("login", { email });
  } else {
    const users = readDemo();
    const rec = users[email];
    if (!rec) throw new Error("მომხმარებელი ვერ მოიძებნა — გთხოვ გაიარე რეგისტრაცია");
    if (rec.password !== password) throw new Error("არასწორი პაროლი");
    currentUser = { email, uid: "demo-" + email, displayName: [rec.profile.firstName, rec.profile.lastName].join(" "), emailVerified: true };
    cacheProfile({ ...rec.profile, lastLoginAt: new Date().toISOString() });
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    notify();
  }
};

/* ---- Register: requires full profile + sends verification email ---- */
export const register = async (data) => {
  const profile = {
    role: data.role,
    firstName: data.firstName.trim(),
    lastName:  data.lastName.trim(),
    email:     data.email.trim().toLowerCase(),
    personalId: data.personalId.trim(),
    phone:     data.phone.trim(),
  };
  const errors = validateProfile({ ...profile, password: data.password });
  if (Object.keys(errors).length) {
    const err = new Error(Object.values(errors)[0]);
    err.fields = errors;
    throw err;
  }

  if (firebaseEnabled) {
    const fb = await loadFirebase();
    const cred = await fb.createUserWithEmailAndPassword(fb.auth, profile.email, data.password);
    try { await fb.updateProfile(cred.user, { displayName: `${profile.firstName} ${profile.lastName}` }); } catch {}

    // DO NOT write to Firestore yet — profile is created only after email verification.
    // Store the full profile locally; it will be used on first verified sign-in.
    writePendingProfile(profile.email, { ...profile, role: data.role || "student" });

    // Send verification email
    try { await fb.sendEmailVerification(cred.user); } catch (e) { console.warn("verify mail failed", e); }

    // Sign out — user must verify before signing in (no logs/setDoc until verified)
    _pendingVerifyEmail = profile.email;
    _pendingVerifyPassword = data.password;
    await fb.signOut(fb.auth);
    return { verificationSent: true, email: profile.email };
  } else {
    const users = readDemo();
    if (users[profile.email]) throw new Error("ეს email უკვე რეგისტრირებულია");
    const role = profile.email === "nika.gogokhiya27@gmail.com" ? "admin" : (data.role || "student");
    users[profile.email] = { password: data.password, profile: { ...profile, role, blocked: false, createdAt: new Date().toISOString() } };
    writeDemo(users);
    await login(profile.email, data.password);
    return { verificationSent: false, email: profile.email };
  }
};

/* ---- Resend verification email ---- */
export const resendVerification = async () => {
  if (!firebaseEnabled) return;
  if (!_pendingVerifyEmail || !_pendingVerifyPassword) {
    throw new Error("ჯერ ცადე შესვლა — ხელახლა გაგზავნა შესაძლებელია მხოლოდ ბოლო მცდელობის შემდეგ.");
  }
  const fb = await loadFirebase();
  const cred = await fb.signInWithEmailAndPassword(fb.auth, _pendingVerifyEmail, _pendingVerifyPassword);
  try {
    await fb.sendEmailVerification(cred.user);
  } finally {
    await fb.signOut(fb.auth);
  }
};

export const logout = async () => {
  if (firebaseEnabled) {
    await logEvent("logout", {});
    const fb = getFb(); if (fb) await fb.signOut(fb.auth);
  } else {
    currentUser = null;
    cacheProfile(null);
    localStorage.removeItem(SESSION_KEY);
    notify();
  }
};
