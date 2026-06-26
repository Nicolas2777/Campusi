// FAQ entries — Firestore-backed when available, localStorage cache fallback.
// Shape: { id, topic, title, body, ts,
//   scope: 'all' | 'uni' | 'faculty',
//   uniId?:  string,   // when scope = 'uni' or 'faculty'
//   facultyId?: string // when scope = 'faculty'
// }
//
// Visibility:
//   scope='all'                       → ყველა სტუდენტი
//   scope='uni',  uniId=X             → მხოლოდ X უნივერსიტეტი
//   scope='faculty', uniId=X, facId=Y → მხოლოდ X უნივერსიტეტის Y ფაკულტეტი
//
// ადმინი ყოველთვის ხედავს ყველაფერს.

import { firebaseEnabled, loadFirebase } from "./firebase.js";

const CACHE_KEY = "campus.faq.cache.v2";
const META_KEY  = "campus.faq.meta.v2";   // { ts: <last fetch ms> }
const STALE_MS  = 24 * 60 * 60 * 1000;    // 24 hours
const COLLECTION = "faq";

const DEFAULTS = [
  { id: "f-mobility", topic: "მობილობა",
    title: "როგორ ხორციელდება მობილობა?",
    body: "მობილობის განცხადება შემოაქვს სტუდენტს მიმდინარე უნივერსიტეტის სასწავლო პროცესის სამსახურში დადგენილ ვადებში. შემდგომ ეტაპზე საჭიროა მიმღები უნივერსიტეტის თანხმობა და კრედიტების აღიარების ფურცელი.",
    scope: "all", ts: 0 },
  { id: "f-gpa", topic: "GPA",
    title: "როგორ გამოითვლება GPA?",
    body: "GPA = Σ(ქულა × კრედიტი) ÷ Σ(კრედიტი). პლატფორმაზე ხელმისაწვდომია GPA-კალკულატორი ზუსტი გათვლისთვის, მათ შორის „რა-თუ“ სცენარების მოდელირებისთვის.",
    scope: "all", ts: 0 },
  { id: "f-account", topic: "ანგარიში",
    title: "შესაძლებელია თუ არა სახელისა და გვარის შეცვლა პარამეტრებიდან?",
    body: "ვერა. რეგისტრაციისას მითითებული სახელი და გვარი მუდმივია. ცვლილებისთვის მიმართეთ ადმინისტრაციას.",
    scope: "all", ts: 0 },
];

const readCache = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (Array.isArray(v)) return v;
  } catch {}
  return DEFAULTS.slice();
};
const writeCache = (arr) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(arr)); } catch {}
};
const readMeta = () => { try { return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {}; } catch { return {}; } };
const writeMeta = (m) => { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {} };

const normalize = (raw, id) => {
  const item = { id: id || raw.id, ...raw };
  if (!item.scope) item.scope = "all";
  if (item.scope !== "uni" && item.scope !== "faculty") item.scope = "all";
  if (item.scope === "all") { delete item.uniId; delete item.facultyId; }
  if (item.scope === "uni") { delete item.facultyId; }
  return item;
};

const sortFn = (a, b) =>
  (a.topic || "").localeCompare(b.topic || "", "ka") ||
  (a.title || "").localeCompare(b.title || "", "ka");

/* ---------- Firestore helpers (with request dedup) ---------- */
let _inflight = null;
const fetchAllFromFs = async () => {
  if (!firebaseEnabled) return null;
  if (_inflight) return _inflight;
  _inflight = (async () => {
    try {
      const fb = await loadFirebase();
      if (!fb) return null;
      const snap = await fb.getDocs(fb.collection(fb.db, COLLECTION));
      const arr = [];
      snap.forEach(d => arr.push(normalize(d.data(), d.id)));
      writeCache(arr);
      writeMeta({ ts: Date.now() });
      return arr;
    } finally { _inflight = null; }
  })();
  return _inflight;
};

/* Optional background refresh on tab focus when cache is stale */
let _focusHooked = false;
const hookFocusOnce = () => {
  if (_focusHooked || typeof window === "undefined") return;
  _focusHooked = true;
  const tryRefresh = () => {
    const m = readMeta();
    if (Date.now() - (m.ts || 0) > STALE_MS) fetchAllFromFs().catch(() => {});
  };
  window.addEventListener("focus", tryRefresh);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tryRefresh(); });
};

/* ---------- Public API ---------- */
export const listFaqAll = async () => {
  hookFocusOnce();
  const meta = readMeta();
  const fresh = Date.now() - (meta.ts || 0) < STALE_MS;
  let arr;
  if (fresh) {
    arr = readCache();          // cache-first, instant
  } else {
    arr = (await fetchAllFromFs().catch(() => null)) || readCache();
  }
  return arr.map(x => normalize(x, x.id)).sort(sortFn);
};


export const listFaqFor = async (profile, isAdminFlag) => {
  const all = await listFaqAll();
  if (isAdminFlag) return all;
  const uniId = profile?.uniId || profile?.universityId || "";
  const facId = profile?.facultyId || "";
  return all.filter(f => {
    if (f.scope === "all") return true;
    if (f.scope === "uni") return uniId && f.uniId === uniId;
    if (f.scope === "faculty") return facId && f.facultyId === facId;
    return false;
  });
};

/* sync version for legacy callers — returns cached snapshot */
export const listFaq = () => readCache().slice().sort(sortFn);

export const addFaq = async ({ topic, title, body, scope, uniId, facultyId }) => {
  const t = String(topic || "").trim();
  const ti = String(title || "").trim();
  const bo = String(body  || "").trim();
  if (!t || !ti || !bo) throw new Error("ყველა ველი აუცილებელია");
  const sc = (scope === "uni" || scope === "faculty") ? scope : "all";
  if (sc === "uni" && !uniId) throw new Error("აირჩიე უნივერსიტეტი");
  if (sc === "faculty" && (!uniId || !facultyId)) throw new Error("აირჩიე უნივერსიტეტი და ფაკულტეტი");

  const payload = { topic: t, title: ti, body: bo, scope: sc, ts: Date.now() };
  if (sc !== "all") payload.uniId = uniId;
  if (sc === "faculty") payload.facultyId = facultyId;

  if (firebaseEnabled) {
    const fb = await loadFirebase();
    if (fb) {
      const ref = await fb.addDoc(fb.collection(fb.db, COLLECTION), {
        ...payload, createdAt: fb.serverTimestamp(),
      });
      await fetchAllFromFs().catch(() => {});
      return { id: ref.id, ...payload };
    }
  }
  // local fallback
  const arr = readCache();
  const item = { id: "f-" + Math.random().toString(36).slice(2, 9), ...payload };
  arr.push(item); writeCache(arr);
  return item;
};

export const deleteFaq = async (id) => {
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    if (fb) {
      try { await fb.deleteDoc(fb.doc(fb.db, COLLECTION, id)); } catch (e) { console.warn("faq delete", e); }
      await fetchAllFromFs().catch(() => {});
      return;
    }
  }
  writeCache(readCache().filter(f => f.id !== id));
};

export const updateFaq = async (id, patch) => {
  if (firebaseEnabled) {
    const fb = await loadFirebase();
    if (fb) {
      await fb.updateDoc(fb.doc(fb.db, COLLECTION, id), patch);
      await fetchAllFromFs().catch(() => {});
      return;
    }
  }
  writeCache(readCache().map(f => f.id === id ? { ...f, ...patch } : f));
};
