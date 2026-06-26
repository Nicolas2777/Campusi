// Quotes — fully admin-managed via Firestore (see js/store.js).
// When the pool is empty (no admin quotes yet), nextQuote() returns a neutral placeholder.
import { state } from "./store.js";

const KEY = "campus.quoteIx";
const SESSION_KEY = "campus.quoteSession";

const EMPTY = { t: "", a: "" };

const pickIx = (prev, len) => {
  let ix;
  do { ix = Math.floor(Math.random() * len); }
  while (len > 1 && ix === prev);
  return ix;
};

export const nextQuote = () => {
  const pool = state.quotes;
  if (!pool.length) return EMPTY;
  let ix = parseInt(sessionStorage.getItem(SESSION_KEY) ?? "", 10);
  if (Number.isNaN(ix) || ix >= pool.length) {
    const prev = parseInt(localStorage.getItem(KEY) || "-1", 10);
    ix = pickIx(prev, pool.length);
    sessionStorage.setItem(SESSION_KEY, String(ix));
    localStorage.setItem(KEY, String(ix));
  }
  return pool[ix] || EMPTY;
};

export const resetQuote = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
