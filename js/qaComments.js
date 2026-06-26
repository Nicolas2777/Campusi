// Subject Q&A comments — Firestore-backed so admins can moderate.
// Falls back to localStorage when Firebase is disabled.
import { firebaseEnabled, loadFirebase } from "./firebase.js";
import { getUser, getProfile, isAdminUser, canModerate, assertNotBlocked } from "./auth.js";

const LS_KEY = "campus.qaComments";
const readLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };
const writeLS = (a) => localStorage.setItem(LS_KEY, JSON.stringify(a));

const subs = new Map(); // subjectId -> Set<cb>

export const subscribeQA = (subjectId, cb) => {
  if (!firebaseEnabled) {
    const all = readLS().filter(c => c.subjectId === subjectId).sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    cb(all);
    const handler = () => {
      cb(readLS().filter(c => c.subjectId === subjectId).sort((a,b) => (b.createdAt||0) - (a.createdAt||0)));
    };
    window.addEventListener("campus.qa.changed", handler);
    return () => window.removeEventListener("campus.qa.changed", handler);
  }
  let unsub = () => {};
  let cancelled = false;
  loadFirebase().then((fb) => {
    if (cancelled) return;
    try {
      const q = fb.query(
        fb.collection(fb.db, "qaComments"),
        fb.where("subjectId", "==", subjectId)
      );
      unsub = fb.onSnapshot(q, (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a,b) => {
            const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || +a.createdAt || 0;
            const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || +b.createdAt || 0;
            return tb - ta;
          });
        cb(arr);
      }, (err) => { console.warn("qa sub", err?.message || err); cb([]); });
    } catch (e) { console.warn("qa sub fail", e); cb([]); }
  });
  return () => { cancelled = true; try { unsub(); } catch {} };
};

export const addQAComment = async (subjectId, text) => {
  const user = getUser();
  if (!user) throw new Error("გთხოვ შეხვიდე");
  assertNotBlocked();
  const profile = getProfile();
  const trimmed = String(text || "").trim().slice(0, 1000);
  if (!trimmed) throw new Error("ცარიელი ტექსტი");
  const author = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim()
              || user.displayName || user.email?.split("@")[0] || "სტუდენტი";
  if (firebaseEnabled) {
    if (!user.emailVerified) throw new Error("გთხოვ, დაადასტურე ელფოსტა");
    const fb = await loadFirebase();
    await fb.addDoc(fb.collection(fb.db, "qaComments"), {
      subjectId,
      userId: user.uid,
      authorEmail: user.email || null,
      author,
      text: trimmed,
      createdAt: fb.serverTimestamp(),
    });
  } else {
    const all = readLS();
    all.push({
      id: "qa-" + Math.random().toString(36).slice(2),
      subjectId, userId: user.uid || "demo", authorEmail: user.email,
      author, text: trimmed, createdAt: Date.now(),
    });
    writeLS(all);
    window.dispatchEvent(new CustomEvent("campus.qa.changed"));
  }
};

export const deleteQAComment = async (id, ownerUid) => {
  const user = getUser();
  if (!user) throw new Error("გთხოვ შეხვიდე");
  const canMod = canModerate();
  if (!canMod && ownerUid && ownerUid !== user.uid) throw new Error("ეს კომენტარი შენი არ არის");
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    await fb.deleteDoc(fb.doc(fb.db, "qaComments", id));
  } else {
    const all = readLS().filter(c => c.id !== id);
    writeLS(all);
    window.dispatchEvent(new CustomEvent("campus.qa.changed"));
  }
};

/* Admin: load all comments (one-shot) for the admin tab. */
export const loadAllQA = async (limit = 500) => {
  if (!firebaseEnabled) return readLS().sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
  const fb = await loadFirebase();
  const snap = await fb.getDocs(fb.collection(fb.db, "qaComments"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || +a.createdAt || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || +b.createdAt || 0;
      return tb - ta;
    }).slice(0, limit);
};
