// Study streak — tracks consecutive days the user opened the platform.
// Resets if a day is missed.

const KEY_LAST = "campus.streak.lastVisit";
const KEY_CNT  = "campus.streak.count";

const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a, b) => {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
};

export const getStreak = () => +(localStorage.getItem(KEY_CNT) || 0);
export const getLastVisit = () => localStorage.getItem(KEY_LAST) || "";

/* Call once on boot. Returns current streak. */
export const tickStreak = () => {
  const t = today();
  const last = getLastVisit();
  let cnt = getStreak();
  if (!last) cnt = 1;
  else if (last === t) { /* same day, no change */ }
  else {
    const d = dayDiff(last, t);
    if (d === 1) cnt = cnt + 1;
    else cnt = 1; // missed at least one day → reset
  }
  localStorage.setItem(KEY_LAST, t);
  localStorage.setItem(KEY_CNT, String(cnt));
  return cnt;
};
