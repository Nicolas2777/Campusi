// localStorage-ზე დაფუძნებული state (theme, favorites, reviews, comments, exams)

const KEY = {
  theme: "campus.theme",
  favorites: "campus.favorites",
  reviews: "campus.reviews",
  comments: "campus.comments",
  exams: "campus.exams",
  adminEmails: "campus.adminEmails",
  compare: "campus.compare",
  points: "campus.points",
  badges: "campus.badges",
  role: "campus.role",
};

/* Role: "student" | "admin" | null */
export const ROLES = {
  student: { id: "student", icon: "📚", name: "სტუდენტი",
    tagline: "მართე შენი აკადემიური ცხოვრება, საგნები, სიახლეები და პროგრესი." },
};
export const getRole = () => localStorage.getItem(KEY.role);
export const setRole = (r) => {
  if (r) localStorage.setItem(KEY.role, r);
  else localStorage.removeItem(KEY.role);
  document.documentElement.setAttribute("data-role", r || "");
};
export const clearRole = () => { localStorage.removeItem(KEY.role); document.documentElement.removeAttribute("data-role"); };

const read = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* Theme */
export const getTheme = () => localStorage.getItem(KEY.theme) || "light";
export const setTheme = (t) => {
  localStorage.setItem(KEY.theme, t);
  document.documentElement.setAttribute("data-theme", t);
};
export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

/* Favorites — feature removed. Kept as no-op stubs for legacy imports. */
export const getFavorites = () => [];
export const isFavorite = () => false;
export const toggleFavorite = () => false;

/* Reviews: [{lecturerId, rating, pros, cons, comment, ts}] */
export const getReviews = (lecturerId) =>
  read(KEY.reviews, []).filter(r => r.lecturerId === lecturerId);
export const addReview = (review) => {
  const all = read(KEY.reviews, []);
  all.push({ ...review, ts: Date.now() });
  write(KEY.reviews, all);
};
export const avgRating = (lecturerId) => {
  const rs = getReviews(lecturerId);
  if (!rs.length) return 0;
  return rs.reduce((a, b) => a + b.rating, 0) / rs.length;
};

/* Comments: [{subjectId, author, text, ts}] */
export const getComments = (subjectId) =>
  read(KEY.comments, []).filter(c => c.subjectId === subjectId).sort((a, b) => b.ts - a.ts);
export const addComment = (c) => {
  const all = read(KEY.comments, []);
  all.push({ ...c, ts: Date.now() });
  write(KEY.comments, all);
};

/* Exams: [{id, subjectId, title, date, location}] */
export const getExams = () => read(KEY.exams, []).sort((a, b) => a.date.localeCompare(b.date));
export const addExam = (e) => {
  const all = read(KEY.exams, []);
  all.push({ ...e, id: crypto.randomUUID() });
  write(KEY.exams, all);
};
export const removeExam = (id) => write(KEY.exams, read(KEY.exams, []).filter(e => e.id !== id));

/* Admin emails (comma-separated in localStorage for demo) */
export const isAdmin = (email) => {
  const list = (localStorage.getItem(KEY.adminEmails) || "nika.gogokhiya27@gmail.com").split(",").map(s => s.trim());
  return email && list.includes(email);
};

/* Compare list (universities) */
export const getCompare = () => read(KEY.compare, []);
export const isComparing = (id) => getCompare().includes(id);
export const toggleCompare = (id) => {
  const list = getCompare();
  const ix = list.indexOf(id);
  if (ix >= 0) list.splice(ix, 1);
  else { if (list.length >= 4) return false; list.push(id); }
  write(KEY.compare, list);
  return true;
};
export const clearCompare = () => write(KEY.compare, []);

/* Gamification: points + badges */
const POINT_RULES = { review: 5, comment: 2.5, resource: 25, exam: 1.5 };
export const POINTS = POINT_RULES;
export const getPoints = () => read(KEY.points, 0);
export const getBadges = () => read(KEY.badges, []);
const BADGE_DEFS = [
  { id: "starter",    name: "დამწყები",     icon: "🌱", req: 10 },
  { id: "active",     name: "აქტიური",      icon: "⚡", req: 50 },
  { id: "contributor",name: "კონტრიბუტორი", icon: "🏆", req: 150 },
  { id: "legend",     name: "ლეგენდა",      icon: "👑", req: 500 },
];
export const BADGES = BADGE_DEFS;
export const addPoints = (kind) => {
  const delta = POINT_RULES[kind] || 0;
  const total = getPoints() + delta;
  write(KEY.points, total);
  const unlocked = getBadges();
  BADGE_DEFS.forEach(b => {
    if (total >= b.req && !unlocked.includes(b.id)) unlocked.push(b.id);
  });
  write(KEY.badges, unlocked);
  return delta;
};
export const levelOf = (pts) => Math.floor(Math.sqrt(pts / 10)) + 1;
