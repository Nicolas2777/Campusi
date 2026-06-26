// Live academic calendars — admin-managed via Firestore (collection "calendars", docId = uniId).
// Schema per uni: { name, semesters: [{ id, name, registration:{start,end}, semester:{...}, addDrop:{...}, midterms:{...}, finals:{...} }], holidays: [{date,name}] }
import { state } from "./store.js";

export const ACADEMIC_PHASES = {
  registration: { label: "რეგისტრაცია",      icon: "📝", color: "#6d5cf6" },
  semester:     { label: "სასწავლო პერიოდი", icon: "📚", color: "#10b981" },
  addDrop:      { label: "Add / Drop",       icon: "⚠️", color: "#f59e0b" },
  midterms:     { label: "შუალედური",        icon: "📋", color: "#22d3ee" },
  finals:       { label: "ფინალური",         icon: "🎯", color: "#ef4444" },
  break:        { label: "არდადეგები",       icon: "🏖",  color: "#b06cf2" },
};

export const academicCalendar = state.academicCalendar;

export const getCurrentSemester = (uniId, today = new Date()) => {
  const uni = academicCalendar[uniId];
  if (!uni || !uni.semesters || !uni.semesters.length) return null;
  const t = today.toISOString().slice(0, 10);
  return uni.semesters.find(s => s.semester?.start <= t && t <= s.semester?.end)
      || uni.semesters.find(s => s.semester?.start > t)
      || uni.semesters[uni.semesters.length - 1];
};

export const getCurrentPhase = (sem, today = new Date()) => {
  if (!sem) return null;
  const t = today.toISOString().slice(0, 10);
  const order = ["registration", "addDrop", "midterms", "finals", "semester"];
  for (const k of order) {
    if (sem[k] && sem[k].start <= t && t <= sem[k].end) return k;
  }
  return null;
};
