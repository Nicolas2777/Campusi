// Subject difficulty rating system — Firestore-backed.
// One rating per (subject, user). Doc id = `${subjectId}__${uid}`.
// Falls back to localStorage when Firebase is disabled.

import { firebaseEnabled, loadFirebase, getFb } from "./firebase.js";
import { getUser, assertNotBlocked } from "./auth.js";

const LS_KEY = "campus.subjectRatings";
const readLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };
const writeLS = (a) => localStorage.setItem(LS_KEY, JSON.stringify(a));

const FIELDS = ["difficulty", "workload", "examHardness", "clarity", "worthIt"];

export const DIFFICULTY_LABELS = [
  { max: 1.8, label: "ძალიან მარტივი", color: "#16a34a" },
  { max: 2.6, label: "მარტივი",        color: "#65a30d" },
  { max: 3.4, label: "საშუალო",        color: "#eab308" },
  { max: 4.2, label: "რთული",          color: "#f97316" },
  { max: 5.1, label: "ძალიან რთული",   color: "#dc2626" },
];
export const difficultyLabel = (avg) =>
  DIFFICULTY_LABELS.find(l => avg <= l.max) || DIFFICULTY_LABELS[2];

export const aggregate = (ratings) => {
  const out = { count: ratings.length };
  for (const f of FIELDS) {
    const vals = ratings.map(r => +r[f]).filter(v => v >= 1 && v <= 5);
    out[f] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  // Confidence: simple thresholds on count
  out.confidence = out.count >= 30 ? "მაღალი"
                 : out.count >= 10 ? "საშუალო"
                 : out.count >= 3  ? "დაბალი"
                 : "ძალიან დაბალი";
  out.label = difficultyLabel(out.difficulty).label;
  out.color = difficultyLabel(out.difficulty).color;
  return out;
};

const validate = (data) => {
  for (const f of FIELDS) {
    const v = +data[f];
    if (!(v >= 1 && v <= 5)) throw new Error(`შეავსე ყველა შეფასება (1–5): ${f}`);
  }
  if (data.comment && String(data.comment).length > 500)
    throw new Error("კომენტარი ძალიან გრძელია (მაქს 500)");
};

const docId = (subjectId, uid) => `${subjectId}__${uid}`;

/* ---- Live subscription. Returns unsubscribe. ---- */
const subjectSubs = new Map(); // subjectId -> { cb, unsub, data }

export const subscribeRatings = (subjectId, cb) => {
  if (!firebaseEnabled) {
    const all = readLS().filter(r => r.subjectId === subjectId);
    cb(all);
    const handler = () => {
      const arr = readLS().filter(r => r.subjectId === subjectId);
      cb(arr);
    };
    window.addEventListener("campus.ratings.changed", handler);
    return () => window.removeEventListener("campus.ratings.changed", handler);
  }
  let unsub = () => {};
  let cancelled = false;
  loadFirebase().then((fb) => {
    if (cancelled || !fb) return;
    try {
      const q = fb.query(
        fb.collection(fb.db, "subjectRatings"),
        fb.where("subjectId", "==", subjectId)
      );
      unsub = fb.onSnapshot(q, (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        cb(arr);
      }, (err) => { console.warn("ratings sub", err?.message || err); cb([]); });
    } catch (e) { console.warn("ratings sub fail", e); cb([]); }
  });
  return () => { cancelled = true; try { unsub(); } catch {} };
};

export const getMyRating = (ratings, uid) =>
  ratings.find(r => r.userId === uid) || null;

export const submitRating = async (subjectId, data) => {
  const user = getUser();
  if (!user) throw new Error("ჯერ შედი სისტემაში");
  assertNotBlocked();
  if (firebaseEnabled && !user.emailVerified) throw new Error("გთხოვ, დაადასტურე ელფოსტა");
  validate(data);
  const payload = {
    subjectId,
    userId: user.uid,
    difficulty:   +data.difficulty,
    workload:     +data.workload,
    examHardness: +data.examHardness,
    clarity:      +data.clarity,
    worthIt:      +data.worthIt,
    comment:      (data.comment || "").trim().slice(0, 500),
  };

  if (firebaseEnabled) {
    const fb = await loadFirebase();
    const id = docId(subjectId, user.uid);
    const ref = fb.doc(fb.db, "subjectRatings", id);
    const existing = await fb.getDoc(ref);
    await fb.setDoc(ref, {
      ...payload,
      createdAt: existing.exists() ? existing.data().createdAt || fb.serverTimestamp() : fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
    });
  } else {
    const all = readLS();
    const ix = all.findIndex(r => r.subjectId === subjectId && r.userId === user.uid);
    const rec = { id: docId(subjectId, user.uid), ...payload, createdAt: Date.now(), updatedAt: Date.now() };
    if (ix >= 0) all[ix] = { ...all[ix], ...rec, createdAt: all[ix].createdAt };
    else all.push(rec);
    writeLS(all);
    window.dispatchEvent(new CustomEvent("campus.ratings.changed"));
  }
};

export const deleteMyRating = async (subjectId) => {
  const user = getUser();
  if (!user) throw new Error("ჯერ შედი სისტემაში");
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    await fb.deleteDoc(fb.doc(fb.db, "subjectRatings", docId(subjectId, user.uid)));
  } else {
    const all = readLS().filter(r => !(r.subjectId === subjectId && r.userId === user.uid));
    writeLS(all);
    window.dispatchEvent(new CustomEvent("campus.ratings.changed"));
  }
};

export const adminDeleteRating = async (ratingId) => {
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    await fb.deleteDoc(fb.doc(fb.db, "subjectRatings", ratingId));
  } else {
    const all = readLS().filter(r => r.id !== ratingId);
    writeLS(all);
    window.dispatchEvent(new CustomEvent("campus.ratings.changed"));
  }
};
