// Lightweight achievement tracking (localStorage only).
// Distinct from BADGES (which are point thresholds).

const KEY_COUNTERS = "campus.ach.counters"; // { materialsUploaded, commentsPosted }
const KEY_UNLOCKED = "campus.ach.unlocked"; // [id]
const KEY_DAYS     = "campus.ach.days";     // [YYYY-MM-DD]

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch { return d; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const ACHIEVEMENTS = [
  { id: "first_material", icon: "🏅", name: "პირველი მასალა",      desc: "ატვირთე პირველი რესურსი" },
  { id: "ten_comments",   icon: "🏅", name: "აქტიური დისკუსანტი",  desc: "დაწერე 10 კომენტარი" },
  { id: "active_30",      icon: "🏅", name: "მონდომებული",          desc: "ნახე პლატფორმა 30 დღის განმავლობაში" },
  { id: "first_rating",   icon: "🏅", name: "შემფასებელი",          desc: "შეაფასე პირველი მასალა" },
];

export const getCounters = () => read(KEY_COUNTERS, {});
export const getUnlocked = () => read(KEY_UNLOCKED, []);
export const getDays = () => read(KEY_DAYS, []);

const unlock = (id) => {
  const arr = getUnlocked();
  if (arr.includes(id)) return false;
  arr.push(id);
  write(KEY_UNLOCKED, arr);
  return true;
};

const showUnlock = async (id) => {
  const meta = ACHIEVEMENTS.find(a => a.id === id);
  if (!meta) return;
  try {
    const { showToast } = await import("./ui.js");
    showToast(`${meta.icon} მიღწევა: ${meta.name}`);
  } catch {}
};

/* Public hooks — call from feature code */
export const recordEvent = (type) => {
  const c = getCounters();
  if (type === "material") {
    c.materialsUploaded = (c.materialsUploaded || 0) + 1;
    write(KEY_COUNTERS, c);
    if (c.materialsUploaded >= 1 && unlock("first_material")) showUnlock("first_material");
  } else if (type === "comment") {
    c.commentsPosted = (c.commentsPosted || 0) + 1;
    write(KEY_COUNTERS, c);
    if (c.commentsPosted >= 10 && unlock("ten_comments")) showUnlock("ten_comments");
  } else if (type === "favorite") {
    /* favorite events ignored (feature removed) */
  } else if (type === "rating") {
    if (unlock("first_rating")) showUnlock("first_rating");
  }
};

/* Mark today's visit; auto-unlocks active_30 */
export const markVisitToday = () => {
  const today = new Date().toISOString().slice(0, 10);
  const days = getDays();
  if (!days.includes(today)) {
    days.push(today);
    write(KEY_DAYS, days);
  }
  if (days.length >= 30 && unlock("active_30")) showUnlock("active_30");
};
