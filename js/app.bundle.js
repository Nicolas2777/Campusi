"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // static-site/js/router.js
  var routes, route, parse, notFound, navigate, lastRawHash, lastPath, renderInFlight, doRender, render, routerStarted, startRouter, refresh;
  var init_router = __esm({
    "static-site/js/router.js"() {
      "use strict";
      routes = [];
      route = (pattern, handler) => routes.push({ pattern, handler });
      parse = (pattern, hash) => {
        const p = pattern.split("/").filter(Boolean);
        const h = hash.split("/").filter(Boolean);
        if (p.length !== h.length) return null;
        const params = {};
        for (let i = 0; i < p.length; i++) {
          if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(h[i]);
          else if (p[i] !== h[i]) return null;
        }
        return params;
      };
      notFound = () => "<div class='empty'><div class='ico'>\u{1F914}</div>\u10D2\u10D5\u10D4\u10E0\u10D3\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</div>";
      navigate = (path) => {
        location.hash = "#" + path;
      };
      lastRawHash = null;
      lastPath = null;
      renderInFlight = null;
      doRender = async () => {
        const rawHash = (location.hash || "#/").slice(1);
        const hash = rawHash.split("?")[0];
        if (rawHash === lastRawHash) return;
        lastRawHash = rawHash;
        const samePath = hash === lastPath;
        const app = document.getElementById("app");
        for (const r of routes) {
          const params = parse(r.pattern, hash);
          if (params) {
            if (samePath && app) app.classList.add("view-swap");
            const out = await r.handler(params);
            const noBackPaths = /* @__PURE__ */ new Set(["/", "/login", "/onboarding"]);
            const backBtn = hash && !noBackPaths.has(hash) ? `<button type="button" class="back-btn" onclick="if(history.length>1){history.back()}else{location.hash='#/'}" aria-label="\u10E3\u10D9\u10D0\u10DC \u10D3\u10D0\u10D1\u10E0\u10E3\u10DC\u10D4\u10D1\u10D0">\u2190 \u10E3\u10D9\u10D0\u10DC</button>` : "";
            app.innerHTML = backBtn + out;
            if (!samePath) window.scrollTo({ top: 0, behavior: "instant" });
            requestAnimationFrame(() => app.classList.remove("view-swap"));
            lastPath = hash;
            document.querySelectorAll("#nav a").forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === "#" + hash);
            });
            app.querySelectorAll("[data-init]").forEach((el) => {
              const fn = window.__campusInit?.[el.dataset.init];
              if (typeof fn === "function") fn(el);
            });
            return;
          }
        }
        app.innerHTML = notFound();
        lastPath = hash;
      };
      render = () => {
        if (renderInFlight) return renderInFlight;
        renderInFlight = Promise.resolve().then(async () => {
          try {
            await doRender();
          } finally {
            renderInFlight = null;
          }
        });
        return renderInFlight;
      };
      routerStarted = false;
      startRouter = () => {
        if (routerStarted) return;
        routerStarted = true;
        window.addEventListener("hashchange", render);
        if (!location.hash) location.hash = "#/";
        render();
      };
      refresh = () => {
        lastRawHash = null;
        return render();
      };
    }
  });

  // static-site/js/state.js
  var KEY, ROLES, getRole, setRole, read, write, getTheme, setTheme, toggleTheme, getExams, addExam, removeExam, isAdmin, POINT_RULES, POINTS, getPoints, getBadges, BADGE_DEFS, BADGES, addPoints, levelOf;
  var init_state = __esm({
    "static-site/js/state.js"() {
      "use strict";
      KEY = {
        theme: "campus.theme",
        favorites: "campus.favorites",
        reviews: "campus.reviews",
        comments: "campus.comments",
        exams: "campus.exams",
        adminEmails: "campus.adminEmails",
        compare: "campus.compare",
        points: "campus.points",
        badges: "campus.badges",
        role: "campus.role"
      };
      ROLES = {
        student: {
          id: "student",
          icon: "\u{1F4DA}",
          name: "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8",
          tagline: "\u10DB\u10D0\u10E0\u10D7\u10D4 \u10E8\u10D4\u10DC\u10D8 \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10EA\u10EE\u10DD\u10D5\u10E0\u10D4\u10D1\u10D0, \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8, \u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10DE\u10E0\u10DD\u10D2\u10E0\u10D4\u10E1\u10D8."
        }
      };
      getRole = () => localStorage.getItem(KEY.role);
      setRole = (r) => {
        if (r) localStorage.setItem(KEY.role, r);
        else localStorage.removeItem(KEY.role);
        document.documentElement.setAttribute("data-role", r || "");
      };
      read = (k, def) => {
        try {
          return JSON.parse(localStorage.getItem(k)) ?? def;
        } catch {
          return def;
        }
      };
      write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
      getTheme = () => localStorage.getItem(KEY.theme) || "light";
      setTheme = (t) => {
        localStorage.setItem(KEY.theme, t);
        document.documentElement.setAttribute("data-theme", t);
      };
      toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");
      getExams = () => read(KEY.exams, []).sort((a, b) => a.date.localeCompare(b.date));
      addExam = (e) => {
        const all = read(KEY.exams, []);
        all.push({ ...e, id: crypto.randomUUID() });
        write(KEY.exams, all);
      };
      removeExam = (id) => write(KEY.exams, read(KEY.exams, []).filter((e) => e.id !== id));
      isAdmin = (email) => {
        const list2 = (localStorage.getItem(KEY.adminEmails) || "nika.gogokhiya27@gmail.com").split(",").map((s) => s.trim());
        return email && list2.includes(email);
      };
      POINT_RULES = { review: 5, comment: 2.5, resource: 25, exam: 1.5 };
      POINTS = POINT_RULES;
      getPoints = () => read(KEY.points, 0);
      getBadges = () => read(KEY.badges, []);
      BADGE_DEFS = [
        { id: "starter", name: "\u10D3\u10D0\u10DB\u10EC\u10E7\u10D4\u10D1\u10D8", icon: "\u{1F331}", req: 10 },
        { id: "active", name: "\u10D0\u10E5\u10E2\u10D8\u10E3\u10E0\u10D8", icon: "\u26A1", req: 50 },
        { id: "contributor", name: "\u10D9\u10DD\u10DC\u10E2\u10E0\u10D8\u10D1\u10E3\u10E2\u10DD\u10E0\u10D8", icon: "\u{1F3C6}", req: 150 },
        { id: "legend", name: "\u10DA\u10D4\u10D2\u10D4\u10DC\u10D3\u10D0", icon: "\u{1F451}", req: 500 }
      ];
      BADGES = BADGE_DEFS;
      addPoints = (kind) => {
        const delta = POINT_RULES[kind] || 0;
        const total = getPoints() + delta;
        write(KEY.points, total);
        const unlocked = getBadges();
        BADGE_DEFS.forEach((b) => {
          if (total >= b.req && !unlocked.includes(b.id)) unlocked.push(b.id);
        });
        write(KEY.badges, unlocked);
        return delta;
      };
      levelOf = (pts) => Math.floor(Math.sqrt(pts / 10)) + 1;
    }
  });

  // static-site/js/firebase.js
  var firebase_exports = {};
  __export(firebase_exports, {
    firebaseEnabled: () => firebaseEnabled,
    getFb: () => getFb,
    loadFirebase: () => loadFirebase
  });
  var firebaseConfig, firebaseEnabled, _fb, _loading, loadFirebase, getFb;
  var init_firebase = __esm({
    "static-site/js/firebase.js"() {
      "use strict";
      firebaseConfig = {
        apiKey: "AIzaSyBytHma1brDH5dInrAj1ipVuSEAJMljl8s",
        authDomain: "campus-2627b.firebaseapp.com",
        projectId: "campus-2627b",
        storageBucket: "campus-2627b.firebasestorage.app",
        messagingSenderId: "819181231425",
        appId: "1:819181231425:web:16e38be50565eeccc055c0",
        measurementId: "G-7NY8Z58JRX"
      };
      firebaseEnabled = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";
      if (typeof window !== "undefined") {
        window.__campusFirebaseEnabled = firebaseEnabled;
      }
      _fb = null;
      _loading = null;
      loadFirebase = async () => {
        if (!firebaseEnabled) return null;
        if (_fb) return _fb;
        if (_loading) return _loading;
        _loading = (async () => {
          const [appMod, authMod, fsMod] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js")
          ]);
          const app = appMod.initializeApp(firebaseConfig);
          const auth = authMod.getAuth(app);
          const db = fsMod.getFirestore(app);
          try {
            await authMod.setPersistence(auth, authMod.browserLocalPersistence);
          } catch {
          }
          _fb = {
            app,
            auth,
            db,
            onAuthStateChanged: authMod.onAuthStateChanged,
            signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
            createUserWithEmailAndPassword: authMod.createUserWithEmailAndPassword,
            updateProfile: authMod.updateProfile,
            signOut: authMod.signOut,
            sendEmailVerification: authMod.sendEmailVerification,
            sendPasswordResetEmail: authMod.sendPasswordResetEmail,
            doc: fsMod.doc,
            getDoc: fsMod.getDoc,
            setDoc: fsMod.setDoc,
            updateDoc: fsMod.updateDoc,
            deleteDoc: fsMod.deleteDoc,
            collection: fsMod.collection,
            addDoc: fsMod.addDoc,
            getDocs: fsMod.getDocs,
            query: fsMod.query,
            where: fsMod.where,
            orderBy: fsMod.orderBy,
            limit: fsMod.limit,
            serverTimestamp: fsMod.serverTimestamp,
            onSnapshot: fsMod.onSnapshot
          };
          return _fb;
        })();
        return _loading;
      };
      getFb = () => _fb;
    }
  });

  // static-site/js/auth.js
  var currentUser, currentProfile, authReady, listeners, DEMO_USERS_KEY, SESSION_KEY, PROFILE_KEY, readDemo, writeDemo, onUser, notify, onAuthReady, cacheProfile, loadCachedProfile, getProfile, isAdminUser, isModeratorUser, canModerate, isBlockedUser, assertNotBlocked, fetchProfileFB, PENDING_PROFILE_KEY, readPendingProfile, writePendingProfile, clearPendingProfile, bootstrapProfileIfMissing, logEvent, fallbackToDemo, _lastProfileFetch, PROFILE_REFETCH_THROTTLE, refreshProfileFromServer, getUser, getDisplayName, getFirstName, setDisplayName, updateProfileData, GEORGIAN_RX, PID_RX, PHONE_RX, EMAIL_RX, EDU_GE_RX, ADMIN_BOOTSTRAP_EMAILS, isEduGeEmail, validateProfile, EmailNotVerifiedError, _pendingVerifyEmail, _pendingVerifyPassword, login, register, resendVerification, logout;
  var init_auth = __esm({
    "static-site/js/auth.js"() {
      "use strict";
      init_firebase();
      currentUser = null;
      currentProfile = null;
      authReady = false;
      listeners = /* @__PURE__ */ new Set();
      DEMO_USERS_KEY = "campus.demoUsers";
      SESSION_KEY = "campus.demoSession";
      PROFILE_KEY = "campus.profile";
      readDemo = () => {
        try {
          return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "{}");
        } catch {
          return {};
        }
      };
      writeDemo = (u) => localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(u));
      onUser = (cb) => {
        listeners.add(cb);
        cb(currentUser);
        return () => listeners.delete(cb);
      };
      notify = () => listeners.forEach((l) => l(currentUser));
      onAuthReady = (cb) => {
        if (authReady) cb(currentUser);
        else {
          const t = setInterval(() => {
            if (authReady) {
              clearInterval(t);
              cb(currentUser);
            }
          }, 30);
        }
      };
      cacheProfile = (p) => {
        currentProfile = p || null;
        if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
        else localStorage.removeItem(PROFILE_KEY);
      };
      loadCachedProfile = () => {
        try {
          currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
        } catch {
          currentProfile = null;
        }
      };
      getProfile = () => currentProfile;
      isAdminUser = () => currentProfile?.role === "admin";
      isModeratorUser = () => currentProfile?.role === "moderator" || currentProfile?.role === "admin";
      canModerate = () => isModeratorUser();
      isBlockedUser = () => !!currentProfile?.blocked;
      assertNotBlocked = () => {
        if (isBlockedUser()) throw new Error("\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8\u10D0 \u2014 \u10EC\u10D4\u10E0\u10D0 \u10D3\u10D0 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10E3\u10DA\u10D8\u10D0");
      };
      fetchProfileFB = async (uid) => {
        const fb = getFb();
        if (!fb) return null;
        try {
          const snap = await fb.getDoc(fb.doc(fb.db, "users", uid));
          return snap.exists() ? snap.data() : null;
        } catch (e) {
          console.warn("profile fetch failed", e);
          return null;
        }
      };
      PENDING_PROFILE_KEY = (email) => `campus.pendingProfile.${(email || "").toLowerCase()}`;
      readPendingProfile = (email) => {
        try {
          return JSON.parse(localStorage.getItem(PENDING_PROFILE_KEY(email)) || "null");
        } catch {
          return null;
        }
      };
      writePendingProfile = (email, data) => {
        try {
          localStorage.setItem(PENDING_PROFILE_KEY(email), JSON.stringify(data));
        } catch {
        }
      };
      clearPendingProfile = (email) => {
        try {
          localStorage.removeItem(PENDING_PROFILE_KEY(email));
        } catch {
        }
      };
      bootstrapProfileIfMissing = async (fb, user) => {
        if (!fb || !user) return null;
        const existing = await fetchProfileFB(user.uid);
        if (existing) return existing;
        const email = (user.email || "").toLowerCase();
        const pending = readPendingProfile(email);
        const ADMIN_BOOTSTRAP = "nika.gogokhiya27@gmail.com";
        const role = email === ADMIN_BOOTSTRAP ? "admin" : pending?.role || "student";
        const [fnGuess, lnGuess] = (user.displayName || "").trim().split(/\s+/);
        const full = {
          role,
          firstName: pending?.firstName || fnGuess || "",
          lastName: pending?.lastName || lnGuess || "",
          email,
          personalId: pending?.personalId || "",
          phone: pending?.phone || "",
          uid: user.uid,
          blocked: false,
          createdAt: fb.serverTimestamp(),
          lastLoginAt: null,
          photoURL: user.photoURL || null
        };
        try {
          await fb.setDoc(fb.doc(fb.db, "users", user.uid), full);
          try {
            await fb.addDoc(fb.collection(fb.db, "logs"), {
              type: "register",
              actorUid: user.uid,
              actorEmail: email,
              meta: { role, source: "post-verify" },
              createdAt: fb.serverTimestamp()
            });
          } catch {
          }
          clearPendingProfile(email);
          return full;
        } catch (e) {
          console.warn("profile bootstrap failed", e);
          return null;
        }
      };
      logEvent = async (type, meta2 = {}) => {
        if (!firebaseEnabled) return;
        const fb = getFb();
        if (!fb) return;
        try {
          await fb.addDoc(fb.collection(fb.db, "logs"), {
            type,
            actorUid: currentUser?.uid || null,
            actorEmail: currentUser?.email || null,
            meta: meta2,
            createdAt: fb.serverTimestamp()
          });
        } catch (e) {
          console.warn("log failed", e);
        }
      };
      fallbackToDemo = (reason) => {
        if (authReady) return;
        if (reason) console.warn("Auth fallback to demo:", reason);
        try {
          currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        } catch {
        }
        loadCachedProfile();
        authReady = true;
        notify();
      };
      if (firebaseEnabled) {
        const failsafe = setTimeout(() => fallbackToDemo("timeout"), 4e3);
        loadFirebase().then((fb) => {
          fb.onAuthStateChanged(fb.auth, async (u) => {
            clearTimeout(failsafe);
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
      _lastProfileFetch = 0;
      PROFILE_REFETCH_THROTTLE = 60 * 1e3;
      refreshProfileFromServer = async () => {
        if (!firebaseEnabled || !currentUser?.uid) return;
        if (Date.now() - _lastProfileFetch < PROFILE_REFETCH_THROTTLE) return;
        _lastProfileFetch = Date.now();
        try {
          const p = await fetchProfileFB(currentUser.uid);
          if (!p) return;
          const prev = JSON.stringify(currentProfile || {});
          const next = JSON.stringify(p);
          if (prev !== next) {
            cacheProfile(p);
            notify();
          }
        } catch (e) {
          console.warn("profile refresh failed", e);
        }
      };
      if (typeof window !== "undefined") {
        window.addEventListener("focus", refreshProfileFromServer);
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) refreshProfileFromServer();
        });
      }
      getUser = () => currentUser;
      getDisplayName = () => {
        const p = currentProfile;
        if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(" ");
        const u = currentUser;
        return u?.displayName || u?.email?.split("@")[0] || "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10DD";
      };
      getFirstName = () => {
        const p = currentProfile;
        if (p?.firstName) return p.firstName.trim();
        const u = currentUser;
        const dn = u?.displayName?.trim();
        if (dn) return dn.split(/\s+/)[0];
        return u?.email?.split("@")[0] || "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10DD";
      };
      setDisplayName = (name) => {
        const displayName = (name || "").trim();
        if (!displayName) return;
        currentUser = currentUser || { uid: "demo-local", email: "demo@campus.local" };
        currentUser = { ...currentUser, displayName };
        currentProfile = { ...currentProfile || {}, firstName: displayName, lastName: "" };
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
        notify();
      };
      updateProfileData = async (patch) => {
        currentProfile = { ...currentProfile || {}, ...patch };
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
            try {
              await fb.updateDoc(fb.doc(fb.db, "users", currentUser.uid), patch);
            } catch (e) {
              console.warn("profile update sync failed", e);
            }
          }
        }
        notify();
      };
      GEORGIAN_RX = /^[\u10D0-\u10FA\u10FC\u10FD\u10FE\u10FF\s\-]+$/;
      PID_RX = /^\d{11}$/;
      PHONE_RX = /^[\d+\-\s()]{6,20}$/;
      EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      EDU_GE_RX = /^[^\s@]+@[^\s@]+\.edu\.ge$/i;
      ADMIN_BOOTSTRAP_EMAILS = ["nika.gogokhiya27@gmail.com"];
      isEduGeEmail = (email) => {
        const e = (email || "").trim().toLowerCase();
        if (!e) return false;
        if (ADMIN_BOOTSTRAP_EMAILS.includes(e)) return true;
        return EDU_GE_RX.test(e);
      };
      validateProfile = (p) => {
        const errors = {};
        if (!p.firstName || !GEORGIAN_RX.test(p.firstName.trim()))
          errors.firstName = "\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10E1\u10DD\u10D4\u10D1\u10D8\u10D7";
        if (!p.lastName || !GEORGIAN_RX.test(p.lastName.trim()))
          errors.lastName = "\u10D2\u10D5\u10D0\u10E0\u10D8 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10E1\u10DD\u10D4\u10D1\u10D8\u10D7";
        if (!p.email || !EMAIL_RX.test(p.email.trim()))
          errors.email = "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0";
        else if (!isEduGeEmail(p.email))
          errors.email = "\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0 \u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E1\u10D0\u10D2\u10D0\u10DC\u10DB\u10D0\u10DC\u10D0\u10D7\u10DA\u10D4\u10D1\u10DA\u10DD \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D8\u10D7 (edu.ge)";
        if (!p.personalId || !PID_RX.test(p.personalId.trim()))
          errors.personalId = "\u10DE\u10D8\u10E0\u10D0\u10D3\u10D8 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8 \u2014 \u10D6\u10E3\u10E1\u10E2\u10D0\u10D3 11 \u10EA\u10D8\u10E4\u10E0\u10D8";
        if (!p.phone || !PHONE_RX.test(p.phone.trim()))
          errors.phone = "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E2\u10D4\u10DA\u10D4\u10E4\u10DD\u10DC\u10D8\u10E1 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8";
        if (!p.password || p.password.length < 6)
          errors.password = "\u10DE\u10D0\u10E0\u10DD\u10DA\u10D8 \u10DB\u10D8\u10DC. 6 \u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD";
        return errors;
      };
      EmailNotVerifiedError = class extends Error {
        constructor(email) {
          super("\u10D2\u10D7\u10EE\u10DD\u10D5, \u10D3\u10D0\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4 \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0 \u2014 \u10E8\u10D4\u10DB\u10DD\u10EC\u10DB\u10D4 \u10E1\u10D0\u10E4\u10DD\u10E1\u10E2\u10DD \u10E7\u10E3\u10D7\u10D8 (\u10D3\u10D0 Spam) \u10D3\u10D0 \u10D3\u10D0\u10D0\u10ED\u10D8\u10E0\u10D4 \u10D1\u10DB\u10E3\u10DA\u10E1.");
          this.code = "auth/email-not-verified";
          this.email = email;
        }
      };
      _pendingVerifyEmail = null;
      _pendingVerifyPassword = null;
      login = async (email, password) => {
        email = (email || "").trim().toLowerCase();
        if (!isEduGeEmail(email)) {
          throw new Error("\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0 \u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E1\u10D0\u10D2\u10D0\u10DC\u10DB\u10D0\u10DC\u10D0\u10D7\u10DA\u10D4\u10D1\u10DA\u10DD \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D8\u10D7 (edu.ge)");
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
          let p = await fetchProfileFB(cred.user.uid);
          if (!p) p = await bootstrapProfileIfMissing(fb, cred.user);
          if (!p) {
            await fb.signOut(fb.auth);
            throw new Error("\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10D5\u10D4\u10E0 \u10E8\u10D4\u10D8\u10E5\u10DB\u10DC\u10D0 \u2014 \u10E1\u10EA\u10D0\u10D3\u10D4 \u10D7\u10D0\u10D5\u10D8\u10D3\u10D0\u10DC");
          }
          try {
            await fb.updateDoc(fb.doc(fb.db, "users", cred.user.uid), {
              lastLoginAt: fb.serverTimestamp()
            });
          } catch {
          }
          cacheProfile({ ...p, lastLoginAt: (/* @__PURE__ */ new Date()).toISOString() });
          _pendingVerifyEmail = null;
          _pendingVerifyPassword = null;
          await logEvent("login", { email });
        } else {
          const users = readDemo();
          const rec = users[email];
          if (!rec) throw new Error("\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0 \u2014 \u10D2\u10D7\u10EE\u10DD\u10D5 \u10D2\u10D0\u10D8\u10D0\u10E0\u10D4 \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0");
          if (rec.password !== password) throw new Error("\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DE\u10D0\u10E0\u10DD\u10DA\u10D8");
          currentUser = { email, uid: "demo-" + email, displayName: [rec.profile.firstName, rec.profile.lastName].join(" "), emailVerified: true };
          cacheProfile({ ...rec.profile, lastLoginAt: (/* @__PURE__ */ new Date()).toISOString() });
          localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
          notify();
        }
      };
      register = async (data) => {
        const profile = {
          role: data.role,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          personalId: data.personalId.trim(),
          phone: data.phone.trim()
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
          try {
            await fb.updateProfile(cred.user, { displayName: `${profile.firstName} ${profile.lastName}` });
          } catch {
          }
          writePendingProfile(profile.email, { ...profile, role: data.role || "student" });
          try {
            await fb.sendEmailVerification(cred.user);
          } catch (e) {
            console.warn("verify mail failed", e);
          }
          _pendingVerifyEmail = profile.email;
          _pendingVerifyPassword = data.password;
          await fb.signOut(fb.auth);
          return { verificationSent: true, email: profile.email };
        } else {
          const users = readDemo();
          if (users[profile.email]) throw new Error("\u10D4\u10E1 email \u10E3\u10D9\u10D5\u10D4 \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0");
          const role = profile.email === "nika.gogokhiya27@gmail.com" ? "admin" : data.role || "student";
          users[profile.email] = { password: data.password, profile: { ...profile, role, blocked: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() } };
          writeDemo(users);
          await login(profile.email, data.password);
          return { verificationSent: false, email: profile.email };
        }
      };
      resendVerification = async () => {
        if (!firebaseEnabled) return;
        if (!_pendingVerifyEmail || !_pendingVerifyPassword) {
          throw new Error("\u10EF\u10D4\u10E0 \u10EA\u10D0\u10D3\u10D4 \u10E8\u10D4\u10E1\u10D5\u10DA\u10D0 \u2014 \u10EE\u10D4\u10DA\u10D0\u10EE\u10DA\u10D0 \u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0 \u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D1\u10DD\u10DA\u10DD \u10DB\u10EA\u10D3\u10D4\u10DA\u10DD\u10D1\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2.");
        }
        const fb = await loadFirebase();
        const cred = await fb.signInWithEmailAndPassword(fb.auth, _pendingVerifyEmail, _pendingVerifyPassword);
        try {
          await fb.sendEmailVerification(cred.user);
        } finally {
          await fb.signOut(fb.auth);
        }
      };
      logout = async () => {
        if (firebaseEnabled) {
          await logEvent("logout", {});
          const fb = getFb();
          if (fb) await fb.signOut(fb.auth);
        } else {
          currentUser = null;
          cacheProfile(null);
          localStorage.removeItem(SESSION_KEY);
          notify();
        }
      };
    }
  });

  // static-site/js/store.js
  var replaceArr, replaceObj, state, CACHE_KEY, META_KEY, readMeta, writeMeta, meta, persist, _refreshScheduled, scheduleRefresh, STALE, _inflight, fetchOnce, REALTIME_COLLECTIONS, _started, startStore;
  var init_store = __esm({
    "static-site/js/store.js"() {
      "use strict";
      init_firebase();
      init_router();
      replaceArr = (arr, next) => {
        arr.length = 0;
        for (const x of next) arr.push(x);
      };
      replaceObj = (obj, next) => {
        for (const k of Object.keys(obj)) delete obj[k];
        for (const k of Object.keys(next || {})) obj[k] = next[k];
      };
      state = {
        universities: [],
        faculties: [],
        subjects: [],
        resources: [],
        news: [],
        /** academicCalendar[uniId] = { name, semesters:[], holidays:[] } */
        academicCalendar: {}
      };
      CACHE_KEY = "campus.store.cache.v1";
      META_KEY = "campus.store.meta.v1";
      readMeta = () => {
        try {
          return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {};
        } catch {
          return {};
        }
      };
      writeMeta = (m) => {
        try {
          localStorage.setItem(META_KEY, JSON.stringify(m));
        } catch {
        }
      };
      meta = readMeta();
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && typeof cached === "object") {
          for (const k of Object.keys(state)) {
            if (cached[k] === void 0) continue;
            if (Array.isArray(state[k])) replaceArr(state[k], cached[k] || []);
            else replaceObj(state[k], cached[k] || {});
          }
        }
      } catch {
      }
      persist = () => {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(state));
        } catch {
        }
      };
      _refreshScheduled = false;
      scheduleRefresh = () => {
        if (_refreshScheduled) return;
        _refreshScheduled = true;
        setTimeout(() => {
          _refreshScheduled = false;
          persist();
          try {
            refresh();
          } catch {
          }
        }, 50);
      };
      STALE = { universities: 30 * 60 * 1e3, faculties: 20 * 60 * 1e3 };
      _inflight = {};
      fetchOnce = async (key, force = false) => {
        if (!firebaseEnabled) return;
        const fresh = !force && Date.now() - (meta[key] || 0) < STALE[key];
        if (fresh) return;
        if (_inflight[key]) return _inflight[key];
        _inflight[key] = (async () => {
          try {
            const fb = await loadFirebase();
            if (!fb) return;
            const snap = await fb.getDocs(fb.collection(fb.db, key));
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            replaceArr(state[key], arr);
            meta[key] = Date.now();
            writeMeta(meta);
            scheduleRefresh();
          } catch (e) {
            console.warn("store fetch " + key, e?.message || e);
          } finally {
            _inflight[key] = null;
          }
        })();
        return _inflight[key];
      };
      REALTIME_COLLECTIONS = [
        ["subjects", "subjects"],
        ["resources", "resources"],
        ["news", "news"]
      ];
      _started = false;
      startStore = async () => {
        if (_started || !firebaseEnabled) return;
        _started = true;
        fetchOnce("universities");
        fetchOnce("faculties");
        const onFocus = () => {
          fetchOnce("universities");
          fetchOnce("faculties");
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) onFocus();
        });
        const fb = await loadFirebase();
        if (!fb || !fb.onSnapshot) return;
        for (const [coll, key] of REALTIME_COLLECTIONS) {
          try {
            fb.onSnapshot(fb.collection(fb.db, coll), (snap) => {
              const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
              replaceArr(state[key], arr);
              scheduleRefresh();
            }, (err) => console.warn("store:" + coll, err?.message || err));
          } catch (e) {
            console.warn("store sub fail", coll, e);
          }
        }
        try {
          fb.onSnapshot(fb.collection(fb.db, "calendars"), (snap) => {
            const next = {};
            snap.docs.forEach((d) => {
              next[d.id] = { id: d.id, ...d.data() };
            });
            replaceObj(state.academicCalendar, next);
            scheduleRefresh();
          }, (err) => console.warn("store:calendars", err?.message || err));
        } catch {
        }
      };
    }
  });

  // static-site/js/data.js
  var data_exports = {};
  __export(data_exports, {
    faculties: () => faculties,
    facultiesByUni: () => facultiesByUni,
    getFaculty: () => getFaculty,
    getSubject: () => getSubject,
    getUni: () => getUni,
    news: () => news,
    resources: () => resources,
    resourcesBySubject: () => resourcesBySubject,
    subjects: () => subjects,
    subjectsByFaculty: () => subjectsByFaculty,
    topStudents: () => topStudents,
    universities: () => universities
  });
  var universities, faculties, subjects, resources, topStudents, news, getUni, getFaculty, getSubject, facultiesByUni, subjectsByFaculty, resourcesBySubject;
  var init_data = __esm({
    "static-site/js/data.js"() {
      "use strict";
      init_store();
      universities = state.universities;
      faculties = state.faculties;
      subjects = state.subjects;
      resources = state.resources;
      topStudents = state.topStudents;
      news = state.news;
      getUni = (id) => universities.find((u) => u.id === id) || null;
      getFaculty = (id) => faculties.find((f) => f.id === id) || null;
      getSubject = (id) => subjects.find((s) => s.id === id) || null;
      facultiesByUni = (uniId) => faculties.filter((f) => f.uniId === uniId);
      subjectsByFaculty = (facultyId) => subjects.filter((s) => s.facultyId === facultyId);
      resourcesBySubject = (subjectId) => resources.filter((r) => r.subjectId === subjectId);
    }
  });

  // static-site/js/news-data.js
  var NEWS_CATEGORIES, newsItems;
  var init_news_data = __esm({
    "static-site/js/news-data.js"() {
      "use strict";
      init_store();
      NEWS_CATEGORIES = {
        registration: { label: "\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0", icon: "\u{1F4DD}", color: "#6d5cf6" },
        event: { label: "\u10E6\u10DD\u10DC\u10D8\u10E1\u10EB\u10D8\u10D4\u10D1\u10D0", icon: "\u{1F389}", color: "#22d3ee" },
        deadline: { label: "\u10D5\u10D0\u10D3\u10D0", icon: "\u23F0", color: "#ef4444" },
        scholarship: { label: "\u10D2\u10E0\u10D0\u10DC\u10E2\u10D8", icon: "\u{1F3C6}", color: "#f59e0b" },
        announcement: { label: "\u10D2\u10D0\u10DC\u10EA\u10EE\u10D0\u10D3\u10D4\u10D1\u10D0", icon: "\u{1F4E2}", color: "#10b981" }
      };
      newsItems = state.news;
    }
  });

  // static-site/js/ui.js
  var ui_exports = {};
  __export(ui_exports, {
    daysUntil: () => daysUntil,
    escapeHtml: () => escapeHtml,
    expose: () => expose,
    showToast: () => showToast,
    skCard: () => skCard,
    skGrid: () => skGrid,
    skLine: () => skLine,
    skList: () => skList,
    stars: () => stars
  });
  var showToast, escapeHtml, stars, daysUntil, expose, skLine, skCard, skList, skGrid;
  var init_ui = __esm({
    "static-site/js/ui.js"() {
      "use strict";
      showToast = (msg, ms = 2200) => {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(t._tid);
        t._tid = setTimeout(() => t.hidden = true, ms);
      };
      escapeHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      stars = (n) => {
        const full = Math.round(n);
        return `<span class="stars">${"\u2605".repeat(full)}${"\u2606".repeat(5 - full)}</span>`;
      };
      daysUntil = (dateStr) => {
        const d = new Date(dateStr);
        const now = /* @__PURE__ */ new Date();
        return Math.ceil((d - now) / (1e3 * 60 * 60 * 24));
      };
      window.__campus = window.__campus || {};
      expose = (name, fn) => {
        window.__campus[name] = fn;
      };
      skLine = (w = "w-70", extra = "") => `<div class="sk sk-line ${w} ${extra}"></div>`;
      skCard = (lines = 3) => {
        const widths = ["w-90", "w-70", "w-50", "w-30"];
        const rows = Array.from(
          { length: lines },
          (_, i) => `<div class="sk sk-line ${widths[i % widths.length]}"></div>`
        ).join("");
        return `<div class="sk-card">
    <div class="sk sk-line lg w-50" style="margin-bottom:14px"></div>
    ${rows}
  </div>`;
      };
      skList = (n = 3) => {
        const items = Array.from({ length: n }, () => `<div class="sk-card">
    <div class="sk-row">
      <div class="sk sk-circle"></div>
      <div style="flex:1">
        <div class="sk sk-line w-30"></div>
        <div class="sk sk-line sm w-50"></div>
      </div>
    </div>
    <div class="sk sk-line w-90" style="margin-top:10px"></div>
    <div class="sk sk-line w-70"></div>
  </div>`).join("");
        return `<div class="stack">${items}</div>`;
      };
      skGrid = (n = 6, lines = 3) => `<div class="sk-grid">${Array.from({ length: n }, () => skCard(lines)).join("")}</div>`;
    }
  });

  // static-site/js/academic-data.js
  var ACADEMIC_PHASES, academicCalendar, getCurrentSemester, getCurrentPhase;
  var init_academic_data = __esm({
    "static-site/js/academic-data.js"() {
      "use strict";
      init_store();
      ACADEMIC_PHASES = {
        registration: { label: "\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0", icon: "\u{1F4DD}", color: "#6d5cf6" },
        semester: { label: "\u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10DE\u10D4\u10E0\u10D8\u10DD\u10D3\u10D8", icon: "\u{1F4DA}", color: "#10b981" },
        addDrop: { label: "Add / Drop", icon: "\u26A0\uFE0F", color: "#f59e0b" },
        midterms: { label: "\u10E8\u10E3\u10D0\u10DA\u10D4\u10D3\u10E3\u10E0\u10D8", icon: "\u{1F4CB}", color: "#22d3ee" },
        finals: { label: "\u10E4\u10D8\u10DC\u10D0\u10DA\u10E3\u10E0\u10D8", icon: "\u{1F3AF}", color: "#ef4444" },
        break: { label: "\u10D0\u10E0\u10D3\u10D0\u10D3\u10D4\u10D2\u10D4\u10D1\u10D8", icon: "\u{1F3D6}", color: "#b06cf2" }
      };
      academicCalendar = state.academicCalendar;
      getCurrentSemester = (uniId, today = /* @__PURE__ */ new Date()) => {
        const uni = academicCalendar[uniId];
        if (!uni || !uni.semesters || !uni.semesters.length) return null;
        const t = today.toISOString().slice(0, 10);
        return uni.semesters.find((s) => s.semester?.start <= t && t <= s.semester?.end) || uni.semesters.find((s) => s.semester?.start > t) || uni.semesters[uni.semesters.length - 1];
      };
      getCurrentPhase = (sem, today = /* @__PURE__ */ new Date()) => {
        if (!sem) return null;
        const t = today.toISOString().slice(0, 10);
        const order = ["registration", "addDrop", "midterms", "finals", "semester"];
        for (const k of order) {
          if (sem[k] && sem[k].start <= t && t <= sem[k].end) return k;
        }
        return null;
      };
    }
  });

  // static-site/js/ics.js
  var init_ics = __esm({
    "static-site/js/ics.js"() {
      "use strict";
    }
  });

  // static-site/js/views/academic.js
  var KEY2, supportedIds, supportedUnisList, readUni, writeUni, fmtDate, fmtShort, daysBetween, semProgress, academicView, semesterStatusFor;
  var init_academic = __esm({
    "static-site/js/views/academic.js"() {
      "use strict";
      init_data();
      init_academic_data();
      init_ui();
      init_ics();
      KEY2 = "campus.academicUni";
      supportedIds = () => Object.keys(academicCalendar);
      supportedUnisList = () => universities.filter((u) => supportedIds().includes(u.id));
      readUni = () => {
        const v = localStorage.getItem(KEY2);
        const ids = supportedIds();
        if (v && ids.includes(v)) return v;
        return ids[0] || "";
      };
      writeUni = (id) => localStorage.setItem(KEY2, id);
      fmtDate = (s) => new Date(s).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" });
      fmtShort = (s) => new Date(s).toLocaleDateString("ka-GE", { day: "numeric", month: "short" });
      daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / (1e3 * 60 * 60 * 24));
      semProgress = (sem) => {
        const now = Date.now();
        const s = new Date(sem.semester.start).getTime();
        const e = new Date(sem.semester.end).getTime();
        if (now <= s) return 0;
        if (now >= e) return 100;
        return Math.round((now - s) / (e - s) * 100);
      };
      academicView = () => {
        const ids = supportedIds();
        if (!ids.length) {
          return `<nav class="crumbs" aria-label="\u10DC\u10D0\u10D9\u10D0\u10D3\u10D8"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8</nav>
      <div class="empty"><div class="ico">\u{1F4C5}</div>\u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0.<br/><span class="muted">\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10E1.</span></div>`;
        }
        const uniId = readUni();
        const uni = academicCalendar[uniId];
        const today = /* @__PURE__ */ new Date();
        const currentSem = getCurrentSemester(uniId, today);
        expose("acadSetUni", (id) => {
          if (!supportedIds().includes(id)) return;
          writeUni(id);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        });
        const renderSemester = (sem) => {
          const isCurrent = sem.id === currentSem?.id;
          const phase = isCurrent ? getCurrentPhase(sem, today) : null;
          const progress = semProgress(sem);
          const t = today.toISOString().slice(0, 10);
          const phaseOrder = ["registration", "semester", "addDrop", "midterms", "finals"];
          const phaseItems = phaseOrder.filter((k) => sem[k]).map((k) => ({ key: k, ...sem[k], meta: ACADEMIC_PHASES[k] }));
          const phaseRow = (p) => {
            const past = p.end < t;
            const live = p.start <= t && t <= p.end;
            const future = p.start > t;
            const status = live ? "live" : past ? "past" : "future";
            let badge = "";
            if (live) {
              const left = daysBetween(today, p.end);
              badge = `<span class="live-pill" style="color:${p.meta.color}">\u25CF \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4\u10DD\u10D1\u10E1 \xB7 ${left}\u10D3 \u10D3\u10D0\u10E0\u10E9\u10D0</span>`;
            } else if (future) {
              badge = `<span class="muted" style="font-size:12px">\u23F3 \u10D3\u10D0\u10D8\u10EC\u10E7\u10D4\u10D1\u10D0 ${daysBetween(today, p.start)}\u10D3-\u10E8\u10D8</span>`;
            } else {
              badge = `<span class="muted" style="font-size:12px">\u2713 \u10D3\u10D0\u10E1\u10E0\u10E3\u10DA\u10D3\u10D0</span>`;
            }
            return `<div class="tl-item ${status}" style="--c:${p.meta.color}">
        <div class="tl-time">
          <div class="tl-start">${fmtShort(p.start)}</div>
          <div class="tl-end muted">${fmtShort(p.end)}</div>
        </div>
        <div class="tl-bar"></div>
        <div class="tl-body">
          <div class="tl-title">${p.meta.icon} ${p.meta.label}</div>
          <div class="tl-meta">${badge}</div>
        </div>
      </div>`;
          };
          return `<article class="card semester-card ${isCurrent ? "is-current" : ""}">
      <div class="row between" style="flex-wrap:wrap;gap:8px;margin-bottom:14px">
        <div>
          <h2 style="margin:0;font-size:18px">${escapeHtml(sem.name)}</h2>
          <p class="muted" style="margin:4px 0 0;font-size:13px">
            ${fmtDate(sem.semester.start)} \u2014 ${fmtDate(sem.semester.end)}
          </p>
        </div>
        ${isCurrent ? `<span class="badge badge-primary">${ACADEMIC_PHASES[phase]?.icon || "\u{1F4DA}"} ${ACADEMIC_PHASES[phase]?.label || "\u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4"}</span>` : ""}
      </div>

      ${isCurrent ? `
        <div class="progress" aria-label="\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10EC\u10D8\u10DC\u10E1\u10D5\u10DA\u10D0 ${progress}%">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
        <p class="muted" style="font-size:12px;margin:6px 0 16px">\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 ${progress}% \u10D3\u10D0\u10E1\u10E0\u10E3\u10DA\u10D3\u10D0</p>
      ` : ""}

      <div class="timeline academic-timeline">
        ${phaseItems.map(phaseRow).join("")}
      </div>
    </article>`;
        };
        const uniChips = supportedUnisList().map((u) => `
    <button type="button" class="chip ${u.id === uniId ? "active" : ""}"
      onclick="__campus.acadSetUni('${u.id}')">${escapeHtml(u.name)}</button>`).join("");
        const holidayList = (uni.holidays || []).map((h) => `
    <li class="holiday-item">
      <span class="holiday-date">${fmtShort(h.date)}</span>
      <span class="holiday-name">${escapeHtml(h.name)}</span>
    </li>`).join("");
        return `
    <nav class="crumbs" aria-label="\u10DC\u10D0\u10D9\u10D0\u10D3\u10D8"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8</nav>
    <div class="page-head">
      <div>
        <h1 style="margin:0">\u{1F393} \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8</h1>
        <p class="muted" style="margin:4px 0 0">\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10E4\u10D0\u10D6\u10D4\u10D1\u10D8, \u10E8\u10E3\u10D0\u10DA\u10D4\u10D3\u10E3\u10E0\u10D8/\u10E4\u10D8\u10DC\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D5\u10D0\u10D3\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D0\u10E0\u10D3\u10D0\u10D3\u10D4\u10D2\u10D4\u10D1\u10D8</p>
      </div>
    </div>

    <div class="chip-row" role="group" aria-label="\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8" style="margin:10px 0 20px">
      ${uniChips}
    </div>

    <div class="stack" style="gap:18px">
      ${uni.semesters.map(renderSemester).join("")}
    </div>

    ${holidayList ? `
      <h2 class="section-title">\u{1F3D6} \u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D3\u10D0\u10E1\u10D5\u10D4\u10DC\u10D4\u10D1\u10D8\u10E1 \u10D3\u10E6\u10D4\u10D4\u10D1\u10D8</h2>
      <ul class="holiday-grid card">${holidayList}</ul>
    ` : ""}

    <p class="muted" style="margin-top:24px;font-size:12px;text-align:center">
      \u2139 \u10D7\u10D0\u10E0\u10D8\u10E6\u10D4\u10D1\u10D8 \u10DB\u10D8\u10D0\u10EE\u10DA\u10DD\u10D4\u10D1\u10D8\u10D7\u10D8\u10D0. \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8\u10D3\u10D0\u10DC \u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D2\u10E0\u10D0\u10E4\u10D8\u10D9\u10D8\u10E1 \u10DB\u10D8\u10E6\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10D2\u10D0\u10DC\u10D0\u10EE\u10DA\u10D3\u10D4\u10D1\u10D0.
    </p>
  `;
      };
      semesterStatusFor = (uniId) => {
        if (!supportedIds().includes(uniId)) uniId = readUni();
        if (!uniId) return null;
        const sem = getCurrentSemester(uniId);
        if (!sem) return null;
        const t = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const inSession = sem.semester.start <= t && t <= sem.semester.end;
        const progress = semProgress(sem);
        const daysLeft = inSession ? daysBetween(/* @__PURE__ */ new Date(), sem.semester.end) : null;
        const finalsLeft = sem.finals && sem.finals.start > t ? daysBetween(/* @__PURE__ */ new Date(), sem.finals.start) : null;
        return { uniId, sem, progress, daysLeft, finalsLeft, inSession };
      };
    }
  });

  // static-site/js/views/schedule.js
  var schedule_exports = {};
  __export(schedule_exports, {
    lectureOccursOn: () => lectureOccursOn,
    scheduleView: () => scheduleView
  });
  function openAddModal(defaultDate, defaultKind) {
    const card = document.getElementById("modalCard");
    const back = document.getElementById("modalBackdrop");
    card.innerHTML = buildAddFormHtml(defaultDate, defaultKind);
    back.hidden = false;
    const closeBtn = card.querySelector("[data-close]");
    const close2 = () => {
      back.hidden = true;
      card.innerHTML = "";
    };
    closeBtn.addEventListener("click", close2);
    back.addEventListener("click", (e) => {
      if (e.target === back) close2();
    });
  }
  function renderMonth(year, month, sel) {
    const first = new Date(year, month, 1);
    const startOffset = dowMon0(first);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const today = todayYmd();
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return `
    <div class="cal-grid">
      <div class="cal-head">
        ${DAYS_SHORT.map((d) => `<div class="cal-dow">${d}</div>`).join("")}
      </div>
      <div class="cal-body">
        ${rows.map((row) => `<div class="cal-row">${row.map((d) => {
      if (!d) return `<div class="cal-cell cal-empty"></div>`;
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      const evs = eventsForDate(dateStr);
      const isToday = dateStr === today;
      const isSel = dateStr === sel;
      const dots = evs.slice(0, 4).map((e) => `<span class="cal-dot" style="background:${COLORS[e.kind]}" title="${escapeHtml(e.title)}"></span>`).join("");
      const more = evs.length > 4 ? `<span class="cal-more">+${evs.length - 4}</span>` : "";
      return `<button type="button" class="cal-cell ${isToday ? "is-today" : ""} ${isSel ? "is-sel" : ""} ${evs.length ? "has-events" : ""}"
            onclick="__campus.schPickDay('${dateStr}')">
            <span class="cal-num">${d}</span>
            <span class="cal-dots">${dots}${more}</span>
          </button>`;
    }).join("")}</div>`).join("")}
      </div>
    </div>
  `;
  }
  function renderDayEvents(sel) {
    const evs = eventsForDate(sel);
    const d = parseYmd(sel);
    const headTxt = `${d.getDate()} ${MONTHS[d.getMonth()]} \xB7 ${DAYS_FULL[dowMon0(d)]}`;
    if (!evs.length) {
      return `<div class="day-pane">
      <div class="day-pane-head"><h2 style="margin:0;font-size:17px">${headTxt}</h2></div>
      <div class="card" style="text-align:center;padding:22px">
        <div style="font-size:32px">\u{1F324}</div>
        <p class="muted" style="margin:8px 0 12px">\u10D0\u10DB \u10D3\u10E6\u10D4\u10E1 \u10D3\u10D0\u10D2\u10D4\u10D2\u10DB\u10D8\u10DA\u10D8 \u10D0\u10E0\u10D0\u10E4\u10D4\u10E0\u10D8 \u10D2\u10D0\u10E5\u10D5\u10E1</p>
        <div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','lecture')">\u{1F4DA} \u10DA\u10D4\u10E5\u10EA\u10D8\u10D0</button>
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','exam')">\u{1F4DD} \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0</button>
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','quiz')">\u{1F9E0} \u10E5\u10D5\u10D8\u10D6\u10D8</button>
        </div>
      </div>
    </div>`;
    }
    return `<div class="day-pane">
    <div class="day-pane-head">
      <h2 style="margin:0;font-size:17px">${headTxt}</h2>
      <span class="muted" style="font-size:13px">${evs.length} \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D8</span>
    </div>
    <div class="stack">
      ${evs.map((e) => `
        <div class="card" style="border-left:4px solid ${COLORS[e.kind]}">
          <div class="card-row" style="align-items:flex-start">
            <div style="min-width:0;flex:1">
              <div class="row" style="gap:6px;align-items:center;flex-wrap:wrap">
                <span class="badge" style="background:${COLORS[e.kind]};color:#fff;font-size:11px">${ICONS[e.kind]} ${KIND_LABEL[e.kind]}</span>
                ${e.start ? `<span class="muted" style="font-size:12px">\u{1F558} ${e.start}${e.end ? "\u2013" + e.end : ""}</span>` : ""}
              </div>
              <h3 style="margin:6px 0 4px;font-size:15px">${escapeHtml(e.title)}</h3>
              <div class="muted" style="font-size:13px;display:flex;gap:10px;flex-wrap:wrap">
                ${e.location ? `<span>\u{1F4CD} ${escapeHtml(e.location)}</span>` : ""}
                ${e.lecturer ? `<span>\u{1F464} ${escapeHtml(e.lecturer)}</span>` : ""}
              </div>
            </div>
            ${e.kind === "lecture" ? `<div class="row" style="gap:4px;flex-shrink:0">
                  <button class="btn-icon" onclick="__campus.schDelLecDay('${e.id}','${sel}')" title="\u10D0\u10DB\u10DD\u10E8\u10D0\u10DA\u10D4 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D4\u10E1 \u10D3\u10E6\u10D4" aria-label="\u10D0\u10DB\u10DD\u10E8\u10D0\u10DA\u10D4 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D4\u10E1 \u10D3\u10E6\u10D4">\u{1F4C5}\u2715</button>
                  <button class="btn-icon" onclick="__campus.schDelLecAll('${e.id}')" title="\u10D0\u10DB\u10DD\u10E8\u10D0\u10DA\u10D4 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10D9\u10D5\u10D8\u10E0\u10D0\u10E8\u10D8" aria-label="\u10D0\u10DB\u10DD\u10E8\u10D0\u10DA\u10D4 \u10DB\u10D7\u10DA\u10D8\u10D0\u10DC\u10D0\u10D3">\u{1F5D1}</button>
                 </div>` : `<button class="btn-icon" onclick="__campus.schDelExam('${e.id}')" title="\u10EC\u10D0\u10E8\u10DA\u10D0" aria-label="\u10EC\u10D0\u10E8\u10DA\u10D0">\u2715</button>`}
          </div>
        </div>`).join("")}
    </div>
  </div>`;
  }
  var KEY3, DAYS_SHORT, DAYS_FULL, MONTHS, readLec, writeLec, pad, ymd, parseYmd, todayYmd, dowMon0, addDays, lectureOccursOn, COLORS, ICONS, KIND_LABEL, getView, setView, eventsForDate, buildAddFormHtml, scheduleView;
  var init_schedule = __esm({
    "static-site/js/views/schedule.js"() {
      "use strict";
      init_ui();
      init_router();
      init_state();
      KEY3 = "campus.schedule";
      DAYS_SHORT = ["\u10DD\u10E0\u10E8", "\u10E1\u10D0\u10DB", "\u10DD\u10D7\u10EE", "\u10EE\u10E3\u10D7", "\u10DE\u10D0\u10E0", "\u10E8\u10D0\u10D1", "\u10D9\u10D5\u10D8"];
      DAYS_FULL = ["\u10DD\u10E0\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8", "\u10E1\u10D0\u10DB\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8", "\u10DD\u10D7\u10EE\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8", "\u10EE\u10E3\u10D7\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8", "\u10DE\u10D0\u10E0\u10D0\u10E1\u10D9\u10D4\u10D5\u10D8", "\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8", "\u10D9\u10D5\u10D8\u10E0\u10D0"];
      MONTHS = ["\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10D8", "\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10D8", "\u10DB\u10D0\u10E0\u10E2\u10D8", "\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8", "\u10DB\u10D0\u10D8\u10E1\u10D8", "\u10D8\u10D5\u10DC\u10D8\u10E1\u10D8", "\u10D8\u10D5\u10DA\u10D8\u10E1\u10D8", "\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10DD", "\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8", "\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10D8", "\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8", "\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8"];
      readLec = () => {
        try {
          return JSON.parse(localStorage.getItem(KEY3) || "[]");
        } catch {
          return [];
        }
      };
      writeLec = (v) => localStorage.setItem(KEY3, JSON.stringify(v));
      pad = (n) => String(n).padStart(2, "0");
      ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      parseYmd = (s) => {
        const [y, m, d] = s.split("-").map(Number);
        return new Date(y, m - 1, d);
      };
      todayYmd = () => ymd(/* @__PURE__ */ new Date());
      dowMon0 = (d) => (d.getDay() + 6) % 7;
      addDays = (s, n) => {
        const d = parseYmd(s);
        d.setDate(d.getDate() + n);
        return ymd(d);
      };
      lectureOccursOn = (l, ymdStr) => {
        const dow = dowMon0(parseYmd(ymdStr));
        if (l.day !== dow) return false;
        if (l.firstDate) {
          if (ymdStr < l.firstDate) return false;
          if (ymdStr > addDays(l.firstDate, 27)) return false;
        }
        if (Array.isArray(l.skipDates) && l.skipDates.includes(ymdStr)) return false;
        return true;
      };
      COLORS = { lecture: "#6d5cf6", exam: "#ef4444", quiz: "#10b981" };
      ICONS = { lecture: "\u{1F4DA}", exam: "\u{1F4DD}", quiz: "\u{1F9E0}" };
      KIND_LABEL = { lecture: "\u10DA\u10D4\u10E5\u10EA\u10D8\u10D0", exam: "\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0", quiz: "\u10E5\u10D5\u10D8\u10D6\u10D8" };
      getView = () => {
        const m = location.hash.match(/[?&]m=(\d{4})-(\d{2})/);
        const dm = location.hash.match(/[?&]d=(\d{4}-\d{2}-\d{2})/);
        const now = /* @__PURE__ */ new Date();
        const year = m ? Number(m[1]) : now.getFullYear();
        const month = m ? Number(m[2]) - 1 : now.getMonth();
        const sel = dm ? dm[1] : todayYmd();
        return { year, month, sel };
      };
      setView = ({ year, month, sel }) => {
        const base = location.hash.split("?")[0];
        location.hash = `${base}?m=${year}-${pad(month + 1)}&d=${sel}`;
      };
      eventsForDate = (ymdStr) => {
        const out = [];
        readLec().forEach((l) => {
          if (lectureOccursOn(l, ymdStr)) out.push({ ...l, kind: "lecture", date: ymdStr });
        });
        getExams().forEach((e) => {
          if (e.date === ymdStr) out.push({ ...e, kind: e.kind || "exam" });
        });
        return out.sort((a, b) => (a.start || "23:59").localeCompare(b.start || "23:59"));
      };
      buildAddFormHtml = (defaultDate, defaultKind = "lecture") => {
        const d = defaultDate ? parseYmd(defaultDate) : /* @__PURE__ */ new Date();
        const dow = dowMon0(d);
        return `
  <div class="modal-head">
    <h3>\u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10D2\u10D0\u10DC\u10E0\u10D8\u10D2\u10E8\u10D8</h3>
    <button class="btn-icon" data-close>\u2715</button>
  </div>
  <form onsubmit="__campus.schAdd(event)" class="modal-body">
    <div class="field"><label>\u10E2\u10D8\u10DE\u10D8</label>
      <select name="kind" onchange="__campus.schToggleKind(this.value)">
        <option value="lecture" ${defaultKind === "lecture" ? "selected" : ""}>\u{1F4DA} \u10DA\u10D4\u10E5\u10EA\u10D8\u10D0 (\u10D9\u10D5\u10D8\u10E0\u10D4\u10E3\u10DA\u10D8)</option>
        <option value="exam" ${defaultKind === "exam" ? "selected" : ""}>\u{1F4DD} \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0</option>
        <option value="quiz" ${defaultKind === "quiz" ? "selected" : ""}>\u{1F9E0} \u10E5\u10D5\u10D8\u10D6\u10D8</option>
      </select>
    </div>
    <div class="grid grid-2">
      <div class="field" data-kind-field="lecture"><label>\u10D3\u10E6\u10D4 (\u10D9\u10D5\u10D8\u10E0\u10D0\u10E8\u10D8)</label>
        <select name="day">
          ${DAYS_SHORT.map((_, i) => `<option value="${i}" ${i === dow ? "selected" : ""}>${DAYS_FULL[i]}</option>`).join("")}
        </select>
      </div>
      <div class="field" data-kind-field="lecture"><label>\u10D3\u10D0\u10EC\u10E7\u10D4\u10D1\u10D8\u10E1 \u10D7\u10D0\u10E0\u10D8\u10E6\u10D8</label>
        <input type="date" name="firstDate" value="${defaultDate || todayYmd()}" />
        <span class="muted" style="font-size:11px;display:block;margin-top:4px">\u10D2\u10D0\u10D2\u10E0\u10EB\u10D4\u10DA\u10D3\u10D4\u10D1\u10D0 1 \u10D7\u10D5\u10D8\u10E1 \u10D2\u10D0\u10DC\u10DB\u10D0\u10D5\u10DA\u10DD\u10D1\u10D0\u10E8\u10D8 (4 \u10D9\u10D5\u10D8\u10E0\u10D0)</span>
      </div>
      <div class="field" data-kind-field="dated" style="display:${defaultKind === "lecture" ? "none" : ""}"><label>\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8</label>
        <input type="date" name="date" value="${defaultDate || todayYmd()}" />
      </div>
      <div class="field"><label>\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8</label><input name="title" required placeholder="\u10DB\u10D0\u10D2. \u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10E3\u10E1\u10D8 I" /></div>
      <div class="field" data-kind-field="lecture"><label>\u10D3\u10D0\u10EC\u10E7\u10D4\u10D1\u10D0</label><input type="time" name="start" /></div>
      <div class="field" data-kind-field="lecture"><label>\u10D3\u10D0\u10E1\u10D0\u10E1\u10E0\u10E3\u10DA\u10D8</label><input type="time" name="end" /></div>
      <div class="field"><label>\u10D0\u10E3\u10D3\u10D8\u10E2\u10DD\u10E0\u10D8\u10D0</label><input name="location" placeholder="\u10DB\u10D0\u10D2. 207, \u10D9.II" /></div>
      <div class="field" data-kind-field="lecture"><label>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</label><input name="lecturer" placeholder="\u10D2\u10D5\u10D0\u10E0\u10D8, \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" /></div>
      <div class="field" data-kind-field="dated" style="display:${defaultKind === "lecture" ? "none" : ""}"><label>\u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4 \u2014 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</label>
        <select name="reminderDays">
          <option value="1">1 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
          <option value="2">2 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
          <option value="3" selected>3 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
          <option value="7">1 \u10D9\u10D5\u10D8\u10E0\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
  </form>
`;
      };
      scheduleView = () => {
        const { year, month, sel } = getView();
        expose("schAdd", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const kind = (fd.get("kind") || "lecture").toString();
          const title = (fd.get("title") || "").toString().trim();
          if (!title) return;
          if (kind === "lecture") {
            const start = (fd.get("start") || "").toString();
            const end = (fd.get("end") || "").toString();
            if (!start || !end) {
              showToast("\u10E8\u10D4\u10D0\u10D5\u10E1\u10D4 \u10D3\u10E0\u10DD\u10D8\u10E1 \u10D5\u10D4\u10DA\u10D4\u10D1\u10D8");
              return;
            }
            const dayNum = Number(fd.get("day"));
            let firstDate = (fd.get("firstDate") || todayYmd()).toString();
            const fd0 = parseYmd(firstDate);
            const diff = (dayNum - dowMon0(fd0) + 7) % 7;
            if (diff) firstDate = addDays(firstDate, diff);
            const all = readLec();
            all.push({
              id: crypto.randomUUID(),
              day: dayNum,
              start,
              end,
              title,
              location: (fd.get("location") || "").toString().trim(),
              lecturer: (fd.get("lecturer") || "").toString().trim(),
              firstDate,
              skipDates: []
            });
            writeLec(all);
          } else {
            const date = (fd.get("date") || "").toString();
            if (!date) {
              showToast("\u10E8\u10D4\u10D0\u10D5\u10E1\u10D4 \u10D7\u10D0\u10E0\u10D8\u10E6\u10D8");
              return;
            }
            addExam({
              kind,
              title,
              date,
              location: (fd.get("location") || "").toString().trim(),
              reminderDays: Number(fd.get("reminderDays")) || 3
            });
          }
          document.getElementById("modalBackdrop").hidden = true;
          showToast("\u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0");
          refresh();
        });
        expose("schToggleKind", (k) => {
          const isLec = k === "lecture";
          document.querySelectorAll('[data-kind-field="lecture"]').forEach((el) => el.style.display = isLec ? "" : "none");
          document.querySelectorAll('[data-kind-field="dated"]').forEach((el) => el.style.display = isLec ? "none" : "");
        });
        expose("schDelLecDay", (id, date) => {
          const all = readLec();
          const l = all.find((x) => x.id === id);
          if (!l) return;
          l.skipDates = Array.isArray(l.skipDates) ? l.skipDates : [];
          if (!l.skipDates.includes(date)) l.skipDates.push(date);
          writeLec(all);
          showToast("\u10D0\u10DB\u10DD\u10E8\u10DA\u10D8\u10DA\u10D8\u10D0 \u10D0\u10DB \u10D3\u10E6\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1");
          refresh();
        });
        expose("schDelLecAll", (id) => {
          if (!confirm("\u10D2\u10DC\u10D4\u10D1\u10D0\u10D5\u10D7 \u10EC\u10D0\u10E8\u10D0\u10DA\u10DD\u10D7 \u10D4\u10E1 \u10DA\u10D4\u10E5\u10EA\u10D8\u10D0 \u10DB\u10D7\u10DA\u10D8\u10D0\u10DC\u10D0\u10D3?")) return;
          writeLec(readLec().filter((l) => l.id !== id));
          showToast("\u10D0\u10DB\u10DD\u10E8\u10DA\u10D8\u10DA\u10D8\u10D0 \u10DB\u10D7\u10DA\u10D8\u10D0\u10DC\u10D0\u10D3");
          refresh();
        });
        expose("schDelExam", (id) => {
          removeExam(id);
          refresh();
        });
        expose("schOpenAdd", (date, kind) => openAddModal(date || sel, kind || "lecture"));
        expose("schPickDay", (dateStr) => setView({ year, month, sel: dateStr }));
        expose("schPrevMonth", () => {
          const nm = month === 0 ? 11 : month - 1;
          const ny = month === 0 ? year - 1 : year;
          setView({ year: ny, month: nm, sel });
        });
        expose("schNextMonth", () => {
          const nm = month === 11 ? 0 : month + 1;
          const ny = month === 11 ? year + 1 : year;
          setView({ year: ny, month: nm, sel });
        });
        expose("schToday", () => {
          const t = /* @__PURE__ */ new Date();
          setView({ year: t.getFullYear(), month: t.getMonth(), sel: todayYmd() });
        });
        return `
    <div class="page-head">
      <div>
        <h1 style="margin:0">\u{1F4C5} \u10D2\u10D0\u10DC\u10E0\u10D8\u10D2\u10D8</h1>
        <p class="muted" style="margin:4px 0 0;font-size:13px">\u10DA\u10D4\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8, \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10E5\u10D5\u10D8\u10D6\u10D4\u10D1\u10D8 \u2014 \u10D4\u10E0\u10D7 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10E8\u10D8</p>
      </div>
      <button class="btn btn-primary" onclick="__campus.schOpenAdd()">+ \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
    </div>

    <div class="cal-toolbar">
      <button class="btn-icon" onclick="__campus.schPrevMonth()" aria-label="\u10EC\u10D8\u10DC\u10D0 \u10D7\u10D5\u10D4">\u2039</button>
      <h2 class="cal-title">${MONTHS[month]} ${year}</h2>
      <button class="btn-icon" onclick="__campus.schNextMonth()" aria-label="\u10E8\u10D4\u10DB\u10D3\u10D4\u10D2\u10D8 \u10D7\u10D5\u10D4">\u203A</button>
      <button class="btn btn-ghost btn-sm" onclick="__campus.schToday()">\u10D3\u10E6\u10D4\u10E1</button>
    </div>

    ${renderMonth(year, month, sel)}

    ${renderDayEvents(sel)}
  `;
      };
    }
  });

  // static-site/js/views/dashboard.js
  var dashboard_exports = {};
  __export(dashboard_exports, {
    dashboardView: () => dashboardView
  });
  var _facStudents, _facStudentsFor, _facStudentsOpen, _facStudentsLoading, loadFacultyStudents, SCHED_KEY, readSched, todayYmdStr, nowMin, toMin, dashboardView;
  var init_dashboard = __esm({
    "static-site/js/views/dashboard.js"() {
      "use strict";
      init_data();
      init_state();
      init_auth();
      init_ui();
      init_news_data();
      init_academic();
      init_firebase();
      init_router();
      init_ui();
      init_schedule();
      _facStudents = null;
      _facStudentsFor = null;
      _facStudentsOpen = false;
      _facStudentsLoading = false;
      loadFacultyStudents = async (facultyId) => {
        if (!facultyId || !firebaseEnabled) return [];
        if (_facStudentsFor === facultyId && _facStudents) return _facStudents;
        try {
          _facStudentsLoading = true;
          const fb = await loadFirebase();
          const snap = await fb.getDocs(fb.collection(fb.db, "users"));
          const list2 = snap.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((u) => u.facultyId === facultyId && u.role !== "admin").sort((a, b) => (a.firstName || a.email || "").localeCompare(b.firstName || b.email || ""));
          _facStudents = list2;
          _facStudentsFor = facultyId;
          _facStudentsLoading = false;
          setTimeout(() => {
            try {
              refresh();
            } catch {
            }
          }, 0);
          return list2;
        } catch (e) {
          _facStudentsLoading = false;
          console.warn("dashboard students load", e?.message || e);
          return [];
        }
      };
      expose("dashToggleStudents", (facultyId) => {
        _facStudentsOpen = !_facStudentsOpen;
        if (_facStudentsOpen && facultyId && _facStudentsFor !== facultyId) {
          loadFacultyStudents(facultyId);
        }
        try {
          refresh();
        } catch {
        }
      });
      SCHED_KEY = "campus.schedule";
      readSched = () => {
        try {
          return JSON.parse(localStorage.getItem(SCHED_KEY) || "[]");
        } catch {
          return [];
        }
      };
      todayYmdStr = () => {
        const d = /* @__PURE__ */ new Date();
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      };
      nowMin = () => {
        const d = /* @__PURE__ */ new Date();
        return d.getHours() * 60 + d.getMinutes();
      };
      toMin = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      dashboardView = () => {
        const user = getUser();
        const name = getFirstName();
        const profile = getProfile();
        const exams = getExams();
        const allUpcoming = exams.map((e) => ({ ...e, d: daysUntil(e.date) })).filter((e) => e.d >= 0);
        const upcomingExams = allUpcoming.filter((e) => (e.kind || "exam") === "exam").slice(0, 3);
        const upcomingQuizzes = allUpcoming.filter((e) => e.kind === "quiz").slice(0, 3);
        const upcoming = allUpcoming.slice(0, 2);
        const reminders = exams.map((e) => ({ ...e, d: daysUntil(e.date) })).filter((e) => e.d >= 0 && e.d <= (e.reminderDays ?? 3)).slice(0, 3);
        const hour = (/* @__PURE__ */ new Date()).getHours();
        const greet = hour < 6 ? "\u10D9\u10D0\u10E0\u10D2\u10D8 \u10E6\u10D0\u10DB\u10D4" : hour < 12 ? "\u10D3\u10D8\u10DA\u10D0 \u10DB\u10E8\u10D5\u10D8\u10D3\u10DD\u10D1\u10D8\u10E1\u10D0" : hour < 18 ? "\u10DB\u10DD\u10D2\u10D4\u10E1\u10D0\u10DA\u10DB\u10D4\u10D1\u10D8" : "\u10E1\u10D0\u10E6\u10D0\u10DB\u10DD \u10DB\u10E8\u10D5\u10D8\u10D3\u10DD\u10D1\u10D8\u10E1\u10D0";
        const tymd = todayYmdStr();
        const sched = readSched().filter((x) => lectureOccursOn(x, tymd)).sort((a, b) => a.start.localeCompare(b.start));
        const now = nowMin();
        const todayUpcoming = sched.filter((x) => toMin(x.end) > now).slice(0, 3);
        const todayIsoStr = tymd;
        const todayExams = exams.filter((e) => e.date === todayIsoStr);
        const todayEvents = [];
        sched.forEach((l) => todayEvents.push({
          kind: "lecture",
          kindLabel: "\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10DA\u10D4\u10E5\u10EA\u10D8\u10D0",
          title: l.title || "\u10DA\u10D4\u10E5\u10EA\u10D8\u10D0",
          time: l.start + (l.end ? " \u2013 " + l.end : ""),
          where: l.location || "",
          who: l.lecturer || "",
          startMin: toMin(l.start)
        }));
        todayExams.forEach((ex) => todayEvents.push({
          kind: ex.kind === "quiz" ? "quiz" : "exam",
          kindLabel: ex.kind === "quiz" ? "\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10E5\u10D5\u10D8\u10D6\u10D8" : "\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0",
          title: ex.title || (ex.kind === "quiz" ? "\u10E5\u10D5\u10D8\u10D6\u10D8" : "\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0"),
          time: ex.time || "\u10D3\u10E6\u10D4\u10E1",
          where: ex.location || "",
          who: "",
          startMin: ex.time ? toMin(ex.time) : 24 * 60
        }));
        todayEvents.sort((a, b) => (a.startMin ?? 0) - (b.startMin ?? 0));
        const renderSlide = (ev) => {
          const mins = ev.startMin != null ? Math.max(0, ev.startMin - now) : null;
          const countdown = mins == null ? "" : mins === 0 ? "\u10D0\u10EE\u10DA\u10D0 \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4\u10DD\u10D1\u10E1" : mins < 60 ? `\u10D8\u10EC\u10E7\u10D4\u10D1\u10D0 ${mins} \u10EC\u10E3\u10D7\u10E8\u10D8` : `\u10D8\u10EC\u10E7\u10D4\u10D1\u10D0 ${Math.floor(mins / 60)} \u10E1\u10D7 ${mins % 60 ? mins % 60 + " \u10EC\u10D7" : ""}-\u10E8\u10D8`;
          return `<div class="ne-slide">
      <div class="next-event-kind">${escapeHtml(ev.kindLabel)}</div>
      <div class="next-event-title">${escapeHtml(ev.title)}</div>
      <div class="next-event-meta">
        <span class="ne-meta-item"><span class="ne-meta-lbl">\u10D3\u10E0\u10DD</span>${escapeHtml(ev.time)}</span>
        ${ev.where ? `<span class="ne-meta-item"><span class="ne-meta-lbl">\u10DD\u10D7\u10D0\u10EE\u10D8</span>${escapeHtml(ev.where)}</span>` : ""}
        ${ev.who ? `<span class="ne-meta-item"><span class="ne-meta-lbl">\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</span>${escapeHtml(ev.who)}</span>` : ""}
      </div>
      ${countdown ? `<div class="next-event-countdown">${countdown}</div>` : ""}
    </div>`;
        };
        let nextEventCard;
        if (todayEvents.length) {
          const dots = todayEvents.length > 1 ? `<div class="ne-dots" role="tablist" aria-label="\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10E6\u10DD\u10DC\u10D8\u10E1\u10EB\u10D8\u10D4\u10D1\u10D4\u10D1\u10D8">
          ${todayEvents.map((_, i) => `<span class="ne-dot${i === 0 ? " active" : ""}" data-i="${i}"></span>`).join("")}
        </div>` : "";
          nextEventCard = `
      <div class="card next-event-card" aria-label="\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10E6\u10DD\u10DC\u10D8\u10E1\u10EB\u10D8\u10D4\u10D1\u10D4\u10D1\u10D8" data-init="neCarousel">
        <div class="ne-scroll">${todayEvents.map(renderSlide).join("")}</div>
        ${dots}
      </div>`;
        } else {
          nextEventCard = `
      <div class="card next-event-card next-event-card--free" aria-label="\u10D3\u10E6\u10D4\u10D5\u10D0\u10DC\u10D3\u10D4\u10DA\u10D8 \u10D3\u10E6\u10D4">
        <div class="next-event-kind">\u10D3\u10E6\u10D4\u10E1</div>
        <div class="next-event-title">\u10D0\u10E5\u10E2\u10D8\u10D5\u10DD\u10D1\u10D0 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1 \u10D3\u10D0\u10D2\u10D4\u10D2\u10DB\u10D8\u10DA\u10D8</div>
      </div>`;
        }
        const sidePanels = `<aside class="dash-side">${nextEventCard}</aside>`;
        const todayEmpty = !todayUpcoming.length && !upcoming.length;
        return `


    <section class="dash-hero">
      <div class="dash-hero-text">
        <h1>${greet},<br/><span class="text-gradient">${escapeHtml(name)}</span></h1>

      </div>
      ${sidePanels}
    </section>

    ${reminders.length ? `<div class="dash-reminders" role="region" aria-label="\u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8">
      <div class="dash-reminders-head">
        <span class="section-eyebrow">\u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8</span>
        <a class="dash-link" href="#/schedule">\u10E1\u10E0\u10E3\u10DA\u10D0\u10D3 \u2192</a>
      </div>
      <div class="dash-reminder-list">
        ${reminders.map((r) => {
          const k = r.kind === "quiz" ? "\u10E5\u10D5\u10D8\u10D6\u10D8" : "\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0";
          return `<a href="#/schedule" class="dash-reminder-item">
            <span class="dr-kind">${k}</span>
            <span class="dr-title">${escapeHtml(r.title)}</span>
            <span class="dr-date muted">${r.date}</span>
            <span class="badge ${r.d <= 1 ? "badge-danger" : "badge-primary"} dr-badge">${r.d === 0 ? "\u10D3\u10E6\u10D4\u10E1" : `${r.d}\u10D3`}</span>
          </a>`;
        }).join("")}
      </div>
    </div>` : ""}

    <div class="dash-block">
      <a class="btn btn-primary btn-lg dash-schedule-btn" href="#/schedule" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 18px;font-size:15px">
        <span aria-hidden="true">\u{1F4C5}</span>
        <span>\u10D2\u10D0\u10DC\u10E0\u10D8\u10D2\u10D8</span>
      </a>
    </div>

    ${(() => {
          const status = semesterStatusFor("tsu");
          if (!status) return "";
          const headline = status.finalsLeft != null ? `\u10E4\u10D8\u10DC\u10D0\u10DA\u10E3\u10E0\u10D0\u10DB\u10D3\u10D4 \u2014 <b>${status.finalsLeft}</b> \u10D3\u10E6\u10D4` : status.daysLeft != null ? `\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10D1\u10DD\u10DA\u10DD\u10DB\u10D3\u10D4 \u2014 <b>${status.daysLeft}</b> \u10D3\u10E6\u10D4` : `${escapeHtml(status.sem.name)}`;
          return `<a href="#/academic" class="card sem-progress-card dash-block-card" aria-label="\u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8">
        <div class="row between" style="margin-bottom:10px;flex-wrap:nowrap;gap:8px">
          <div style="min-width:0">
            <div class="section-eyebrow" style="margin-bottom:4px">\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8</div>
            <div style="font-weight:600;font-size:14px">${headline}</div>
            <div class="muted" style="font-size:12px;margin-top:2px">${escapeHtml(status.sem.name)}</div>
          </div>
          <span class="muted" style="font-size:13px;flex-shrink:0;font-variant-numeric:tabular-nums">${status.progress}%</span>
        </div>
        <div class="progress" aria-label="\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10EC\u10D8\u10DC\u10E1\u10D5\u10DA\u10D0"><div class="progress-bar" style="width:${status.progress}%"></div></div>
      </a>`;
        })()}

    ${(() => {
          const top = [...newsItems].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 2);
          if (!top.length) return "";
          const uniMap2 = Object.fromEntries(universities.map((u) => [u.id, u]));
          return `<div class="dash-block">
        <div class="dash-col-head">
          <span class="section-eyebrow">\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8</span>
          <a class="dash-link" href="#/news">\u10E1\u10E0\u10E3\u10DA\u10D0\u10D3 \u2192</a>
        </div>
        <div class="stack">
          ${top.map((n) => `<a class="card news-mini" href="#/news">
            <div class="news-mini-top">
              <span class="news-uni">${escapeHtml(uniMap2[n.uniId]?.name || n.uniId)}</span>
              ${n.pinned ? `<span class="news-pin" aria-label="\u10D3\u10D0\u10DE\u10D8\u10DC\u10E3\u10DA\u10D8">\u25CF</span>` : ""}
            </div>
            <div class="news-mini-title">${escapeHtml(n.title)}</div>
          </a>`).join("")}
        </div>
      </div>`;
        })()}

    <div class="dash-block">
      <div class="dash-col-head"><span class="section-eyebrow">${T("dash.quick.eyebrow")}</span></div>
      <div class="grid grid-3 quick-grid">
        <a class="card quick" href="#/chats"><div class="qi">\u{1F4AC}</div><h3>${T("dash.quick.forums.title")}</h3><p class="muted">${T("dash.quick.forums.body")}</p></a>
        <a class="card quick" href="#/resources"><div class="qi">\u{1F4DA}</div><h3>${T("dash.quick.resources.title")}</h3><p class="muted">${T("dash.quick.resources.body")}</p></a>
        <a class="card quick" href="#/faq"><div class="qi">\u2753</div><h3>${T("dash.quick.faq.title")}</h3><p class="muted">${T("dash.quick.faq.body")}</p></a>
        <a class="card quick" href="#/lecturers"><div class="qi">\u{1F468}\u200D\u{1F3EB}</div><h3>${T("dash.quick.lecturers.title")}</h3><p class="muted">${T("dash.quick.lecturers.body")}</p></a>
        <a class="card quick" href="#/schedule"><div class="qi">\u{1F4C5}</div><h3>${T("dash.quick.calendar.title")}</h3><p class="muted">${T("dash.quick.calendar.body")}</p></a>
        <a class="card quick" href="#/gpa"><div class="qi">\u{1F9EE}</div><h3>${T("dash.quick.gpa.title")}</h3><p class="muted">${T("dash.quick.gpa.body")}</p></a>
      </div>
    </div>

  `;
      };
    }
  });

  // static-site/js/qaComments.js
  var LS_KEY, readLS, writeLS, subscribeQA, addQAComment, deleteQAComment;
  var init_qaComments = __esm({
    "static-site/js/qaComments.js"() {
      "use strict";
      init_firebase();
      init_auth();
      LS_KEY = "campus.qaComments";
      readLS = () => {
        try {
          return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
        } catch {
          return [];
        }
      };
      writeLS = (a) => localStorage.setItem(LS_KEY, JSON.stringify(a));
      subscribeQA = (subjectId, cb) => {
        if (!firebaseEnabled) {
          const all = readLS().filter((c) => c.subjectId === subjectId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          cb(all);
          const handler = () => {
            cb(readLS().filter((c) => c.subjectId === subjectId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
          };
          window.addEventListener("campus.qa.changed", handler);
          return () => window.removeEventListener("campus.qa.changed", handler);
        }
        let unsub = () => {
        };
        let cancelled = false;
        loadFirebase().then((fb) => {
          if (cancelled) return;
          try {
            const q2 = fb.query(
              fb.collection(fb.db, "qaComments"),
              fb.where("subjectId", "==", subjectId)
            );
            unsub = fb.onSnapshot(q2, (snap) => {
              const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1e3 || +a.createdAt || 0;
                const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1e3 || +b.createdAt || 0;
                return tb - ta;
              });
              cb(arr);
            }, (err) => {
              console.warn("qa sub", err?.message || err);
              cb([]);
            });
          } catch (e) {
            console.warn("qa sub fail", e);
            cb([]);
          }
        });
        return () => {
          cancelled = true;
          try {
            unsub();
          } catch {
          }
        };
      };
      addQAComment = async (subjectId, text) => {
        const user = getUser();
        if (!user) throw new Error("\u10D2\u10D7\u10EE\u10DD\u10D5 \u10E8\u10D4\u10EE\u10D5\u10D8\u10D3\u10D4");
        assertNotBlocked();
        const profile = getProfile();
        const trimmed = String(text || "").trim().slice(0, 1e3);
        if (!trimmed) throw new Error("\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8 \u10E2\u10D4\u10E5\u10E1\u10E2\u10D8");
        const author = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() || user.displayName || user.email?.split("@")[0] || "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8";
        if (firebaseEnabled) {
          if (!user.emailVerified) throw new Error("\u10D2\u10D7\u10EE\u10DD\u10D5, \u10D3\u10D0\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4 \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0");
          const fb = await loadFirebase();
          await fb.addDoc(fb.collection(fb.db, "qaComments"), {
            subjectId,
            userId: user.uid,
            authorEmail: user.email || null,
            author,
            text: trimmed,
            createdAt: fb.serverTimestamp()
          });
        } else {
          const all = readLS();
          all.push({
            id: "qa-" + Math.random().toString(36).slice(2),
            subjectId,
            userId: user.uid || "demo",
            authorEmail: user.email,
            author,
            text: trimmed,
            createdAt: Date.now()
          });
          writeLS(all);
          window.dispatchEvent(new CustomEvent("campus.qa.changed"));
        }
      };
      deleteQAComment = async (id, ownerUid) => {
        const user = getUser();
        if (!user) throw new Error("\u10D2\u10D7\u10EE\u10DD\u10D5 \u10E8\u10D4\u10EE\u10D5\u10D8\u10D3\u10D4");
        const canMod = canModerate();
        if (!canMod && ownerUid && ownerUid !== user.uid) throw new Error("\u10D4\u10E1 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8 \u10E8\u10D4\u10DC\u10D8 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1");
        if (firebaseEnabled) {
          const fb = await loadFirebase();
          await fb.deleteDoc(fb.doc(fb.db, "qaComments", id));
        } else {
          const all = readLS().filter((c) => c.id !== id);
          writeLS(all);
          window.dispatchEvent(new CustomEvent("campus.qa.changed"));
        }
      };
    }
  });

  // static-site/js/views/catalog.js
  var catalog_exports = {};
  __export(catalog_exports, {
    facultyView: () => facultyView,
    subjectView: () => subjectView,
    universitiesView: () => universitiesView,
    universityView: () => universityView
  });
  var safe, fmtNum, getSort, setSort, universitiesView, universityView, facultyView, getSubjTab, setSubjTab, subjectView;
  var init_catalog = __esm({
    "static-site/js/views/catalog.js"() {
      "use strict";
      init_data();
      init_state();
      init_ui();
      init_auth();
      init_router();
      init_qaComments();
      safe = (v, fallback = "\u2014") => v == null || v === "" ? fallback : v;
      fmtNum = (n) => n == null || isNaN(+n) ? "\u2014" : (+n).toLocaleString();
      getSort = () => {
        const m = location.hash.match(/[?&]sort=([a-z]+)/);
        return m ? m[1] : "name";
      };
      setSort = (s) => {
        const base = location.hash.split("?")[0];
        location.hash = `${base}?sort=${s}`;
      };
      universitiesView = () => {
        const sort = getSort();
        let list2 = [...universities];
        if (sort === "rating") list2.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort === "students") list2.sort((a, b) => (b.students || 0) - (a.students || 0));
        else if (sort === "city") list2.sort((a, b) => (a.city || "").localeCompare(b.city || "", "ka"));
        else list2.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ka"));
        expose("uniSort", (s) => setSort(s));
        const sortBtn = (id, label) => `<button class="seg ${sort === id ? "active" : ""}" onclick="__campus.uniSort('${id}')">${label}</button>`;
        return `
    <div class="crumbs"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8</div>
    <div class="page-head">
      <div>
        <h1 style="margin:0">\u{1F393} \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8</h1>
        <p class="muted" style="margin:4px 0 0">${universities.length} \u10D1\u10D0\u10D6\u10D0\u10E8\u10D8</p>
      </div>
    </div>


    ${list2.length ? `<div class="grid grid-3">
      ${list2.map((u, i) => {
          return `<div class="card uni-card">
          <a href="#/university/${u.id}" class="uni-link">
            <div class="card-row">
              <div style="min-width:0;flex:1">
                <h3 class="uni-card-title">${sort === "rating" && u.rating ? `<span class="text-gradient" style="margin-right:6px">#${i + 1}</span>` : ""}${escapeHtml(u.name || "\u2014")}</h3>
                <p class="uni-card-desc">${escapeHtml(u.fullName || u.name || "")}</p>
              </div>
              ${u.rating ? `<span class="badge badge-primary">\u2605 ${u.rating}</span>` : ""}
            </div>
            <div class="row muted uni-card-meta">
              <span>\u{1F4CD} ${escapeHtml(safe(u.city))}</span>
              ${u.students ? `<span>\u{1F465} ${fmtNum(u.students)}</span>` : ""}
              ${u.founded ? `<span>\u{1F4C5} ${u.founded}</span>` : ""}
            </div>
          </a>
        </div>`;
        }).join("")}
    </div>` : `<div class="empty"><div class="ico">\u{1F3DB}</div>\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10E3\u10DA\u10D0.</div>`}
  `;
      };
      universityView = ({ id }) => {
        const u = getUni(id);
        if (!u) return `<div class="empty"><div class="ico">\u{1F914}</div>\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0<br/><a href="#/universities" class="btn" style="margin-top:14px">\u10D3\u10D0\u10D1\u10E0\u10E3\u10DC\u10D4\u10D1\u10D0</a></div>`;
        const fac = facultiesByUni(id);
        const meta2 = [
          u.city ? `\u{1F4CD} ${escapeHtml(u.city)}` : "",
          u.founded ? `\u{1F4C5} \u10D3\u10D0\u10D0\u10E0\u10E1\u10D3\u10D0 ${u.founded}` : "",
          u.students ? `\u{1F465} ${fmtNum(u.students)} \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8` : ""
        ].filter(Boolean).join(" \xB7 ");
        return `
    <div class="crumbs"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / <a href="#/universities">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8</a> / ${escapeHtml(u.name || "")}</div>
    <div class="card-row" style="margin-bottom:24px">
      <div style="min-width:0">
        <h1 style="margin:0">${escapeHtml(u.fullName || u.name || "")}</h1>
        ${meta2 ? `<p class="muted">${meta2}</p>` : ""}
        ${u.rating ? `<span class="badge badge-primary">\u2605 ${u.rating}</span>` : ""}
      </div>
    </div>
    ${u.website ? `<p><a class="btn" href="${escapeHtml(u.website)}" target="_blank" rel="noopener">\u{1F310} \u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E1\u10D0\u10D8\u10E2\u10D8</a></p>` : ""}
    <h2 class="section-title">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8</h2>
    ${fac.length ? `<div class="grid grid-2">${fac.map((f) => `
      <a class="card" href="#/faculty/${f.id}">
        <h3>${escapeHtml(f.name || "")}</h3>
        <p class="muted">\u10D3\u10D4\u10D9\u10D0\u10DC\u10D8: ${escapeHtml(safe(f.dean))}</p>
      </a>`).join("")}</div>` : `<p class="muted">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10E3\u10DA\u10D0</p>`}
  `;
      };
      facultyView = ({ id }) => {
        const f = getFaculty(id);
        if (!f) return `<div class="empty"><div class="ico">\u{1F914}</div>\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</div>`;
        const u = getUni(f.uniId);
        const subs = subjectsByFaculty(id);
        return `
    <div class="crumbs">
      ${u ? `<a href="#/universities">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8</a> / <a href="#/university/${u.id}">${escapeHtml(u.name)}</a> / ` : ""}
      ${escapeHtml(f.name || "")}
    </div>
    <h1>${escapeHtml(f.name || "")}</h1>
    <p class="muted">\u10D3\u10D4\u10D9\u10D0\u10DC\u10D8: ${escapeHtml(safe(f.dean))}</p>
    ${f.description ? `<p>${escapeHtml(f.description)}</p>` : ""}
    <h2 class="section-title">\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8</h2>
    ${subs.length ? `<div class="grid grid-2">${subs.map((s) => `
      <a class="card" href="#/subject/${s.id}">
        <div class="card-row"><h3>${escapeHtml(s.name || "")}</h3>${s.code ? `<span class="badge">${escapeHtml(s.code)}</span>` : ""}</div>
        <p>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8: ${escapeHtml(safe(s.lecturer))} \xB7 ${s.credits || 0} \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</p>
      </a>`).join("")}</div>` : `<p class="muted">\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8 \u10D0\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</p>`}
  `;
      };
      getSubjTab = () => {
        const m = location.hash.match(/[?&]tab=([a-z]+)/);
        return m ? m[1] : "overview";
      };
      setSubjTab = (id, t) => {
        location.hash = `#/subject/${id}?tab=${t}`;
      };
      subjectView = ({ id }) => {
        const s = getSubject(id);
        if (!s) return `<div class="empty"><div class="ico">\u{1F914}</div>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</div>`;
        const f = getFaculty(s.facultyId);
        const u = f ? getUni(f.uniId) : null;
        const res = resourcesBySubject(id);
        const user = getUser();
        const isAdmin2 = isAdminUser();
        const tab = getSubjTab();
        const credits = s.credits || 0;
        const lecturer = safe(s.lecturer);
        const semester = safe(s.semester);
        expose("subjTab", (t) => setSubjTab(s.id, t));
        expose("submitComment", async (e) => {
          e.preventDefault();
          if (!user) {
            location.hash = "#/login";
            return;
          }
          const fd = new FormData(e.target);
          try {
            await addQAComment(id, fd.get("text"));
            const p = addPoints("comment");
            showToast(`+${p} \u10E5\u10E3\u10DA\u10D0`);
            e.target.reset();
          } catch (err) {
            showToast(err.message || "\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0");
          }
        });
        expose("qaDelete", async (cid, ownerUid) => {
          if (!confirm("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10D4\u10E1 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8?")) return;
          try {
            await deleteQAComment(cid, ownerUid);
            showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
          } catch (err) {
            showToast(err.message || "\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0");
          }
        });
        const tabOverview = `
    <div class="subj-overview">
      <div class="card">
        <h4 class="pn-head">\u{1F4C4} \u10E1\u10D8\u10DA\u10D0\u10D1\u10E3\u10E1\u10D8</h4>
        ${s.syllabus ? `<p style="margin:0;line-height:1.6">${escapeHtml(s.syllabus)}</p>` : `<p class="muted" style="margin:0">\u10E1\u10D8\u10DA\u10D0\u10D1\u10E3\u10E1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D4\u10D1\u10E3\u10DA\u10D0.</p>`}
      </div>
    </div>
  `;
        const tabQA = `
    <div class="card">
      <h4 class="pn-head">\u{1F4AC} \u10D3\u10D0\u10E1\u10D5\u10D8 \u10D9\u10D8\u10D7\u10EE\u10D5\u10D0 \u10D0\u10DC \u10D3\u10D0\u10E2\u10DD\u10D5\u10D4 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8</h4>
      <form onsubmit="__campus.submitComment(event)">
        <div class="field">
          <textarea name="text" rows="3" required maxlength="1000" ${user ? "" : "disabled"} placeholder="${user ? "\u10E8\u10D4\u10DC\u10D8 \u10D9\u10D8\u10D7\u10EE\u10D5\u10D0..." : "\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D0"}"></textarea>
        </div>
        ${user ? `<button class="btn btn-primary" type="submit">\u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0</button>` : `<a href="#/login" class="btn btn-primary">\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</a>`}
      </form>
    </div>
    <div id="qaList" class="stack" style="margin-top:14px">
      ${skList(3)}
    </div>
  `;
        const renderQA = (items) => {
          const box = document.getElementById("qaList");
          if (!box) return;
          const myUid = user?.uid;
          box.innerHTML = items.length ? items.map((c) => {
            const t = c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1e3) : new Date(+c.createdAt || Date.now());
            const canDel = isAdmin2 || myUid && c.userId === myUid;
            const safeOwner = String(c.userId || "").replace(/'/g, "\\'");
            const reportArg = `'qaComment','${c.id}',${JSON.stringify((c.text || "").slice(0, 180)).replace(/'/g, "&#39;")}`;
            return `<div class="card comment-item">
        <div class="comment-meta">
          <span class="comment-avatar">${escapeHtml((c.author || "?")[0].toUpperCase())}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px">${escapeHtml(c.author || "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8")}</div>
            <div class="muted" style="font-size:12px">${t.toLocaleString("ka-GE")}</div>
          </div>
          ${!canDel && myUid && c.userId !== myUid ? `<button class="btn btn-ghost" title="\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0" style="padding:4px 8px;font-size:12px" onclick="__campus.report(${reportArg})">\u2691</button>` : ""}
          ${canDel ? `<button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" onclick="__campus.qaDelete('${escapeHtml(c.id)}','${escapeHtml(safeOwner)}')">\u{1F5D1}</button>` : ""}
        </div>
        <div style="margin-top:10px;white-space:pre-wrap;word-break:break-word">${escapeHtml(c.text)}</div>
      </div>`;
          }).join("") : `<div class="empty"><div class="ico">\u{1F4AC}</div>\u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D2\u10D0\u10DB\u10DD\u10E5\u10D5\u10D4\u10E7\u10DC\u10D4\u10D1\u10E3\u10DA\u10D0</div>`;
          const cntEl = document.getElementById("qaCount");
          if (cntEl) cntEl.textContent = items.length;
        };
        if (tab === "qa") {
          queueMicrotask(() => {
            if (window.__campus.__qaUnsub) {
              try {
                window.__campus.__qaUnsub();
              } catch {
              }
            }
            window.__campus.__qaUnsub = subscribeQA(id, renderQA);
          });
        }
        const tabResources = res.length ? `<div class="grid grid-2">${res.map((r) => {
          const reportArg = `'resource','${r.id}',${JSON.stringify(r.title || "").replace(/'/g, "&#39;")}`;
          return `
        <div class="card">
          <div class="card-row">
            <h3 style="margin:0;font-size:15px">${escapeHtml(r.title)}</h3>
            <span class="badge badge-primary">${escapeHtml(r.type)}</span>
          </div>
          <div class="row between" style="margin-top:10px;gap:8px;flex-wrap:wrap">
            <span class="muted">\u25B2 ${r.upvotes || 0}</span>
            <div class="row" style="gap:6px">
              ${user ? `<button class="btn btn-ghost" title="\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0" style="padding:4px 10px;font-size:12px" onclick="__campus.report(${reportArg})">\u2691</button>` : ""}
              <a class="btn" href="${escapeHtml(r.url || "#")}" target="_blank" rel="noopener">\u10D2\u10D0\u10EE\u10E1\u10DC\u10D0 \u2192</a>
            </div>
          </div>
        </div>`;
        }).join("")}</div>` : `<div class="empty"><div class="ico">\u{1F4DA}</div>\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10DC\u10D0\u10D7</div>`;
        const tabBtn = (id2, label) => `<button class="prof-tab ${tab === id2 ? "active" : ""}" onclick="__campus.subjTab('${id2}')">${label}</button>`;
        let body = tabOverview;
        if (tab === "qa") body = tabQA;
        else if (tab === "resources") body = tabResources;
        return `
    <div class="crumbs">
      ${u ? `<a href="#/university/${u.id}">${escapeHtml(u.name)}</a> / ` : ""}
      ${f ? `<a href="#/faculty/${f.id}">${escapeHtml(f.name)}</a> / ` : ""}
      ${escapeHtml(s.name || "")}
    </div>
    <div class="subj-hero">
      <div style="min-width:0;flex:1">
        <h1 style="margin:0;font-size:clamp(20px,4.5vw,28px);line-height:1.25">${escapeHtml(s.name || "")}</h1>
        <p class="muted" style="margin:6px 0 0;font-size:13px">${escapeHtml(s.code || "")}</p>
      </div>
      
    </div>
    <div class="subj-stats">
      <div class="subj-stat"><div class="ss-ico">\u{1F3AF}</div><div><div class="ss-val">${credits || "\u2014"}</div><div class="ss-lbl">\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</div></div></div>
      <div class="subj-stat"><div class="ss-ico">\u{1F4C5}</div><div><div class="ss-val">${escapeHtml(semester)}</div><div class="ss-lbl">\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8</div></div></div>
      <div class="subj-stat"><div class="ss-ico">\u{1F468}\u200D\u{1F3EB}</div><div><div class="ss-val" style="font-size:14px">${escapeHtml(lecturer)}</div><div class="ss-lbl">\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</div></div></div>
    </div>
    <div class="prof-tabs">
      ${tabBtn("overview", "\u{1F4CA} \u10DB\u10D8\u10DB\u10DD\u10EE\u10D8\u10DA\u10D5\u10D0")}
      ${tabBtn("qa", `\u{1F4AC} \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 (<span id="qaCount">0</span>)`)}
      ${tabBtn("resources", `\u{1F4DA} \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8 (${res.length})`)}
    </div>
    <div style="margin-top:18px">${body}</div>
  `;
      };
    }
  });

  // static-site/js/views/news.js
  var news_exports = {};
  __export(news_exports, {
    newsView: () => newsView
  });
  var uniF, catF, visibleNews, fmtAcademicDate, fmtRelative, uniMap, render2, newsView;
  var init_news = __esm({
    "static-site/js/views/news.js"() {
      "use strict";
      init_data();
      init_news_data();
      init_ui();
      init_auth();
      uniF = "all";
      catF = "all";
      visibleNews = () => {
        const profile = getProfile();
        const myFac = profile?.facultyId || "";
        const admin = isAdminUser();
        return newsItems.filter((n) => {
          const aud = n.audience || "both";
          if (aud !== "both" && aud !== "student") return false;
          if (n.facultyId && !admin && n.facultyId !== myFac) return false;
          return true;
        });
      };
      fmtAcademicDate = (iso) => {
        try {
          return new Date(iso).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" });
        } catch {
          return "";
        }
      };
      fmtRelative = (iso) => {
        const t = new Date(iso).getTime();
        const diff = Math.round((Date.now() - t) / 1e3);
        if (diff < 60) return "\u10D0\u10EE\u10DA\u10D0\u10EE\u10D0\u10DC";
        const m = Math.round(diff / 60);
        if (m < 60) return `${m} \u10EC\u10D7 \u10EC\u10D8\u10DC`;
        const h = Math.round(m / 60);
        if (h < 24) return `${h} \u10E1\u10D7 \u10EC\u10D8\u10DC`;
        const d = Math.round(h / 24);
        if (d < 7) return `${d} \u10D3\u10E6\u10D8\u10E1 \u10EC\u10D8\u10DC`;
        return fmtAcademicDate(iso);
      };
      uniMap = Object.fromEntries(universities.map((u) => [u.id, u]));
      render2 = () => {
        const root = document.getElementById("newsList");
        if (!root) return;
        let items = visibleNews();
        if (uniF !== "all") items = items.filter((n) => n.uniId === uniF);
        if (catF !== "all") items = items.filter((n) => n.category === catF);
        items.sort(
          (a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        const countEl = document.getElementById("newsCount");
        if (countEl) countEl.textContent = items.length ? `${items.length} \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D8` : "\u10E8\u10D4\u10D3\u10D4\u10D2\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0";
        root.innerHTML = items.length ? items.map((n) => {
          const uni = uniMap[n.uniId];
          const cat = NEWS_CATEGORIES[n.category] || NEWS_CATEGORIES.announcement;
          return `<article class="news-item ${n.pinned ? "pinned" : ""}">
      ${n.pinned ? `<span class="news-pin-tag">\u10D3\u10D0\u10DB\u10D0\u10D2\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8</span>` : ""}
      <div class="news-meta-row">
        <time class="news-date-iso" datetime="${escapeHtml(n.publishedAt)}">${fmtAcademicDate(n.publishedAt)}</time>
        <span class="news-meta-sep">\xB7</span>
        <span class="news-uni-name">${escapeHtml(uni?.name || n.uniId)}</span>
        <span class="news-meta-sep">\xB7</span>
        <span class="news-cat-label">${cat.label}</span>
      </div>
      <h3 class="news-title">${escapeHtml(n.title)}</h3>
      <p class="news-summary">${escapeHtml(n.summary)}</p>
      <div class="news-foot">
        <a class="news-link" href="${escapeHtml(n.url)}" target="_blank" rel="noopener noreferrer"
           aria-label="\u10D2\u10D0\u10D3\u10D0\u10D3\u10D8 ${escapeHtml(uni?.name || "\u10E3\u10DC\u10D8\u10D5.")} \u10D2\u10D5\u10D4\u10E0\u10D3\u10D6\u10D4">\u10EC\u10E7\u10D0\u10E0\u10DD\u10D6\u10D4 \u10D2\u10D0\u10D3\u10D0\u10E1\u10D5\u10DA\u10D0 \u2192</a>
        <span class="muted news-rel">${fmtRelative(n.publishedAt)}</span>
      </div>
    </article>`;
        }).join("") : `<div class="empty" role="status">
    <div class="ico" aria-hidden="true">\u{1F4F0}</div>
    \u10D0\u10E0\u10E9\u10D4\u10E3\u10DA\u10D8 \u10E4\u10D8\u10DA\u10E2\u10E0\u10D8\u10D7 \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0
  </div>`;
      };
      newsView = () => {
        expose("newsSetUni", (v) => {
          uniF = v;
          render2();
        });
        expose("newsSetCat", (v) => {
          catF = v;
          render2();
        });
        expose("newsReset", () => {
          uniF = "all";
          catF = "all";
          document.querySelectorAll("#newsFilters .chip").forEach((c) => c.classList.toggle("active", c.dataset.val === "all"));
          render2();
        });
        setTimeout(render2, 0);
        const uniChips = [
          `<button type="button" class="chip active" data-grp="uni" data-val="all" onclick="__campus.newsSetUni('all')">\u10E7\u10D5\u10D4\u10DA\u10D0</button>`,
          ...universities.map(
            (u) => `<button type="button" class="chip" data-grp="uni" data-val="${u.id}"
        onclick="document.querySelectorAll('[data-grp=uni]').forEach(c=>c.classList.remove('active'));this.classList.add('active');__campus.newsSetUni('${u.id}')">${escapeHtml(u.name)}</button>`
          )
        ].join("");
        const catChips = [
          `<button type="button" class="chip active" data-grp="cat" data-val="all" onclick="__campus.newsSetCat('all')">\u10E7\u10D5\u10D4\u10DA\u10D0</button>`,
          ...Object.entries(NEWS_CATEGORIES).map(
            ([id, c]) => `<button type="button" class="chip" data-grp="cat" data-val="${id}"
        onclick="document.querySelectorAll('[data-grp=cat]').forEach(c=>c.classList.remove('active'));this.classList.add('active');__campus.newsSetCat('${id}')">${c.label}</button>`
          )
        ].join("");
        setTimeout(() => {
          document.querySelectorAll("#newsFilters [data-grp=uni][data-val=all], #newsFilters [data-grp=cat][data-val=all]").forEach((b) => b.addEventListener("click", () => {
            b.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
            b.classList.add("active");
          }));
        }, 0);
        return `
    <nav class="crumbs" aria-label="\u10DC\u10D0\u10D9\u10D0\u10D3\u10D8"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / \u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8</nav>
    <header class="news-hero">
      <span class="news-eyebrow">\u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D1\u10D8\u10E3\u10DA\u10D4\u10E2\u10D4\u10DC\u10D8</span>
      <h1 class="news-h1">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8</h1>
      <p class="news-sub">\u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D2\u10D0\u10DC\u10EA\u10EE\u10D0\u10D3\u10D4\u10D1\u10D4\u10D1\u10D8: \u10DB\u10D8\u10E6\u10D4\u10D1\u10D8\u10E1 \u10D5\u10D0\u10D3\u10D4\u10D1\u10D8, \u10E1\u10D0\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10DD \u10DE\u10D4\u10E0\u10D8\u10DD\u10D3\u10D8, \u10D9\u10DD\u10DC\u10E4\u10D4\u10E0\u10D4\u10DC\u10EA\u10D8\u10D4\u10D1\u10D8, \u10E1\u10E2\u10D8\u10DE\u10D4\u10DC\u10D3\u10D8\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10DE\u10E0\u10DD\u10EA\u10D4\u10E1\u10D8\u10E1 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8.</p>
    </header>

    <section id="newsFilters" class="news-filters" aria-label="\u10E4\u10D8\u10DA\u10E2\u10E0\u10D4\u10D1\u10D8">
      <div class="news-filter-row">
        <span class="news-filter-label">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</span>
        <div class="chip-row" role="group" aria-label="\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8">${uniChips}</div>
      </div>
      <div class="news-filter-row">
        <span class="news-filter-label">\u10D9\u10D0\u10E2\u10D4\u10D2\u10DD\u10E0\u10D8\u10D0</span>
        <div class="chip-row" role="group" aria-label="\u10D9\u10D0\u10E2\u10D4\u10D2\u10DD\u10E0\u10D8\u10D0">${catChips}</div>
      </div>
      <div class="news-filter-foot">
        <span id="newsCount" class="muted" aria-live="polite"></span>
        <button type="button" class="btn btn-ghost" onclick="__campus.newsReset()">\u10E4\u10D8\u10DA\u10E2\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>
      </div>
    </section>

    <div id="newsList" class="news-grid" role="region" aria-label="\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D8\u10D0" aria-live="polite"></div>

    <p class="news-disclaimer">
      \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10DB\u10DD\u10EC\u10DD\u10D3\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8\u10E1 \u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10EC\u10E7\u10D0\u10E0\u10DD\u10D4\u10D1\u10D8\u10D3\u10D0\u10DC. \u10D0\u10D5\u10E2\u10DD\u10DB\u10D0\u10E2\u10E3\u10E0\u10D8 RSS-\u10E1\u10D8\u10DC\u10E5\u10E0\u10DD\u10DC\u10D8\u10D6\u10D0\u10EA\u10D8\u10D0 \u10E9\u10D0\u10D8\u10E0\u10D7\u10D5\u10D4\u10D1\u10D0 \u10DB\u10D0\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2, \u10E0\u10D0\u10EA \u10D3\u10D0\u10EC\u10D4\u10E1\u10D4\u10D1\u10E3\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8 \u10D2\u10D0\u10E1\u10EA\u10D4\u10DB\u10D4\u10DC \u10E8\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D8\u10E1 \u10DC\u10D4\u10D1\u10D0\u10E0\u10D7\u10D5\u10D0\u10E1.
    </p>
  `;
      };
    }
  });

  // static-site/js/materialRatings.js
  var KEY4, read2, write2, getRatings, getAvg, getMyRating, rateMaterial;
  var init_materialRatings = __esm({
    "static-site/js/materialRatings.js"() {
      "use strict";
      init_auth();
      KEY4 = "campus.materialRatings";
      read2 = () => {
        try {
          return JSON.parse(localStorage.getItem(KEY4) || "") ?? {};
        } catch {
          return {};
        }
      };
      write2 = (v) => localStorage.setItem(KEY4, JSON.stringify(v));
      getRatings = (id) => read2()[id] || {};
      getAvg = (id) => {
        const r = getRatings(id);
        const vals = Object.values(r);
        if (!vals.length) return { avg: 0, count: 0 };
        const sum = vals.reduce((a, b) => a + (+b || 0), 0);
        return { avg: sum / vals.length, count: vals.length };
      };
      getMyRating = (id) => {
        const u = getUser();
        if (!u) return 0;
        return +getRatings(id)[u.uid] || 0;
      };
      rateMaterial = (id, stars2) => {
        const u = getUser();
        if (!u) throw new Error("\u10EF\u10D4\u10E0 \u10E8\u10D4\u10D3\u10D8 \u10E1\u10D8\u10E1\u10E2\u10D4\u10DB\u10D0\u10E8\u10D8");
        const s = Math.max(1, Math.min(5, +stars2 || 0));
        const all = read2();
        all[id] = all[id] || {};
        const isFirst = !all[id][u.uid];
        all[id][u.uid] = s;
        write2(all);
        void isFirst;
        return s;
      };
    }
  });

  // static-site/js/views/misc.js
  var misc_exports = {};
  __export(misc_exports, {
    adminView: () => adminView,
    authView: () => authView,
    calendarView: () => calendarView,
    effectiveFaculties: () => effectiveFaculties,
    effectiveUniversities: () => effectiveUniversities,
    profileView: () => profileView,
    rankingsView: () => rankingsView,
    resourcesView: () => resourcesView
  });
  var rankingsView, _resState, _resData, _resLoading, _loadRes, RES_TYPES, resourcesView, calendarView, authView, getTab, setTabUrl, renderProfileBody, profileView, ADMIN_OVERRIDES_KEY, readOverrides, writeOverrides, getDeletedIds, getAdded, effectiveUniversities, effectiveFaculties, adminTab, readDemoUsers, writeDemoUsers, adminView;
  var init_misc = __esm({
    "static-site/js/views/misc.js"() {
      "use strict";
      init_data();
      init_state();
      init_auth();
      init_ui();
      init_router();
      init_firebase();
      init_state();
      init_materialRatings();
      rankingsView = () => {
        setTimeout(() => {
          location.hash = "#/universities?sort=rating";
        }, 0);
        return `<div class="empty">\u10D2\u10D0\u10D3\u10D0\u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D4\u10D1\u10D0...</div>`;
      };
      _resState = { subjectId: "", type: "all", minRating: 0 };
      _resData = { subs: null, items: null };
      _resLoading = false;
      _loadRes = async () => {
        if (_resLoading) return;
        _resLoading = true;
        try {
          const { loadFirebase: loadFirebase2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
          const fb = await loadFirebase2();
          const [s, r] = await Promise.all([
            fb.getDocs(fb.collection(fb.db, "subjects")),
            fb.getDocs(fb.collection(fb.db, "resources"))
          ]);
          _resData.subs = s.docs.map((d) => ({ id: d.id, ...d.data() }));
          _resData.items = r.docs.map((d) => ({ id: d.id, ...d.data() }));
          refresh();
        } catch (e) {
          console.warn("resources load", e);
        } finally {
          _resLoading = false;
        }
      };
      RES_TYPES = ["\u10DA\u10D8\u10DC\u10D9\u10D8"];
      resourcesView = () => {
        const user = getUser();
        const realProfile = getProfile();
        const facultyId = realProfile?.facultyId || "";
        const isAdminLocal = isAdminUser();
        if (_resData.subs == null) {
          _loadRes();
          return `<h1>\u{1F4DA} \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8</h1>${skGrid(6, 3)}`;
        }
        const facSubs = isAdminLocal ? _resData.subs : _resData.subs.filter((s) => s.facultyId === facultyId);
        const subMap = Object.fromEntries(_resData.subs.map((s) => [s.id, s]));
        const facSubIds = new Set(facSubs.map((s) => s.id));
        if (_resState.subjectId && !facSubIds.has(_resState.subjectId)) _resState.subjectId = "";
        let items = _resData.items.filter((r) => facSubIds.has(r.subjectId));
        if (_resState.subjectId) items = items.filter((r) => r.subjectId === _resState.subjectId);
        if (_resState.type !== "all") items = items.filter((r) => r.type === _resState.type);
        if (_resState.minRating > 0) {
          items = items.filter((r) => getAvg(r.id).avg >= _resState.minRating);
        }
        items = items.slice().sort((a, b) => {
          const ra = getAvg(a.id).avg, rb = getAvg(b.id).avg;
          if (rb !== ra) return rb - ra;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        expose("resSetSubject", (id) => {
          _resState.subjectId = id;
          refresh();
        });
        expose("resSetType", (t) => {
          _resState.type = t;
          refresh();
        });
        expose("resSetMinRating", (n) => {
          _resState.minRating = +n || 0;
          refresh();
        });
        expose("resAddSubmit", async (e) => {
          e.preventDefault();
          if (!user) {
            showToast("\u10D2\u10D7\u10EE\u10DD\u10D5 \u10E8\u10D4\u10EE\u10D5\u10D8\u10D3\u10D4");
            return;
          }
          const f = new FormData(e.target);
          const data = {
            subjectId: f.get("subjectId"),
            title: (f.get("title") || "").toString().trim(),
            type: "\u10DA\u10D8\u10DC\u10D9\u10D8",
            url: (f.get("url") || "").toString().trim(),
            uploadedBy: user.uid,
            uploaderName: getDisplayName ? getDisplayName() : user.email || "\u2014",
            upvotes: 0,
            createdAt: Date.now()
          };
          if (!data.subjectId || !data.title || !data.url) {
            showToast("\u10E7\u10D5\u10D4\u10DA\u10D0 \u10D5\u10D4\u10DA\u10D8 \u10D0\u10E3\u10EA\u10D8\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0");
            return;
          }
          try {
            const { loadFirebase: loadFirebase2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
            const fb = await loadFirebase2();
            await fb.addDoc(fb.collection(fb.db, "resources"), data);
            recordEvent("material");
            showToast("\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8 \u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0 \u2713");
            e.target.reset();
            _resData.subs = null;
            _resData.items = null;
            _loadRes();
          } catch (err) {
            console.error(err);
            showToast("\u10D5\u10D4\u10E0 \u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0: " + (err?.message || err));
          }
        });
        expose("resFav", () => {
        });
        expose("resRate", (id, n) => {
          try {
            rateMaterial(id, +n);
            showToast(`\u10E8\u10D4\u10E4\u10D0\u10E1\u10D3\u10D0: ${n} \u2605`);
            refresh();
          } catch (err) {
            showToast(err.message || "\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0");
          }
        });
        expose("resDelete", async (id) => {
          if (!confirm("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10D4\u10E1 \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8?")) return;
          try {
            const { loadFirebase: loadFirebase2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
            const fb = await loadFirebase2();
            await fb.deleteDoc(fb.doc(fb.db, "resources", id));
            _resData.items = _resData.items.filter((r) => r.id !== id);
            showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
            refresh();
          } catch (err) {
            showToast("\u10D5\u10D4\u10E0 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0: " + (err?.message || err));
          }
        });
        const subjOptions = facSubs.map((s) => `<option value="${s.id}" ${_resState.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}${s.code ? ` (${escapeHtml(s.code)})` : ""}</option>`).join("");
        return `
    <h1>\u{1F4DA} \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8</h1>
    <p class="muted">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8\u10E1 \u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10DB\u10D0\u10E1\u10D0\u10DA\u10D4\u10D1\u10D8.</p>

    ${!facultyId && !isAdminLocal ? `<div class="empty"><div class="ico">\u{1F393}</div>\u10EF\u10D4\u10E0 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8. <a class="btn btn-primary" href="#/onboarding" style="margin-top:12px">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8\u10E1 \u10D0\u10E0\u10E9\u10D4\u10D5\u10D0</a></div>` : `

    <div class="card" style="margin-top:14px">
      <div class="grid grid-3" style="gap:12px">
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</label>
          <select onchange="__campus.resSetSubject(this.value)" style="width:100%">
            <option value="">\u2014 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8 \u2014</option>
            ${subjOptions}
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">\u10E2\u10D8\u10DE\u10D8</label>
          <select onchange="__campus.resSetType(this.value)" style="width:100%">
            <option value="all" ${_resState.type === "all" ? "selected" : ""}>\u2014 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E2\u10D8\u10DE\u10D8 \u2014</option>
            ${RES_TYPES.map((t) => `<option value="${t}" ${_resState.type === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">\u10DB\u10D8\u10DC\u10D8\u10DB\u10E3\u10DB \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0</label>
          <select onchange="__campus.resSetMinRating(this.value)" style="width:100%">
            <option value="0" ${_resState.minRating === 0 ? "selected" : ""}>\u10DC\u10D4\u10D1\u10D8\u10E1\u10DB\u10D8\u10D4\u10E0\u10D8</option>
            <option value="3" ${_resState.minRating === 3 ? "selected" : ""}>3\u2605 \u10D0\u10DC \u10DB\u10D4\u10E2\u10D8</option>
            <option value="4" ${_resState.minRating === 4 ? "selected" : ""}>4\u2605 \u10D0\u10DC \u10DB\u10D4\u10E2\u10D8</option>
            <option value="4.5" ${_resState.minRating === 4.5 ? "selected" : ""}>4.5\u2605 \u10D0\u10DC \u10DB\u10D4\u10E2\u10D8</option>
          </select>
        </div>
      </div>
    </div>


    ${user ? `<details class="card" style="margin-top:12px" ${items.length === 0 ? "open" : ""}>
      <summary style="cursor:pointer;font-weight:600">\u2795 \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8\u10E1 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</summary>
      <form onsubmit="__campus.resAddSubmit(event)" style="margin-top:12px">
        <div class="grid grid-2" style="gap:10px">
          <div>
            <label style="font-size:12px;color:var(--muted)">\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8 *</label>
            <select name="subjectId" required style="width:100%">
              <option value="">\u2014 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u2014</option>
              ${facSubs.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size:12px;color:var(--muted)">\u10E2\u10D8\u10DE\u10D8 *</label>
            <select name="type" required style="width:100%">
              ${RES_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}
            </select>
          </div>
        </div>
        <div style="margin-top:10px">
          <label style="font-size:12px;color:var(--muted)">\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8 *</label>
          <input name="title" required maxlength="160" placeholder="\u10DB\u10D0\u10D2.: \u10D0\u10DA\u10D2\u10D4\u10D1\u10E0\u10D0 I \u2014 \u10E8\u10E3\u10D0\u10DA\u10D4\u10D3\u10E3\u10E0\u10D8 \u10D9\u10DD\u10DC\u10E1\u10DE\u10D4\u10E5\u10E2\u10D8" style="width:100%" />
        </div>
        <div style="margin-top:10px">
          <label style="font-size:12px;color:var(--muted)">Drive / \u10D1\u10DB\u10E3\u10DA\u10D8 *</label>
          <input name="url" type="url" required placeholder="https://drive.google.com/..." style="width:100%" />
        </div>
        <div style="margin-top:12px;text-align:right">
          <button type="submit" class="btn btn-primary">\u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D0</button>
        </div>
      </form>
    </details>` : `<p class="muted" style="margin-top:10px;font-size:13px">\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8\u10E1 \u10D3\u10D0\u10E1\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10DA\u10D0\u10D3 <a href="#/login">\u10E8\u10D4\u10D3\u10D8 \u10E1\u10D8\u10E1\u10E2\u10D4\u10DB\u10D0\u10E8\u10D8</a>.</p>`}

    <div class="grid grid-2" style="margin-top:18px">
      ${items.length ? items.map((r) => {
          const s = subMap[r.subjectId];
          const mine = user && r.uploadedBy === user.uid;
          const canDel = mine || isAdminLocal;
          const ag = getAvg(r.id);
          const mine2 = user && r.uploadedBy === user.uid;
          const myR = getMyRating(r.id);
          const starsRow = [1, 2, 3, 4, 5].map(
            (n) => `<button type="button" class="mr-star ${myR >= n ? "on" : ""}" aria-label="${n} \u10D5\u10D0\u10E0\u10E1\u10D9\u10D5\u10DA\u10D0\u10D5\u10D8" onclick="__campus.resRate('${r.id}',${n})" ${!user || mine2 ? "disabled" : ""}>\u2605</button>`
          ).join("");
          return `<div class="card">
          <div class="card-row">
            <h3 style="margin:0">${escapeHtml(r.title)}</h3>
          </div>
          <p class="muted" style="margin:6px 0 0;font-size:13px">\u{1F4D8} ${escapeHtml(s?.name || "\u2014")}${r.uploaderName ? ` \xB7 \u{1F464} ${escapeHtml(r.uploaderName)}` : ""}</p>
          <div class="mr-row" style="margin-top:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div class="mr-stars" aria-label="\u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0">${starsRow}</div>
            <span class="muted" style="font-size:12px">${ag.count ? `${ag.avg.toFixed(1)}/5 \xB7 ${ag.count} \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0` : "\u10EF\u10D4\u10E0 \u10D0\u10E0 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10E3\u10DA\u10D0"}</span>
          </div>
          <div class="row between" style="margin-top:10px;gap:8px;flex-wrap:wrap">
            <a class="btn btn-primary" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">\u10D2\u10D0\u10EE\u10E1\u10DC\u10D0 \u2192</a>
            <div class="row" style="gap:6px">
              ${user && !mine ? `<button class="btn btn-ghost" title="\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0" style="padding:6px 10px;font-size:12px" onclick="__campus.report('material','${r.id}',${JSON.stringify(r.title || "").replace(/'/g, "&#39;")})">\u2691</button>` : ""}
              ${canDel ? `<button class="btn btn-ghost" onclick="__campus.resDelete('${r.id}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>` : ""}
            </div>
          </div>
        </div>`;
        }).join("") : `<div class="empty" style="grid-column:1/-1"><div class="ico">\u{1F4ED}</div>\u10EF\u10D4\u10E0 \u10D0\u10E0\u10D0\u10E4\u10D4\u10E0\u10D8\u10D0 \u2014 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10DE\u10D8\u10E0\u10D5\u10D4\u10DA\u10D8 \u261D\uFE0F</div>`}

    </div>

    `}
  `;
      };
      calendarView = () => {
        const exams = getExams();
        expose("addExam", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          addExam({
            kind: (fd.get("kind") || "exam").toString(),
            title: fd.get("title"),
            subjectId: fd.get("subjectId") || "",
            date: fd.get("date"),
            location: fd.get("location") || "",
            reminderDays: Number(fd.get("reminderDays")) || 3
          });
          const p = addPoints("exam");
          if (p) showToast(`+${p} \u10E5\u10E3\u10DA\u10D0`);
          e.target.reset();
          refresh();
        });
        expose("removeExam", (id) => {
          removeExam(id);
          refresh();
        });
        const reminders = exams.map((e) => ({ ...e, d: daysUntil(e.date) })).filter((e) => e.d >= 0 && e.d <= (e.reminderDays ?? 3));
        const kindLabel = (k) => k === "quiz" ? "\u{1F9E0} \u10E5\u10D5\u10D8\u10D6\u10D8" : "\u{1F4DD} \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0";
        return `
    <h1>\u23F0 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10E5\u10D5\u10D8\u10D6\u10D4\u10D1\u10D8</h1>
    <p class="muted">\u10DE\u10D8\u10E0\u10D0\u10D3\u10D8 \u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8 \u2014 \u10EE\u10D8\u10DA\u10D5\u10D0\u10D3\u10D8\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E8\u10D4\u10DC\u10D7\u10D5\u10D8\u10E1.</p>

    ${reminders.length ? `<div class="card" style="margin-top:14px;border-left:4px solid var(--primary)">
      <h3 style="margin:0 0 8px">\u{1F514} \u10E3\u10D0\u10EE\u10DA\u10DD\u10D4\u10E1\u10D8 \u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8</h3>
      <div class="stack">
        ${reminders.map((r) => `<div class="row between" style="gap:8px;flex-wrap:nowrap">
          <div style="min-width:0">
            <b>${kindLabel(r.kind)} \u2014 ${escapeHtml(r.title)}</b>
            <div class="muted" style="font-size:12px">\u{1F4C5} ${r.date}${r.location ? ` \xB7 \u{1F4CD} ${escapeHtml(r.location)}` : ""}</div>
          </div>
          <span class="badge ${r.d <= 1 ? "badge-danger" : "badge-primary"}">${r.d === 0 ? "\u10D3\u10E6\u10D4\u10E1" : `${r.d} \u10D3\u10E6\u10D4`}</span>
        </div>`).join("")}
      </div>
    </div>` : ""}

    <div class="card" style="margin:16px 0">
      <h3 style="margin-top:0">\u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0 \u10D0\u10DC \u10E5\u10D5\u10D8\u10D6\u10D8</h3>
      <form onsubmit="__campus.addExam(event)">
        <div class="grid grid-2">
          <div class="field"><label>\u10E2\u10D8\u10DE\u10D8</label>
            <select name="kind">
              <option value="exam">\u{1F4DD} \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0</option>
              <option value="quiz">\u{1F9E0} \u10E5\u10D5\u10D8\u10D6\u10D8</option>
            </select>
          </div>
          <div class="field"><label>\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8</label><input type="date" name="date" required /></div>
          <div class="field"><label>\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8</label><input name="title" required placeholder="\u10DB\u10D0\u10D2. \u10D0\u10DA\u10D2\u10DD\u10E0\u10D8\u10D7\u10DB\u10D4\u10D1\u10D8 \u2014 \u10E8\u10E3\u10D0\u10DA\u10D4\u10D3\u10E3\u10E0\u10D8" /></div>
          <div class="field"><label>\u10DA\u10DD\u10D9\u10D0\u10EA\u10D8\u10D0</label><input name="location" placeholder="\u10D0\u10E3\u10D3\u10D8\u10E2\u10DD\u10E0\u10D8\u10D0 / \u10D1\u10DB\u10E3\u10DA\u10D8" /></div>
          <div class="field"><label>\u10E8\u10D4\u10DB\u10D0\u10EE\u10E1\u10D4\u10DC\u10D4 \u2014 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</label>
            <select name="reminderDays">
              <option value="1">1 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
              <option value="2">2 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
              <option value="3" selected>3 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
              <option value="5">5 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
              <option value="7">1 \u10D9\u10D5\u10D8\u10E0\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
              <option value="14">2 \u10D9\u10D5\u10D8\u10E0\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</option>
            </select>
          </div>
          <div class="field"><label>\u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 ID (\u10DD\u10DE\u10EA.)</label><input name="subjectId" placeholder="algo101" /></div>
        </div>
        <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
      </form>
    </div>
    ${exams.length ? `<div class="stack">${exams.map((e) => {
          const d = daysUntil(e.date);
          const rd = e.reminderDays ?? 3;
          const urgent = d >= 0 && d <= Math.min(rd, 3);
          return `<div class="card">
        <div class="card-row">
          <div style="min-width:0">
            <h3 style="margin:0">${kindLabel(e.kind)} \u2014 ${escapeHtml(e.title)}</h3>
            <p>\u{1F4C5} ${e.date}${e.location ? " \xB7 " + escapeHtml(e.location) : ""}<span class="muted" style="margin-left:8px;font-size:12px">\u{1F514} ${rd} \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4</span></p>
          </div>
          <div class="row" style="gap:8px;flex-wrap:nowrap">
            <span class="badge ${urgent ? "badge-danger" : d < 0 ? "" : "badge-primary"}">
              ${d < 0 ? "\u10D2\u10D0\u10E1\u10E3\u10DA\u10D8" : d === 0 ? "\u10D3\u10E6\u10D4\u10E1" : `${d} \u10D3\u10E6\u10D4`}
            </span>
            <button class="btn-icon" onclick="__campus.removeExam('${e.id}')" title="\u10EC\u10D0\u10E8\u10DA\u10D0">\u2715</button>
          </div>
        </div>
      </div>`;
        }).join("")}</div>` : `<p class="muted">\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D4\u10D1\u10D8/\u10E5\u10D5\u10D8\u10D6\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D2\u10D8\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D0</p>`}
  `;
      };
      authView = () => {
        expose("doAuth", async (e, mode) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            if (mode === "login") await login(fd.get("email"), fd.get("password"));
            else await register(fd.get("email"), fd.get("password"));
            showToast("\u10EC\u10D0\u10E0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0!");
            navigate("/profile");
            refresh();
          } catch (err) {
            showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + err.message);
          }
        });
        return `
    <h1>\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0 / \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0</h1>
    ${!firebaseEnabled ? `<div class="card" style="margin-bottom:16px">
      <p class="muted">\u2139\uFE0F \u10DA\u10DD\u10D9\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E0\u10D4\u10DF\u10D8\u10DB\u10D8 \u2014 \u10E8\u10D4\u10DC\u10D8 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10E8\u10D4\u10D8\u10DC\u10D0\u10EE\u10D4\u10D1\u10D0 \u10D1\u10E0\u10D0\u10E3\u10D6\u10D4\u10E0\u10E8\u10D8.</p>
    </div>` : ""}
    <div class="grid grid-2">
      <div class="card">
        <h3>\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</h3>
        <form onsubmit="__campus.doAuth(event,'login')">
          <div class="field"><label>\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0</label><input type="email" name="email" required /></div>
          <div class="field"><label>\u10DE\u10D0\u10E0\u10DD\u10DA\u10D8</label><input type="password" name="password" required minlength="6" /></div>
          <button class="btn btn-primary" type="submit">\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</button>
        </form>
      </div>
      <div class="card">
        <h3>\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0</h3>
        <form onsubmit="__campus.doAuth(event,'register')">
          <div class="field"><label>\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0</label><input type="email" name="email" required /></div>
          <div class="field"><label>\u10DE\u10D0\u10E0\u10DD\u10DA\u10D8</label><input type="password" name="password" required minlength="6" /></div>
          <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D8\u10E0\u10D4\u10D1\u10D0</button>
        </form>
      </div>
    </div>
  `;
      };
      getTab = () => {
        const m = location.hash.match(/[?&]tab=([a-z]+)/);
        return m ? m[1] : "overview";
      };
      setTabUrl = (t) => {
        const newHash = `#/profile?tab=${t}`;
        if (location.hash !== newHash) {
          try {
            history.replaceState(null, "", newHash);
          } catch {
            location.hash = newHash;
          }
        }
      };
      renderProfileBody = (tab) => {
        const user = getUser();
        if (!user) return "";
        const exams = getExams();
        const pts = getPoints();
        const unlocked = getBadges();
        const next = BADGES.find((b) => !unlocked.includes(b.id));
        const progress = next ? Math.min(100, Math.round(pts / next.req * 100)) : 100;
        const displayName = getDisplayName();
        const theme = getTheme();
        if (tab === "favorites") return renderProfileBody("overview");
        if (tab === "badges") {
          return `
      <div class="card" style="margin-bottom:16px">
        <div class="row between"><h3 style="margin:0">\u10DE\u10E0\u10DD\u10D2\u10E0\u10D4\u10E1\u10D8</h3>
          <span class="muted">${next ? `${pts}/${next.req} \u2192 ${next.icon} ${next.name}` : "\u10E7\u10D5\u10D4\u10DA\u10D0 badge \u10E8\u10D4\u10E1\u10E0\u10E3\u10DA\u10D3\u10D0 \u{1F389}"}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
      </div>
      <div class="grid grid-4">
        ${BADGES.map((b) => {
            const got = unlocked.includes(b.id);
            return `<div class="card stat badge-card ${got ? "got" : "locked"}">
            <div style="font-size:42px">${got ? b.icon : "\u{1F512}"}</div>
            <div class="stat-label" style="margin-top:6px">${b.name}</div>
            <div class="muted" style="font-size:12px">${b.req} \u10E5\u10E3\u10DA\u10D0</div>
          </div>`;
          }).join("")}
      </div>
      <p class="muted" style="margin-top:18px;font-size:13px">\u10E5\u10E3\u10DA\u10D4\u10D1\u10D8: \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0 +${POINTS.review} \xB7 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8 +${POINTS.comment} \xB7 \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8 +${POINTS.resource} \xB7 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0 +${POINTS.exam}</p>
    `;
        }
        if (tab === "settings") {
          return `
      <div class="card">
        <h3 style="margin-top:0">\u10DE\u10D8\u10E0\u10D0\u10D3\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8</h3>
        <p class="muted" style="font-size:13px;margin:4px 0 12px">\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10D3\u10D0 \u10D2\u10D5\u10D0\u10E0\u10D8 \u10DB\u10D8\u10D7\u10D8\u10D7\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0 \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D8\u10E1\u10D0\u10E1 \u10D3\u10D0 \u10DB\u10D8\u10E1\u10D8 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D0 \u10DE\u10D0\u10E0\u10D0\u10DB\u10D4\u10E2\u10E0\u10D4\u10D1\u10D8\u10D3\u10D0\u10DC \u10E8\u10D4\u10E3\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0. \u10E8\u10D4\u10E1\u10EC\u10DD\u10E0\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10D3\u10D0\u10E3\u10D9\u10D0\u10D5\u10E8\u10D8\u10E0\u10D3\u10D8\u10D7 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0\u10E1.</p>
        <div class="field"><label class="muted" style="font-size:12px">\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10D3\u10D0 \u10D2\u10D5\u10D0\u10E0\u10D8</label>
          <input value="${escapeHtml(displayName)}" disabled readonly aria-readonly="true" style="opacity:.75;cursor:not-allowed" />
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="card-row">
          <div>
            <h3 style="margin:0">\u10D7\u10D4\u10DB\u10D0</h3>
            <p class="muted" style="font-size:13px;margin:4px 0 0">\u10D0\u10DB\u10DF\u10D0\u10DB\u10D0\u10D3: ${theme === "dark" ? "\u10DB\u10E3\u10E5\u10D8 \u{1F319}" : "\u10E6\u10D8\u10D0 \u2600\uFE0F"}</p>
          </div>
          <button class="btn" onclick="__campus.toggleThemeBtn()">\u10D2\u10D0\u10D3\u10D0\u10E0\u10D7\u10D5\u10D0</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">\u{1F4F2} \u10D0\u10DE\u10DA\u10D8\u10D9\u10D0\u10EA\u10D8\u10D8\u10E1 \u10D3\u10D0\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0 \u10E2\u10D4\u10DA\u10D4\u10E4\u10DD\u10DC\u10D6\u10D4</h3>
        <p class="muted" style="font-size:13px;margin:0 0 12px">Campusi \u10E8\u10D4\u10D2\u10D8\u10EB\u10DA\u10D8\u10D0\u10D7 \u10DB\u10D7\u10D0\u10D5\u10D0\u10E0 \u10D4\u10D9\u10E0\u10D0\u10DC\u10D6\u10D4 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10DD\u10D7 \u10D0\u10DE\u10DA\u10D8\u10D9\u10D0\u10EA\u10D8\u10D8\u10E1 \u10E4\u10DD\u10E0\u10DB\u10D0\u10E2\u10D8\u10D7 \u2014 \u10D2\u10D0\u10D8\u10EE\u10E1\u10DC\u10D4\u10D1\u10D0 \u10EA\u10D0\u10DA\u10D9\u10D4 \u10E4\u10D0\u10DC\u10EF\u10E0\u10D0\u10D3, \u10D1\u10E0\u10D0\u10E3\u10D6\u10D4\u10E0\u10D8\u10E1 \u10D6\u10DD\u10DA\u10D8\u10E1 \u10D2\u10D0\u10E0\u10D4\u10E8\u10D4.</p>

        <details style="margin-bottom:10px" open>
          <summary style="cursor:pointer;font-weight:600;padding:8px 0"> iPhone / iPad (Safari)</summary>
          <ol style="margin:6px 0 0 18px;padding:0;font-size:13.5px;line-height:1.65">
            <li>\u10D2\u10D0\u10EE\u10E1\u10D4\u10DC\u10D8 Campusi <b>Safari</b>-\u10E8\u10D8 (Chrome-\u10E8\u10D8 \u10D0\u10E0 \u10DB\u10E3\u10E8\u10D0\u10DD\u10D1\u10E1).</li>
            <li>\u10D3\u10D0\u10D0\u10ED\u10D8\u10E0\u10D4 \u10E5\u10D5\u10D4\u10D3\u10D0 (\u10D0\u10DC \u10D6\u10D4\u10D3\u10D0) \u10D6\u10DD\u10DA\u10D6\u10D4 <b>\u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D8\u10E1</b> \u10E6\u10D8\u10DA\u10D0\u10D9\u10E1 \u2014 \u10D9\u10D5\u10D0\u10D3\u10E0\u10D0\u10E2\u10D8 \u10D8\u10E1\u10E0\u10D8\u10D7 \u10D6\u10D4\u10DB\u10DD\u10D7.</li>
            <li>\u10E9\u10D0\u10DB\u10DD\u10EC\u10D8\u10D4 \u10D3\u10D0 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 <b>\u201EAdd to Home Screen" / \u201E\u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10DB\u10D7\u10D0\u10D5\u10D0\u10E0 \u10D4\u10D9\u10E0\u10D0\u10DC\u10D6\u10D4"</b>.</li>
            <li>\u10D3\u10D0\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4 <b>\u201EAdd" / \u201E\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"</b>.</li>
          </ol>
        </details>

        <details>
          <summary style="cursor:pointer;font-weight:600;padding:8px 0"> Android (Chrome)</summary>
          <ol style="margin:6px 0 0 18px;padding:0;font-size:13.5px;line-height:1.65">
            <li>\u10D2\u10D0\u10EE\u10E1\u10D4\u10DC\u10D8 Campusi <b>Chrome</b>-\u10E8\u10D8.</li>
            <li>\u10D3\u10D0\u10D0\u10ED\u10D8\u10E0\u10D4 \u10D6\u10D4\u10D3\u10D0 \u10DB\u10D0\u10E0\u10EF\u10D5\u10D4\u10DC\u10D0 <b>\u22EE</b> \u10DB\u10D4\u10DC\u10D8\u10E3\u10E1.</li>
            <li>\u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 <b>\u201EInstall app" / \u201E\u10D0\u10DE\u10D8\u10E1 \u10D3\u10D0\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0"</b> \u10D0\u10DC <b>\u201EAdd to Home screen"</b>.</li>
            <li>\u10D3\u10D0\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4 <b>\u201EInstall" / \u201E\u10D3\u10D0\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0"</b>.</li>
          </ol>
        </details>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="card-row">
          <div>
            <h3 style="margin:0">\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8</h3>
            <p class="muted" style="font-size:13px;margin:4px 0 0">\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0: ${user.email}</p>
          </div>
          <button class="btn btn-danger" onclick="__campus.clearLocal()">\u10DA\u10DD\u10D9. \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>
        </div>
      </div>
      <div style="margin-top:28px;display:flex;justify-content:center">
        <button class="btn btn-danger" onclick="__campus.doLogout()" style="padding:14px 32px;font-size:15px">\u238B \u10D2\u10D0\u10E1\u10D5\u10DA\u10D0</button>
      </div>
    `;
        }
        return `
    <div class="grid grid-2">
      <div class="card stat"><div class="stat-num text-gradient">${exams.length}</div><div class="stat-label">\u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0</div></div>
      <div class="card stat"><div class="stat-num text-gradient">${pts}</div><div class="stat-label">\u10E5\u10E3\u10DA\u10D0</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="row between"><h3 style="margin:0">\u10DE\u10E0\u10DD\u10D2\u10E0\u10D4\u10E1\u10D8</h3>
        <span class="muted">${next ? `${pts}/${next.req} \u2192 ${next.icon} ${next.name}` : "\u10E7\u10D5\u10D4\u10DA\u10D0 badge \u10E8\u10D4\u10E1\u10E0\u10E3\u10DA\u10D3\u10D0 \u{1F389}"}</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
    </div>
  `;
      };
      profileView = () => {
        const user = getUser();
        if (!user) {
          setTimeout(() => navigate("/login"), 0);
          return `<div class="empty">\u10D2\u10D0\u10D3\u10D0\u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D4\u10D1\u10D0...</div>`;
        }
        const pts = getPoints();
        const lvl = levelOf(pts);
        const displayName = getDisplayName();
        const tab = getTab();
        expose("profTab", (t) => {
          const current = getTab();
          if (t === current) return;
          setTabUrl(t);
          const body = document.getElementById("profBody");
          const tabsRoot = document.querySelector(".prof-tabs");
          if (tabsRoot) {
            tabsRoot.querySelectorAll(".prof-tab").forEach((btn) => {
              btn.classList.toggle("active", btn.dataset.tab === t);
            });
          }
          if (!body) return;
          body.classList.add("swapping");
          const swap = () => {
            body.innerHTML = renderProfileBody(t);
            void body.offsetWidth;
            body.classList.remove("swapping");
          };
          setTimeout(swap, 90);
        });
        expose("saveName", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          setDisplayName((fd.get("name") || "").toString());
          showToast("\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10D2\u10D0\u10DC\u10D0\u10EE\u10DA\u10D3\u10D0");
          const body = document.getElementById("profBody");
          if (body) body.innerHTML = renderProfileBody(getTab());
          const heroName = document.querySelector(".profile-hero h3");
          if (heroName) heroName.textContent = getDisplayName();
        });
        expose("toggleThemeBtn", () => {
          toggleTheme();
          const btn = document.getElementById("themeBtn");
          if (btn) btn.textContent = getTheme() === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
          const body = document.getElementById("profBody");
          if (body) body.innerHTML = renderProfileBody(getTab());
        });
        expose("clearLocal", () => {
          if (!confirm("\u10EC\u10D0\u10D5\u10E8\u10D0\u10DA\u10DD\u10D7 \u10DA\u10DD\u10D9\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 (\u10EA\u10EE\u10E0\u10D8\u10DA\u10D8, \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D4\u10D1\u10D8, GPA, \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D4\u10D1\u10D8)? \u10D4\u10E1 \u10E5\u10DB\u10D4\u10D3\u10D4\u10D1\u10D0 \u10E8\u10D4\u10E3\u10E5\u10EA\u10D4\u10D5\u10D0\u10D3\u10D8\u10D0.")) return;
          [
            "campus.comments",
            "campus.reviews",
            "campus.exams",
            "campus.points",
            "campus.badges",
            "campus.schedule",
            "campus.notes",
            "campus.gpa.courses",
            "campus.quoteIx"
          ].forEach((k) => localStorage.removeItem(k));
          showToast("\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D3\u10D0");
          refresh();
        });
        expose("doLogout", async () => {
          await logout();
          navigate("/login");
          refresh();
        });
        expose("removeFav", () => {
        });
        expose("changeRole", (r) => {
          setRole(r);
          showToast(`\u10E0\u10DD\u10DA\u10D8: ${ROLES[r].name}`);
          refresh();
        });
        const role = getRole();
        const roleMeta = role ? ROLES[role] : null;
        const tabBtn = (id, label) => `<button class="prof-tab ${tab === id ? "active" : ""}" data-tab="${id}" onclick="__campus.profTab('${id}')">${label}</button>`;
        return `
    <h1>\u{1F464} \u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D8</h1>
    <div class="card profile-hero">
      <div class="avatar">${displayName[0].toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <h3 style="margin:0">${escapeHtml(displayName)}</h3>
        <p class="muted" style="overflow:hidden;text-overflow:ellipsis">${user.email}</p>
        <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">
          ${roleMeta ? `<span class="badge badge-primary">${roleMeta.icon} ${roleMeta.name}</span>` : ""}
          <span class="badge">\u10D3\u10DD\u10DC\u10D4 ${lvl}</span>
          <span class="badge">${pts} \u10E5\u10E3\u10DA\u10D0</span>
          ${isAdmin(user.email) ? `<span class="badge badge-danger">\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8</span>` : ""}
        </div>
      </div>
    </div>

    <div class="prof-tabs">
      ${tabBtn("overview", "\u{1F4CA} \u10DB\u10D8\u10DB\u10DD\u10EE\u10D8\u10DA\u10D5\u10D0")}
      ${tabBtn("badges", "\u{1F3C6} \u10D1\u10D4\u10EF\u10D4\u10D1\u10D8")}
      ${tabBtn("settings", "\u2699\uFE0F \u10DE\u10D0\u10E0\u10D0\u10DB\u10D4\u10E2\u10E0\u10D4\u10D1\u10D8")}
    </div>

    <div id="profBody" class="prof-body" style="margin-top:18px">${renderProfileBody(tab)}</div>
  `;
      };
      ADMIN_OVERRIDES_KEY = "campus.adminOverrides";
      readOverrides = () => {
        try {
          return JSON.parse(localStorage.getItem(ADMIN_OVERRIDES_KEY) || "{}");
        } catch {
          return {};
        }
      };
      writeOverrides = (o) => localStorage.setItem(ADMIN_OVERRIDES_KEY, JSON.stringify(o));
      getDeletedIds = (kind) => readOverrides()[`deleted_${kind}`] || [];
      getAdded = (kind) => readOverrides()[`added_${kind}`] || [];
      effectiveUniversities = () => {
        const del = new Set(getDeletedIds("uni"));
        return [...universities.filter((u) => !del.has(u.id)), ...getAdded("uni")];
      };
      effectiveFaculties = () => {
        const del = new Set(getDeletedIds("fac"));
        return [...faculties.filter((f) => !del.has(f.id)), ...getAdded("fac")];
      };
      adminTab = () => new URLSearchParams(location.hash.split("?")[1] || "").get("tab") || "users";
      readDemoUsers = () => {
        try {
          return JSON.parse(localStorage.getItem("campus.demoUsers") || "{}");
        } catch {
          return {};
        }
      };
      writeDemoUsers = (u) => localStorage.setItem("campus.demoUsers", JSON.stringify(u));
      adminView = () => {
        const user = getUser();
        if (!user || !isAdmin(user.email)) {
          return `<div class="empty"><div class="ico">\u{1F512}</div>\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10E2\u10E0\u10D0\u10E2\u10DD\u10E0\u10D8\u10E1 \u10EC\u10D5\u10D3\u10DD\u10DB\u10D0 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D0.<br/><span class="muted">nika.gogokhiya27@gmail.com</span></div>`;
        }
        const tab = adminTab();
        const ov = readOverrides();
        const delUni = new Set(ov.deleted_uni || []);
        const delFac = new Set(ov.deleted_fac || []);
        const addedUni = ov.added_uni || [];
        const addedFac = ov.added_fac || [];
        const allUnis = [...universities.filter((u) => !delUni.has(u.id)), ...addedUni];
        const allFac = [...faculties.filter((f) => !delFac.has(f.id)), ...addedFac];
        const demoUsers = readDemoUsers();
        const usersList = Object.entries(demoUsers).map(([email, rec]) => ({ email, ...rec.profile }));
        expose("admTab", (t) => {
          location.hash = `#/admin?tab=${t}`;
        });
        expose("admDelUser", (email) => {
          if (!confirm(`\u10EC\u10D0\u10D5\u10E8\u10D0\u10DA\u10DD ${email}?`)) return;
          const u = readDemoUsers();
          delete u[email];
          writeDemoUsers(u);
          showToast("\u10EC\u10D0\u10E8\u10DA\u10D8\u10DA\u10D8\u10D0");
          refresh();
        });
        expose("admDelUni", (id) => {
          if (!confirm("\u10EC\u10D0\u10D5\u10E8\u10D0\u10DA\u10DD \u10D4\u10E1 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8?")) return;
          const o = readOverrides();
          o.deleted_uni = [.../* @__PURE__ */ new Set([...o.deleted_uni || [], id])];
          o.added_uni = (o.added_uni || []).filter((u) => u.id !== id);
          writeOverrides(o);
          showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
          refresh();
        });
        expose("admAddUni", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const id = (fd.get("id") || "").toString().trim();
          const name = (fd.get("name") || "").toString().trim();
          const city = (fd.get("city") || "").toString().trim();
          if (!id || !name) {
            showToast("\u10E8\u10D4\u10D0\u10D5\u10E1\u10D4 ID \u10D3\u10D0 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8");
            return;
          }
          const o = readOverrides();
          o.added_uni = [...o.added_uni || [], { id, name, fullName: name, city, rating: 4, students: 0 }];
          writeOverrides(o);
          showToast("\u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0");
          e.target.reset();
          refresh();
        });
        expose("admDelFac", (id) => {
          if (!confirm("\u10EC\u10D0\u10D5\u10E8\u10D0\u10DA\u10DD \u10D4\u10E1 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8?")) return;
          const o = readOverrides();
          o.deleted_fac = [.../* @__PURE__ */ new Set([...o.deleted_fac || [], id])];
          o.added_fac = (o.added_fac || []).filter((f) => f.id !== id);
          writeOverrides(o);
          showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
          refresh();
        });
        expose("admAddFac", (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const id = (fd.get("id") || "").toString().trim();
          const name = (fd.get("name") || "").toString().trim();
          const uniId = (fd.get("uniId") || "").toString();
          if (!id || !name || !uniId) {
            showToast("\u10E8\u10D4\u10D0\u10D5\u10E1\u10D4 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10D5\u10D4\u10DA\u10D8");
            return;
          }
          const o = readOverrides();
          o.added_fac = [...o.added_fac || [], { id, name, uniId, dean: "\u2014" }];
          writeOverrides(o);
          showToast("\u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0");
          e.target.reset();
          refresh();
        });
        expose("admResetAll", () => {
          if (!confirm("\u10D2\u10D0\u10D5\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10DD \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8?")) return;
          localStorage.removeItem(ADMIN_OVERRIDES_KEY);
          showToast("\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D3\u10D0");
          refresh();
        });
        let body = "";
        if (tab === "users") {
          body = `
      <div class="card">
        <h2 style="margin:0 0 12px">\u{1F465} \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8 (${usersList.length})</h2>
        ${usersList.length ? `<div class="stack">
          ${usersList.map((u) => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-weight:600">${escapeHtml(u.firstName || "")} ${escapeHtml(u.lastName || "")}</div>
              <div class="muted" style="font-size:12px">${escapeHtml(u.email)} \xB7 ${escapeHtml(u.role || "?")}${u.uniId ? ` \xB7 ${escapeHtml(u.uniId)}/${escapeHtml(u.facultyId || "")}` : ""}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelUser('${u.email}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
          </div>`).join("")}
        </div>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D0\u10E0\u10D0\u10D5\u10D8\u10DC \u10D3\u10D0\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D0 (localStorage demo re\u017Eim-\u10E8\u10D8).</p>`}
        <p class="muted" style="margin-top:10px;font-size:12px">\u26A0 \u10D4\u10E1 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10DA\u10DD\u10D9\u10D0\u10DA\u10E3\u10E0\u10D8\u10D0 (\u10D1\u10E0\u10D0\u10E3\u10D6\u10D4\u10E0\u10E8\u10D8). Firebase-\u10D8\u10E1 \u10E9\u10D0\u10E0\u10D7\u10D5\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2 \u10DC\u10D0\u10EE\u10D0\u10D5 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10E1.</p>
      </div>`;
        } else if (tab === "unis") {
          body = `
      <div class="card">
        <h2 style="margin:0 0 12px">\u{1F3DB} \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8 (${allUnis.length})</h2>
        <div class="stack">
          ${allUnis.map((u) => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;gap:8px">
            <div style="min-width:0">
              <div style="font-weight:600">${escapeHtml(u.name)}</div>
              <div class="muted" style="font-size:12px">${escapeHtml(u.city || "")} \xB7 ID: ${u.id}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelUni('${u.id}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
          </div>`).join("")}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 10px">+ \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</h3>
        <form onsubmit="__campus.admAddUni(event)" class="stack" style="gap:10px">
          <input name="id" placeholder="ID (\u10DB\u10D0\u10D2. caucasus)" required />
          <input name="name" placeholder="\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" required />
          <input name="city" placeholder="\u10E5\u10D0\u10DA\u10D0\u10E5\u10D8" />
          <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
        </form>
      </div>`;
        } else if (tab === "facs") {
          body = `
      <div class="card">
        <h2 style="margin:0 0 12px">\u{1F4DA} \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8 (${allFac.length})</h2>
        <div class="stack" style="max-height:400px;overflow:auto">
          ${allFac.map((f) => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;gap:8px">
            <div style="min-width:0">
              <div style="font-weight:600;font-size:13px">${escapeHtml(f.name)}</div>
              <div class="muted" style="font-size:11px">\u10E3\u10DC\u10D8: ${f.uniId}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelFac('${f.id}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
          </div>`).join("")}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 10px">+ \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</h3>
        <form onsubmit="__campus.admAddFac(event)" class="stack" style="gap:10px">
          <input name="id" placeholder="ID (\u10DB\u10D0\u10D2. tsu-it)" required />
          <input name="name" placeholder="\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" required />
          <select name="uniId" required>
            <option value="">\u2014 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u2014</option>
            ${allUnis.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}
          </select>
          <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
        </form>
      </div>`;
        } else if (tab === "stats") {
          body = `
      <div class="grid grid-4">
        <div class="card stat"><div class="stat-num text-gradient">${allUnis.length}</div><div class="stat-label">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${allFac.length}</div><div class="stat-label">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${usersList.length}</div><div class="stat-label">\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${resources.length}</div><div class="stat-label">\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8</div></div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">\u26A0 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D7\u10D0 \u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</h3>
        <p class="muted" style="margin:0 0 10px;font-size:13px">\u10D2\u10D0\u10D0\u10E3\u10E5\u10DB\u10DD\u10E1 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1 \u10DB\u10D8\u10D4\u10E0 \u10E9\u10D0\u10E2\u10D0\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8 (\u10E3\u10DC\u10D8/\u10E4\u10D0\u10D9. \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0/\u10EC\u10D0\u10E8\u10DA\u10D0).</p>
        <button class="btn btn-ghost" onclick="__campus.admResetAll()">\u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">\u{1F525} Firebase \u10E1\u10E2\u10D0\u10E2\u10E3\u10E1\u10D8</h3>
        <p class="muted" style="margin:0;font-size:13px">
          ${firebaseEnabled ? "\u2705 \u10E9\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8\u10D0 \u2014 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10E1\u10D8\u10DC\u10E5\u10E0\u10DD\u10DC\u10D8\u10D6\u10D3\u10D4\u10D1\u10D0 \u10E6\u10E0\u10E3\u10D1\u10D4\u10DA\u10E8\u10D8" : "\u26AA \u10DA\u10DD\u10D9\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E0\u10D4\u10DF\u10D8\u10DB\u10D8 (localStorage). Firebase-\u10D8\u10E1 \u10E9\u10D0\u10E1\u10D0\u10E0\u10D7\u10D0\u10D5\u10D0\u10D3 \u10E8\u10D4\u10D0\u10D5\u10E1\u10D4 <code>js/firebase.js</code>."}
        </p>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">\u{1F4CB} \u10DB\u10DD\u10DB\u10D0\u10D5\u10D0\u10DA\u10D8 \u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8</h3>
        <ul class="muted" style="margin:0;padding-left:20px;font-size:13px;line-height:1.8">
          <li>\u{1F468}\u200D\u{1F3EB} \u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0</li>
          <li>\u{1F4AC} \u10EA\u10D8\u10E2\u10D0\u10E2\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0</li>
          <li>\u{1F4F0} \u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</li>
          <li>\u{1F4C6} \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10E0\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0 (\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D6\u10D4 \u10D2\u10D0\u10E4\u10D8\u10DA\u10E2\u10E0\u10E3\u10DA\u10D8)</li>
          <li>\u{1F4C5} \u10E6\u10DD\u10DC\u10D8\u10E1\u10EB\u10D8\u10D4\u10D1\u10D4\u10D1\u10D8\u10E1 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8</li>
        </ul>
        <p class="muted" style="margin:10px 0 0;font-size:12px">\u2191 \u10D4\u10E1 \u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8 \u10DB\u10D6\u10D0\u10D3\u10D3\u10D4\u10D1\u10D0. Firebase-\u10D8\u10E1 \u10E9\u10D0\u10E0\u10D7\u10D5\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2 \u10D2\u10D0\u10D0\u10E5\u10E2\u10D8\u10E3\u10E0\u10D3\u10D4\u10D1\u10D0.</p>
      </div>`;
        }
        const tabBtn = (id, label) => `<button class="role-switch-btn ${tab === id ? "active" : ""}" onclick="__campus.admTab('${id}')">${label}</button>`;
        return `
    <h1>\u{1F6E1} \u10D0\u10D3\u10DB\u10D8\u10DC \u10DE\u10D0\u10DC\u10D4\u10DA\u10D8</h1>
    <p class="muted" style="margin:4px 0 18px">${escapeHtml(user.email)}</p>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">
      ${tabBtn("users", "\u{1F465} \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8")}
      ${tabBtn("unis", "\u{1F3DB} \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8")}
      ${tabBtn("facs", "\u{1F4DA} \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8")}
      ${tabBtn("stats", "\u{1F4CA} \u10E1\u10E2\u10D0\u10E2\u10D8\u10E1\u10E2\u10D8\u10D9\u10D0")}
    </div>
    ${body}
  `;
      };
    }
  });

  // static-site/js/faq.js
  var faq_exports = {};
  __export(faq_exports, {
    addFaq: () => addFaq,
    deleteFaq: () => deleteFaq,
    listFaq: () => listFaq,
    listFaqAll: () => listFaqAll,
    listFaqFor: () => listFaqFor,
    updateFaq: () => updateFaq
  });
  var CACHE_KEY2, META_KEY2, STALE_MS, COLLECTION, DEFAULTS, readCache, writeCache, readMeta2, writeMeta2, normalize, sortFn, _inflight2, fetchAllFromFs, _focusHooked, hookFocusOnce, listFaqAll, listFaqFor, listFaq, addFaq, deleteFaq, updateFaq;
  var init_faq = __esm({
    "static-site/js/faq.js"() {
      "use strict";
      init_firebase();
      CACHE_KEY2 = "campus.faq.cache.v2";
      META_KEY2 = "campus.faq.meta.v2";
      STALE_MS = 24 * 60 * 60 * 1e3;
      COLLECTION = "faq";
      DEFAULTS = [
        {
          id: "f-mobility",
          topic: "\u10DB\u10DD\u10D1\u10D8\u10DA\u10DD\u10D1\u10D0",
          title: "\u10E0\u10DD\u10D2\u10DD\u10E0 \u10EE\u10DD\u10E0\u10EA\u10D8\u10D4\u10DA\u10D3\u10D4\u10D1\u10D0 \u10DB\u10DD\u10D1\u10D8\u10DA\u10DD\u10D1\u10D0?",
          body: "\u10DB\u10DD\u10D1\u10D8\u10DA\u10DD\u10D1\u10D8\u10E1 \u10D2\u10D0\u10DC\u10EA\u10EE\u10D0\u10D3\u10D4\u10D1\u10D0 \u10E8\u10D4\u10DB\u10DD\u10D0\u10E5\u10D5\u10E1 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10E1 \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8\u10E1 \u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10DE\u10E0\u10DD\u10EA\u10D4\u10E1\u10D8\u10E1 \u10E1\u10D0\u10DB\u10E1\u10D0\u10EE\u10E3\u10E0\u10E8\u10D8 \u10D3\u10D0\u10D3\u10D2\u10D4\u10DC\u10D8\u10DA \u10D5\u10D0\u10D3\u10D4\u10D1\u10E8\u10D8. \u10E8\u10D4\u10DB\u10D3\u10D2\u10DD\u10DB \u10D4\u10E2\u10D0\u10DE\u10D6\u10D4 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D0 \u10DB\u10D8\u10DB\u10E6\u10D4\u10D1\u10D8 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8\u10E1 \u10D7\u10D0\u10DC\u10EE\u10DB\u10DD\u10D1\u10D0 \u10D3\u10D0 \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D4\u10D1\u10D8\u10E1 \u10D0\u10E6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E4\u10E3\u10E0\u10EA\u10D4\u10DA\u10D8.",
          scope: "all",
          ts: 0
        },
        {
          id: "f-gpa",
          topic: "GPA",
          title: "\u10E0\u10DD\u10D2\u10DD\u10E0 \u10D2\u10D0\u10DB\u10DD\u10D8\u10D7\u10D5\u10DA\u10D4\u10D1\u10D0 GPA?",
          body: "GPA = \u03A3(\u10E5\u10E3\u10DA\u10D0 \xD7 \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8) \xF7 \u03A3(\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8). \u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D0\u10D6\u10D4 \u10EE\u10D4\u10DA\u10DB\u10D8\u10E1\u10D0\u10EC\u10D5\u10D3\u10DD\u10DB\u10D8\u10D0 GPA-\u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10D0\u10E2\u10DD\u10E0\u10D8 \u10D6\u10E3\u10E1\u10E2\u10D8 \u10D2\u10D0\u10D7\u10D5\u10DA\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1, \u10DB\u10D0\u10D7 \u10E8\u10DD\u10E0\u10D8\u10E1 \u201E\u10E0\u10D0-\u10D7\u10E3\u201C \u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10DD\u10D3\u10D4\u10DA\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.",
          scope: "all",
          ts: 0
        },
        {
          id: "f-account",
          topic: "\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8",
          title: "\u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10D7\u10E3 \u10D0\u10E0\u10D0 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8\u10E1\u10D0 \u10D3\u10D0 \u10D2\u10D5\u10D0\u10E0\u10D8\u10E1 \u10E8\u10D4\u10EA\u10D5\u10DA\u10D0 \u10DE\u10D0\u10E0\u10D0\u10DB\u10D4\u10E2\u10E0\u10D4\u10D1\u10D8\u10D3\u10D0\u10DC?",
          body: "\u10D5\u10D4\u10E0\u10D0. \u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D8\u10E1\u10D0\u10E1 \u10DB\u10D8\u10D7\u10D8\u10D7\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10D3\u10D0 \u10D2\u10D5\u10D0\u10E0\u10D8 \u10DB\u10E3\u10D3\u10DB\u10D8\u10D5\u10D8\u10D0. \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10DB\u10D8\u10DB\u10D0\u10E0\u10D7\u10D4\u10D7 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0\u10E1.",
          scope: "all",
          ts: 0
        }
      ];
      readCache = () => {
        try {
          const v = JSON.parse(localStorage.getItem(CACHE_KEY2) || "null");
          if (Array.isArray(v)) return v;
        } catch {
        }
        return DEFAULTS.slice();
      };
      writeCache = (arr) => {
        try {
          localStorage.setItem(CACHE_KEY2, JSON.stringify(arr));
        } catch {
        }
      };
      readMeta2 = () => {
        try {
          return JSON.parse(localStorage.getItem(META_KEY2) || "{}") || {};
        } catch {
          return {};
        }
      };
      writeMeta2 = (m) => {
        try {
          localStorage.setItem(META_KEY2, JSON.stringify(m));
        } catch {
        }
      };
      normalize = (raw, id) => {
        const item = { id: id || raw.id, ...raw };
        if (!item.scope) item.scope = "all";
        if (item.scope !== "uni" && item.scope !== "faculty") item.scope = "all";
        if (item.scope === "all") {
          delete item.uniId;
          delete item.facultyId;
        }
        if (item.scope === "uni") {
          delete item.facultyId;
        }
        return item;
      };
      sortFn = (a, b) => (a.topic || "").localeCompare(b.topic || "", "ka") || (a.title || "").localeCompare(b.title || "", "ka");
      _inflight2 = null;
      fetchAllFromFs = async () => {
        if (!firebaseEnabled) return null;
        if (_inflight2) return _inflight2;
        _inflight2 = (async () => {
          try {
            const fb = await loadFirebase();
            if (!fb) return null;
            const snap = await fb.getDocs(fb.collection(fb.db, COLLECTION));
            const arr = [];
            snap.forEach((d) => arr.push(normalize(d.data(), d.id)));
            writeCache(arr);
            writeMeta2({ ts: Date.now() });
            return arr;
          } finally {
            _inflight2 = null;
          }
        })();
        return _inflight2;
      };
      _focusHooked = false;
      hookFocusOnce = () => {
        if (_focusHooked || typeof window === "undefined") return;
        _focusHooked = true;
        const tryRefresh = () => {
          const m = readMeta2();
          if (Date.now() - (m.ts || 0) > STALE_MS) fetchAllFromFs().catch(() => {
          });
        };
        window.addEventListener("focus", tryRefresh);
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) tryRefresh();
        });
      };
      listFaqAll = async () => {
        hookFocusOnce();
        const meta2 = readMeta2();
        const fresh = Date.now() - (meta2.ts || 0) < STALE_MS;
        let arr;
        if (fresh) {
          arr = readCache();
        } else {
          arr = await fetchAllFromFs().catch(() => null) || readCache();
        }
        return arr.map((x) => normalize(x, x.id)).sort(sortFn);
      };
      listFaqFor = async (profile, isAdminFlag) => {
        const all = await listFaqAll();
        if (isAdminFlag) return all;
        const uniId = profile?.uniId || profile?.universityId || "";
        const facId = profile?.facultyId || "";
        return all.filter((f) => {
          if (f.scope === "all") return true;
          if (f.scope === "uni") return uniId && f.uniId === uniId;
          if (f.scope === "faculty") return facId && f.facultyId === facId;
          return false;
        });
      };
      listFaq = () => readCache().slice().sort(sortFn);
      addFaq = async ({ topic, title, body, scope, uniId, facultyId }) => {
        const t = String(topic || "").trim();
        const ti = String(title || "").trim();
        const bo = String(body || "").trim();
        if (!t || !ti || !bo) throw new Error("\u10E7\u10D5\u10D4\u10DA\u10D0 \u10D5\u10D4\u10DA\u10D8 \u10D0\u10E3\u10EA\u10D8\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0");
        const sc = scope === "uni" || scope === "faculty" ? scope : "all";
        if (sc === "uni" && !uniId) throw new Error("\u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8");
        if (sc === "faculty" && (!uniId || !facultyId)) throw new Error("\u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u10D3\u10D0 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8");
        const payload = { topic: t, title: ti, body: bo, scope: sc, ts: Date.now() };
        if (sc !== "all") payload.uniId = uniId;
        if (sc === "faculty") payload.facultyId = facultyId;
        if (firebaseEnabled) {
          const fb = await loadFirebase();
          if (fb) {
            const ref = await fb.addDoc(fb.collection(fb.db, COLLECTION), {
              ...payload,
              createdAt: fb.serverTimestamp()
            });
            await fetchAllFromFs().catch(() => {
            });
            return { id: ref.id, ...payload };
          }
        }
        const arr = readCache();
        const item = { id: "f-" + Math.random().toString(36).slice(2, 9), ...payload };
        arr.push(item);
        writeCache(arr);
        return item;
      };
      deleteFaq = async (id) => {
        if (firebaseEnabled) {
          const fb = await loadFirebase();
          if (fb) {
            try {
              await fb.deleteDoc(fb.doc(fb.db, COLLECTION, id));
            } catch (e) {
              console.warn("faq delete", e);
            }
            await fetchAllFromFs().catch(() => {
            });
            return;
          }
        }
        writeCache(readCache().filter((f) => f.id !== id));
      };
      updateFaq = async (id, patch) => {
        if (firebaseEnabled) {
          const fb = await loadFirebase();
          if (fb) {
            await fb.updateDoc(fb.doc(fb.db, COLLECTION, id), patch);
            await fetchAllFromFs().catch(() => {
            });
            return;
          }
        }
        writeCache(readCache().map((f) => f.id === id ? { ...f, ...patch } : f));
      };
    }
  });

  // static-site/js/app.js
  init_router();
  init_state();
  init_auth();
  init_store();

  // static-site/js/palette.js
  init_data();
  init_news_data();
  init_router();
  var _inited = false;
  var backdrop = null;
  var input = null;
  var list = null;
  var PAGES = [
    { kind: "page", title: "\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8", path: "/" },
    { kind: "page", title: "\u10D2\u10D0\u10DC\u10E0\u10D8\u10D2\u10D8", path: "/schedule" },
    { kind: "page", title: "\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8", path: "/news" },
    { kind: "page", title: "\u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8", path: "/academic" },
    { kind: "page", title: "GPA", path: "/gpa" },
    { kind: "page", title: "\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8", path: "/universities" },
    { kind: "page", title: "\u10D2\u10D0\u10E4\u10D0\u10E0\u10D7\u10DD\u10D4\u10D1\u10E3\u10DA\u10D8 \u10EB\u10D8\u10D4\u10D1\u10D0", path: "/search" },
    { kind: "page", title: "\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8", path: "/resources" },
    { kind: "page", title: "\u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D8", path: "/profile" },
    { kind: "page", title: "\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8", path: "/admin" }
  ];
  var allItems = () => [
    ...PAGES,
    ...universities.map((u) => ({ kind: "\u10E3\u10DC\u10D8\u10D5.", title: u.name, subtitle: u.fullName, path: `/university/${u.id}` })),
    ...faculties.map((f) => ({ kind: "\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2.", title: f.name, path: `/faculty/${f.id}` })),
    ...subjects.map((s) => ({ kind: "\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8", title: s.name, subtitle: s.code, path: `/subject/${s.id}` })),
    ...newsItems.map((n) => ({ kind: "\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4", title: n.title, subtitle: n.summary.slice(0, 60), path: `/news` }))
  ];
  var selected = 0;
  var filtered = [];
  var open = () => {
    backdrop.hidden = false;
    input.value = "";
    search("");
    setTimeout(() => input.focus(), 0);
  };
  var close = () => {
    backdrop.hidden = true;
  };
  var search = (q2) => {
    const ql = q2.trim().toLowerCase();
    filtered = allItems().filter(
      (i) => !ql || i.title.toLowerCase().includes(ql) || (i.subtitle || "").toLowerCase().includes(ql)
    ).slice(0, 30);
    selected = 0;
    list.innerHTML = filtered.map((i, ix) => `
    <li class="${ix === selected ? "selected" : ""}" data-ix="${ix}">
      <span>${i.title}</span>
      ${i.subtitle ? `<span class="muted" style="font-size:12px">${i.subtitle}</span>` : ""}
      <span class="kind">${i.kind}</span>
    </li>
  `).join("") || `<li class="muted" style="padding:14px">\u10D5\u10D4\u10E0\u10D0\u10E4\u10D4\u10E0\u10D8 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</li>`;
  };
  var go = (ix) => {
    const item = filtered[ix];
    if (!item) return;
    navigate(item.path);
    close();
  };
  var onInputKeydown = (e) => {
    if (e.key === "ArrowDown") {
      selected = Math.min(selected + 1, filtered.length - 1);
      updateSel();
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      selected = Math.max(selected - 1, 0);
      updateSel();
      e.preventDefault();
    } else if (e.key === "Enter") {
      go(selected);
    } else if (e.key === "Escape") {
      close();
    }
  };
  var updateSel = () => list.querySelectorAll("li").forEach((el, ix) => el.classList.toggle("selected", ix === selected));
  var initPalette = () => {
    if (_inited) return;
    backdrop = document.getElementById("paletteBackdrop");
    input = document.getElementById("paletteInput");
    list = document.getElementById("paletteResults");
    const btn = document.getElementById("searchBtn");
    if (!backdrop || !input || !list || !btn) return;
    _inited = true;
    input.addEventListener("input", (e) => search(e.target.value));
    input.addEventListener("keydown", onInputKeydown);
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-ix]");
      if (li) go(+li.dataset.ix);
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    });
    btn.addEventListener("click", open);
  };

  // static-site/js/mobile-nav.js
  init_state();
  var BASE_TABS = [
    { href: "#/", icon: "\u{1F3E0}", label: "\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8" },
    { href: "#/schedule", icon: "\u{1F4C5}", label: "\u10D2\u10D0\u10DC\u10E0\u10D8\u10D2\u10D8" },
    { href: "#/chats", icon: "\u{1F4AC}", label: "\u10E4\u10DD\u10E0\u10E3\u10DB\u10D8" },
    { href: "#/gpa", icon: "\u{1F9EE}", label: "GPA" },
    { href: "#more", icon: "\u22EF", label: "\u10DB\u10D4\u10E2\u10D8", action: "more" }
  ];
  var MORE_LINKS = [
    { href: "#/lecturers", icon: "\u{1F468}\u200D\u{1F3EB}", label: "\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8" },
    { href: "#/academic", icon: "\u{1F393}", label: "\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8", roles: ["student"] },
    { href: "#/resources", icon: "\u{1F4DA}", label: "\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8", roles: ["student"] },
    { href: "#/faq", icon: "\u2753", label: "FAQ" }
  ];
  var linksForRole = () => {
    const r = getRole();
    return MORE_LINKS.filter((l) => !l.roles || l.roles.includes(r));
  };
  function activeHash() {
    return (location.hash || "#/").toLowerCase();
  }
  function renderTabs() {
    const el = document.getElementById("mobileTabs");
    if (!el) return;
    const cur = activeHash();
    el.innerHTML = BASE_TABS.map((t) => {
      const active = t.action ? false : t.href === "#/" ? cur === "#/" || cur === "" : cur.startsWith(t.href);
      const cls = ["tab-btn"];
      if (active) cls.push("active");
      const attr = t.action ? `data-action="${t.action}" type="button"` : `href="${t.href}"`;
      const tag = t.action ? "button" : "a";
      const aria = active ? ` aria-current="page"` : "";
      return `<${tag} class="${cls.join(" ")}" ${attr}${aria} aria-label="${t.label}">
      <span class="ti" aria-hidden="true">${t.icon}</span>
      <span class="tl">${t.label}</span>
    </${tag}>`;
    }).join("");
  }
  function closeSheet() {
    document.getElementById("moreSheet").hidden = true;
    document.getElementById("moreBackdrop").hidden = true;
  }
  function openSheet() {
    const sheet = document.getElementById("moreSheet");
    const back = document.getElementById("moreBackdrop");
    const theme = getTheme();
    sheet.innerHTML = `
    <div class="sheet-handle" aria-hidden="true"></div>
    <div class="sheet-head">
      <h3>\u10DB\u10D4\u10E2\u10D8</h3>
      <button class="btn-icon" data-action="close-sheet" type="button" aria-label="\u10D3\u10D0\u10EE\u10E3\u10E0\u10D5\u10D0">\u2715</button>
    </div>
    <div class="sheet-grid">
      ${linksForRole().map((l) => `<a class="sheet-item" href="${l.href}" data-action="link">
        <span class="si" aria-hidden="true">${l.icon}</span><span>${l.label}</span></a>`).join("")}
    </div>
    <div class="sheet-row">
      <button class="btn" data-action="toggle-theme" type="button">${theme === "dark" ? "\u2600\uFE0F \u10E6\u10D8\u10D0 \u10D7\u10D4\u10DB\u10D0" : "\u{1F319} \u10DB\u10E3\u10E5\u10D8 \u10D7\u10D4\u10DB\u10D0"}</button>
    </div>
  `;
    sheet.hidden = false;
    back.hidden = false;
  }
  function initMobileNav() {
    renderTabs();
    window.addEventListener("hashchange", () => {
      renderTabs();
      closeSheet();
    });
    document.getElementById("mobileTabs").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='more']");
      if (btn) {
        e.preventDefault();
        openSheet();
      }
    });
    document.getElementById("moreBackdrop").addEventListener("click", closeSheet);
    document.getElementById("moreSheet").addEventListener("click", (e) => {
      const act = e.target.closest("[data-action]")?.dataset.action;
      if (act === "close-sheet") closeSheet();
      else if (act === "link") closeSheet();
      else if (act === "toggle-theme") {
        toggleTheme();
        const btn = document.getElementById("themeBtn");
        if (btn) btn.textContent = getTheme() === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
        openSheet();
      }
    });
  }

  // static-site/js/prefetch.js
  init_store();
  init_auth();
  var idle = (fn, timeout = 1500) => (window.requestIdleCallback || ((cb) => setTimeout(cb, 200)))(fn, { timeout });
  var warmedImages = /* @__PURE__ */ new Set();
  var warmImage = (url) => {
    if (!url || warmedImages.has(url)) return;
    warmedImages.add(url);
    try {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = url;
      if (img.decode) img.decode().catch(() => {
      });
    } catch {
    }
  };
  var warmedViews = /* @__PURE__ */ new Set();
  var warmView = async (name, fn, params = {}) => {
    if (warmedViews.has(name)) return;
    warmedViews.add(name);
    try {
      await fn(params);
    } catch {
    }
  };
  var kicked = false;
  var prefetchAfterAuth = async () => {
    if (kicked) return;
    kicked = true;
    idle(() => {
      const unis = state.universities || [];
      for (const u of unis.slice(0, 30)) warmImage(u.logoUrl);
      const news2 = state.news || [];
      for (const n of news2.slice(0, 12)) warmImage(n.coverUrl || n.imageUrl);
    });
    idle(async () => {
      try {
        const [
          { dashboardView: dashboardView2 },
          { universitiesView: universitiesView2 },
          { newsView: newsView2 },
          { scheduleView: scheduleView2 },
          { profileView: profileView2 }
        ] = await Promise.all([
          Promise.resolve().then(() => (init_dashboard(), dashboard_exports)),
          Promise.resolve().then(() => (init_catalog(), catalog_exports)).then((m) => ({ universitiesView: m.universitiesView })),
          Promise.resolve().then(() => (init_news(), news_exports)),
          Promise.resolve().then(() => (init_schedule(), schedule_exports)),
          Promise.resolve().then(() => (init_misc(), misc_exports)).then((m) => ({ profileView: m.profileView }))
        ]);
        const sink = document.createElement("div");
        const run = async (name, viewFn) => {
          try {
            const out = await viewFn({});
            if (typeof out === "string") sink.innerHTML = out;
          } catch {
          }
        };
        const prof = getProfile();
        await warmView("dashboard", () => run("dashboard", dashboardView2));
        await warmView("universities", () => run("universities", universitiesView2));
        await warmView("news", () => run("news", newsView2));
        if (prof?.role === "student") {
          await warmView("schedule", () => run("schedule", scheduleView2));
        }
        await warmView("profile", () => run("profile", profileView2));
      } catch {
      }
    }, 3e3);
    idle(() => {
      const lecs = state.lecturers || [];
      for (const l of lecs.slice(0, 24)) warmImage(l.photoUrl);
    }, 3500);
  };

  // static-site/js/app.js
  init_dashboard();

  // static-site/js/views/login.js
  init_auth();
  init_firebase();
  init_ui();
  init_router();
  init_state();
  var T2 = (k, v) => window.T ? window.T(k, v) : k;
  var setStatus = (id, msg, kind = "error") => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("error", kind === "error");
    el.classList.toggle("success", kind === "success");
  };
  var setFieldError = (id, msg) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    const hint = document.getElementById(id + "Err");
    if (hint) hint.textContent = msg || "";
  };
  var clearFieldErrors = (ids) => ids.forEach((id) => setFieldError(id, ""));
  var readQuery = () => {
    try {
      const q2 = location.hash.split("?")[1] || "";
      return new URLSearchParams(q2);
    } catch {
      return new URLSearchParams();
    }
  };
  var getPendingRole = () => {
    const fromUrl = readQuery().get("role");
    if (fromUrl && ROLES[fromUrl]) return fromUrl;
    try {
      const stored = localStorage.getItem("campus.pendingRole");
      if (stored && ROLES[stored]) return stored;
    } catch {
    }
    return "";
  };
  var getInitialMode = () => {
    const m = readQuery().get("mode");
    if (m === "login" || m === "register") return m;
    return getPendingRole() ? "register" : "login";
  };
  var loginView = () => {
    const pendingRole = getPendingRole();
    const initialMode = getInitialMode();
    expose("doLogin", async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      const btn = form.querySelector("button[type=submit]");
      clearFieldErrors(["loginEmail", "loginPassword"]);
      setStatus("loginStatus", "");
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      const orig = btn.textContent;
      btn.textContent = T2("auth.btn.loading");
      try {
        await login(fd.get("email"), fd.get("password"));
        showToast(T2("auth.toast.welcome"));
        navigate("/");
      } catch (err) {
        if (err instanceof EmailNotVerifiedError || err.code === "auth/email-not-verified") {
          setStatus("loginStatus", err.message, "error");
          const resendBox = document.getElementById("resendBox");
          if (resendBox) resendBox.hidden = false;
        } else {
          setFieldError("loginEmail", " ");
          setFieldError("loginPassword", " ");
          setStatus("loginStatus", err.message || T2("auth.toast.failed"), "error");
        }
      } finally {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        btn.textContent = orig;
      }
    });
    expose("doResend", async (btn) => {
      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = T2("auth.btn.sending");
      try {
        await resendVerification();
        showToast(T2("auth.resend.ok"));
      } catch (err) {
        showToast(err.message || T2("auth.resend.fail"));
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
    expose("pickRole", () => {
    });
    expose("changeRole", () => {
    });
    expose("doRegister", async (e) => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      const btn = form.querySelector("button[type=submit]");
      const ids = ["regFirstName", "regLastName", "regEmail", "regPersonalId", "regPhone", "regPassword"];
      clearFieldErrors(ids);
      setStatus("regStatus", "");
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      const orig = btn.textContent;
      btn.textContent = T2("auth.btn.loading");
      try {
        const result = await register({
          role: "student",
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          personalId: fd.get("personalId"),
          phone: fd.get("phone"),
          password: fd.get("password")
        });
        setRole("student");
        try {
          localStorage.removeItem("campus.pendingRole");
        } catch {
        }
        if (result?.verificationSent) {
          const regCard = document.getElementById("regCard");
          if (regCard) {
            regCard.innerHTML = `
            <div class="verify-notice">
              <h3>${T2("auth.verify.title")}</h3>
              <p>${T2("auth.verify.body", { email: result.email })}</p>
              <button class="btn" onclick="__campus.doResend(this)">${T2("auth.verify.resendBtn")}</button>
              <button class="btn btn-primary" style="margin-left:8px" onclick="__campus.toggleAuth('login')">${T2("auth.verify.toLogin")}</button>
            </div>`;
          }
          showToast(T2("auth.toast.checkEmail"));
        } else {
          showToast(T2("auth.toast.registered"));
          navigate("/");
        }
      } catch (err) {
        if (err.fields) {
          const map = {
            firstName: "regFirstName",
            lastName: "regLastName",
            email: "regEmail",
            personalId: "regPersonalId",
            phone: "regPhone",
            password: "regPassword"
          };
          Object.entries(err.fields).forEach(([k, msg]) => setFieldError(map[k], msg));
        }
        setStatus("regStatus", err.message || T2("auth.toast.failed"), "error");
      } finally {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        btn.textContent = orig;
      }
    });
    expose("toggleAuth", (mode) => {
      const loginCard = document.getElementById("loginCard");
      const regCard = document.getElementById("regCard");
      loginCard.hidden = mode !== "login";
      regCard.hidden = mode !== "register";
      document.querySelectorAll(".auth-tabs button").forEach((b) => {
        const on = b.dataset.mode === mode;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      (mode === "login" ? loginCard : regCard).querySelector("input,button[data-role]")?.focus();
    });
    expose("authTabKey", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = e.target.dataset.mode === "login" ? "register" : "login";
      window.__campus.toggleAuth(next);
    });
    window.__campusInit = window.__campusInit || {};
    window.__campusInit.authInit = () => {
      const firebaseNote = document.querySelector("[data-firebase-note]");
      if (firebaseNote) firebaseNote.hidden = firebaseEnabled;
      window.__campus.toggleAuth(initialMode);
    };
    const TERMS_CONTENT = {
      terms: {
        en: "Terms of Use",
        ka: "Campusi-\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10E7\u10D4\u10DC\u10D4\u10D1\u10D8\u10E1 \u10EC\u10D4\u10E1\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10DE\u10D8\u10E0\u10DD\u10D1\u10D4\u10D1\u10D8",
        body: `
        <p>Campusi-\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10E7\u10D4\u10DC\u10D4\u10D1\u10D8\u10D7 \u10D7\u10E5\u10D5\u10D4\u10DC \u10D4\u10D7\u10D0\u10DC\u10EE\u10DB\u10D4\u10D1\u10D8\u10D7 \u10E5\u10D5\u10D4\u10DB\u10DD\u10D7 \u10DB\u10DD\u10EA\u10D4\u10DB\u10E3\u10DA \u10DE\u10D8\u10E0\u10DD\u10D1\u10D4\u10D1\u10E1.</p>
        <h4>\u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D8\u10E1 \u10DB\u10D8\u10D6\u10D0\u10DC\u10D8</h4>
        <p>Campusi \u10EC\u10D0\u10E0\u10DB\u10DD\u10D0\u10D3\u10D2\u10D4\u10DC\u10E1 \u10D3\u10D0\u10DB\u10DD\u10E3\u10D9\u10D8\u10D3\u10D4\u10D1\u10D4\u10DA \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10E3\u10E0 \u10EA\u10D8\u10E4\u10E0\u10E3\u10DA \u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D0\u10E1, \u10E0\u10DD\u10DB\u10D4\u10DA\u10D8\u10EA \u10E8\u10D4\u10E5\u10DB\u10DC\u10D8\u10DA\u10D8\u10D0 \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D8\u10E1, \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10E3\u10E0\u10D8 \u10E1\u10D4\u10E0\u10D5\u10D8\u10E1\u10D4\u10D1\u10D8\u10E1 \u10EE\u10D4\u10DA\u10DB\u10D8\u10E1\u10D0\u10EC\u10D5\u10D3\u10DD\u10DB\u10DD\u10D1\u10D8\u10E1 \u10DB\u10D8\u10D6\u10DC\u10D8\u10D7.</p>
        <p>Campusi \u10D0\u10E0 \u10EC\u10D0\u10E0\u10DB\u10DD\u10D0\u10D3\u10D2\u10D4\u10DC\u10E1 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8\u10E1 \u10DD\u10E4\u10D8\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0 \u10E1\u10D8\u10E1\u10E2\u10D4\u10DB\u10D0\u10E1, \u10D2\u10D0\u10E0\u10D3\u10D0 \u10D8\u10DB \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D8\u10E1\u10D0, \u10E0\u10DD\u10D3\u10D4\u10E1\u10D0\u10EA \u10D9\u10DD\u10DC\u10D9\u10E0\u10D4\u10E2\u10E3\u10DA\u10D8 \u10DE\u10D0\u10E0\u10E2\u10DC\u10D8\u10DD\u10E0\u10DD\u10D1\u10D0 \u10DE\u10D8\u10E0\u10D3\u10D0\u10DE\u10D8\u10E0 \u10D0\u10E0\u10D8\u10E1 \u10DB\u10D8\u10D7\u10D8\u10D7\u10D4\u10D1\u10E3\u10DA\u10D8.</p>
        <h4>\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10E8\u10D4\u10E5\u10DB\u10DC\u10D0</h4>
        <p>\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D8\u10E1\u10D0\u10E1 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8 \u10D5\u10D0\u10DA\u10D3\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0 \u10DB\u10D8\u10E3\u10D7\u10D8\u10D7\u10DD\u10E1 \u10E1\u10EC\u10DD\u10E0\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0.</p>
        <p>\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8 \u10DE\u10D0\u10E1\u10E3\u10EE\u10D8\u10E1\u10DB\u10D2\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10E1\u10D0\u10D9\u10E3\u10D7\u10D0\u10E0\u10D8 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10E3\u10E1\u10D0\u10E4\u10E0\u10D7\u10EE\u10DD\u10D4\u10D1\u10D0\u10D6\u10D4 \u10D3\u10D0 \u10DE\u10D0\u10E0\u10DD\u10DA\u10D8\u10E1 \u10D3\u10D0\u10EA\u10D5\u10D0\u10D6\u10D4.</p>
        <h4>\u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8 \u10E5\u10DB\u10D4\u10D3\u10D4\u10D1\u10D4\u10D1\u10D8</h4>
        <p>\u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8\u10D0:</p>
        <ul>
          <li>\u10E7\u10D0\u10DA\u10D1\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D8\u10E1 \u10D2\u10D0\u10D5\u10E0\u10EA\u10D4\u10DA\u10D4\u10D1\u10D0</li>
          <li>\u10E1\u10EE\u10D5\u10D8\u10E1\u10D8 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0</li>
          <li>\u10E1\u10DE\u10D0\u10DB\u10D8\u10E1 \u10D2\u10D0\u10D5\u10E0\u10EA\u10D4\u10DA\u10D4\u10D1\u10D0</li>
          <li>\u10E8\u10D4\u10E3\u10E0\u10D0\u10EA\u10EE\u10DB\u10E7\u10DD\u10E4\u10D4\u10DA\u10D8 \u10D0\u10DC \u10DB\u10D0\u10D5\u10DC\u10D4 \u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8\u10E1 \u10D2\u10D0\u10DC\u10D7\u10D0\u10D5\u10E1\u10D4\u10D1\u10D0</li>
          <li>\u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D8\u10E1 \u10D1\u10DD\u10E0\u10DD\u10E2\u10D0\u10D3 \u10D2\u10D0\u10DB\u10DD\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0</li>
          <li>\u10E1\u10D0\u10D0\u10D5\u10E2\u10DD\u10E0\u10DD \u10E3\u10E4\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10E0\u10E6\u10D5\u10D4\u10D5\u10D0</li>
        </ul>
        <h4>\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10D5\u10D0</h4>
        <p>Campusi \u10E3\u10E4\u10DA\u10D4\u10D1\u10D0\u10E1 \u10D8\u10E2\u10DD\u10D5\u10D4\u10D1\u10E1 \u10D3\u10E0\u10DD\u10D4\u10D1\u10D8\u10D7 \u10D0\u10DC \u10DB\u10E3\u10D3\u10DB\u10D8\u10D5\u10D0\u10D3 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10DD\u10E1 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10EC\u10D4\u10E1\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10E0\u10E6\u10D5\u10D4\u10D5\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D0\u10E8\u10D8.</p>
        <h4>\u10DE\u10D0\u10E1\u10E3\u10EE\u10D8\u10E1\u10DB\u10D2\u10D4\u10D1\u10DA\u10DD\u10D1\u10D8\u10E1 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10D5\u10D0</h4>
        <p>Campusi \u10D0\u10E0 \u10D8\u10EB\u10DA\u10D4\u10D5\u10D0 \u10D2\u10D0\u10E0\u10D0\u10DC\u10E2\u10D8\u10D0\u10E1 \u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D0\u10D6\u10D4 \u10D0\u10E0\u10E1\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D8\u10E1 \u10E1\u10E0\u10E3\u10DA \u10E1\u10D8\u10D6\u10E3\u10E1\u10E2\u10D4\u10D6\u10D4. \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D8\u10E1 \u10DB\u10D8\u10D4\u10E0 \u10D2\u10D0\u10DB\u10DD\u10E5\u10D5\u10D4\u10E7\u10DC\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 \u10EC\u10D0\u10E0\u10DB\u10DD\u10D0\u10D3\u10D2\u10D4\u10DC\u10E1 \u10DB\u10D0\u10D7\u10D8 \u10D0\u10D5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DE\u10D8\u10E0\u10D0\u10D3 \u10DB\u10DD\u10E1\u10D0\u10D6\u10E0\u10D4\u10D1\u10D4\u10D1\u10E1.</p>
        <h4>\u10DE\u10D8\u10E0\u10DD\u10D1\u10D4\u10D1\u10D8\u10E1 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D0</h4>
        <p>Campusi \u10E3\u10E4\u10DA\u10D4\u10D1\u10D0\u10E1 \u10D8\u10E2\u10DD\u10D5\u10D4\u10D1\u10E1 \u10E8\u10D4\u10EA\u10D5\u10D0\u10DA\u10DD\u10E1 \u10DE\u10D8\u10E0\u10DD\u10D1\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D0\u10E8\u10D8 \u10D0\u10EA\u10DC\u10DD\u10D1\u10DD\u10E1 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D4\u10D1\u10E1.</p>
      `
      },
      privacy: {
        en: "Privacy Policy",
        ka: "\u10E0\u10DD\u10D2\u10DD\u10E0 \u10D5\u10D0\u10D2\u10E0\u10DD\u10D5\u10D4\u10D1\u10D7, \u10D5\u10D8\u10E7\u10D4\u10DC\u10D4\u10D1\u10D7 \u10D3\u10D0 \u10D5\u10D8\u10EA\u10D0\u10D5\u10D7 \u10D7\u10E5\u10D5\u10D4\u10DC\u10E1 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10E1",
        body: `
        <p>Campusi \u10DE\u10D0\u10E2\u10D8\u10D5\u10E1 \u10E1\u10EA\u10D4\u10DB\u10E1 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D8\u10E1 \u10D9\u10DD\u10DC\u10E4\u10D8\u10D3\u10D4\u10DC\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10DD\u10D1\u10D0\u10E1.</p>
        <h4>\u10E0\u10D0 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0\u10E1 \u10D5\u10D0\u10D2\u10E0\u10DD\u10D5\u10D4\u10D1\u10D7</h4>
        <p>\u10E9\u10D5\u10D4\u10DC \u10E8\u10D4\u10D8\u10EB\u10DA\u10D4\u10D1\u10D0 \u10E8\u10D4\u10D5\u10D0\u10D2\u10E0\u10DD\u10D5\u10DD\u10D7:</p>
        <ul>
          <li>\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8</li><li>\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0</li><li>\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</li><li>\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</li>
          <li>\u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D8\u10E1 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0</li><li>\u10D0\u10E5\u10E2\u10D8\u10D5\u10DD\u10D1\u10D8\u10E1 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8</li><li>\u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10E3\u10E0\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0</li>
        </ul>
        <h4>\u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0</h4>
        <p>\u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10D2\u10D0\u10DB\u10DD\u10D8\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0:</p>
        <ul>
          <li>\u10D0\u10D5\u10E2\u10DD\u10E0\u10D8\u10D6\u10D0\u10EA\u10D8\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1</li><li>\u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10D8\u10D6\u10D0\u10EA\u10D8\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1</li>
          <li>\u10DE\u10DA\u10D0\u10E2\u10E4\u10DD\u10E0\u10DB\u10D8\u10E1 \u10E3\u10E1\u10D0\u10E4\u10E0\u10D7\u10EE\u10DD\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1</li><li>\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E3\u10DB\u10EF\u10DD\u10D1\u10D4\u10E1\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1</li>
        </ul>
        <h4>\u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10EA\u10D5\u10D0</h4>
        <p>Campusi \u10D8\u10E7\u10D4\u10DC\u10D4\u10D1\u10E1 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10E3\u10E0 \u10D3\u10D0 \u10DD\u10E0\u10D2\u10D0\u10DC\u10D8\u10D6\u10D0\u10EA\u10D8\u10E3\u10DA \u10D6\u10DD\u10DB\u10D4\u10D1\u10E1 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D8\u10E1 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10E1\u10D0\u10EA\u10D0\u10D5\u10D0\u10D3.</p>
        <h4>\u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D0</h4>
        <p>Campusi \u10D0\u10E0 \u10E7\u10D8\u10D3\u10D8\u10E1 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D8\u10E1 \u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10E3\u10E0 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10E1 \u10DB\u10D4\u10E1\u10D0\u10DB\u10D4 \u10DE\u10D8\u10E0\u10D4\u10D1\u10D6\u10D4.</p>
        <h4>\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D8\u10E1 \u10E3\u10E4\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8</h4>
        <p>\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10E1 \u10E8\u10D4\u10E3\u10EB\u10DA\u10D8\u10D0:</p>
        <ul>
          <li>\u10E1\u10D0\u10D9\u10E3\u10D7\u10D0\u10E0\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10DC\u10D0\u10EE\u10D5\u10D0</li>
          <li>\u10DB\u10D0\u10D7\u10D8 \u10D2\u10D0\u10DC\u10D0\u10EE\u10DA\u10D4\u10D1\u10D0</li>
          <li>\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10D0\u10DC \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10EC\u10D0\u10E8\u10DA\u10D8\u10E1 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D0</li>
        </ul>
      `
      },
      community: {
        en: "Community Guidelines",
        ka: "\u10E1\u10D0\u10D6\u10DD\u10D2\u10D0\u10D3\u10DD\u10D4\u10D1\u10D8\u10E1 \u10EC\u10D4\u10E1\u10D4\u10D1\u10D8 \u10E3\u10E1\u10D0\u10E4\u10E0\u10D7\u10EE\u10DD \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10E3\u10E0\u10D8 \u10D2\u10D0\u10E0\u10D4\u10DB\u10DD\u10E1\u10D7\u10D5\u10D8\u10E1",
        body: `
        <p>Campusi-\u10D8\u10E1 \u10DB\u10D8\u10D6\u10D0\u10DC\u10D8\u10D0 \u10E3\u10E1\u10D0\u10E4\u10E0\u10D7\u10EE\u10DD \u10D3\u10D0 \u10DE\u10D0\u10E2\u10D8\u10D5\u10D8\u10E1\u10EA\u10D4\u10DB\u10D0\u10D6\u10D4 \u10D3\u10D0\u10E4\u10E3\u10EB\u10DC\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10E3\u10E0\u10D8 \u10E1\u10D8\u10D5\u10E0\u10EA\u10D8\u10E1 \u10E8\u10D4\u10E5\u10DB\u10DC\u10D0.</p>
        <h4>\u10D3\u10D0\u10E8\u10D5\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0:</h4>
        <ul>
          <li>\u2713 \u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D3\u10D8\u10E1\u10D9\u10E3\u10E1\u10D8\u10D4\u10D1\u10D8</li>
          <li>\u2713 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D8\u10DA\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D0</li>
          <li>\u2713 \u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D0</li>
          <li>\u2713 \u10D3\u10D0\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D0 \u10E1\u10EE\u10D5\u10D0 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1</li>
        </ul>
        <h4>\u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8\u10D0:</h4>
        <ul>
          <li>\u2717 \u10E8\u10D4\u10E3\u10E0\u10D0\u10EA\u10EE\u10DB\u10E7\u10DD\u10E4\u10D4\u10DA\u10D8 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8</li>
          <li>\u2717 \u10E1\u10D8\u10EB\u10E3\u10DA\u10D5\u10D8\u10DA\u10D8\u10E1 \u10D4\u10DC\u10D0</li>
          <li>\u2717 \u10DB\u10E3\u10E5\u10D0\u10E0\u10D0</li>
          <li>\u2717 \u10E1\u10DE\u10D0\u10DB\u10D8</li>
          <li>\u2717 \u10E7\u10D0\u10DA\u10D1\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0</li>
          <li>\u2717 \u10E1\u10EE\u10D5\u10D8\u10E1\u10D8 \u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10E5\u10D5\u10D4\u10E7\u10DC\u10D4\u10D1\u10D0</li>
        </ul>
        <p>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8 \u10E3\u10DC\u10D3\u10D0 \u10D4\u10E4\u10E3\u10EB\u10DC\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10DE\u10D8\u10E0\u10D0\u10D3 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D8\u10DA\u10D4\u10D1\u10D0\u10E1 \u10D3\u10D0 \u10EC\u10D0\u10E0\u10DB\u10DD\u10D3\u10D2\u10D4\u10DC\u10D8\u10DA\u10D8 \u10D8\u10E7\u10DD\u10E1 \u10DE\u10D0\u10E2\u10D8\u10D5\u10D8\u10E1\u10EA\u10D4\u10DB\u10D8\u10D7.</p>
      `
      },
      copyright: {
        en: "Copyright / Takedown Policy",
        ka: "\u10E1\u10D0\u10D0\u10D5\u10E2\u10DD\u10E0\u10DD \u10E3\u10E4\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0\u10EA\u10D5\u10D8\u10E1\u10D0 \u10D3\u10D0 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D4\u10D1\u10D8\u10E1 \u10DE\u10E0\u10DD\u10EA\u10D4\u10D3\u10E3\u10E0\u10D0",
        body: `
        <p>\u10D7\u10E3 \u10D7\u10D5\u10DA\u10D8\u10D7, \u10E0\u10DD\u10DB Campusi-\u10D6\u10D4 \u10D0\u10E0\u10E1\u10D4\u10D1\u10E3\u10DA\u10D8 \u10DB\u10D0\u10E1\u10D0\u10DA\u10D0 \u10D0\u10E0\u10E6\u10D5\u10D4\u10D5\u10E1 \u10D7\u10E5\u10D5\u10D4\u10DC\u10E1 \u10E1\u10D0\u10D0\u10D5\u10E2\u10DD\u10E0\u10DD \u10E3\u10E4\u10DA\u10D4\u10D1\u10D4\u10D1\u10E1, \u10D3\u10D0\u10D2\u10D5\u10D8\u10D9\u10D0\u10D5\u10E8\u10D8\u10E0\u10D3\u10D8\u10D7 \u10D3\u10D0 \u10DB\u10DD\u10D2\u10D5\u10D0\u10EC\u10DD\u10D3\u10D4\u10D7:</p>
        <ul>
          <li>\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8</li>
          <li>\u10E1\u10D0\u10D9\u10DD\u10DC\u10E2\u10D0\u10E5\u10E2\u10DD \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0</li>
          <li>\u10DB\u10D0\u10E1\u10D0\u10DA\u10D8\u10E1 \u10D0\u10E6\u10EC\u10D4\u10E0\u10D0</li>
          <li>\u10D1\u10DB\u10E3\u10DA\u10D8</li>
          <li>\u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D8\u10E1 \u10E1\u10D0\u10E4\u10E3\u10EB\u10D5\u10D4\u10DA\u10D8</li>
        </ul>
        <p>Campusi \u10D2\u10D0\u10DC\u10D8\u10EE\u10D8\u10DA\u10D0\u10D5\u10E1 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D0\u10E1 \u10D2\u10DD\u10DC\u10D8\u10D5\u10E0\u10E3\u10DA \u10D5\u10D0\u10D3\u10D0\u10E8\u10D8 \u10D3\u10D0 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D0\u10E8\u10D8 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10D0\u10D5\u10E1 \u10D0\u10DC \u10EC\u10D0\u10E8\u10DA\u10D8\u10E1 \u10DB\u10D0\u10E1\u10D0\u10DA\u10D0\u10E1.</p>
      `
      }
    };
    const getTermsContent = (key) => {
      const tpl = document.getElementById(`termsTemplate-${key}`);
      if (tpl) {
        return {
          en: tpl.dataset.en || "",
          ka: tpl.dataset.ka || "",
          body: tpl.innerHTML
        };
      }
      return TERMS_CONTENT[key];
    };
    expose("openTerms", (key) => {
      let host = document.getElementById("termsModalRoot");
      if (!host) {
        host = document.createElement("div");
        host.id = "termsModalRoot";
        document.body.appendChild(host);
      }
      const active = getTermsContent(key) ? key : "terms";
      const tabIds = ["terms", "privacy", "community", "copyright"];
      const cur = getTermsContent(active);
      host.innerHTML = `
      <div class="terms-backdrop" onclick="if(event.target===this)__campus.closeTerms()">
        <div class="modal-card terms-modal" role="dialog" aria-modal="true" aria-labelledby="termsTitle">
          <div class="terms-head">
            <div>
              <h2 id="termsTitle" class="terms-title">${cur.en}</h2>
              <p class="terms-sub">${cur.ka}</p>
            </div>
            <button type="button" class="btn btn-ghost terms-close" onclick="__campus.closeTerms()" aria-label="${T2("auth.terms.close")}">\u2715</button>
          </div>
          <nav class="terms-tabs" role="tablist">
            ${tabIds.map((id) => {
        const item = getTermsContent(id);
        return `<button type="button" role="tab" aria-selected="${id === active}" class="terms-tab ${id === active ? "active" : ""}" onclick="__campus.openTerms('${id}')">${item.en}</button>`;
      }).join("")}
          </nav>
          <div class="terms-body">${cur.body}</div>
          <div class="terms-foot">
            <button type="button" class="btn btn-primary" onclick="__campus.closeTerms()">${T2("auth.terms.ok")}</button>
          </div>
        </div>
      </div>`;
      document.body.style.overflow = "hidden";
    });
    expose("closeTerms", () => {
      const host = document.getElementById("termsModalRoot");
      if (host) host.innerHTML = "";
      document.body.style.overflow = "";
    });
    const loginTabActive = initialMode === "login";
    const regTabActive = initialMode === "register";
    const rolePickerHtml = "";
    const termsLinksHtml = `
    <div class="terms-links" aria-label="${T2("auth.terms.linksAria")}">
      <button type="button" class="terms-link" onclick="__campus.openTerms('terms')">${T2("auth.terms.link.terms")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('privacy')">${T2("auth.terms.link.privacy")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('community')">${T2("auth.terms.link.community")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('copyright')">${T2("auth.terms.link.copyright")}</button>
    </div>`;
    const template = document.getElementById("loginPageTemplate");
    if (template) {
      return template.innerHTML.replaceAll("{{logintabactiveclass}}", loginTabActive ? "active" : "").replaceAll("{{logintabselected}}", String(loginTabActive)).replaceAll("{{logintabindex}}", String(loginTabActive ? 0 : -1)).replaceAll("{{regtabactiveclass}}", regTabActive ? "active" : "").replaceAll("{{regtabselected}}", String(regTabActive)).replaceAll("{{regtabindex}}", String(regTabActive ? 0 : -1)).replaceAll("{{logincardhidden}}", loginTabActive ? "" : "hidden").replaceAll("{{regcardhidden}}", regTabActive ? "" : "hidden").replaceAll("{{rolepickerhtml}}", rolePickerHtml).replaceAll("{{termslinkshtml}}", termsLinksHtml);
    }
    return `<div class="empty">Login template is missing from index.html.</div>`;
  };

  // static-site/js/app.js
  init_catalog();
  init_misc();

  // static-site/js/views/admin.js
  init_firebase();
  init_auth();
  init_ui();
  init_router();

  // static-site/js/reports.js
  init_firebase();
  init_auth();
  var TYPES = {
    qaComment: { label: "Q&A \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8", collection: "qaComments" },
    subjectRating: { label: "\u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0", collection: "subjectRatings" },
    lecturerRating: { label: "\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8\u10E1 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0", collection: "lecturerRatings" },
    resource: { label: "\u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8", collection: "resources" },
    material: { label: "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8\u10E1 \u10DB\u10D0\u10E1\u10D0\u10DA\u10D0", collection: "materials" },
    forumMessage: { label: "\u10E4\u10DD\u10E0\u10E3\u10DB\u10D8\u10E1 \u10EC\u10D4\u10E0\u10D8\u10DA\u10D8", collection: "subjectChats" }
  };
  var REPORT_TYPES = TYPES;
  var REASONS = [
    "\u10E8\u10D4\u10E3\u10E0\u10D0\u10EA\u10EE\u10DB\u10E7\u10DD\u10E4\u10D4\u10DA\u10D8 \u10D0\u10DC \u10D0\u10D2\u10E0\u10D4\u10E1\u10D8\u10E3\u10DA\u10D8 \u10D4\u10DC\u10D0",
    "\u10E1\u10DE\u10D0\u10DB\u10D8 \u10D0\u10DC \u10E0\u10D4\u10D9\u10DA\u10D0\u10DB\u10D0",
    "\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0\u10E8\u10D8 \u10E8\u10D4\u10DB\u10E7\u10D5\u10D0\u10DC\u10D8 \u10D8\u10DC\u10E4\u10DD\u10E0\u10DB\u10D0\u10EA\u10D8\u10D0",
    "\u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DF\u10E6\u10D0\u10D5\u10DC\u10D4\u10D1\u10D0",
    "\u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D0\u10E0\u10D0\u10D9\u10D4\u10D7\u10D8\u10DA\u10E1\u10D8\u10DC\u10D3\u10D8\u10E1\u10D8\u10D4\u10E0\u10D4\u10D1\u10D0",
    "\u10E1\u10EE\u10D5\u10D0"
  ];
  var REPORT_REASONS = REASONS;
  var submitReport = async ({ type, targetId, contextText, reason, extra }) => {
    const user = getUser();
    if (!user) throw new Error("\u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10E1\u10D0\u10ED\u10D8\u10E0\u10DD\u10D0 \u10D0\u10D5\u10E2\u10DD\u10E0\u10D8\u10D6\u10D0\u10EA\u10D8\u10D0");
    if (!TYPES[type]) throw new Error("\u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8\u10E1 \u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10E2\u10D8\u10DE\u10D8");
    if (!targetId) throw new Error("\u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8\u10E1 \u10DD\u10D1\u10D8\u10D4\u10E5\u10E2\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0");
    if (!firebaseEnabled) throw new Error("\u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8 \u10DB\u10DD\u10D8\u10D7\u10EE\u10DD\u10D5\u10E1 Firebase-\u10D8\u10E1 \u10D9\u10DD\u10DC\u10E4\u10D8\u10D2\u10E3\u10E0\u10D0\u10EA\u10D8\u10D0\u10E1");
    const fb = await loadFirebase();
    await fb.addDoc(fb.collection(fb.db, "reports"), {
      type,
      targetId: String(targetId),
      targetCollection: TYPES[type].collection,
      contextText: String(contextText || "").slice(0, 600),
      reason: String(reason || "\u10E1\u10EE\u10D5\u10D0").slice(0, 120),
      extra: extra || null,
      reporterId: user.uid,
      reporterEmail: user.email || null,
      status: "open",
      createdAt: fb.serverTimestamp()
    });
  };
  var loadAllReports = async (limit = 500) => {
    if (!firebaseEnabled) return [];
    const fb = await loadFirebase();
    const snap = await fb.getDocs(fb.collection(fb.db, "reports"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1e3 || +a.createdAt || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1e3 || +b.createdAt || 0;
      return tb - ta;
    }).slice(0, limit);
  };
  var resolveReport = async (id) => {
    if (!isAdminUser()) throw new Error("\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1");
    const fb = await loadFirebase();
    await fb.updateDoc(fb.doc(fb.db, "reports", id), {
      status: "resolved",
      resolvedAt: fb.serverTimestamp()
    });
  };
  var deleteReport = async (id) => {
    if (!isAdminUser()) throw new Error("\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1");
    const fb = await loadFirebase();
    await fb.deleteDoc(fb.doc(fb.db, "reports", id));
  };
  var deleteReportedContent = async (report) => {
    if (!isAdminUser()) throw new Error("\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1");
    const fb = await loadFirebase();
    if (report.type === "forumMessage") {
      const [chatId, msgId] = String(report.targetId).split("::");
      if (!chatId || !msgId) throw new Error("\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10EC\u10D4\u10E0\u10D8\u10DA\u10D8\u10E1 ID");
      await fb.deleteDoc(fb.doc(fb.db, "subjectChats", chatId, "messages", msgId));
    } else {
      const coll = report.targetCollection || TYPES[report.type]?.collection;
      if (!coll) throw new Error("\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10DF\u10D0\u10DC\u10E0\u10D8");
      await fb.deleteDoc(fb.doc(fb.db, coll, report.targetId));
    }
  };

  // static-site/js/views/admin.js
  var TABS = [
    { id: "dashboard", label: "\u10DB\u10D8\u10DB\u10DD\u10EE\u10D8\u10DA\u10D5\u10D0", group: "general", audience: "all" },
    { id: "users", label: "\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8", group: "general", audience: "all" },
    { id: "reports", label: "\u{1F4E2} \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8", group: "general", audience: "all" },
    { id: "universities", label: "\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "faculties", label: "\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "lecturers", label: "\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "lectRatings", label: "\u10DA\u10D4\u10E5\u10E2. \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "subjRatings", label: "\u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "news", label: "\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4\u10D4\u10D1\u10D8", group: "shared", audience: "student" },
    { id: "calendars", label: "\u10D0\u10D9\u10D0\u10D3\u10D4\u10DB\u10D8\u10E3\u10E0\u10D8 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8", group: "student", audience: "student" },
    { id: "subjects", label: "\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8", group: "student", audience: "student" },
    { id: "resources", label: "\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D4\u10D1\u10D8", group: "student", audience: "student" },
    { id: "materials", label: "\u10DB\u10D0\u10E1\u10D0\u10DA\u10D4\u10D1\u10D8 (user)", group: "student", audience: "student" },
    { id: "qa", label: "Q&A \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8", group: "student", audience: "student" },
    { id: "faq", label: "\u2753 FAQ", group: "general", audience: "all" },
    { id: "logs", label: "\u10DA\u10DD\u10D2\u10D4\u10D1\u10D8", group: "general", audience: "all" }
  ];
  var MOD_TABS = /* @__PURE__ */ new Set([
    "dashboard",
    "users",
    "reports",
    "lecturers",
    "lectRatings",
    "subjRatings",
    "news",
    "calendars",
    "subjects",
    "resources",
    "materials",
    "qa",
    "logs"
  ]);
  var AUDIENCE_META = {
    all: { icon: "\u2699\uFE0F", label: "\u10E1\u10D8\u10E1\u10E2\u10D4\u10DB\u10E3\u10E0\u10D8", color: "#64748b" },
    both: { icon: "\u{1F465}", label: "\u10E7\u10D5\u10D4\u10DA\u10D0 \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8", color: "#7c3aed" },
    student: { icon: "\u{1F4DA}", label: "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8", color: "#2563eb" }
  };
  var GROUP_LABEL = {
    general: "\u10D6\u10DD\u10D2\u10D0\u10D3\u10D8",
    shared: "\u10E1\u10D0\u10D4\u10E0\u10D7\u10DD \u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8",
    student: "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8\u10E1 \u10D2\u10D5\u10D4\u10E0\u10D3\u10D8"
  };
  var qs = () => new URLSearchParams(location.hash.split("?")[1] || "");
  var getTab2 = () => qs().get("tab") || "dashboard";
  var getEdit = () => qs().get("edit") || "";
  var setTab = (t, edit) => {
    location.hash = `#/admin?tab=${t}${edit ? `&edit=${edit}` : ""}`;
  };
  var fmtTime = (ts) => {
    if (!ts) return "\u2014";
    let d;
    if (ts?.toDate) d = ts.toDate();
    else if (ts?.seconds) d = new Date(ts.seconds * 1e3);
    else d = new Date(ts);
    if (isNaN(d.getTime())) return "\u2014";
    return d.toLocaleString("ka-GE", { dateStyle: "medium", timeStyle: "short" });
  };
  var j = (v) => encodeURIComponent(String(v ?? ""));
  var unj = (v) => {
    try {
      return decodeURIComponent(String(v ?? ""));
    } catch {
      return String(v ?? "");
    }
  };
  var loadCollection = async (name, opts = {}) => {
    if (!firebaseEnabled) return [];
    const fb = await loadFirebase();
    let q2 = fb.collection(fb.db, name);
    if (opts.orderBy) q2 = fb.query(q2, fb.orderBy(opts.orderBy, opts.dir || "desc"), fb.limit(opts.limit || 200));
    const snap = await fb.getDocs(q2);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };
  var num = (v) => v === "" || v == null ? null : Number(v);
  var trim = (v) => v == null ? "" : String(v).trim();
  var audienceChip = (aud) => {
    const m = AUDIENCE_META[aud];
    return `<div class="audience-chip" style="display:inline-flex;align-items:center;gap:8px;background:${m.color}15;color:${m.color};border:1px solid ${m.color}40;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:14px">
    <span style="font-size:15px">${m.icon}</span>
    <span>\u10D4\u10E1 \u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8 \u10E9\u10D0\u10DC\u10E1: <b>${m.label}</b></span>
  </div>`;
  };
  var adminView2 = async () => {
    const user = getUser();
    const profile = getProfile();
    if (!firebaseEnabled) return `<div class="empty"><div class="ico">\u26A0\uFE0F</div>Admin Panel \u10DB\u10DD\u10D8\u10D7\u10EE\u10DD\u10D5\u10E1 Firebase-\u10D8\u10E1 \u10D9\u10DD\u10DC\u10E4\u10D8\u10D2\u10E3\u10E0\u10D0\u10EA\u10D8\u10D0\u10E1.</div>`;
    if (!user) return `<div class="empty"><div class="ico">\u{1F512}</div>\u10D2\u10D7\u10EE\u10DD\u10D5 \u10E8\u10D4\u10EE\u10D5\u10D8\u10D3\u10D4.<br/><a href="#/login" class="btn btn-primary" style="margin-top:14px">\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</a></div>`;
    const isAdmin2 = isAdminUser();
    const isMod = isModeratorUser();
    if (!isMod) return `<div class="empty"><div class="ico">\u{1F6AB}</div>\u10EC\u10D5\u10D3\u10DD\u10DB\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC/\u10DB\u10DD\u10D3\u10D4\u10E0\u10D0\u10E2\u10DD\u10E0\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1. \u10E8\u10D4\u10DC\u10D8 \u10E0\u10DD\u10DA\u10D8: ${escapeHtml(profile?.role || "\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8")}</div>`;
    const canSeeTab = (id) => isAdmin2 || MOD_TABS.has(id);
    let tab = getTab2();
    if (!canSeeTab(tab)) tab = "dashboard";
    const editId = getEdit();
    const fb = getFb();
    expose("adminTab", (t) => setTab(t));
    expose("adminEdit", (t, id) => setTab(t, id));
    expose("adminCancelEdit", (t) => setTab(t));
    expose("adminToggleBlock", async (uid, blocked) => {
      await fb.updateDoc(fb.doc(fb.db, "users", uid), {
        blocked: !blocked,
        blockedAt: !blocked ? fb.serverTimestamp() : null,
        blockedBy: !blocked ? user.uid || null : null
      });
      await logEvent(blocked ? "user_unblocked" : "user_blocked", { uid });
      showToast(blocked ? "\u10D2\u10D0\u10DC\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8\u10D0" : "\u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8\u10D0");
      refresh();
    });
    expose("adminEditUserName", async (uid, curFirst, curLast) => {
      const f = window.prompt("\u10D0\u10EE\u10D0\u10DA\u10D8 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8:", decodeURIComponent(curFirst || ""));
      if (f == null) return;
      const l = window.prompt("\u10D0\u10EE\u10D0\u10DA\u10D8 \u10D2\u10D5\u10D0\u10E0\u10D8:", decodeURIComponent(curLast || ""));
      if (l == null) return;
      const firstName = f.trim();
      const lastName = l.trim();
      if (!firstName || !lastName) return showToast("\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8 \u10D5\u10D4\u10DA\u10D8 \u10D0\u10E0 \u10DB\u10D8\u10D8\u10E6\u10D4\u10D1\u10D0");
      try {
        await fb.updateDoc(fb.doc(fb.db, "users", uid), { firstName, lastName });
        await logEvent("user_renamed", { uid, firstName, lastName });
        showToast("\u10E8\u10D4\u10DC\u10D0\u10EE\u10E3\u10DA\u10D8\u10D0");
        refresh();
      } catch (err) {
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err?.message || err));
      }
    });
    expose("adminUserSearch", (val) => {
      const q2 = (val || "").toString().trim().toLowerCase();
      document.querySelectorAll("tr[data-user-row]").forEach((tr) => {
        const hay = (tr.getAttribute("data-search") || "").toLowerCase();
        tr.style.display = !q2 || hay.includes(q2) ? "" : "none";
      });
    });
    expose("adminToggleAdmin", async (uid, currentRole) => {
      if (!isAdmin2) return showToast("\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC\u10E1 \u10E8\u10D4\u10E3\u10EB\u10DA\u10D8\u10D0 \u10E0\u10DD\u10DA\u10D8\u10E1 \u10E8\u10D4\u10EA\u10D5\u10DA\u10D0");
      if (uid === user.uid) return showToast("\u10E1\u10D0\u10D9\u10E3\u10D7\u10D0\u10E0\u10D8 \u10E0\u10DD\u10DA\u10D8\u10E1 \u10E8\u10D4\u10EA\u10D5\u10DA\u10D0 \u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8\u10D0");
      const newRole = currentRole === "admin" ? "student" : "admin";
      await fb.updateDoc(fb.doc(fb.db, "users", uid), { role: newRole });
      await logEvent("role_changed", { uid, newRole });
      showToast(`\u10E0\u10DD\u10DA\u10D8: ${newRole}`);
      refresh();
    });
    expose("adminToggleMod", async (uid, currentRole) => {
      if (!isAdmin2) return showToast("\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10D0\u10D3\u10DB\u10D8\u10DC\u10E1 \u10E8\u10D4\u10E3\u10EB\u10DA\u10D8\u10D0 \u10E0\u10DD\u10DA\u10D8\u10E1 \u10E8\u10D4\u10EA\u10D5\u10DA\u10D0");
      if (uid === user.uid) return showToast("\u10E1\u10D0\u10D9\u10E3\u10D7\u10D0\u10E0\u10D8 \u10E0\u10DD\u10DA\u10D8\u10E1 \u10E8\u10D4\u10EA\u10D5\u10DA\u10D0 \u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8\u10D0");
      if (currentRole === "admin") return showToast("\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8 \u10EF\u10D4\u10E0 \u10DB\u10DD\u10D0\u10E8\u10DD\u10E0\u10D4");
      const newRole = currentRole === "moderator" ? "student" : "moderator";
      await fb.updateDoc(fb.doc(fb.db, "users", uid), { role: newRole });
      await logEvent("role_changed", { uid, newRole });
      showToast(`\u10E0\u10DD\u10DA\u10D8: ${newRole}`);
      refresh();
    });
    expose("adminExportUsers", async () => {
      try {
        showToast("\u10D4\u10E5\u10E1\u10DE\u10DD\u10E0\u10E2\u10D8 \u10D8\u10EC\u10E7\u10D4\u10D1\u10D0\u2026");
        const users = await loadCollection("users");
        const cols = ["uid", "email", "firstName", "lastName", "role", "blocked", "facultyId", "universityId", "personalId", "phone", "createdAt", "lastLoginAt"];
        const esc = (v) => {
          if (v == null) return "";
          if (v?.toDate) v = v.toDate().toISOString();
          else if (v?.seconds) v = new Date(v.seconds * 1e3).toISOString();
          const s = String(v).replace(/"/g, '""');
          return /[",\n\r;]/.test(s) ? `"${s}"` : s;
        };
        const rows = [cols.join(",")];
        users.forEach((u) => rows.push(cols.map((c) => esc(u[c])).join(",")));
        const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        a.href = url;
        a.download = `campus-users-${stamp}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e3);
        await logEvent("users_exported", { n: users.length });
        showToast(`\u10D2\u10D0\u10D3\u10DB\u10DD\u10EC\u10D4\u10E0\u10D0: ${users.length} \u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8`);
      } catch (err) {
        console.error(err);
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err?.message || err));
      }
    });
    const cascadeDeleteUser = async (uid) => {
      try {
        const mats = await fb.getDocs(fb.query(fb.collection(fb.db, "materials"), fb.where("uploadedBy", "==", uid)));
        await Promise.all(mats.docs.map((d) => fb.deleteDoc(d.ref)));
      } catch (e) {
        console.warn("materials cascade", e);
      }
      try {
        const lr = await fb.getDocs(fb.query(fb.collection(fb.db, "lecturerRatings"), fb.where("studentId", "==", uid)));
        await Promise.all(lr.docs.map((d) => fb.deleteDoc(d.ref)));
      } catch (e) {
        console.warn("lecturerRatings cascade", e);
      }
      try {
        const sr = await fb.getDocs(fb.query(fb.collection(fb.db, "subjectRatings"), fb.where("userId", "==", uid)));
        await Promise.all(sr.docs.map((d) => fb.deleteDoc(d.ref)));
      } catch (e) {
        console.warn("subjectRatings cascade", e);
      }
      try {
        const chats = await fb.getDocs(fb.collection(fb.db, "subjectChats"));
        for (const c of chats.docs) {
          try {
            const col = fb.collection(fb.db, "subjectChats", c.id, "messages");
            const bySender = await fb.getDocs(fb.query(col, fb.where("senderId", "==", uid)));
            const byUid = await fb.getDocs(fb.query(col, fb.where("uid", "==", uid)));
            const refs = /* @__PURE__ */ new Map();
            bySender.docs.forEach((d) => refs.set(d.id, d.ref));
            byUid.docs.forEach((d) => refs.set(d.id, d.ref));
            await Promise.all([...refs.values()].map((ref) => fb.deleteDoc(ref)));
          } catch (e) {
            console.warn("chat msgs", c.id, e);
          }
          const data = c.data();
          if (data?.participants?.[uid]) {
            const np = { ...data.participants };
            delete np[uid];
            try {
              await fb.setDoc(c.ref, { participants: np }, { merge: true });
            } catch (e) {
              console.warn("participants", e);
            }
          }
        }
      } catch (e) {
        console.warn("chats cascade", e);
      }
    };
    expose("adminDeleteUser", async (uid, email) => {
      if (uid === user.uid) return showToast("\u10E1\u10D0\u10D9\u10E3\u10D7\u10D0\u10E0\u10D8 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8\u10E1 \u10EC\u10D0\u10E8\u10DA\u10D0 \u10D0\u10D9\u10E0\u10EB\u10D0\u10DA\u10E3\u10DA\u10D8\u10D0");
      if (!confirm(`\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 "${email || uid}" \u10D3\u10D0 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10DB\u10D8\u10E1\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D8?
(login \u10E3\u10DC\u10D3\u10D0 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10EA\u10D0\u10DA\u10D9\u10D4 Firebase Console-\u10D3\u10D0\u10DC)`)) return;
      try {
        showToast("\u10D8\u10E8\u10DA\u10D4\u10D1\u10D0 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8\u2026");
        await cascadeDeleteUser(uid);
        await fb.deleteDoc(fb.doc(fb.db, "users", uid));
        await logEvent("user_deleted", { uid, email });
        showToast("\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8 \u10D3\u10D0 \u10DB\u10D8\u10E1\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D4\u10D1\u10D8 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
        refresh();
      } catch (err) {
        console.error(err);
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err?.message || err));
      }
    });
    const saveRecord = async (coll, id, data, eventType) => {
      if (id) {
        await fb.setDoc(fb.doc(fb.db, coll, id), { ...data, updatedAt: fb.serverTimestamp() }, { merge: true });
        await logEvent(eventType + "_updated", { id });
        showToast("\u10E8\u10D4\u10DC\u10D0\u10EE\u10E3\u10DA\u10D8\u10D0");
      } else {
        await fb.addDoc(fb.collection(fb.db, coll), { ...data, createdAt: fb.serverTimestamp() });
        await logEvent(eventType + "_created", {});
        showToast("\u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0");
      }
    };
    const deleteRecord = async (coll, id, eventType, name) => {
      const label = unj(name);
      if (!confirm(`\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1${label ? ` "${label}"` : ""}?`)) return;
      try {
        await fb.deleteDoc(fb.doc(fb.db, coll, id));
        try {
          await logEvent(eventType + "_deleted", { id });
        } catch (e) {
          console.warn("delete log failed", e);
        }
        showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
        refresh();
      } catch (err) {
        console.error("delete failed", coll, id, err);
        showToast("\u10D5\u10D4\u10E0 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0: " + (err?.message || err));
      }
    };
    expose("adminSaveUni", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        name: trim(f.get("name")),
        shortName: trim(f.get("shortName")),
        fullName: trim(f.get("fullName")) || trim(f.get("name")),
        city: trim(f.get("city")),
        founded: num(f.get("founded")),
        rating: num(f.get("rating")) || 0,
        logoUrl: trim(f.get("logoUrl")) || null,
        website: trim(f.get("website")) || null
      };
      await saveRecord("universities", f.get("id") || "", data, "university");
      setTab("universities");
    });
    expose("adminDelUni", (id, name) => deleteRecord("universities", id, "university", name));
    expose("adminSaveFac", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        uniId: f.get("uniId"),
        name: trim(f.get("name")),
        dean: trim(f.get("dean")) || "\u2014",
        description: trim(f.get("description")) || null
      };
      await saveRecord("faculties", f.get("id") || "", data, "faculty");
      setTab("faculties");
    });
    expose("adminDelFac", (id, name) => deleteRecord("faculties", id, "faculty", name));
    expose("adminSaveLect", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        name: trim(f.get("name")),
        facultyId: f.get("facultyId") || null,
        uniId: f.get("uniId") || null,
        subject: trim(f.get("subject")) || "",
        title: trim(f.get("title")) || "",
        bio: trim(f.get("bio")) || "",
        photoUrl: trim(f.get("photoUrl")) || null
      };
      await saveRecord("lecturers", f.get("id") || "", data, "lecturer");
      setTab("lecturers");
    });
    expose("adminDelLect", (id, name) => deleteRecord("lecturers", id, "lecturer", name));
    expose("adminDelRating", (id) => deleteRecord("lecturerRatings", id, "rating"));
    expose("adminDelSubjRating", (id) => deleteRecord("subjectRatings", id, "subjectRating"));
    expose("adminDelQA", (id) => deleteRecord("qaComments", id, "qaComment"));
    expose("adminReportResolve", async (id) => {
      try {
        await resolveReport(id);
        showToast("\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0 \u10D3\u10D0\u10EE\u10E3\u10E0\u10E3\u10DA\u10D8\u10D0");
        refresh();
      } catch (err) {
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err.message || err));
      }
    });
    expose("adminReportDelete", async (id) => {
      if (!confirm("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D8?")) return;
      try {
        await deleteReport(id);
        showToast("\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0 \u10EC\u10D0\u10E8\u10DA\u10D8\u10DA\u10D8\u10D0");
        refresh();
      } catch (err) {
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err.message || err));
      }
    });
    expose("adminReportDeleteContent", async (json) => {
      let report;
      try {
        report = JSON.parse(decodeURIComponent(json));
      } catch {
        return;
      }
      if (!confirm(`\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8 (${REPORT_TYPES[report.type]?.label || report.type})? \u10D4\u10E1 \u10E5\u10DB\u10D4\u10D3\u10D4\u10D1\u10D0 \u10E8\u10D4\u10E3\u10E5\u10EA\u10D4\u10D5\u10D0\u10D3\u10D8\u10D0.`)) return;
      try {
        await deleteReportedContent(report);
        await resolveReport(report.id);
        await logEvent("report_content_deleted", { reportId: report.id, type: report.type, targetId: report.targetId });
        showToast("\u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0 \u10D3\u10D0 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0 \u10D3\u10D0\u10D8\u10EE\u10E3\u10E0\u10D0");
        refresh();
      } catch (err) {
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err.message || err));
      }
    });
    expose("adminDelMaterial", (id, title) => deleteRecord("materials", id, "material", title));
    expose("adminSaveSubject", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        facultyId: f.get("facultyId"),
        name: trim(f.get("name")),
        code: trim(f.get("code")),
        lecturer: trim(f.get("lecturer")) || "\u2014",
        lecturerId: trim(f.get("lecturerId")) || trim(f.get("lecturer")).toLowerCase().replace(/\s+/g, "-") || "x",
        credits: num(f.get("credits")) || 0,
        semester: trim(f.get("semester")) || "\u2014",
        syllabus: trim(f.get("syllabus")) || null
      };
      await saveRecord("subjects", f.get("id") || "", data, "subject");
      setTab("subjects");
    });
    expose("adminDelSubject", (id, name) => deleteRecord("subjects", id, "subject", name));
    expose("adminSaveResource", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        subjectId: f.get("subjectId"),
        title: trim(f.get("title")),
        type: f.get("type") || "PDF",
        url: trim(f.get("url")),
        upvotes: num(f.get("upvotes")) || 0
      };
      await saveRecord("resources", f.get("id") || "", data, "resource");
      setTab("resources");
    });
    expose("adminDelResource", (id, name) => deleteRecord("resources", id, "resource", name));
    expose("adminSaveNews", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        uniId: f.get("uniId") || null,
        facultyId: f.get("facultyId") || null,
        title: trim(f.get("title")),
        summary: trim(f.get("summary")),
        url: trim(f.get("url")) || null,
        category: f.get("category") || "announcement",
        audience: f.get("audience") || "both",
        pinned: f.get("pinned") === "on",
        publishedAt: f.get("publishedAt") || (/* @__PURE__ */ new Date()).toISOString(),
        source: "manual"
      };
      await saveRecord("news", f.get("id") || "", data, "news");
      setTab("news");
    });
    expose("adminDelNews", (id, title) => deleteRecord("news", id, "news", title));
    expose("adminSaveCalendar", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const uniId = f.get("uniId");
      const semesterId = trim(f.get("semesterId"));
      if (!uniId || !semesterId) return showToast("\u10D0\u10D0\u10E0\u10E9\u10D8\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u10D3\u10D0 \u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 ID");
      const newSem = {
        id: semesterId,
        name: trim(f.get("name")),
        registration: { start: f.get("regStart"), end: f.get("regEnd") },
        semester: { start: f.get("semStart"), end: f.get("semEnd") },
        addDrop: { start: f.get("addStart"), end: f.get("addEnd") },
        midterms: { start: f.get("midStart"), end: f.get("midEnd") },
        finals: { start: f.get("finStart"), end: f.get("finEnd") }
      };
      const ref = fb.doc(fb.db, "calendars", uniId);
      const snap = await fb.getDoc(ref);
      const cur = snap.exists() ? snap.data() : { semesters: [], holidays: [] };
      const semesters = (cur.semesters || []).filter((s) => s.id !== semesterId);
      semesters.push(newSem);
      await fb.setDoc(ref, { ...cur, semesters }, { merge: true });
      await logEvent("calendar_saved", { uniId, semesterId });
      showToast("\u10E8\u10D4\u10DC\u10D0\u10EE\u10E3\u10DA\u10D8\u10D0");
      e.target.reset();
      refresh();
    });
    expose("adminDelSemester", async (uniId, semId) => {
      if (!confirm(`\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8 "${semId}"?`)) return;
      const ref = fb.doc(fb.db, "calendars", uniId);
      const snap = await fb.getDoc(ref);
      if (!snap.exists()) return;
      const cur = snap.data();
      const semesters = (cur.semesters || []).filter((s) => s.id !== semId);
      await fb.setDoc(ref, { ...cur, semesters }, { merge: true });
      await logEvent("semester_deleted", { uniId, semId });
      refresh();
    });
    const F = (label, input2) => `<div class="field"><label>${label}</label>${input2}</div>`;
    let body = skList(4);
    const currentTab = TABS.find((t) => t.id === tab) || TABS[0];
    try {
      if (tab === "dashboard") {
        const [users, unis, facs, news2, logs] = await Promise.all([
          loadCollection("users"),
          loadCollection("universities"),
          loadCollection("faculties"),
          loadCollection("news"),
          loadCollection("logs", { orderBy: "createdAt", limit: 10 })
        ]);
        const admins = users.filter((u) => u.role === "admin").length;
        const mods = users.filter((u) => u.role === "moderator").length;
        const blocked = users.filter((u) => u.blocked).length;
        body = `
        ${audienceChip("all")}
        <div class="admin-stat-grid">
          <div class="admin-stat"><div class="admin-stat-label">\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8</div><div class="admin-stat-value">${users.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10D0\u10D3\u10DB\u10D8\u10DC\u10D4\u10D1\u10D8</div><div class="admin-stat-value">${admins}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10DB\u10DD\u10D3\u10D4\u10E0\u10D0\u10E2\u10DD\u10E0\u10D8</div><div class="admin-stat-value">${mods}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8</div><div class="admin-stat-value">${blocked}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</div><div class="admin-stat-value">${unis.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</div><div class="admin-stat-value">${facs.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4</div><div class="admin-stat-value">${news2.length}</div></div>
        </div>
        <div class="card" style="margin-top:14px">
          <h3 style="margin-top:0">\u10D1\u10DD\u10DA\u10DD \u10D0\u10E5\u10E2\u10D8\u10D5\u10DD\u10D1\u10D0</h3>
          ${logs.length ? logs.map((l) => `
            <div class="log-row">
              <span class="log-time">${fmtTime(l.createdAt)}</span>
              <span class="log-type">${escapeHtml(l.type)}</span>
              <span>${escapeHtml(l.actorEmail || "\u2014")}</span>
            </div>`).join("") : `<p class="muted">\u10DA\u10DD\u10D2\u10D4\u10D1\u10D8 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}
        </div>`;
      } else if (tab === "users") {
        const users = await loadCollection("users");
        body = `${audienceChip("all")}
        <div class="card" style="margin-bottom:14px;padding:12px">
          <div class="row between" style="gap:10px;flex-wrap:wrap;align-items:center">
            <input type="search" placeholder="\u{1F50E} \u10EB\u10D8\u10D4\u10D1\u10D0 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8\u10D7 \u10D0\u10DC \u10D2\u10D5\u10D0\u10E0\u10D8\u10D7\u2026"
              oninput="__campus.adminUserSearch(this.value)"
              style="flex:1;min-width:220px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card,#fff);color:var(--text)" />
            <button class="btn btn-primary" onclick="__campus.adminExportUsers()" type="button">\u2B07 CSV \u10D4\u10E5\u10E1\u10DE\u10DD\u10E0\u10E2\u10D8</button>
          </div>
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8</th><th>\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0</th><th>\u10E0\u10DD\u10DA\u10D8</th><th>\u10E1\u10E2\u10D0\u10E2\u10E3\u10E1\u10D8</th><th>\u10D1\u10DD\u10DA\u10DD \u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</th><th></th></tr></thead>
          <tbody>
            ${users.map((u) => {
          const first = u.firstName || "";
          const last = u.lastName || "";
          const fullName = [first, last].filter(Boolean).join(" ") || "\u2014";
          const name = escapeHtml(fullName);
          const isMe = u.uid === user.uid;
          const searchHay = `${fullName} ${u.email || ""}`;
          return `<tr data-user-row data-search="${escapeHtml(searchHay)}">
                <td>
                  ${name}
                  <button class="btn" title="\u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0" style="padding:2px 6px;font-size:11px;margin-left:6px" onclick="__campus.adminEditUserName('${u.uid}','${encodeURIComponent(first)}','${encodeURIComponent(last)}')">\u270F\uFE0F</button>
                </td>
                <td style="font-size:13px">${escapeHtml(u.email || "\u2014")}</td>
                 <td><span class="role-chip ${u.role === "admin" ? "admin" : u.role === "moderator" ? "mod" : "student"}">${escapeHtml(u.role || "student")}</span></td>
                <td>${u.blocked ? `<span class="role-chip blocked">\u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8</span>` : `<span class="role-chip verified">\u10D0\u10E5\u10E2\u10D8\u10E3\u10E0\u10D8</span>`}</td>
                <td style="font-size:12px;color:var(--muted)">${fmtTime(u.lastLoginAt)}</td>
                <td>
                  <button class="btn" style="padding:4px 10px;font-size:12px" ${isMe ? "disabled" : ""} onclick="__campus.adminToggleBlock('${u.uid}', ${!!u.blocked})">${u.blocked ? "\u10D2\u10D0\u10DC\u10D1\u10DA\u10DD\u10D9\u10D5\u10D0" : "\u10D1\u10DA\u10DD\u10D9\u10D8"}</button>
                   ${isAdmin2 ? `
                   <button class="btn" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe ? "disabled" : ""} onclick="__campus.adminToggleAdmin('${u.uid}', '${u.role || ""}')">${u.role === "admin" ? "\u10D0\u10D3\u10DB\u10D8\u10DC\u10D8\u10E1 \u10DB\u10DD\u10E8\u10DD\u10E0\u10D4\u10D1\u10D0" : "\u10D0\u10D3\u10DB\u10D8\u10DC\u10D0\u10D3"}</button>
                   <button class="btn" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe || u.role === "admin" ? "disabled" : ""} onclick="__campus.adminToggleMod('${u.uid}', '${u.role || ""}')">${u.role === "moderator" ? "\u10DB\u10DD\u10D3\u10D4\u10E0. \u10DB\u10DD\u10E8\u10DD\u10E0\u10D4\u10D1\u10D0" : "\u10DB\u10DD\u10D3\u10D4\u10E0\u10D0\u10E2\u10DD\u10E0\u10D0\u10D3"}</button>
                   <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe ? "disabled" : ""} onclick="__campus.adminDeleteUser('${u.uid}', '${escapeHtml(u.email || "").replace(/'/g, "\\'")}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
                   ` : ""}
                </td>
              </tr>`;
        }).join("")}
          </tbody>
        </table>`;
      } else if (tab === "universities") {
        const unis = await loadCollection("universities");
        const edit = editId ? unis.find((u) => u.id === editId) : null;
        body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0: ${escapeHtml(edit.name)}` : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8"}</h3>
          <form onsubmit="__campus.adminSaveUni(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0 *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="\u10D7\u10D1\u10D8\u10DA\u10D8\u10E1\u10D8\u10E1 \u10E1\u10D0\u10EE\u10D4\u10DA\u10DB\u10EC\u10D8\u10E4\u10DD \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8" />`)}
              ${F("\u10D0\u10D1\u10E0\u10D4\u10D5\u10D8\u10D0\u10E2\u10E3\u10E0\u10D0 *", `<input name="shortName" required value="${escapeHtml(edit?.shortName || "")}" placeholder="TSU" />`)}
              ${F("\u10E1\u10E0\u10E3\u10DA\u10D8 \u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0", `<input name="fullName" value="${escapeHtml(edit?.fullName || "")}" placeholder="\u10D8. \u10EF\u10D0\u10D5\u10D0\u10EE\u10D8\u10E8\u10D5\u10D8\u10DA\u10D8\u10E1 \u10E1\u10D0\u10EE. \u10D7\u10D1. \u10E1\u10D0\u10EE\u10D4\u10DA\u10DB\u10EC\u10D8\u10E4\u10DD \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8" />`)}
              ${F("\u10E5\u10D0\u10DA\u10D0\u10E5\u10D8 *", `<input name="city" required value="${escapeHtml(edit?.city || "")}" placeholder="\u10D7\u10D1\u10D8\u10DA\u10D8\u10E1\u10D8" />`)}
              ${F("\u10D3\u10D0\u10D0\u10E0\u10E1\u10D4\u10D1\u10D8\u10E1 \u10EC\u10D4\u10DA\u10D8", `<input name="founded" type="number" min="1700" max="2100" value="${edit?.founded || ""}" placeholder="1918" />`)}
              
              ${F("\u10E0\u10D4\u10D8\u10E2\u10D8\u10DC\u10D2\u10D8 (0\u20135)", `<input name="rating" type="number" step="0.1" min="0" max="5" value="${edit?.rating || ""}" placeholder="4.5" />`)}
              ${F("\u10D5\u10D4\u10D1\u10D2\u10D5\u10D4\u10E0\u10D3\u10D8", `<input name="website" type="url" value="${escapeHtml(edit?.website || "")}" placeholder="https://tsu.ge" />`)}
              ${F("\u10DA\u10DD\u10D2\u10DD URL", `<input name="logoUrl" type="url" value="${escapeHtml(edit?.logoUrl || "")}" placeholder="https://..." />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('universities')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0</th><th>\u10D0\u10D1\u10E0\u10D4\u10D5.</th><th>\u10E5\u10D0\u10DA\u10D0\u10E5\u10D8</th><th>\u10E0\u10D4\u10D8\u10E2.</th><th></th></tr></thead>
          <tbody>
            ${unis.length ? unis.map((u) => `<tr>
              <td>${escapeHtml(u.name)}</td>
              <td>${escapeHtml(u.shortName || "\u2014")}</td>
              <td>${escapeHtml(u.city || "\u2014")}</td>
              <td>\u2605 ${u.rating || "\u2014"}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('universities','${u.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelUni('${u.id}','${j(u.name)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0 \u2014 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10DE\u10D8\u10E0\u10D5\u10D4\u10DA\u10D8 \u261D\uFE0F</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "faculties") {
        const [unis, facs] = await Promise.all([loadCollection("universities"), loadCollection("faculties")]);
        const uniMap2 = Object.fromEntries(unis.map((u) => [u.id, u.name]));
        const edit = editId ? facs.find((f) => f.id === editId) : null;
        body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0: ${escapeHtml(edit.name)}` : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8"}</h3>
          ${unis.length ? `<form onsubmit="__campus.adminSaveFac(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 *", `<select name="uniId" required>${unis.map((u) => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("\u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0 *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="\u10D6\u10E3\u10E1\u10E2 \u10D3\u10D0 \u10E1\u10D0\u10D1\u10E3\u10DC\u10D4\u10D1\u10D8\u10E1\u10DB\u10D4\u10E2\u10E7\u10D5\u10D4\u10DA\u10DD" />`)}
              ${F("\u10D3\u10D4\u10D9\u10D0\u10DC\u10D8", `<input name="dean" value="${escapeHtml(edit?.dean || "")}" placeholder="\u10D2\u10D5\u10D0\u10E0\u10D8 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" />`)}
              ${F("\u10D0\u10E6\u10EC\u10D4\u10E0\u10D0", `<input name="description" value="${escapeHtml(edit?.description || "")}" />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('faculties')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0</th><th>\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</th><th>\u10D3\u10D4\u10D9\u10D0\u10DC\u10D8</th><th></th></tr></thead>
          <tbody>
            ${facs.length ? facs.map((f) => `<tr>
              <td>${escapeHtml(f.name)}</td>
              <td>${escapeHtml(uniMap2[f.uniId] || f.uniId || "\u2014")}</td>
              <td>${escapeHtml(f.dean || "\u2014")}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('faculties','${f.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelFac('${f.id}','${j(f.name)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="4" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "subjects") {
        const [facs, unis, subs] = await Promise.all([loadCollection("faculties"), loadCollection("universities"), loadCollection("subjects")]);
        const uniMap2 = Object.fromEntries(unis.map((u) => [u.id, u.shortName || u.name]));
        const facMap = Object.fromEntries(facs.map((f) => [f.id, `${f.name} (${uniMap2[f.uniId] || "?"})`]));
        const edit = editId ? subs.find((s) => s.id === editId) : null;
        body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0: ${escapeHtml(edit.name)}` : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8"}</h3>
          ${facs.length ? `<form onsubmit="__campus.adminSaveSubject(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8 *", `<select name="facultyId" required>${facs.map((f) => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}</option>`).join("")}</select>`)}
              ${F("\u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="\u10D0\u10DA\u10D2\u10D4\u10D1\u10E0\u10D0 I" />`)}
              ${F("\u10D9\u10DD\u10D3\u10D8", `<input name="code" value="${escapeHtml(edit?.code || "")}" placeholder="MATH101" />`)}
              ${F("\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8", `<input name="lecturer" value="${escapeHtml(edit?.lecturer || "")}" placeholder="\u10D2\u10D5\u10D0\u10E0\u10D8 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" />`)}
              ${F("\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8\u10E1 ID (slug)", `<input name="lecturerId" value="${escapeHtml(edit?.lecturerId || "")}" placeholder="auto" />`)}
              ${F("\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8", `<input name="credits" type="number" min="0" value="${edit?.credits || ""}" />`)}
              ${F("\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8", `<input name="semester" value="${escapeHtml(edit?.semester || "")}" placeholder="\u10E8\u10D4\u10DB\u10DD\u10D3\u10D2\u10DD\u10DB\u10D0 2026" />`)}
            </div>
            ${F("\u10E1\u10D8\u10DA\u10D0\u10D1\u10E3\u10E1\u10D8", `<textarea name="syllabus" rows="3">${escapeHtml(edit?.syllabus || "")}</textarea>`)}
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('subjects')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8</th><th>\u10D9\u10DD\u10D3\u10D8</th><th>\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</th><th>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</th><th>\u10D9\u10E0\u10D4\u10D3.</th><th></th></tr></thead>
          <tbody>
            ${subs.length ? subs.map((s) => `<tr>
              <td>${escapeHtml(s.name)}</td>
              <td>${escapeHtml(s.code || "\u2014")}</td>
              <td style="font-size:12px">${escapeHtml(facMap[s.facultyId] || "\u2014")}</td>
              <td>${escapeHtml(s.lecturer || "\u2014")}</td>
              <td>${s.credits || 0}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('subjects','${s.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelSubject('${s.id}','${j(s.name)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="6" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "resources") {
        const [subs, ress] = await Promise.all([loadCollection("subjects"), loadCollection("resources")]);
        const subMap = Object.fromEntries(subs.map((s) => [s.id, s.name]));
        const edit = editId ? ress.find((r) => r.id === editId) : null;
        body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0` : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8"}</h3>
          ${subs.length ? `<form onsubmit="__campus.adminSaveResource(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8 *", `<select name="subjectId" required>${subs.map((s) => `<option value="${s.id}" ${edit?.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}</select>`)}
              ${F("\u10E2\u10D8\u10DE\u10D8", `<select name="type">${["PDF", "Video", "Link", "Notes", "Book"].map((t) => `<option ${edit?.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>`)}
              ${F("\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8 *", `<input name="title" required value="${escapeHtml(edit?.title || "")}" />`)}
              ${F("URL *", `<input name="url" type="url" required value="${escapeHtml(edit?.url || "")}" />`)}
              ${F("\u10EE\u10DB\u10D4\u10D1\u10D8", `<input name="upvotes" type="number" min="0" value="${edit?.upvotes || 0}" />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('resources')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8</th><th>\u10E2\u10D8\u10DE\u10D8</th><th>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</th><th>\u10EE\u10DB\u10D4\u10D1\u10D8</th><th></th></tr></thead>
          <tbody>
            ${ress.length ? ress.map((r) => `<tr>
              <td>${escapeHtml(r.title)}</td>
              <td>${escapeHtml(r.type)}</td>
              <td style="font-size:12px">${escapeHtml(subMap[r.subjectId] || "\u2014")}</td>
              <td>\u25B2 ${r.upvotes || 0}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('resources','${r.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelResource('${r.id}','${j(r.title)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "news") {
        const [unis, facs, items] = await Promise.all([
          loadCollection("universities"),
          loadCollection("faculties"),
          loadCollection("news", { orderBy: "createdAt" })
        ]);
        const uniMap2 = Object.fromEntries(unis.map((u) => [u.id, u.name]));
        const facMap = Object.fromEntries(facs.map((f) => [f.id, f.name]));
        const edit = editId ? items.find((n) => n.id === editId) : null;
        const cats = ["registration", "event", "deadline", "scholarship", "announcement"];
        const auds = [["both", "\u10E7\u10D5\u10D4\u10DA\u10D0"], ["student", "\u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8"]];
        body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? "\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0" : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E1\u10D8\u10D0\u10EE\u10DA\u10D4"}</h3>
          <form onsubmit="__campus.adminSaveNews(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8", `<select name="uniId"><option value="">\u2014 \u10E7\u10D5\u10D4\u10DA\u10D0 (\u10D2\u10DA\u10DD\u10D1\u10D0\u10DA\u10E3\u10E0\u10D8) \u2014</option>${unis.map((u) => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("\u10D5\u10D8\u10E1 \u10D4\u10E9\u10D5\u10D4\u10DC\u10D4\u10D1\u10D0 (\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8)", `<select name="facultyId"><option value="">\u2014 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10E1 \u2014</option>${facs.map((f) => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}${uniMap2[f.uniId] ? ` (${escapeHtml(uniMap2[f.uniId])})` : ""}</option>`).join("")}</select>`)}
              ${F("\u10D9\u10D0\u10E2\u10D4\u10D2\u10DD\u10E0\u10D8\u10D0", `<select name="category">${cats.map((c) => `<option value="${c}" ${edit?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
              ${F("\u10D0\u10E3\u10D3\u10D8\u10D4\u10DC\u10EA\u10D8\u10D0", `<select name="audience">${auds.map(([v, l]) => `<option value="${v}" ${edit?.audience === v ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
              ${F("\u10D1\u10DB\u10E3\u10DA\u10D8", `<input name="url" type="url" value="${escapeHtml(edit?.url || "")}" />`)}
            </div>
            ${F("\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8 *", `<input name="title" required maxlength="200" value="${escapeHtml(edit?.title || "")}" />`)}
            ${F("\u10DB\u10DD\u10D9\u10DA\u10D4 \u10D0\u10E6\u10EC\u10D4\u10E0\u10D0 *", `<textarea name="summary" rows="3" required>${escapeHtml(edit?.summary || "")}</textarea>`)}
            <label style="display:flex;align-items:center;gap:8px;margin:8px 0"><input type="checkbox" name="pinned" ${edit?.pinned ? "checked" : ""} /> \u{1F4CC} \u10D3\u10D0\u10D0\u10DB\u10D0\u10D2\u10E0\u10D4 \u10D6\u10D4\u10D5\u10D8\u10D7</label>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('news')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>
        </div>
        ${items.length ? items.map((n) => `
          <div class="card" style="margin-bottom:10px">
            <div class="row between" style="align-items:flex-start;gap:14px">
              <div style="flex:1;min-width:0">
                <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:4px">
                  <span class="badge badge-primary" style="font-size:11px">${escapeHtml(uniMap2[n.uniId] || (n.uniId ? n.uniId : "\u10D2\u10DA\u10DD\u10D1\u10D0\u10DA\u10E3\u10E0\u10D8"))}</span>
                  ${n.facultyId ? `<span class="badge" style="font-size:11px;background:#dbeafe;color:#1e40af">\u{1F3DB} ${escapeHtml(facMap[n.facultyId] || n.facultyId)}</span>` : ""}
                  <span class="badge" style="font-size:11px">${escapeHtml(n.category || "\u2014")}</span>
                  <span class="badge" style="font-size:11px;background:#f1f5f9;color:#475569">\u{1F441} ${escapeHtml(n.audience || "both")}</span>
                  ${n.pinned ? `<span class="badge" style="font-size:11px">\u{1F4CC}</span>` : ""}
                </div>
                <h4 style="margin:0">${escapeHtml(n.title)}</h4>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${escapeHtml(n.summary || "")}</p>
              </div>
              <div style="white-space:nowrap;flex-shrink:0">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('news','${n.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelNews('${n.id}','${j(n.title)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </div>
            </div>
          </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">\u10E1\u10D8\u10D0\u10EE\u10DA\u10D4 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}`;
      } else if (tab === "calendars") {
        const [unis, cals] = await Promise.all([loadCollection("universities"), loadCollection("calendars")]);
        const calMap = Object.fromEntries(cals.map((c) => [c.id, c]));
        body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">\u2795 \u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0 / \u10D2\u10D0\u10DC\u10D0\u10EE\u10DA\u10D4\u10D1\u10D0</h3>
          ${unis.length ? `<form onsubmit="__campus.adminSaveCalendar(event)">
            <div class="grid grid-2">
              ${F("\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 *", `<select name="uniId" required>${unis.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 ID *", `<input name="semesterId" required placeholder="2026-spring" />`)}
            </div>
            ${F("\u10D3\u10D0\u10E1\u10D0\u10EE\u10D4\u10DA\u10D4\u10D1\u10D0 *", `<input name="name" required placeholder="\u10D2\u10D0\u10D6\u10D0\u10E4\u10EE\u10E3\u10DA\u10D8\u10E1 \u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8 2026" />`)}
            ${[["regStart", "regEnd", "\u10E0\u10D4\u10D2\u10D8\u10E1\u10E2\u10E0\u10D0\u10EA\u10D8\u10D0"], ["semStart", "semEnd", "\u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD \u10DE\u10D4\u10E0\u10D8\u10DD\u10D3\u10D8"], ["addStart", "addEnd", "Add/Drop"], ["midStart", "midEnd", "\u10E8\u10E3\u10D0\u10DA\u10D4\u10D3\u10E3\u10E0\u10D8"], ["finStart", "finEnd", "\u10E4\u10D8\u10DC\u10D0\u10DA\u10E3\u10E0\u10D8"]].map(([a, b, l]) => `<div class="grid grid-2">
              ${F(`${l} \u2014 \u10D3\u10D0\u10EC\u10E7\u10D4\u10D1\u10D0`, `<input name="${a}" type="date" required />`)}
              ${F(`${l} \u2014 \u10D3\u10D0\u10E1\u10E0\u10E3\u10DA\u10D4\u10D1\u10D0`, `<input name="${b}" type="date" required />`)}
            </div>`).join("")}
            <button class="btn btn-primary" type="submit">\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0</button>
          </form>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8.</p>`}
        </div>
        ${unis.map((u) => {
          const c = calMap[u.id];
          const sems = c?.semesters || [];
          return `<div class="card" style="margin-bottom:12px">
            <h4 style="margin:0 0 8px">${escapeHtml(u.name)}</h4>
            ${sems.length ? sems.map((s) => `<div class="row between" style="padding:6px 0;border-top:1px solid var(--border)">
              <div style="min-width:0">
                <div style="font-weight:600;font-size:14px">${escapeHtml(s.name || s.id)}</div>
                <div class="muted" style="font-size:12px">\u10E1\u10D0\u10E1\u10EC\u10D0\u10D5\u10DA\u10DD: ${s.semester?.start || "\u2014"} \u2014 ${s.semester?.end || "\u2014"} \xB7 \u10E4\u10D8\u10DC\u10D0\u10DA\u10D4\u10D1\u10D8: ${s.finals?.start || "\u2014"} \u2014 ${s.finals?.end || "\u2014"}</div>
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelSemester('${u.id}','${s.id}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>`).join("") : `<p class="muted" style="margin:0;font-size:13px">\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1</p>`}
          </div>`;
        }).join("")}`;
      } else if (tab === "logs") {
        const logs = await loadCollection("logs", { orderBy: "createdAt", limit: 100 });
        body = `${audienceChip("all")}
        <div class="card" style="padding:0">
          <div class="log-row" style="background:var(--surface-2);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">
            <span>\u10D3\u10E0\u10DD</span><span>\u10E2\u10D8\u10DE\u10D8</span><span>\u10DB\u10DD\u10DB\u10EE\u10DB\u10D0\u10E0\u10D4\u10D1\u10D4\u10DA\u10D8</span><span>\u10D3\u10D4\u10E2\u10D0\u10DA\u10D4\u10D1\u10D8</span>
          </div>
          ${logs.length ? logs.map((l) => `
            <div class="log-row">
              <span class="log-time">${fmtTime(l.createdAt)}</span>
              <span class="log-type">${escapeHtml(l.type)}</span>
              <span style="font-size:13px">${escapeHtml(l.actorEmail || "\u2014")}</span>
              <span class="muted" style="font-size:12px;font-family:monospace">${escapeHtml(JSON.stringify(l.meta || {}))}</span>
            </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">\u10DA\u10DD\u10D2\u10D4\u10D1\u10D8 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}
        </div>`;
      } else if (tab === "lecturers") {
        const [lects, facs, unis] = await Promise.all([
          loadCollection("lecturers"),
          loadCollection("faculties"),
          loadCollection("universities")
        ]);
        const uniMap2 = Object.fromEntries(unis.map((u) => [u.id, u.shortName || u.name]));
        const facMap = Object.fromEntries(facs.map((f) => [f.id, `${f.name} (${uniMap2[f.uniId] || "?"})`]));
        const edit = editId ? lects.find((l) => l.id === editId) : null;
        body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `\u270F\uFE0F \u10E0\u10D4\u10D3\u10D0\u10E5\u10E2\u10D8\u10E0\u10D4\u10D1\u10D0: ${escapeHtml(edit.name)}` : "\u2795 \u10D0\u10EE\u10D0\u10DA\u10D8 \u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8"}</h3>
          <form onsubmit="__campus.adminSaveLect(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8 \u10D2\u10D5\u10D0\u10E0\u10D8 *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="\u10D2\u10D5\u10D0\u10E0\u10D8 \u10E1\u10D0\u10EE\u10D4\u10DA\u10D8" />`)}
              ${F("\u10EC\u10DD\u10D3\u10D4\u10D1\u10D0/\u10D7\u10D0\u10DC\u10D0\u10DB\u10D3\u10D4\u10D1\u10DD\u10D1\u10D0", `<input name="title" value="${escapeHtml(edit?.title || "")}" placeholder="\u10DE\u10E0\u10DD\u10E4\u10D4\u10E1\u10DD\u10E0\u10D8 / \u10D0\u10E1\u10D8\u10E1\u10E2\u10D4\u10DC\u10E2\u10D8" />`)}
              ${F("\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8", `<select name="uniId"><option value="">\u2014 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u2014</option>${unis.map((u) => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8", `<select name="facultyId"><option value="">\u2014 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u2014</option>${facs.map((f) => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}</option>`).join("")}</select>`)}
              ${F("\u10EB\u10D8\u10E0\u10D8\u10D7\u10D0\u10D3\u10D8 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8", `<input name="subject" value="${escapeHtml(edit?.subject || "")}" placeholder="\u10D0\u10DA\u10D2\u10D4\u10D1\u10E0\u10D0" />`)}
              ${F("\u10E4\u10DD\u10E2\u10DD URL", `<input name="photoUrl" type="url" value="${escapeHtml(edit?.photoUrl || "")}" />`)}
            </div>
            ${F("\u10D1\u10D8\u10DD\u10D2\u10E0\u10D0\u10E4\u10D8\u10D0", `<textarea name="bio" rows="3">${escapeHtml(edit?.bio || "")}</textarea>`)}
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "\u10E8\u10D4\u10DC\u10D0\u10EE\u10D5\u10D0" : "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('lecturers')">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>` : ""}
            </div>
          </form>
        </div>
        <table class="admin-table">
          <thead><tr><th>\u10E1\u10D0\u10EE\u10D4\u10DA\u10D8</th><th>\u10EC\u10DD\u10D3\u10D4\u10D1\u10D0</th><th>\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</th><th>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</th><th></th></tr></thead>
          <tbody>
            ${lects.length ? lects.map((l) => `<tr>
              <td>${escapeHtml(l.name)}</td>
              <td>${escapeHtml(l.title || "\u2014")}</td>
              <td style="font-size:12px">${escapeHtml(facMap[l.facultyId] || "\u2014")}</td>
              <td>${escapeHtml(l.subject || "\u2014")}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('lecturers','${l.id}')">\u270F\uFE0F</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelLect('${l.id}','${j(l.name)}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0 \u2014 \u10D3\u10D0\u10D0\u10DB\u10D0\u10E2\u10D4 \u10DE\u10D8\u10E0\u10D5\u10D4\u10DA\u10D8 \u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8 \u261D\uFE0F</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "lectRatings") {
        const [ratings, lects] = await Promise.all([
          loadCollection("lecturerRatings", { orderBy: "createdAt" }),
          loadCollection("lecturers")
        ]);
        const lectMap = Object.fromEntries(lects.map((l) => [l.id, l.name]));
        const agg = {};
        ratings.forEach((r) => {
          const k = r.lecturerId;
          if (!agg[k]) agg[k] = { sum: 0, n: 0 };
          agg[k].sum += Number(r.rating) || 0;
          agg[k].n += 1;
        });
        const summary = Object.entries(agg).map(([id, a]) => ({ id, name: lectMap[id] || id, avg: a.sum / a.n, n: a.n })).sort((a, b) => b.avg - a.avg);
        body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">\u{1F4CA} \u10E1\u10D0\u10E8\u10E3\u10D0\u10DA\u10DD \u10E0\u10D4\u10D8\u10E2\u10D8\u10DC\u10D2\u10D8</h3>
          ${summary.length ? `<table class="admin-table">
            <thead><tr><th>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</th><th>\u10E1\u10D0\u10E8\u10E3\u10D0\u10DA\u10DD</th><th>\u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8</th></tr></thead>
            <tbody>${summary.map((s) => `<tr>
              <td>${escapeHtml(s.name)}</td>
              <td>\u2B50 ${s.avg.toFixed(2)} / 5</td>
              <td>${s.n}</td>
            </tr>`).join("")}</tbody>
          </table>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10D0\u10E0\u10EA\u10D4\u10E0\u10D7\u10D8 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1</p>`}
        </div>
        <h3>\u10E7\u10D5\u10D4\u10DA\u10D0 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0</h3>
        ${ratings.length ? ratings.map((r) => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(lectMap[r.lecturerId] || r.lecturerId)} \u2014 \u2B50 ${r.rating}/5</div>
                <div class="muted" style="font-size:12px">${escapeHtml(r.semester || "")} \xB7 ${escapeHtml(r.studentEmail || r.studentId || "")} \xB7 ${fmtTime(r.createdAt)}</div>
                ${r.comment ? `<p style="margin:6px 0 0">${escapeHtml(r.comment)}</p>` : ""}
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelRating('${r.id}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>
          </div>`).join("") : `<p class="muted">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}`;
      } else if (tab === "subjRatings") {
        const [ratings, subs] = await Promise.all([
          loadCollection("subjectRatings"),
          loadCollection("subjects")
        ]);
        const subMap = Object.fromEntries(subs.map((s) => [s.id, s.name]));
        const sorted = ratings.slice().sort((a, b) => {
          const ta = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
          const tb = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
          return tb - ta;
        });
        body = `${audienceChip("student")}
        <p class="muted">\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D8\u10D4\u10E0 \u10DB\u10D8\u10EA\u10D4\u10DB\u10E3\u10DA\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10E1\u10D8\u10E0\u10D7\u10E3\u10DA\u10D8\u10E1 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D4\u10D1\u10D8. \u10E1\u10E3\u10DA: <b>${ratings.length}</b></p>
        ${sorted.length ? sorted.map((r) => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(subMap[r.subjectId] || r.subjectId)}</div>
                <div class="muted" style="font-size:12px">
                  \u10E1\u10D8\u10E0\u10D7\u10E3\u10DA\u10D4 ${r.difficulty}/5 \xB7 \u10D3\u10D0\u10E2\u10D5. ${r.workload}/5 \xB7 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D0 ${r.examHardness}/5 \xB7 \u10D2\u10D0\u10E1\u10D0\u10D2\u10D4\u10D1\u10DA\u10DD\u10D1\u10D0 ${r.clarity}/5 \xB7 \u10E6\u10D8\u10E0\u10E1 ${r.worthIt}/5
                </div>
                <div class="muted" style="font-size:12px">user: ${escapeHtml(r.userId || "")} \xB7 ${fmtTime(r.updatedAt || r.createdAt)}</div>
                ${r.comment ? `<p style="margin:6px 0 0;white-space:pre-wrap">${escapeHtml(r.comment)}</p>` : ""}
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelSubjRating('${r.id}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>
          </div>`).join("") : `<p class="muted">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}`;
      } else if (tab === "qa") {
        const [items, subs] = await Promise.all([
          loadCollection("qaComments"),
          loadCollection("subjects")
        ]);
        const subMap = Object.fromEntries(subs.map((s) => [s.id, s.name]));
        const sorted = items.slice().sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
        body = `${audienceChip("student")}
        <p class="muted">\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1 Q&A \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D6\u10D4. \u10E1\u10E3\u10DA: <b>${items.length}</b></p>
        ${sorted.length ? sorted.map((c) => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(c.author || "\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8")} <span class="muted" style="font-weight:400;font-size:12px">\xB7 ${escapeHtml(c.authorEmail || "")}</span></div>
                <div class="muted" style="font-size:12px">\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8: <a href="#/subject/${escapeHtml(c.subjectId)}?tab=qa">${escapeHtml(subMap[c.subjectId] || c.subjectId)}</a> \xB7 ${fmtTime(c.createdAt)}</div>
                <p style="margin:8px 0 0;white-space:pre-wrap;word-break:break-word">${escapeHtml(c.text || "")}</p>
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelQA('${c.id}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>
          </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">Q&A \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</p>`}`;
      } else if (tab === "materials") {
        const [mats, subs] = await Promise.all([
          loadCollection("materials"),
          loadCollection("subjects")
        ]);
        const subMap = Object.fromEntries(subs.map((s) => [s.id, s.name]));
        const sorted = mats.slice().sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
        body = `${audienceChip("student")}
        <p class="muted">\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D8\u10D4\u10E0 \u10D0\u10E2\u10D5\u10D8\u10E0\u10D7\u10E3\u10DA\u10D8 \u10DB\u10D0\u10E1\u10D0\u10DA\u10D4\u10D1\u10D8. \u10E1\u10E3\u10DA: <b>${mats.length}</b></p>
        <table class="admin-table">
          <thead><tr><th>\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8</th><th>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</th><th>\u10D0\u10E2\u10D5\u10D8\u10E0\u10D7\u10D0</th><th>\u10D3\u10E0\u10DD</th><th></th></tr></thead>
          <tbody>
            ${sorted.length ? sorted.map((m) => `<tr>
              <td>${escapeHtml(m.title || "\u2014")}${m.url ? ` <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener" style="font-size:12px">\u2197</a>` : ""}</td>
              <td style="font-size:12px">${escapeHtml(subMap[m.subjectId] || m.subjectId || "\u2014")}</td>
              <td style="font-size:12px">${escapeHtml(m.uploadedByEmail || m.uploadedBy || "\u2014")}</td>
              <td style="font-size:12px">${fmtTime(m.createdAt)}</td>
              <td><button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelMaterial('${m.id}','${j(m.title || "")}')">\u{1F5D1} \u10EC\u10D0\u10E8\u10DA\u10D0</button></td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0</td></tr>`}
          </tbody>
        </table>`;
      } else if (tab === "reports") {
        const reports = await loadAllReports(500);
        const open2 = reports.filter((r) => r.status === "open");
        const resolved = reports.filter((r) => r.status !== "open");
        const card = (r, isOpen) => {
          const meta2 = REPORT_TYPES[r.type] || { label: r.type };
          const payload = encodeURIComponent(JSON.stringify({
            id: r.id,
            type: r.type,
            targetId: r.targetId,
            targetCollection: r.targetCollection
          }));
          return `<div class="card" style="margin-bottom:10px;border-left:4px solid ${isOpen ? "#dc2626" : "#16a34a"}">
          <div class="row between" style="align-items:flex-start;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:240px">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span class="badge" style="background:#dc262615;color:#dc2626;border-color:#dc262640">${escapeHtml(meta2.label)}</span>
                <span class="badge ${isOpen ? "badge-danger" : "badge-primary"}">${isOpen ? "\u10E6\u10D8\u10D0" : "\u10D3\u10D0\u10EE\u10E3\u10E0\u10E3\u10DA\u10D8"}</span>
                <span class="muted" style="font-size:12px">${fmtTime(r.createdAt)}</span>
              </div>
              <div style="margin-top:8px;font-weight:600">\u10DB\u10D8\u10D6\u10D4\u10D6\u10D8: ${escapeHtml(r.reason || "\u2014")}</div>
              <div class="muted" style="font-size:12px;margin-top:4px">\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0: <b>${escapeHtml(r.reporterEmail || r.reporterId || "\u2014")}</b></div>
              <div class="muted" style="font-size:12px">\u10DD\u10D1\u10D8\u10D4\u10E5\u10E2\u10D8: <code>${escapeHtml(r.targetId || "")}</code></div>
              ${r.contextText ? `<div class="card" style="background:var(--bg);padding:10px 12px;margin-top:8px;font-size:13px;white-space:pre-wrap;word-break:break-word">${escapeHtml(r.contextText)}</div>` : ""}
            </div>
            <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">
              ${isOpen ? `
                <button class="btn btn-danger" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportDeleteContent('${payload}')">\u{1F5D1} \u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8\u10E1 \u10EC\u10D0\u10E8\u10DA\u10D0</button>
                <button class="btn" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportResolve('${r.id}')">\u2713 \u10E3\u10D0\u10E0\u10E7\u10DD\u10E4\u10D0</button>
              ` : ""}
              <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportDelete('${r.id}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>
          </div>
        </div>`;
        };
        body = `${audienceChip("all")}
        <p class="muted">\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8 \u10D9\u10DD\u10DC\u10E2\u10D4\u10DC\u10E2\u10D6\u10D4. \u10E6\u10D8\u10D0 \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10DD\u10D3\u10D4\u10E0\u10D0\u10EA\u10D8\u10D0 \u10DE\u10E0\u10D8\u10DD\u10E0\u10D8\u10E2\u10D4\u10E2\u10E3\u10DA\u10D8\u10D0.</p>
        <div class="grid grid-3" style="margin-bottom:18px">
          <div class="card stat"><div class="stat-num" style="color:#dc2626">${open2.length}</div><div class="stat-label">\u10E6\u10D8\u10D0</div></div>
          <div class="card stat"><div class="stat-num">${resolved.length}</div><div class="stat-label">\u10D3\u10D0\u10EE\u10E3\u10E0\u10E3\u10DA\u10D8</div></div>
          <div class="card stat"><div class="stat-num">${reports.length}</div><div class="stat-label">\u10E1\u10E3\u10DA</div></div>
        </div>
        <h3 style="margin:0 0 10px">\u{1F534} \u10E6\u10D8\u10D0 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8</h3>
        ${open2.length ? open2.map((r) => card(r, true)).join("") : `<p class="muted" style="text-align:center;padding:20px">\u10E6\u10D8\u10D0 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1. \u{1F389}</p>`}
        ${resolved.length ? `<h3 style="margin:22px 0 10px">\u2705 \u10D3\u10D0\u10EE\u10E3\u10E0\u10E3\u10DA\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8</h3>${resolved.slice(0, 50).map((r) => card(r, false)).join("")}` : ""}
      `;
      } else if (tab === "faq") {
        const { listFaqAll: listFaqAll2, addFaq: addFaq2, deleteFaq: deleteFaq2 } = await Promise.resolve().then(() => (init_faq(), faq_exports));
        const { universities: universities2, faculties: faculties2 } = await Promise.resolve().then(() => (init_data(), data_exports));
        expose("adminFaqAdd", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await addFaq2({
              topic: fd.get("topic"),
              title: fd.get("title"),
              body: fd.get("body"),
              scope: fd.get("scope"),
              uniId: fd.get("uniId") || "",
              facultyId: fd.get("facultyId") || ""
            });
            showToast("\u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0");
            e.target.reset();
            refresh();
          } catch (err) {
            showToast(err.message || "\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0");
          }
        });
        expose("adminFaqDel", async (id) => {
          if (!confirm("\u10EC\u10D0\u10D5\u10E8\u10D0\u10DA\u10DD?")) return;
          await deleteFaq2(id);
          showToast("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0");
          refresh();
        });
        expose("adminFaqScope", (sel) => {
          const form = sel.form;
          const sc = form.scope.value;
          form.querySelector("[data-uni-row]").style.display = sc === "uni" || sc === "faculty" ? "" : "none";
          form.querySelector("[data-fac-row]").style.display = sc === "faculty" ? "" : "none";
        });
        expose("adminFaqUni", (sel) => {
          const form = sel.form;
          const uniId = form.uniId.value;
          const facSel = form.facultyId;
          const opts = faculties2.filter((f) => f.uniId === uniId).map((f) => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`).join("");
          facSel.innerHTML = `<option value="">\u2014 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8 \u2014</option>${opts}`;
        });
        const items = await listFaqAll2();
        const uniName = (id) => universities2.find((u) => u.id === id)?.name || id || "\u2014";
        const facName = (id) => faculties2.find((f) => f.id === id)?.name || id || "\u2014";
        const scopeLabel = (f) => {
          if (f.scope === "uni") return `\u{1F3DB} ${escapeHtml(uniName(f.uniId))}`;
          if (f.scope === "faculty") return `\u{1F393} ${escapeHtml(uniName(f.uniId))} \xB7 ${escapeHtml(facName(f.facultyId))}`;
          return `\u{1F310} \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8`;
        };
        body = `${audienceChip("all")}
        <p class="muted">\u10EE\u10E8\u10D8\u10E0\u10D0\u10D3 \u10D3\u10D0\u10E1\u10DB\u10E3\u10DA\u10D8 \u10D9\u10D8\u10D7\u10EE\u10D5\u10D4\u10D1\u10D8\u10E1 \u10D1\u10D0\u10D6\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0 (Firestore). \u10E8\u10D4\u10E1\u10D0\u10EB\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8\u10D0 \u10DB\u10D8\u10D7\u10D8\u10D7\u10D4\u10D1\u10D0, \u10E0\u10DD\u10DB\u10D4\u10DA\u10D8 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8\u10E1 \u10E0\u10DD\u10DB\u10D4\u10DA\u10D8 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8\u10E1 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8 \u10DC\u10D0\u10EE\u10D0\u10D5\u10D4\u10DC \u10D7\u10D4\u10DB\u10D0\u10E1.</p>
        <div class="card" style="margin-bottom:14px">
          <h3 style="margin:0 0 10px">+ \u10D0\u10EE\u10D0\u10DA\u10D8 \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D8</h3>
          <form onsubmit="__campus.adminFaqAdd(event)" class="stack" style="gap:10px">
            <input name="topic" placeholder="\u10D7\u10D4\u10DB\u10D0 (\u10DB\u10D0\u10D2. \u10DB\u10DD\u10D1\u10D8\u10DA\u10DD\u10D1\u10D0)" required maxlength="60" />
            <input name="title" placeholder="\u10D9\u10D8\u10D7\u10EE\u10D5\u10D0 (\u10E1\u10D0\u10D7\u10D0\u10E3\u10E0\u10D8)" required maxlength="160" />
            <textarea name="body" placeholder="\u10DE\u10D0\u10E1\u10E3\u10EE\u10D8\u10E1 \u10E2\u10D4\u10E5\u10E1\u10E2\u10D8" required rows="4" maxlength="2000"></textarea>

            <label class="muted" style="font-size:12px;margin-bottom:-4px">\u10D5\u10D8\u10E1 \u10DC\u10D0\u10EE\u10D0\u10D5\u10E1?</label>
            <select name="scope" onchange="__campus.adminFaqScope(this)" required>
              <option value="all">\u{1F310} \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D8</option>
              <option value="uni">\u{1F3DB} \u10D9\u10DD\u10DC\u10D9\u10E0\u10D4\u10E2\u10E3\u10DA\u10D8 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</option>
              <option value="faculty">\u{1F393} \u10D9\u10DD\u10DC\u10D9\u10E0\u10D4\u10E2\u10E3\u10DA\u10D8 \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</option>
            </select>

            <div data-uni-row style="display:none">
              <select name="uniId" onchange="__campus.adminFaqUni(this)">
                <option value="">\u2014 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u2014</option>
                ${universities2.map((u) => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.name)}</option>`).join("")}
              </select>
            </div>
            <div data-fac-row style="display:none">
              <select name="facultyId">
                <option value="">\u2014 \u10EF\u10D4\u10E0 \u10D0\u10D8\u10E0\u10E9\u10D8\u10D4 \u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8 \u2014</option>
              </select>
            </div>

            <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
          </form>
        </div>
        <h3 style="margin:18px 0 10px">\u10D0\u10E0\u10E1\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E9\u10D0\u10DC\u10D0\u10EC\u10D4\u10E0\u10D4\u10D1\u10D8 (${items.length})</h3>
        ${items.length ? `<div class="stack">${items.map((f) => `
          <div class="card">
            <div class="row between" style="gap:8px;flex-wrap:wrap">
              <div style="min-width:0">
                <div style="font-weight:600">${escapeHtml(f.title)}</div>
                <div class="muted" style="font-size:12px">\u10D7\u10D4\u10DB\u10D0: ${escapeHtml(f.topic)} \xB7 \u10EE\u10D8\u10DA\u10D5\u10D0\u10D3\u10DD\u10D1\u10D0: ${scopeLabel(f)}</div>
              </div>
              <button class="btn btn-ghost" onclick="__campus.adminFaqDel('${f.id}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
            </div>
            <div style="margin-top:8px;line-height:1.6;white-space:pre-wrap">${escapeHtml(f.body)}</div>
          </div>
        `).join("")}</div>` : `<p class="muted">\u10EF\u10D4\u10E0 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0.</p>`}
      `;
      }
    } catch (err) {
      console.error("admin load error", err);
      body = `<div class="card"><h3>\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0</h3><p class="muted">${escapeHtml(err.message || "\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0")}</p></div>`;
    }
    const groups = ["general", "shared", "student"];
    const nav = groups.map((g) => {
      const items = TABS.filter((t) => t.group === g && canSeeTab(t.id));
      if (!items.length) return "";
      const meta2 = g === "student" ? AUDIENCE_META.student : g === "shared" ? AUDIENCE_META.both : AUDIENCE_META.all;
      return `<div class="admin-nav-group">
      <div class="admin-nav-group-label" style="color:${meta2.color}">${meta2.icon} ${GROUP_LABEL[g]}</div>
      ${items.map((t) => `<button class="${tab === t.id ? "active" : ""}" onclick="__campus.adminTab('${t.id}')">${escapeHtml(t.label)}</button>`).join("")}
    </div>`;
    }).join("");
    return `
    <div class="admin-shell">
      <aside class="admin-side">
        <h2>${isAdmin2 ? "\u{1F6E1}\uFE0F Admin Panel" : "\u{1F9D1}\u200D\u2696\uFE0F Moderator Panel"}</h2>
        <nav class="admin-nav">${nav}</nav>
      </aside>
      <section class="admin-main">
        <div class="admin-header">
          <h1>${escapeHtml(currentTab.label)}</h1>
          <p>\u10E8\u10D4\u10E1\u10E3\u10DA\u10D8 \u10EE\u10D0\u10E0 \u10E0\u10DD\u10D2\u10DD\u10E0\u10EA <b>${escapeHtml(user.email)}</b></p>
        </div>
        ${body}
      </section>
    </div>`;
  };

  // static-site/js/views/search.js
  init_data();
  init_ui();
  var q = "";
  var uniFilter = "all";
  var credFilter = "all";
  var typeFilter = "all";
  var kindFilter = "all";
  var searchView = () => {
    expose("setQ", (v) => {
      q = v;
      refreshResults();
    });
    expose("setFilter", (k, v) => {
      if (k === "uni") uniFilter = v;
      if (k === "cred") credFilter = v;
      if (k === "type") typeFilter = v;
      if (k === "kind") kindFilter = v;
      refreshResults();
    });
    expose("resetFilters", () => {
      q = "";
      uniFilter = "all";
      credFilter = "all";
      typeFilter = "all";
      kindFilter = "all";
      const qi = document.getElementById("searchQ");
      if (qi) qi.value = "";
      document.querySelectorAll("#filterForm select").forEach((s) => {
        s.value = "all";
      });
      refreshResults();
      document.getElementById("searchQ")?.focus();
    });
    setTimeout(() => {
      refreshResults();
      document.getElementById("searchQ")?.focus();
    }, 0);
    return `
    <nav class="crumbs" aria-label="\u10DC\u10D0\u10D9\u10D0\u10D3\u10D8"><a href="#/">\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8</a> / \u10D2\u10D0\u10E4\u10D0\u10E0\u10D7\u10DD\u10D4\u10D1\u10E3\u10DA\u10D8 \u10EB\u10D8\u10D4\u10D1\u10D0</nav>
    <h1>\u10D2\u10D0\u10E4\u10D0\u10E0\u10D7\u10DD\u10D4\u10D1\u10E3\u10DA\u10D8 \u10EB\u10D8\u10D4\u10D1\u10D0</h1>
    <p class="muted">\u10DB\u10DD\u10EB\u10D4\u10D1\u10DC\u10D4 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8, \u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8, \u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8 \u10D0\u10DC \u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8</p>

    <form id="filterForm" class="card search-panel" role="search" aria-label="\u10EB\u10D8\u10D4\u10D1\u10D0 \u10E4\u10D8\u10DA\u10E2\u10E0\u10D4\u10D1\u10D8\u10D7"
          onsubmit="event.preventDefault()">
      <label for="searchQ" class="sr-only">\u10E1\u10D0\u10EB\u10D8\u10D4\u10D1\u10DD \u10E1\u10D8\u10E2\u10E7\u10D5\u10D0</label>
      <input id="searchQ" type="search" placeholder="\u10EB\u10D8\u10D4\u10D1\u10D0..." value="${escapeHtml(q)}"
             autocomplete="off" enterkeyhint="search"
             aria-controls="searchResults" aria-describedby="resultsCount"
             oninput="__campus.setQ(this.value)" />

      <fieldset class="filter-row" aria-label="\u10E4\u10D8\u10DA\u10E2\u10E0\u10D4\u10D1\u10D8">
        <legend class="sr-only">\u10E4\u10D8\u10DA\u10E2\u10E0\u10D4\u10D1\u10D8</legend>

        <div class="field" style="margin:0">
          <label for="fKind" class="sr-only">\u10E2\u10D8\u10DE\u10D8</label>
          <select id="fKind" aria-label="\u10E8\u10D4\u10D3\u10D4\u10D2\u10D8\u10E1 \u10E2\u10D8\u10DE\u10D8" onchange="__campus.setFilter('kind', this.value)">
            <option value="all">\u10E7\u10D5\u10D4\u10DA\u10D0\u10E4\u10D4\u10E0\u10D8</option>
            <option value="subject">\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8</option>
            <option value="faculty">\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8</option>
            <option value="lecturer">\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8</option>
            <option value="resource">\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8</option>
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fUni" class="sr-only">\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8</label>
          <select id="fUni" aria-label="\u10E3\u10DC\u10D8\u10D5\u10D4\u10E0\u10E1\u10D8\u10E2\u10D4\u10E2\u10D8" onchange="__campus.setFilter('uni', this.value)">
            <option value="all">\u10E7\u10D5\u10D4\u10DA\u10D0 \u10E3\u10DC\u10D8\u10D5.</option>
            ${universities.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fCred" class="sr-only">\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</label>
          <select id="fCred" aria-label="\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8" onchange="__campus.setFilter('cred', this.value)">
            <option value="all">\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</option>
            <option value="lt5">&lt; 5</option>
            <option value="5">5</option>
            <option value="6">6+</option>
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fType" class="sr-only">\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8\u10E1 \u10E2\u10D8\u10DE\u10D8</label>
          <select id="fType" aria-label="\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1\u10D8\u10E1 \u10E2\u10D8\u10DE\u10D8" onchange="__campus.setFilter('type', this.value)">
            <option value="all">\u10E0\u10D4\u10E1\u10E3\u10E0\u10E1. \u10E2\u10D8\u10DE\u10D8</option>
            <option value="PDF">PDF</option>
            <option value="YouTube">YouTube</option>
            <option value="Drive">Drive</option>
          </select>
        </div>
      </fieldset>

      <div class="row between" style="margin-top:12px">
        <span id="resultsCount" class="muted" aria-live="polite" style="font-size:13px"></span>
        <button type="button" class="btn btn-ghost" onclick="__campus.resetFilters()">\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>
      </div>
    </form>

    <div id="searchResults" class="stack" role="region" aria-label="\u10EB\u10D8\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10D3\u10D4\u10D2\u10D4\u10D1\u10D8"
         aria-live="polite" aria-busy="false" style="margin-top:20px"></div>
  `;
  };
  function refreshResults() {
    const root = document.getElementById("searchResults");
    if (!root) return;
    const ql = q.trim().toLowerCase();
    const match = (s) => !ql || s.toLowerCase().includes(ql);
    const uniOfSubject = (s) => getUni(getFaculty(s.facultyId)?.uniId)?.id;
    const out = [];
    if (kindFilter === "all" || kindFilter === "subject") {
      subjects.filter((s) => {
        if (!(match(s.name) || match(s.code) || match(s.lecturer))) return false;
        if (uniFilter !== "all" && uniOfSubject(s) !== uniFilter) return false;
        if (credFilter === "lt5" && !(s.credits < 5)) return false;
        if (credFilter === "5" && s.credits !== 5) return false;
        if (credFilter === "6" && !(s.credits >= 6)) return false;
        return true;
      }).forEach((s) => out.push({
        kind: "\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8",
        href: `#/subject/${s.id}`,
        title: s.name,
        sub: `${s.code} \xB7 ${s.credits} \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8 \xB7 ${s.lecturer}`
      }));
    }
    if (kindFilter === "all" || kindFilter === "faculty") {
      faculties.filter((f) => match(f.name) && (uniFilter === "all" || f.uniId === uniFilter)).forEach((f) => out.push({ kind: "\u10E4\u10D0\u10D9\u10E3\u10DA\u10E2\u10D4\u10E2\u10D8", href: `#/faculty/${f.id}`, title: f.name, sub: getUni(f.uniId).name }));
    }
    if (kindFilter === "all" || kindFilter === "lecturer") {
      const seen = /* @__PURE__ */ new Set();
      subjects.filter((s) => match(s.lecturer)).forEach((s) => {
        if (uniFilter !== "all" && uniOfSubject(s) !== uniFilter) return;
        if (seen.has(s.lecturerId)) return;
        seen.add(s.lecturerId);
        out.push({ kind: "\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8", href: `#/subject/${s.id}`, title: s.lecturer, sub: `\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8: ${s.name}` });
      });
    }
    if (kindFilter === "all" || kindFilter === "resource") {
      resources.filter((r) => {
        if (typeFilter !== "all" && r.type !== typeFilter) return false;
        const s = subjects.find((x) => x.id === r.subjectId);
        if (uniFilter !== "all" && (!s || uniOfSubject(s) !== uniFilter)) return false;
        return match(r.title) || s && match(s.name);
      }).forEach((r) => {
        const s = subjects.find((x) => x.id === r.subjectId);
        out.push({ kind: r.type, href: `#/subject/${r.subjectId}`, title: r.title, sub: s?.name || "" });
      });
    }
    const countEl = document.getElementById("resultsCount");
    if (countEl) countEl.textContent = out.length ? `\u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0 ${out.length} \u10E8\u10D4\u10D3\u10D4\u10D2\u10D8` : "\u10E8\u10D4\u10D3\u10D4\u10D2\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0";
    root.innerHTML = out.length ? `<ul class="stack" style="list-style:none;padding:0;margin:0">${out.map((r) => `
        <li><a class="card result-card" href="${r.href}" aria-label="${escapeHtml(r.kind)}: ${escapeHtml(r.title)}">
          <div class="card-row">
            <div><h3 style="margin:0">${escapeHtml(r.title)}</h3><p>${escapeHtml(r.sub)}</p></div>
            <span class="badge badge-primary">${escapeHtml(r.kind)}</span>
          </div></a></li>`).join("")}</ul>` : `<div class="empty" role="status"><div class="ico" aria-hidden="true">\u{1F50D}</div>\u10D5\u10D4\u10E0\u10D0\u10E4\u10D4\u10E0\u10D8 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0</div>`;
  }

  // static-site/js/views/gpa.js
  init_ui();
  init_router();
  var KEY5 = "campus.gpa.courses";
  var WHAT_KEY = "campus.gpa.whatIf";
  var TAB_KEY = "campus.gpa.tab";
  var read3 = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY5) || "[]");
    } catch {
      return [];
    }
  };
  var write3 = (v) => localStorage.setItem(KEY5, JSON.stringify(v));
  var readWhat = () => {
    try {
      return JSON.parse(localStorage.getItem(WHAT_KEY) || "[]");
    } catch {
      return [];
    }
  };
  var writeWhat = (v) => localStorage.setItem(WHAT_KEY, JSON.stringify(v));
  var to4 = (score) => {
    const s = Number(score);
    if (isNaN(s)) return 0;
    if (s >= 91) return 4;
    if (s >= 81) return 3.5;
    if (s >= 71) return 3;
    if (s >= 61) return 2.5;
    if (s >= 51) return 2;
    return 0;
  };
  var letter = (score) => {
    const s = Number(score);
    if (s >= 91) return "A";
    if (s >= 81) return "B";
    if (s >= 71) return "C";
    if (s >= 61) return "D";
    if (s >= 51) return "E";
    if (s >= 41) return "FX";
    return "F";
  };
  var computeGPA = (rows) => {
    const totalCredits = rows.reduce((a, c) => a + Number(c.credits || 0), 0);
    const weighted4 = rows.reduce((a, c) => a + to4(c.score) * Number(c.credits || 0), 0);
    const weighted100 = rows.reduce((a, c) => a + Number(c.score || 0) * Number(c.credits || 0), 0);
    return {
      totalCredits,
      gpa4: totalCredits ? +(weighted4 / totalCredits).toFixed(2) : 0,
      avg100: totalCredits ? +(weighted100 / totalCredits).toFixed(1) : 0
    };
  };
  var getTab3 = () => localStorage.getItem(TAB_KEY) || "actual";
  var setTab2 = (t) => {
    localStorage.setItem(TAB_KEY, t);
    refresh();
  };
  var gpaView = () => {
    const courses = read3();
    const tab = getTab3();
    expose("gpaTab", (t) => setTab2(t));
    expose("gpaAdd", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get("name") || "").toString().trim();
      const credits = Number(fd.get("credits"));
      const score = Number(fd.get("score"));
      if (!name || !credits || isNaN(score)) return;
      const list2 = read3();
      list2.push({ id: crypto.randomUUID(), name, credits, score });
      write3(list2);
      e.target.reset();
      refresh();
    });
    expose("gpaDel", (id) => {
      write3(read3().filter((c) => c.id !== id));
      refresh();
    });
    expose("gpaClear", () => {
      if (confirm("\u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10DD\u10E1 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8?")) {
        write3([]);
        refresh();
      }
    });
    expose("whatAdd", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get("name") || "").toString().trim();
      const credits = Number(fd.get("credits"));
      const score = Number(fd.get("score"));
      if (!name || !credits || isNaN(score)) return;
      const list2 = readWhat();
      list2.push({ id: crypto.randomUUID(), name, credits, score, virtual: true });
      writeWhat(list2);
      e.target.reset();
      refresh();
    });
    expose("whatDel", (id) => {
      writeWhat(readWhat().filter((c) => c.id !== id));
      refresh();
    });
    expose("whatUpd", (id, val) => {
      const v = Math.max(0, Math.min(100, Number(val) || 0));
      const list2 = readWhat().map((c2) => c2.id === id ? { ...c2, score: v } : c2);
      writeWhat(list2);
      const all = [...read3(), ...list2];
      const r = computeGPA(all);
      const g = document.getElementById("whatGpa");
      if (g) g.textContent = r.gpa4.toFixed(2);
      const a = document.getElementById("whatAvg");
      if (a) a.textContent = r.avg100.toFixed(1);
      const c = document.getElementById("whatCred");
      if (c) c.textContent = r.totalCredits;
    });
    expose("whatReset", () => {
      if (confirm("\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D3\u10D4\u10E1 \u10E0\u10D0-\u10D7\u10E3 \u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8?")) {
        writeWhat([]);
        refresh();
      }
    });
    expose("whatImport", () => {
      if (!confirm("\u10D2\u10D0\u10D3\u10DB\u10DD\u10D5\u10D8\u10E2\u10D0\u10DC\u10DD \u10E0\u10D4\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8 \u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8\u10E1 \u10E1\u10D0\u10EC\u10E7\u10D8\u10E1 \u10EC\u10D4\u10E0\u10E2\u10D8\u10DA\u10D0\u10D3?")) return;
      const copy = read3().map((c) => ({
        id: crypto.randomUUID(),
        name: c.name + " (\u10DE\u10E0\u10DD\u10D2\u10DC\u10DD\u10D6\u10D8)",
        credits: c.credits,
        score: c.score,
        virtual: true
      }));
      writeWhat([...readWhat(), ...copy]);
      refresh();
    });
    const actual = computeGPA(courses);
    const whatIf = readWhat();
    const combined = computeGPA([...courses, ...whatIf]);
    const tabBtn = (id, label) => `<button class="prof-tab ${tab === id ? "active" : ""}" onclick="__campus.gpaTab('${id}')">${label}</button>`;
    const actualPane = `
    <div class="grid grid-3" style="margin-top:18px">
      <div class="card stat tile-grad-1"><div class="stat-num">${actual.gpa4.toFixed(2)}</div><div class="stat-label">GPA (4.0)</div></div>
      <div class="card stat tile-grad-2"><div class="stat-num">${actual.avg100.toFixed(1)}</div><div class="stat-label">\u10E1\u10D0\u10E8\u10E3\u10D0\u10DA\u10DD (100)</div></div>
      <div class="card stat tile-grad-3"><div class="stat-num">${actual.totalCredits}</div><div class="stat-label">\u10E1\u10E3\u10DA \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</div></div>
    </div>

    <div class="card" style="margin-top:20px">
      <h3 style="margin-top:0">\u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</h3>
      <form onsubmit="__campus.gpaAdd(event)">
        <div class="grid grid-3">
          <div class="field"><label>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</label><input name="name" required placeholder="\u10DB\u10D0\u10D2. \u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10E3\u10E1\u10D8 I" /></div>
          <div class="field"><label>\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</label><input name="credits" type="number" min="1" max="30" required placeholder="6" /></div>
          <div class="field"><label>\u10E5\u10E3\u10DA\u10D0 (0-100)</label><input name="score" type="number" min="0" max="100" step="0.1" required placeholder="85" /></div>
        </div>
        <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
      </form>
    </div>

    ${courses.length ? `
      <div class="row between" style="margin-top:22px">
        <h2 class="section-title" style="margin:0">\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8</h2>
        <button class="btn btn-danger" onclick="__campus.gpaClear()" style="padding:6px 12px;font-size:13px">\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>
      </div>
      <div class="stack" style="margin-top:8px">
        ${courses.map((c) => `
          <div class="card">
            <div class="card-row">
              <div>
                <h3 style="margin:0">${c.name}</h3>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${c.credits} \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8 \xB7 \u10E5\u10E3\u10DA\u10D0 ${c.score}</p>
              </div>
              <div class="row">
                <span class="badge badge-primary">${letter(c.score)} \xB7 ${to4(c.score).toFixed(1)}</span>
                <button class="btn btn-danger" onclick="__campus.gpaDel('${c.id}')">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<p class="muted" style="margin-top:18px">\u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D2\u10D8\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D0\u10D7 \u2014 \u10D2\u10D0\u10DB\u10DD\u10D8\u10E7\u10D4\u10DC\u10D4\u10D7 \u10D6\u10D4\u10DB\u10DD\u10D7 \u10DB\u10DD\u10EA\u10D4\u10DB\u10E3\u10DA\u10D8 \u10E4\u10DD\u10E0\u10DB\u10D0.</p>`}
  `;
    const delta = whatIf.length || courses.length ? combined.gpa4 - actual.gpa4 : 0;
    const deltaColor = delta > 5e-3 ? "#16a34a" : delta < -5e-3 ? "#dc2626" : "var(--muted)";
    const deltaArrow = delta > 5e-3 ? "\u25B2" : delta < -5e-3 ? "\u25BC" : "\u2192";
    const whatPane = `
    <div class="card" style="margin-top:18px">
      <h3 style="margin-top:0">\u10E0\u10D0-\u10D7\u10E3 \u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8</h3>
      <p class="muted" style="font-size:13px;margin:0 0 4px">
        \u10DE\u10E0\u10DD\u10D2\u10DC\u10DD\u10D6\u10E3\u10DA\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8 \u2014 \u10E8\u10D4\u10D3\u10D4\u10D2\u10D8 \u10D4\u10E0\u10D7\u10D8\u10D0\u10DC\u10D3\u10D4\u10D1\u10D0 \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4 GPA-\u10E1\u10D7\u10D0\u10DC.
      </p>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        ${courses.length ? `<button type="button" class="btn btn-ghost" onclick="__campus.whatImport()">\u2913 \u10E0\u10D4\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D3\u10DB\u10DD\u10E2\u10D0\u10DC\u10D0</button>` : ""}
        ${whatIf.length ? `<button type="button" class="btn btn-danger" onclick="__campus.whatReset()" style="padding:6px 12px;font-size:13px">\u10D2\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0</button>` : ""}
      </div>
    </div>

    <div class="grid grid-3" style="margin-top:14px">
      <div class="card stat tile-grad-1"><div class="stat-num" id="whatGpa">${combined.gpa4.toFixed(2)}</div><div class="stat-label">\u10DE\u10E0\u10DD\u10D2\u10DC\u10DD\u10D6\u10E3\u10DA\u10D8 GPA</div></div>
      <div class="card stat tile-grad-2"><div class="stat-num" id="whatAvg">${combined.avg100.toFixed(1)}</div><div class="stat-label">\u10E1\u10D0\u10E8\u10E3\u10D0\u10DA\u10DD (100)</div></div>
      <div class="card stat tile-grad-3"><div class="stat-num" id="whatCred">${combined.totalCredits}</div><div class="stat-label">\u10E1\u10E3\u10DA \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</div></div>
    </div>

    <div class="card" style="margin-top:14px;text-align:center">
      <span class="muted" style="font-size:13px">\u10EA\u10D5\u10DA\u10D8\u10DA\u10D4\u10D1\u10D0 \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4 GPA-\u10E1\u10D7\u10D0\u10DC:</span>
      <span style="font-size:22px;font-weight:700;color:${deltaColor};margin-left:10px">
        ${deltaArrow} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}
      </span>
      <span class="muted" style="font-size:12px;margin-left:6px">(${actual.gpa4.toFixed(2)} \u2192 ${combined.gpa4.toFixed(2)})</span>
    </div>

    <div class="card" style="margin-top:18px">
      <h3 style="margin-top:0">\u10DE\u10E0\u10DD\u10D2\u10DC\u10DD\u10D6\u10E3\u10DA\u10D8 \u10E1\u10D0\u10D2\u10DC\u10D8\u10E1 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</h3>
      <form onsubmit="__campus.whatAdd(event)">
        <div class="grid grid-3">
          <div class="field"><label>\u10E1\u10D0\u10D2\u10D0\u10DC\u10D8</label><input name="name" required placeholder="\u10DB\u10D0\u10D2. \u10D0\u10DA\u10D2\u10DD\u10E0\u10D8\u10D7\u10DB\u10D4\u10D1\u10D8 II" /></div>
          <div class="field"><label>\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</label><input name="credits" type="number" min="1" max="30" required placeholder="5" /></div>
          <div class="field"><label>\u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 \u10E5\u10E3\u10DA\u10D0</label><input name="score" type="number" min="0" max="100" step="0.5" required placeholder="80" /></div>
        </div>
        <button class="btn btn-primary" type="submit">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D0</button>
      </form>
    </div>

    ${whatIf.length ? `
      <h2 class="section-title" style="margin-top:22px">\u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8\u10E1 \u10E1\u10D0\u10D2\u10DC\u10D4\u10D1\u10D8</h2>
      <div class="stack">
        ${whatIf.map((c) => `
          <div class="card">
            <div class="card-row" style="gap:12px;flex-wrap:wrap">
              <div style="min-width:160px;flex:1">
                <h3 style="margin:0">${c.name}</h3>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${c.credits} \u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10D8</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px;min-width:240px;flex:1">
                <input type="range" min="0" max="100" step="1" value="${c.score}"
                  oninput="document.getElementById('val_${c.id}').textContent=this.value;__campus.whatUpd('${c.id}',this.value)"
                  style="flex:1" />
                <span id="val_${c.id}" style="font-weight:700;min-width:34px;text-align:right">${c.score}</span>
                <span class="badge badge-primary">${letter(c.score)} \xB7 ${to4(c.score).toFixed(1)}</span>
                <button class="btn btn-danger" onclick="__campus.whatDel('${c.id}')" style="padding:4px 10px;font-size:12px">\u10EC\u10D0\u10E8\u10DA\u10D0</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<p class="muted" style="margin-top:18px">\u10DE\u10E0\u10DD\u10D2\u10DC\u10DD\u10D6\u10E3\u10DA\u10D8 \u10E1\u10D0\u10D2\u10D0\u10DC\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D2\u10D8\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D0.</p>`}
  `;
    return `
    <div class="row between" style="align-items:flex-end;flex-wrap:wrap;gap:12px">
      <div>
        <span class="badge badge-primary">\u{1F9EE} \u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10D0\u10E2\u10DD\u10E0\u10D8</span>
        <h1 style="margin:10px 0 4px">GPA \u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10D0\u10E2\u10DD\u10E0\u10D8</h1>
        <p class="muted">100-\u10E5\u10E3\u10DA\u10D8\u10D0\u10DC\u10D8 \u10E1\u10D8\u10E1\u10E2\u10D4\u10DB\u10D0 \xB7 4.0 \u10E1\u10D9\u10D0\u10DA\u10D0.</p>
      </div>
    </div>

    <div style="margin-top:14px">
      ${actualPane}
    </div>

    <div class="card" style="margin-top:24px">
      <h3 style="margin-top:0">\u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D9\u10D0\u10DA\u10D0</h3>
      <p class="muted" style="font-size:13px;line-height:1.7">
        A (91-100) \u2192 4.0 \xB7 B (81-90) \u2192 3.5 \xB7 C (71-80) \u2192 3.0 \xB7 D (61-70) \u2192 2.5 \xB7 E (51-60) \u2192 2.0 \xB7 FX/F (&lt;51) \u2192 0
      </p>
    </div>
  `;
  };

  // static-site/js/app.js
  init_schedule();
  init_news();
  init_academic();

  // static-site/js/views/onboarding.js
  init_data();
  init_auth();
  init_ui();
  init_router();
  var T3 = (k, v) => window.T ? window.T(k, v) : k;
  expose("onboardingSubmit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const uniId = (fd.get("uniId") || "").toString();
    const facultyId = (fd.get("facultyId") || "").toString();
    if (!uniId || !facultyId) {
      showToast(T3("onb.toast.choose"));
      return;
    }
    try {
      await updateProfileData({ uniId, facultyId });
      showToast(T3("onb.toast.saved"));
      navigate("/");
    } catch (err) {
      showToast(err.message || T3("onb.toast.err"));
    }
  });
  var siblingUniIds = (uniId) => {
    const me = universities.find((u) => u.id === uniId);
    if (!me) return [uniId];
    const nm = (me.name || "").trim().toLowerCase();
    if (!nm) return [uniId];
    return universities.filter((u) => (u.name || "").trim().toLowerCase() === nm).map((u) => u.id);
  };
  var facultiesForUniName = (uniId) => {
    const ids = new Set(siblingUniIds(uniId));
    return dedupBy(faculties.filter((f) => ids.has(f.uniId)), "name");
  };
  expose("onboardingUniChange", (sel) => {
    const facSel = document.getElementById("ob-fac");
    const opts = facultiesForUniName(sel.value);
    facSel.innerHTML = `<option value="">${T3("onb.opt.pickFac")}</option>` + opts.map((f) => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("");
    facSel.disabled = opts.length === 0;
  });
  var dedupBy = (arr, key) => {
    const seen = /* @__PURE__ */ new Set();
    return arr.filter((x) => {
      const k = (x?.[key] ?? "").toString().trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  var onboardingView = () => {
    const p = getProfile();
    const name = getFirstName();
    const currentUni = p?.uniId || "";
    const uniList = dedupBy(universities, "name");
    const initialFacs = currentUni ? facultiesForUniName(currentUni) : [];
    return `
    <section class="auth-card" style="max-width:540px;margin:40px auto">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:42px">\u{1F393}</div>
        <h1 style="margin:8px 0 4px">${T3("onb.hello", { name: escapeHtml(name) })}</h1>
        <p class="muted" style="margin:0">${T3("onb.sub")}</p>
        <p class="muted" style="margin:8px 0 0;font-size:12px">${T3("onb.warn")}</p>
      </div>

      <form onsubmit="__campus.onboardingSubmit(event)" class="stack" style="gap:14px">
        <label class="field">
          <span>${T3("onb.label.uni")}</span>
          <select name="uniId" required onchange="__campus.onboardingUniChange(this)">
            <option value="">${T3("onb.opt.pickUni")}</option>
            ${uniList.map((u) => `<option value="${u.id}" ${u.id === currentUni ? "selected" : ""}>${escapeHtml(u.name)} \u2014 ${escapeHtml(u.city || "")}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>${T3("onb.label.fac")}</span>
          <select name="facultyId" id="ob-fac" required ${initialFacs.length ? "" : "disabled"}>
            <option value="">${initialFacs.length ? T3("onb.opt.pickFac") : T3("onb.opt.pickUniFirst")}</option>
            ${initialFacs.map((f) => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("")}
          </select>
        </label>
        <button class="btn btn-primary" type="submit" style="margin-top:6px">${T3("onb.submit")}</button>
      </form>
    </section>
  `;
  };

  // static-site/js/views/lecturers.js
  init_firebase();
  init_auth();
  init_ui();
  init_router();
  var _cache = null;
  var loadAll = async () => {
    if (_cache) return _cache;
    if (!firebaseEnabled) return { lecturers: [], ratings: [] };
    const fb = await loadFirebase();
    const [lSnap, rSnap] = await Promise.all([
      fb.getDocs(fb.collection(fb.db, "lecturers")),
      fb.getDocs(fb.collection(fb.db, "lecturerRatings"))
    ]);
    _cache = {
      lecturers: lSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      ratings: rSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    };
    setTimeout(() => {
      try {
        refresh();
      } catch {
      }
    }, 0);
    return _cache;
  };
  var invalidate = () => {
    _cache = null;
  };
  var currentSemester = () => {
    const d = /* @__PURE__ */ new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    return m < 6 ? `Spring ${y}` : `Fall ${y}`;
  };
  var lecturersView = async () => {
    const user = getUser();
    const profile = getProfile();
    const data = await loadAll();
    const { lecturers, ratings } = data;
    const byLect = {};
    ratings.forEach((r) => {
      if (!byLect[r.lecturerId]) byLect[r.lecturerId] = [];
      byLect[r.lecturerId].push(r);
    });
    Object.values(byLect).forEach((arr) => arr.sort((a, b) => {
      const ta = a.createdAt?.seconds || 0, tb = b.createdAt?.seconds || 0;
      return tb - ta;
    }));
    expose("lectOpenRate", (lectId) => {
      if (!user) return showToast("\u10D2\u10D7\u10EE\u10DD\u10D5 \u10E8\u10D4\u10EE\u10D5\u10D8\u10D3\u10D4");
      const lect = lecturers.find((l) => l.id === lectId);
      if (!lect) return;
      const card = document.getElementById("modalCard");
      const back = document.getElementById("modalBackdrop");
      const sem = currentSemester();
      card.innerHTML = `
      <div class="modal-head">
        <h3>\u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8: ${escapeHtml(lect.name)}</h3>
        <button class="btn-icon" data-close>\u2715</button>
      </div>
      <form class="modal-body" onsubmit="__campus.lectSubmit(event, '${lect.id}')">
        <div class="field"><label>\u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8</label><input name="semester" value="${sem}" /></div>
        <div class="field"><label>\u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8 (\u10D0\u10DC\u10DD\u10DC\u10D8\u10DB\u10E3\u10E0\u10D8) *</label>
          <textarea name="comment" rows="4" required minlength="5" maxlength="600" placeholder="\u10E0\u10D0 \u10DB\u10DD\u10D2\u10D4\u10EC\u10DD\u10DC\u10D0? \u10E0\u10D0 \u10E8\u10D4\u10D8\u10EB\u10DA\u10D4\u10D1\u10D0 \u10D2\u10D0\u10E3\u10DB\u10EF\u10DD\u10D1\u10D4\u10E1\u10D3\u10D4\u10E1?"></textarea>
        </div>
        <button class="btn btn-primary" type="submit">\u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0</button>
      </form>`;
      back.hidden = false;
      const close2 = () => {
        back.hidden = true;
        card.innerHTML = "";
      };
      card.querySelector("[data-close]").addEventListener("click", close2);
      back.addEventListener("click", (e) => {
        if (e.target === back) close2();
      });
    });
    expose("lectSubmit", async (e, lectId) => {
      e.preventDefault();
      if (!firebaseEnabled || !user) return;
      if (isBlockedUser()) {
        showToast("\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8\u10D0 \u2014 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D0 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10E3\u10DA\u10D8\u10D0");
        return;
      }
      const f = new FormData(e.target);
      const comment = (f.get("comment") || "").toString().trim();
      if (comment.length < 5) {
        showToast("\u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8 \u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8\u10D0");
        return;
      }
      const fb = await loadFirebase();
      try {
        await fb.addDoc(fb.collection(fb.db, "lecturerRatings"), {
          lecturerId: lectId,
          studentId: user.uid,
          studentEmail: user.email || "",
          facultyId: profile?.facultyId || "",
          semester: (f.get("semester") || "").toString().trim() || currentSemester(),
          rating: 0,
          comment,
          createdAt: fb.serverTimestamp()
        });
        document.getElementById("modalBackdrop").hidden = true;
        showToast("\u10DB\u10D0\u10D3\u10DA\u10DD\u10D1\u10D0 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1!");
        invalidate();
        refresh();
      } catch (err) {
        showToast("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err.message || err));
      }
    });
    if (!firebaseEnabled) {
      return `<div class="empty"><div class="ico">\u26A0\uFE0F</div>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D8\u10D0 \u10DB\u10DD\u10D8\u10D7\u10EE\u10DD\u10D5\u10E1 Firebase-\u10D8\u10E1 \u10D9\u10DD\u10DC\u10E4\u10D8\u10D2\u10E3\u10E0\u10D0\u10EA\u10D8\u10D0\u10E1.</div>`;
    }
    const facId = profile?.facultyId || "";
    let shown = lecturers;
    if (facId) {
      const mine = lecturers.filter((l) => l.facultyId === facId);
      if (mine.length) shown = mine;
    }
    shown = [...shown].sort((a, b) => (byLect[b.id]?.length || 0) - (byLect[a.id]?.length || 0));
    return `
    <h1>\u{1F468}\u200D\u{1F3EB} \u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8</h1>
    <p class="muted">\u10E1\u10E2\u10E3\u10D3\u10D4\u10DC\u10E2\u10D7\u10D0 \u10D0\u10DC\u10DD\u10DC\u10D8\u10DB\u10E3\u10E0\u10D8 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8. \u10D3\u10D0\u10E2\u10DD\u10D5\u10D4 \u10E3\u10D9\u10E3\u10D9\u10D0\u10D5\u10E8\u10D8\u10E0\u10D8 \u10E1\u10D4\u10DB\u10D4\u10E1\u10E2\u10E0\u10D8\u10E1 \u10D1\u10DD\u10DA\u10DD\u10E1.</p>
    ${shown.length ? `<div class="grid grid-2" style="margin-top:18px">
      ${shown.map((l) => {
      const comments = byLect[l.id] || [];
      const n = comments.length;
      const preview = comments.slice(0, 2);
      return `<div class="card">
          <div class="row between" style="gap:10px;align-items:flex-start">
            <div style="min-width:0;flex:1">
              <h3 style="margin:0">${escapeHtml(l.name)}</h3>
              <p class="muted" style="margin:2px 0 0;font-size:13px">${escapeHtml(l.title || "")}${l.subject ? ` \xB7 ${escapeHtml(l.subject)}` : ""}</p>
              ${l.bio ? `<p style="margin:8px 0 0;font-size:13px">${escapeHtml(l.bio)}</p>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:22px;font-weight:700">\u{1F4AC} ${n}</div>
              <div class="muted" style="font-size:11px">\u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8</div>
            </div>
          </div>
          ${preview.length ? `<div class="stack" style="margin-top:10px;gap:8px">
            ${preview.map((c) => `<div class="card" style="padding:8px 10px;background:var(--bg);font-size:13px">
              <div style="white-space:pre-wrap">${escapeHtml((c.comment || "").slice(0, 220))}${(c.comment || "").length > 220 ? "\u2026" : ""}</div>
              <div class="muted" style="font-size:11px;margin-top:4px">${escapeHtml(c.semester || "")}</div>
            </div>`).join("")}
          </div>` : ""}
          <div class="row" style="gap:6px;margin-top:10px">
            <button class="btn btn-primary" style="flex:1" onclick="__campus.lectOpenRate('${l.id}')">\u270D\uFE0F \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8\u10E1 \u10D3\u10D0\u10E2\u10DD\u10D5\u10D4\u10D1\u10D0</button>
            ${user ? `<button class="btn btn-ghost" title="\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D8\u10E1 \u10E8\u10D4\u10E1\u10D0\u10EE\u10D4\u10D1 \u10EA\u10E0\u10E3/\u10D0\u10D2\u10E0\u10D4\u10E1\u10D8\u10E3\u10DA\u10D8 \u10E8\u10D8\u10DC\u10D0\u10D0\u10E0\u10E1\u10D8\u10E1 \u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0" style="padding:8px 12px" onclick="__campus.report('lecturerRating','${l.id}',${JSON.stringify(l.name || "").replace(/'/g, "&#39;")})">\u2691</button>` : ""}
          </div>
        </div>`;
    }).join("")}
    </div>` : `<div class="empty"><div class="ico">\u{1F4ED}</div>\u10DA\u10D4\u10E5\u10E2\u10DD\u10E0\u10D4\u10D1\u10D8 \u10EF\u10D4\u10E0 \u10D0\u10E0 \u10D3\u10D0\u10D4\u10DB\u10D0\u10E2\u10D0.</div>`}`;
  };

  // static-site/js/views/chats.js
  init_firebase();
  init_auth();
  init_ui();
  init_router();

  // static-site/js/notifications.js
  var clearUnread = () => {
  };
  var ensureForumSub = () => {
  };

  // static-site/js/views/chats.js
  var chatIdFor = (facultyId, subjectId) => `${facultyId}__${subjectId}`;
  var fmtTs = (ts) => {
    if (!ts) return "";
    let d;
    if (ts?.toDate) d = ts.toDate();
    else if (ts?.seconds) d = new Date(ts.seconds * 1e3);
    else d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("ka-GE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
  };
  var _subjectsCache = null;
  var _subjectsCacheFor = null;
  var _allSubsCache = null;
  var _allFacsCache = null;
  var loadFacultySubjects = async (facultyId) => {
    if (!facultyId) return [];
    if (_subjectsCacheFor === facultyId && _subjectsCache) return _subjectsCache;
    const fb = await loadFirebase();
    const snap = await fb.getDocs(fb.collection(fb.db, "subjects"));
    const list2 = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.facultyId === facultyId);
    _subjectsCache = list2;
    _subjectsCacheFor = facultyId;
    setTimeout(() => {
      try {
        refresh();
      } catch {
      }
    }, 0);
    return list2;
  };
  var loadAllSubjectsAndFaculties = async () => {
    if (_allSubsCache && _allFacsCache) return { subs: _allSubsCache, facs: _allFacsCache };
    const fb = await loadFirebase();
    const [s, f] = await Promise.all([
      fb.getDocs(fb.collection(fb.db, "subjects")),
      fb.getDocs(fb.collection(fb.db, "faculties"))
    ]);
    _allSubsCache = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    _allFacsCache = f.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTimeout(() => {
      try {
        refresh();
      } catch {
      }
    }, 0);
    return { subs: _allSubsCache, facs: _allFacsCache };
  };
  var chatsView = async () => {
    const user = getUser();
    const profile = getProfile();
    const admin = isAdminUser();
    const T4 = window.T || ((k) => k);
    if (!firebaseEnabled) return `<div class="empty"><div class="ico">\u26A0\uFE0F</div>${T4("forum.required.firebase")}</div>`;
    if (!user) return `<div class="empty"><div class="ico">\u{1F512}</div>${T4("forum.required.auth")}</div>`;
    if (admin) {
      loadAllSubjectsAndFaculties();
      const subs2 = _allSubsCache || [];
      const facs = _allFacsCache || [];
      const facMap = Object.fromEntries(facs.map((f) => [f.id, f.name]));
      const groups = {};
      subs2.forEach((s) => {
        (groups[s.facultyId] ||= []).push(s);
      });
      const facIds = Object.keys(groups).sort((a, b) => (facMap[a] || "").localeCompare(facMap[b] || "", "ka"));
      return `
      <h1>${T4("forum.admin.title")} <span class="badge badge-primary">${T4("forum.admin.badge")}</span></h1>
      <p class="muted">${T4("forum.admin.sub")}</p>
      ${facIds.length ? facIds.map((fid) => `
        <h2 style="margin:22px 0 10px;font-size:16px">\u{1F3DB} ${escapeHtml(facMap[fid] || fid)}</h2>
        <div class="grid grid-2">
          ${groups[fid].sort((a, b) => (a.name || "").localeCompare(b.name || "", "ka")).map((s) => {
        const cid = chatIdFor(fid, s.id);
        return `<a class="card forum-card" href="#/chat/${encodeURIComponent(cid)}" style="text-decoration:none;color:inherit;padding:12px 14px">
              <div class="row between" style="gap:10px">
                <div style="min-width:0">
                  <h3 style="margin:0;font-size:14px;font-weight:700">\u{1F4D8} ${escapeHtml(s.name)}</h3>
                  <p class="muted" style="margin:3px 0 0;font-size:11.5px">${escapeHtml(s.code || "")}${s.lecturer ? ` \xB7 ${escapeHtml(s.lecturer)}` : ""}</p>
                </div>
                <span class="badge badge-primary" style="font-size:11px">${T4("forum.card.enter")}</span>
              </div>
            </a>`;
      }).join("")}
        </div>
      `).join("") : `<div class="empty"><div class="ico">\u{1F4ED}</div>${T4("forum.empty.subjects")}</div>`}
    `;
    }
    if (!profile?.facultyId) return `<div class="empty"><div class="ico">\u{1F393}</div>${T4("forum.faculty.required")} <a href="#/onboarding" class="btn btn-primary" style="margin-top:14px">${T4("forum.faculty.cta")}</a></div>`;
    loadFacultySubjects(profile.facultyId);
    const subs = (_subjectsCacheFor === profile.facultyId ? _subjectsCache : null) || [];
    return `
    <h1>${T4("forum.list.title")}</h1>
    <p class="muted">${T4("forum.list.sub")}</p>


    ${subs.length ? `<div class="grid grid-2" style="margin-top:18px">
      ${[...subs].sort((a, b) => (a.name || "").localeCompare(b.name || "", "ka")).map((s) => {
      const cid = chatIdFor(profile.facultyId, s.id);
      return `<a class="card forum-card" href="#/chat/${encodeURIComponent(cid)}" style="text-decoration:none;color:inherit;padding:12px 14px">
          <div class="row between" style="gap:10px">
            <div style="min-width:0">
              <h3 style="margin:0;font-size:14px;font-weight:700">\u{1F4D8} ${escapeHtml(s.name)}</h3>
              <p class="muted" style="margin:3px 0 0;font-size:11.5px">${escapeHtml(s.code || "")}${s.lecturer ? ` \xB7 ${escapeHtml(s.lecturer)}` : ""}</p>
            </div>
            <span class="badge badge-primary" style="font-size:11px">${T4("forum.card.enter")}</span>
          </div>
        </a>`;
    }).join("")}
    </div>` : `<div class="empty" style="margin-top:18px"><div class="ico">\u{1F4ED}</div>${T4("forum.list.empty")}</div>`}
  `;
  };
  var _unsub = null;
  var _metaUnsub = null;
  var _msgs = [];
  var _meta = null;
  var _activeChatId = null;
  var _knownUserIds = null;
  var msgUid = (m) => m.senderId || m.uid || m.userId || "";
  var detachListener = () => {
    if (_unsub) {
      try {
        _unsub();
      } catch {
      }
    }
    if (_metaUnsub) {
      try {
        _metaUnsub();
      } catch {
      }
    }
    _unsub = null;
    _metaUnsub = null;
    _msgs = [];
    _meta = null;
    _activeChatId = null;
  };
  window.addEventListener("hashchange", () => {
    if (!location.hash.startsWith("#/chat/")) detachListener();
  });
  var ensureChatDoc = async (fb, chatId, facultyId, subjectId, subjectName, user, profile) => {
    const ref = fb.doc(fb.db, "subjectChats", chatId);
    const snap = await fb.getDoc(ref);
    const dn = getDisplayName();
    const me = {
      name: dn,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || user.email || "",
      joinedAt: Date.now()
    };
    if (!snap.exists()) {
      await fb.setDoc(ref, {
        chatId,
        facultyId,
        subjectId,
        subjectName: subjectName || "",
        createdAt: fb.serverTimestamp(),
        participants: { [user.uid]: me }
      });
    } else {
      const data = snap.data();
      const existing = data.participants?.[user.uid];
      if (!existing || !existing.email || !existing.lastName) {
        await fb.setDoc(ref, {
          participants: { ...data.participants || {}, [user.uid]: me }
        }, { merge: true });
      }
    }
  };
  var attachListener = async (chatId) => {
    const fb = await loadFirebase();
    try {
      const usersSnap = await fb.getDocs(fb.collection(fb.db, "users"));
      _knownUserIds = new Set(usersSnap.docs.map((d) => d.id));
    } catch (e) {
      console.warn("chat users filter", e);
      _knownUserIds = null;
    }
    const msgsCol = fb.collection(fb.db, "subjectChats", chatId, "messages");
    const q2 = fb.query(msgsCol, fb.orderBy("createdAt", "asc"), fb.limit(200));
    _unsub = fb.onSnapshot(q2, (snap) => {
      _msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((m) => !_knownUserIds || _knownUserIds.has(msgUid(m)));
      renderMessagesIntoDOM();
    }, (err) => {
      console.warn("chat messages", err);
      const box = document.getElementById("chatMsgs");
      if (box) box.innerHTML = `<p class="muted" style="text-align:center;padding:32px">${(window.T || ((k) => k))("forum.msgs.loadFail", { err: escapeHtml(err?.message || err) })}</p>`;
    });
    const metaRef = fb.doc(fb.db, "subjectChats", chatId);
    _metaUnsub = fb.onSnapshot(metaRef, (s) => {
      if (s.exists()) {
        _meta = s.data();
        const parts = _meta.participants || {};
        const count = Object.keys(parts).length;
        const cEl = document.getElementById("chatPartCount");
        if (cEl) cEl.textContent = count;
        const cEl2 = document.getElementById("chatPartCount2");
        if (cEl2) cEl2.textContent = count;
        renderParticipantsIntoDOM();
      }
    });
  };
  var renderParticipantsIntoDOM = () => {
    const box = document.getElementById("chatParts");
    if (!box) return;
    const parts = _meta?.participants || {};
    const entries = Object.entries(parts).filter(([uid]) => !_knownUserIds || _knownUserIds.has(uid)).sort((a, b) => {
      const an = `${a[1].firstName || ""} ${a[1].lastName || ""}`.trim() || a[1].name || "";
      const bn = `${b[1].firstName || ""} ${b[1].lastName || ""}`.trim() || b[1].name || "";
      return an.localeCompare(bn, "ka");
    });
    const myUid = getUser()?.uid;
    const admin = canModerate();
    const T4 = window.T || ((k) => k);
    box.innerHTML = entries.length ? entries.map(([uid, p]) => {
      const full = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || T4("forum.parts.unknown");
      const initials = ((p.firstName?.[0] || p.name?.[0] || "?") + (p.lastName?.[0] || "")).toUpperCase();
      const me = uid === myUid ? ` <span class="muted" style="font-size:11px">${T4("forum.parts.you")}</span>` : "";
      const kickBtn = admin && uid !== myUid ? `<button type="button" class="chat-part-kick" title="${T4("forum.parts.kickTitle")}" onclick="event.stopPropagation();__campus.chatKickParticipant('${escapeHtml(uid)}','${escapeHtml(full).replace(/'/g, "&#39;")}')">\u26D4</button>` : "";
      return `<div class="chat-part-row" style="display:flex;align-items:center;gap:6px">
      <button type="button" class="chat-part" style="flex:1;min-width:0" onclick="__campus.chatShowMember('${escapeHtml(uid)}')">
        <span class="chat-part-av">${escapeHtml(initials)}</span>
        <span class="chat-part-name">${escapeHtml(full)}${me}</span>
      </button>
      ${kickBtn}
    </div>`;
    }).join("") : `<p class="muted" style="padding:10px;font-size:12px">${T4("forum.parts.empty")}</p>`;
  };
  var renderMessagesIntoDOM = () => {
    const box = document.getElementById("chatMsgs");
    if (!box) return;
    const user = getUser();
    const myUid = user?.uid;
    const admin = canModerate();
    const T4 = window.T || ((k) => k);
    const DELETE_WINDOW_MS = 15 * 60 * 1e3;
    const now = Date.now();
    box.innerHTML = _msgs.length ? _msgs.map((m) => {
      const senderUid = msgUid(m);
      const mine = senderUid === myUid;
      const ts = m.createdAt && typeof m.createdAt.toMillis === "function" ? m.createdAt.toMillis() : m.createdAt instanceof Date ? m.createdAt.getTime() : 0;
      const withinWindow = ts > 0 && now - ts <= DELETE_WINDOW_MS;
      const canDelete = admin || mine && withinWindow;
      const safeText = escapeHtml(m.text || "");
      const reportArg = `'forumMessage','${_activeChatId}::${m.id}',${JSON.stringify((m.text || "").slice(0, 180)).replace(/'/g, "&#39;")}`;
      const delBtn = canDelete ? `<button type="button" class="chat-msg-del chat-msg-del-left" title="${T4("forum.msg.delTitle")}" onclick="__campus.chatDelMsg('${escapeHtml(m.id)}')">\u{1F5D1}</button>` : "";
      const reportBtn = !mine ? `<button type="button" class="chat-msg-del" title="${T4("forum.msg.reportTitle")}" onclick="__campus.report(${reportArg})">\u2691</button>` : "";
      return `<div class="chat-msg ${mine ? "mine" : "other"}">
      ${mine ? "" : `<div class="chat-msg-name" style="cursor:pointer" onclick="__campus.chatShowMember('${escapeHtml(senderUid)}')">${escapeHtml(m.senderName || T4("forum.msg.unknownSender"))}</div>`}
      <div class="chat-msg-row">${delBtn}<div class="chat-msg-bubble">${safeText}${reportBtn}</div></div>
      <div class="chat-msg-time">${fmtTs(m.createdAt)}</div>
    </div>`;
    }).join("") : `<p class="muted" style="text-align:center;padding:32px">${T4("forum.msgs.empty")}</p>`;
    box.scrollTop = box.scrollHeight;
  };
  var chatRoomView = async (params) => {
    const chatId = decodeURIComponent(params.chatId || "");
    const user = getUser();
    const profile = getProfile();
    const T4 = window.T || ((k, v) => k);
    if (!firebaseEnabled) return `<div class="empty"><div class="ico">\u26A0\uFE0F</div>${T4("forum.room.firebase")}</div>`;
    if (!user) return `<div class="empty"><div class="ico">\u{1F512}</div>${T4("forum.room.signin")}</div>`;
    if (!profile?.facultyId && !isAdminUser()) return `<div class="empty"><div class="ico">\u{1F393}</div>${T4("forum.faculty.required")}</div>`;
    const [facultyId, subjectId] = chatId.split("__");
    if (!facultyId || !subjectId) return `<div class="empty">${T4("forum.room.invalidId")}</div>`;
    const admin = isAdminUser();
    if (!admin && profile.facultyId !== facultyId) {
      return `<div class="empty"><div class="ico">\u{1F6AB}</div>${T4("forum.room.accessDenied")}</div>`;
    }
    await loadFacultySubjects(facultyId);
    const subj = (_subjectsCache || []).find((s) => s.id === subjectId);
    const subjectName = subj?.name || subjectId;
    const fb = await loadFirebase();
    try {
      if (admin) {
        const ref = fb.doc(fb.db, "subjectChats", chatId);
        const snap = await fb.getDoc(ref);
        if (!snap.exists()) {
          await fb.setDoc(ref, {
            chatId,
            facultyId,
            subjectId,
            subjectName: subjectName || "",
            createdAt: fb.serverTimestamp(),
            participants: {}
          });
        }
      } else {
        await ensureChatDoc(fb, chatId, facultyId, subjectId, subjectName, user, profile);
      }
    } catch (err) {
      return `<div class="empty"><div class="ico">\u26A0\uFE0F</div>${T4("forum.room.loadFail", { err: escapeHtml(err.message || "") })}</div>`;
    }
    if (!admin) {
      ensureForumSub(chatId, subjectName);
      clearUnread(chatId);
    }
    if (_activeChatId !== chatId) {
      detachListener();
      _activeChatId = chatId;
      attachListener(chatId).catch((e) => console.warn("listener", e));
    }
    expose("chatSend", async (e) => {
      e.preventDefault();
      const input2 = e.target.elements.text;
      const text = (input2.value || "").trim();
      if (!text) return;
      if (isBlockedUser()) {
        showToast("\u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8 \u10D3\u10D0\u10D1\u10DA\u10DD\u10D9\u10D8\u10DA\u10D8\u10D0 \u2014 \u10EC\u10D4\u10E0\u10D0 \u10E8\u10D4\u10D6\u10E6\u10E3\u10D3\u10E3\u10DA\u10D8\u10D0");
        return;
      }
      const fb2 = await loadFirebase();
      try {
        await fb2.addDoc(fb2.collection(fb2.db, "subjectChats", chatId, "messages"), {
          senderId: user.uid,
          uid: user.uid,
          senderName: getDisplayName(),
          text,
          createdAt: fb2.serverTimestamp()
        });
        input2.value = "";
        input2.focus();
      } catch (err) {
        showToast(T4("forum.send.fail", { err: err.message || err }));
      }
    });
    expose("chatKickParticipant", async (uid, name) => {
      if (!uid) return;
      if (!isAdminUser()) {
        showToast(T4("forum.kick.adminOnly"));
        return;
      }
      if (!confirm(T4("forum.kick.confirm", { name: name || uid }))) return;
      const fb2 = await loadFirebase();
      try {
        try {
          const col = fb2.collection(fb2.db, "subjectChats", chatId, "messages");
          const bySender = await fb2.getDocs(fb2.query(col, fb2.where("senderId", "==", uid)));
          const byUid = await fb2.getDocs(fb2.query(col, fb2.where("uid", "==", uid)));
          const refs = /* @__PURE__ */ new Map();
          bySender.docs.forEach((d) => refs.set(d.id, d.ref));
          byUid.docs.forEach((d) => refs.set(d.id, d.ref));
          await Promise.all([...refs.values()].map((ref2) => fb2.deleteDoc(ref2)));
        } catch (e) {
          console.warn("kick: msgs", e);
        }
        const ref = fb2.doc(fb2.db, "subjectChats", chatId);
        const snap = await fb2.getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const np = { ...data.participants || {} };
          delete np[uid];
          await fb2.setDoc(ref, { participants: np }, { merge: true });
        }
        showToast(T4("forum.kick.ok"));
      } catch (err) {
        showToast(T4("forum.kick.fail", { err: err?.message || err }));
      }
    });
    expose("chatDelMsg", async (msgId) => {
      if (!msgId) return;
      if (!confirm(T4("forum.del.confirm"))) return;
      const fb2 = await loadFirebase();
      try {
        await fb2.deleteDoc(fb2.doc(fb2.db, "subjectChats", chatId, "messages", msgId));
        showToast(T4("forum.del.ok"));
      } catch (err) {
        showToast(T4("forum.del.fail", { err: err.message || err }));
      }
    });
    expose("chatShowMember", (uid) => {
      const p = _meta?.participants?.[uid];
      if (!p || _knownUserIds && !_knownUserIds.has(uid)) {
        showToast(T4("forum.member.notFound"));
        return;
      }
      const full = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || T4("forum.parts.unknown");
      const email = p.email || "";
      const initials = ((p.firstName?.[0] || p.name?.[0] || "?") + (p.lastName?.[0] || "")).toUpperCase();
      const html = `
      <div class="modal-backdrop" onclick="if(event.target===this)__campus.chatCloseMember()">
        <div class="modal-card" style="max-width:380px">
          <div style="text-align:center;padding:8px 0 14px">
            <div class="chat-part-av" style="width:64px;height:64px;font-size:24px;margin:0 auto 10px">${escapeHtml(initials)}</div>
            <h3 style="margin:0">${escapeHtml(full)}</h3>
            ${p.firstName ? `<p class="muted" style="margin:6px 0 0;font-size:13px">${T4("forum.member.fn")}: <b>${escapeHtml(p.firstName)}</b></p>` : ""}
            ${p.lastName ? `<p class="muted" style="margin:2px 0 0;font-size:13px">${T4("forum.member.ln")}: <b>${escapeHtml(p.lastName)}</b></p>` : ""}
            ${email ? `<p class="muted" style="margin:8px 0 0;font-size:13px">\u{1F4E7} <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : `<p class="muted" style="margin:8px 0 0;font-size:13px">${T4("forum.member.noEmail")}</p>`}
          </div>
          <div class="row" style="gap:8px;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" onclick="__campus.chatCloseMember()">${T4("forum.member.close")}</button>
            ${email ? `<a class="btn btn-primary" href="mailto:${escapeHtml(email)}">${T4("forum.member.sendMail")}</a>` : ""}
          </div>
        </div>
      </div>`;
      const host = document.getElementById("chatMemberModal");
      if (host) host.innerHTML = html;
    });
    expose("chatCloseMember", () => {
      const host = document.getElementById("chatMemberModal");
      if (host) host.innerHTML = "";
    });
    const partCount = _meta?.participants ? Object.keys(_meta.participants).length : "\u2014";
    setTimeout(() => {
      renderMessagesIntoDOM();
      renderParticipantsIntoDOM();
    }, 50);
    return `
    <div class="chat-layout">
      <aside class="chat-sidebar">
        <div class="chat-sidebar-head">
          <h3 style="margin:0;font-size:14px">${T4("forum.parts.title")} (<span id="chatPartCount2">${partCount}</span>)</h3>
        </div>
        <div id="chatParts" class="chat-parts"></div>
      </aside>

      <div class="chat-shell">
        <header class="chat-head">
          <a href="#/chats" class="btn btn-ghost" style="padding:4px 10px">${T4("forum.back")}</a>
          <div style="flex:1;min-width:0">
            <h2 style="margin:0;font-size:17px">\u{1F4D8} ${escapeHtml(subjectName)}</h2>
            <p class="muted" style="margin:2px 0 0;font-size:12px">
              <span id="chatPartCount">${partCount}</span> ${T4("forum.head.partsSuffix")} \xB7 ${escapeHtml(subj?.code || "")}
            </p>
          </div>
        </header>

        <div id="chatMsgs" class="chat-msgs"></div>

        <form class="chat-composer" onsubmit="__campus.chatSend(event)">
          <input name="text" required maxlength="2000" autocomplete="off" placeholder="${T4("forum.composer.placeholder")}" />
          <button class="btn btn-primary" type="submit">${T4("forum.composer.send")}</button>
        </form>
      </div>
    </div>
    <div id="chatMemberModal"></div>
  `;
  };

  // static-site/js/views/faq.js
  init_faq();
  init_auth();
  init_ui();
  var faqView = async () => {
    const profile = getProfile();
    const isAdm = isAdminUser();
    let items = [];
    try {
      items = await listFaqFor(profile, isAdm);
    } catch (e) {
      console.warn("faq load", e);
    }
    const byTopic = items.reduce((acc, f) => {
      (acc[f.topic] ||= []).push(f);
      return acc;
    }, {});
    const topics = Object.keys(byTopic).sort((a, b) => a.localeCompare(b, "ka"));
    const scopeBadge = (f) => {
      if (!isAdm) return "";
      if (f.scope === "all") return `<span class="chip" style="font-size:11px">\u10E7\u10D5\u10D4\u10DA\u10D0</span>`;
      if (f.scope === "uni") return `<span class="chip" style="font-size:11px">\u10E3\u10DC\u10D8: ${escapeHtml(f.uniId)}</span>`;
      if (f.scope === "faculty") return `<span class="chip" style="font-size:11px">\u10E4\u10D0\u10D9: ${escapeHtml(f.facultyId)}</span>`;
      return "";
    };
    return `
    <div class="crumbs"><a href="#/">${T("faq.crumbs.home")}</a> / ${T("faq.crumbs.self")}</div>
    <h1>${T("faq.page.title")}</h1>
    <p class="muted">${T("faq.page.sub")}</p>

    ${topics.length ? topics.map((t) => `
      <section style="margin-top:22px">
        <h2 style="margin:0 0 10px;font-size:17px">${escapeHtml(t)}</h2>
        <div class="stack" style="gap:8px">
          ${byTopic[t].map((f) => `
            <details class="card faq-item">
              <summary style="cursor:pointer;font-weight:600;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span>${escapeHtml(f.title)}</span>
                ${scopeBadge(f)}
              </summary>
              <div style="margin-top:10px;line-height:1.7;white-space:pre-wrap">${escapeHtml(f.body)}</div>
            </details>
          `).join("")}
        </div>
      </section>
    `).join("") : `<div class="empty"><div class="ico">\u{1F4ED}</div>${T("faq.empty")}</div>`}
  `;
  };

  // static-site/js/app.js
  var hashPath = () => (location.hash || "#/").slice(1).split("?")[0];
  setTheme(getTheme());
  var themeBtn = document.getElementById("themeBtn");
  var setIcon = () => themeBtn.textContent = getTheme() === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
  setIcon();
  themeBtn.addEventListener("click", () => {
    toggleTheme();
    setIcon();
  });
  document.getElementById("year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
  window.__campus = window.__campus || {};
  window.__campus.logout = async () => {
    await logout();
    navigate("/login");
  };
  window.__campus.report = (type, targetId, contextText, extra) => {
    if (!getUser()) {
      location.hash = "#/login";
      return;
    }
    const host = document.getElementById("reportModalHost") || (() => {
      const d = document.createElement("div");
      d.id = "reportModalHost";
      document.body.appendChild(d);
      return d;
    })();
    const ctx = String(contextText || "").slice(0, 220);
    const meta2 = REPORT_TYPES[type];
    if (!meta2) return;
    host.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this)__campus.reportClose()">
      <div class="modal-card" style="max-width:440px">
        <h3 style="margin:0 0 4px">\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0</h3>
        <p class="muted" style="margin:0 0 12px;font-size:13px">\u10DD\u10D1\u10D8\u10D4\u10E5\u10E2\u10D8: <b>${meta2.label}</b></p>
        ${ctx ? `<div class="card" style="background:var(--bg);padding:10px 12px;margin-bottom:12px;font-size:13px;color:var(--ink-secondary,var(--muted));max-height:120px;overflow:auto">${ctx.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c])}</div>` : ""}
        <form onsubmit="__campus.reportSubmit(event,'${type}','${String(targetId).replace(/'/g, "\\'")}',${extra ? JSON.stringify(extra).replace(/'/g, "&#39;") : "null"})">
          <div class="field">
            <label style="font-size:12px;color:var(--muted)">\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D8\u10D6\u10D4\u10D6\u10D8</label>
            <select name="reason" required style="width:100%">
              ${REPORT_REASONS.map((r) => `<option value="${r}">${r}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label style="font-size:12px;color:var(--muted)">\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D7\u10D8 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8 (\u10D0\u10E0\u10D0\u10E1\u10D0\u10D5\u10D0\u10DA\u10D3\u10D4\u10D1\u10E3\u10DA\u10DD)</label>
            <textarea name="note" rows="2" maxlength="300" placeholder="\u10EE\u10D0\u10DC\u10DB\u10DD\u10D9\u10DA\u10D4 \u10D0\u10EE\u10E1\u10DC\u10D0, \u10E0\u10D0 \u10E9\u10D0\u10D7\u10D5\u10D0\u10DA\u10D4\u10D7 \u10DE\u10E0\u10DD\u10D1\u10DA\u10D4\u10DB\u10E3\u10E0\u10D0\u10D3"></textarea>
          </div>
          <div class="row" style="gap:8px;justify-content:flex-end;margin-top:10px">
            <button type="button" class="btn btn-ghost" onclick="__campus.reportClose()">\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0</button>
            <button type="submit" class="btn btn-primary">\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0</button>
          </div>
        </form>
      </div>
    </div>`;
  };
  window.__campus.reportClose = () => {
    const h = document.getElementById("reportModalHost");
    if (h) h.innerHTML = "";
  };
  window.__campus.reportSubmit = async (e, type, targetId, extra) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const reason = fd.get("reason");
    const note = (fd.get("note") || "").toString().trim();
    const ctx = e.target.previousElementSibling?.textContent?.trim() || "";
    try {
      await submitReport({
        type,
        targetId,
        contextText: ctx,
        reason: note ? `${reason} \u2014 ${note}` : reason,
        extra: extra || null
      });
      window.__campus.reportClose();
      const { showToast: showToast2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
      showToast2("\u10D2\u10D0\u10E1\u10D0\u10E9\u10D8\u10D5\u10E0\u10D4\u10D1\u10D0 \u10D2\u10D0\u10D3\u10D0\u10D8\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0 \u10DB\u10DD\u10D3\u10D4\u10E0\u10D0\u10EA\u10D8\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1");
    } catch (err) {
      const { showToast: showToast2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
      showToast2("\u10E8\u10D4\u10EA\u10D3\u10DD\u10DB\u10D0: " + (err.message || err));
    }
  };
  var slot = document.getElementById("authSlot");
  var renderSlot = (u) => {
    if (!u) {
      slot.innerHTML = `<a href="#/login" class="btn btn-primary">\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0</a>`;
      return;
    }
    const dn = getDisplayName();
    const admin = isAdminUser();
    const mod = !admin && isModeratorUser();
    const panel = admin || mod;
    const adminBtn = panel ? `<a href="#/admin" class="btn btn-ghost admin-link" title="${admin ? "Admin Panel" : "Moderator Panel"}" style="margin-right:6px;border:1px solid var(--primary);color:var(--primary);font-weight:700">${admin ? "\u{1F6E1}\uFE0F Admin" : "\u{1F9D1}\u200D\u2696\uFE0F Mod"}</a>` : "";
    const badge = admin ? `<span class="admin-badge" style="margin-left:6px;font-size:10px;background:var(--primary);color:#fff;padding:2px 6px;border-radius:999px;font-weight:700;letter-spacing:.04em">ADMIN</span>` : mod ? `<span class="admin-badge" style="margin-left:6px;font-size:10px;background:#7c3aed;color:#fff;padding:2px 6px;border-radius:999px;font-weight:700;letter-spacing:.04em">MOD</span>` : "";
    slot.innerHTML = `${adminBtn}<a href="#/profile" class="btn btn-ghost user-chip" title="\u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D8">
       <span class="user-dot">${dn[0].toUpperCase()}</span>
       <span class="user-name">${dn}</span>${badge}
     </a>`;
  };
  onUser(renderSlot);
  setRole(getRole());
  var applyChrome = () => {
    const hash = hashPath();
    const onAuth = hash === "/login";
    document.body.classList.toggle("is-auth-page", onAuth && !getUser());
  };
  route("/", dashboardView);
  route("/login", loginView);
  route("/universities", universitiesView);
  route("/university/:id", universityView);
  route("/faculty/:id", facultyView);
  route("/subject/:id", subjectView);
  route("/rankings", rankingsView);
  route("/resources", resourcesView);
  route("/favorites", () => {
    setTimeout(() => {
      location.hash = "#/profile";
    }, 0);
    return `<div class="empty">\u10D2\u10D0\u10D3\u10D0\u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D4\u10D1\u10D0...</div>`;
  });
  route("/calendar", () => {
    setTimeout(() => {
      location.hash = "#/schedule";
    }, 0);
    return `<div class="empty">\u10D2\u10D0\u10D3\u10D0\u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D4\u10D1\u10D0...</div>`;
  });
  route("/profile", profileView);
  route("/admin", adminView2);
  route("/search", searchView);
  route("/gpa", gpaView);
  route("/schedule", scheduleView);
  route("/news", newsView);
  route("/academic", academicView);
  route("/onboarding", onboardingView);
  route("/lecturers", lecturersView);
  route("/chats", chatsView);
  route("/chat/:chatId", chatRoomView);
  route("/forum/:chatId", chatRoomView);
  route("/faq", faqView);
  var enforceGate = () => {
    const h = hashPath();
    if (!getUser()) {
      if (h !== "/login") {
        location.hash = "#/login";
        return;
      }
      return;
    }
    const prof = getProfile();
    if (prof?.role && getRole() !== prof.role) setRole(prof.role);
    if (h === "/login") {
      location.hash = "#/";
      return;
    }
    if (prof?.role === "student" && (!prof.uniId || !prof.facultyId) && h !== "/onboarding") {
      location.hash = "#/onboarding";
      return;
    }
    if (prof?.role !== "student" && h === "/onboarding") {
      location.hash = "#/";
      return;
    }
  };
  onAuthReady(() => {
    enforceGate();
    applyChrome();
    window.addEventListener("hashchange", () => {
      enforceGate();
      applyChrome();
    });
    startRouter();
    initPalette();
    initMobileNav();
    window.__campusInit = window.__campusInit || {};
    window.__campusInit.neCarousel = (el) => {
      const scroll = el.querySelector(".ne-scroll");
      const dots = el.querySelectorAll(".ne-dot");
      if (!scroll || !dots.length) return;
      let raf = 0;
      const update = () => {
        const w = scroll.clientWidth || 1;
        const i = Math.round(scroll.scrollLeft / w);
        dots.forEach((d, j2) => d.classList.toggle("active", j2 === i));
      };
      scroll.addEventListener("scroll", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      });
      dots.forEach((d, i) => d.addEventListener("click", () => {
        scroll.scrollTo({ left: i * scroll.clientWidth, behavior: "smooth" });
      }));
    };
    startStore();
    onUser(() => {
      enforceGate();
      applyChrome();
    });
    if (getUser()) {
      prefetchAfterAuth();
    }
    onUser((u) => {
      if (u) {
        prefetchAfterAuth();
      }
    });
  });
})();
