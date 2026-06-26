// Per-material 1–5 star ratings. localStorage-backed, one rating per user per material.
// Aggregated client-side. Simple, works without backend changes.

import { getUser } from "./auth.js";

const KEY = "campus.materialRatings"; // { [materialId]: { [uid]: 1-5 } }

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "") ?? {}; } catch { return {}; } };
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

export const getRatings = (id) => read()[id] || {};

export const getAvg = (id) => {
  const r = getRatings(id);
  const vals = Object.values(r);
  if (!vals.length) return { avg: 0, count: 0 };
  const sum = vals.reduce((a, b) => a + (+b || 0), 0);
  return { avg: sum / vals.length, count: vals.length };
};

export const getMyRating = (id) => {
  const u = getUser();
  if (!u) return 0;
  return +getRatings(id)[u.uid] || 0;
};

export const rateMaterial = (id, stars) => {
  const u = getUser();
  if (!u) throw new Error("ჯერ შედი სისტემაში");
  const s = Math.max(1, Math.min(5, +stars || 0));
  const all = read();
  all[id] = all[id] || {};
  const isFirst = !all[id][u.uid];
  all[id][u.uid] = s;
  write(all);
  void isFirst;
  return s;
};
