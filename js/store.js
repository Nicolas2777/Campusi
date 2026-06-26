// Central Firestore-backed store with hybrid cache + smart refresh strategy.
// Universities/Faculties: cache-first + window-focus refetch (no realtime).
// Subjects/resources/news/calendars: real-time onSnapshot (out of scope).

import { firebaseEnabled, loadFirebase } from "./firebase.js";
import { refresh } from "./router.js";

/* Mutate-in-place helpers (preserve reference identity) */
const replaceArr = (arr, next) => { arr.length = 0; for (const x of next) arr.push(x); };
const replaceObj = (obj, next) => {
  for (const k of Object.keys(obj)) delete obj[k];
  for (const k of Object.keys(next || {})) obj[k] = next[k];
};

/* Live state — references are stable */
export const state = {
  universities: [],
  faculties: [],
  subjects: [],
  resources: [],
  news: [],
  /** academicCalendar[uniId] = { name, semesters:[], holidays:[] } */
  academicCalendar: {},
};

/* localStorage cache so first paint isn't empty */
const CACHE_KEY = "campus.store.cache.v1";
const META_KEY  = "campus.store.meta.v1"; // { universities: ts, faculties: ts }

const readMeta = () => { try { return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {}; } catch { return {}; } };
const writeMeta = (m) => { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {} };
let meta = readMeta();

try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  if (cached && typeof cached === "object") {
    for (const k of Object.keys(state)) {
      if (cached[k] === undefined) continue;
      if (Array.isArray(state[k])) replaceArr(state[k], cached[k] || []);
      else replaceObj(state[k], cached[k] || {});
    }
  }
} catch {}

const persist = () => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch {}
};

let _refreshScheduled = false;
const scheduleRefresh = () => {
  if (_refreshScheduled) return;
  _refreshScheduled = true;
  setTimeout(() => { _refreshScheduled = false; persist(); try { refresh(); } catch {} }, 50);
};

/* ============ Hybrid (cache-first + focus refetch) collections ============ */
/* staleTime ms — universities ~30m, faculties ~20m */
const STALE = { universities: 30 * 60 * 1000, faculties: 20 * 60 * 1000 };
const _inflight = {}; // dedupe concurrent fetches

const fetchOnce = async (key, force = false) => {
  if (!firebaseEnabled) return;
  const fresh = !force && (Date.now() - (meta[key] || 0) < STALE[key]);
  if (fresh) return; // cache is fresh — skip
  if (_inflight[key]) return _inflight[key];
  _inflight[key] = (async () => {
    try {
      const fb = await loadFirebase();
      if (!fb) return;
      const snap = await fb.getDocs(fb.collection(fb.db, key));
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      replaceArr(state[key], arr);
      meta[key] = Date.now();
      writeMeta(meta);
      scheduleRefresh();
    } catch (e) { console.warn("store fetch " + key, e?.message || e); }
    finally { _inflight[key] = null; }
  })();
  return _inflight[key];
};

export const refetchUniversities = (force = false) => fetchOnce("universities", force);
export const refetchFaculties    = (force = false) => fetchOnce("faculties",    force);

/** Force-refresh hybrid collections — used by manual refresh. */
export const refreshHybrid = () => Promise.all([fetchOnce("universities", true), fetchOnce("faculties", true)]);

/* ============ Realtime collections (kept) ============ */
const REALTIME_COLLECTIONS = [
  ["subjects",    "subjects"],
  ["resources",   "resources"],
  ["news",        "news"],
];

let _started = false;
export const startStore = async () => {
  if (_started || !firebaseEnabled) return;
  _started = true;

  // 1) Cache-first hybrid fetch (fire immediately, no await — UI already paints from cache)
  fetchOnce("universities");
  fetchOnce("faculties");

  // 2) Refetch on tab focus + visibility change
  const onFocus = () => {
    fetchOnce("universities");
    fetchOnce("faculties");
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) onFocus(); });

  // 3) Manual page reload → startup already fires fresh fetch via fetchOnce above
  //    (if cache is stale it goes to Firestore; if not it skips the request → free)
  //    Force-refresh path: call refreshHybrid() from a Refresh button if needed.

  // 4) Realtime listeners for non-scope collections
  const fb = await loadFirebase();
  if (!fb || !fb.onSnapshot) return;

  for (const [coll, key] of REALTIME_COLLECTIONS) {
    try {
      fb.onSnapshot(fb.collection(fb.db, coll), (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        replaceArr(state[key], arr);
        scheduleRefresh();
      }, (err) => console.warn("store:" + coll, err?.message || err));
    } catch (e) { console.warn("store sub fail", coll, e); }
  }

  try {
    fb.onSnapshot(fb.collection(fb.db, "calendars"), (snap) => {
      const next = {};
      snap.docs.forEach(d => { next[d.id] = { id: d.id, ...d.data() }; });
      replaceObj(state.academicCalendar, next);
      scheduleRefresh();
    }, (err) => console.warn("store:calendars", err?.message || err));
  } catch {}
};
