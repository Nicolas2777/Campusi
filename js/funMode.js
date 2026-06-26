// UX modes: Exam Mode (minimal UI), Professor Mode (formal B&W),
// plus Night Owl detector and Exam Luck Index (fun, deterministic-by-day).

const KEY_EXAM = "campus.examMode";
const KEY_PROF = "campus.profMode";

export const isExamMode = () => localStorage.getItem(KEY_EXAM) === "1";
export const isProfessorMode = () => localStorage.getItem(KEY_PROF) === "1";

const applyAttrs = () => {
  const html = document.documentElement;
  html.toggleAttribute && html.toggleAttribute("data-exam-mode", isExamMode());
  if (isExamMode()) html.setAttribute("data-exam-mode", "1"); else html.removeAttribute("data-exam-mode");
  if (isProfessorMode()) html.setAttribute("data-prof-mode", "1"); else html.removeAttribute("data-prof-mode");
};

export const setExamMode = (on) => {
  localStorage.setItem(KEY_EXAM, on ? "1" : "0");
  applyAttrs();
};
export const setProfessorMode = (on) => {
  localStorage.setItem(KEY_PROF, on ? "1" : "0");
  applyAttrs();
};
export const toggleExamMode = () => { setExamMode(!isExamMode()); return isExamMode(); };
export const toggleProfessorMode = () => { setProfessorMode(!isProfessorMode()); return isProfessorMode(); };

/* Night Owl: between 00:00 and 04:59 local time */
export const isNightOwl = () => {
  const h = new Date().getHours();
  return h >= 0 && h < 5;
};

/* Daily luck — deterministic per (uid + date), values 60–99 to keep it fun */
export const todaysLuck = (uid = "anon") => {
  const seed = uid + new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const v = Math.abs(h) % 40;
  return 60 + v; // 60–99
};

/* Apply attributes on boot */
export const initFunMode = () => applyAttrs();
