// Live data — populated by Firestore (see js/store.js).
// Arrays keep stable references and mutate in place when admin updates content.
// Initial render: empty arrays. After Firestore loads, store.js triggers refresh.
import { state } from "./store.js";

export const universities = state.universities;
export const faculties    = state.faculties;
export const subjects     = state.subjects;
export const resources    = state.resources;
export const topStudents  = state.topStudents;
export const news         = state.news;

export const getUni = (id) => universities.find(u => u.id === id) || null;
export const getFaculty = (id) => faculties.find(f => f.id === id) || null;
export const getSubject = (id) => subjects.find(s => s.id === id) || null;

export const facultiesByUni = (uniId) => faculties.filter(f => f.uniId === uniId);
export const subjectsByFaculty = (facultyId) => subjects.filter(s => s.facultyId === facultyId);
export const resourcesBySubject = (subjectId) => resources.filter(r => r.subjectId === subjectId);
