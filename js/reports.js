// Reporting & moderation — Firestore-backed report queue.
// Each report: { type, targetId, targetCollection, contextText, reason,
//                reporterId, reporterEmail, status: "open"|"resolved",
//                createdAt, resolvedAt? }
import { firebaseEnabled, loadFirebase } from "./firebase.js";
import { getUser, isAdminUser } from "./auth.js";

const TYPES = {
  qaComment:      { label: "Q&A კომენტარი",        collection: "qaComments" },
  subjectRating:  { label: "საგნის შეფასება",        collection: "subjectRatings" },
  lecturerRating: { label: "ლექტორის შეფასება",      collection: "lecturerRatings" },
  resource:       { label: "სასწავლო რესურსი",       collection: "resources" },
  material:       { label: "სტუდენტის მასალა",       collection: "materials" },
  forumMessage:   { label: "ფორუმის წერილი",         collection: "subjectChats" },
};
export const REPORT_TYPES = TYPES;

const REASONS = [
  "შეურაცხმყოფელი ან აგრესიული ენა",
  "სპამი ან რეკლამა",
  "შეცდომაში შემყვანი ინფორმაცია",
  "პერსონალური მონაცემების გამჟღავნება",
  "აკადემიური არაკეთილსინდისიერება",
  "სხვა",
];
export const REPORT_REASONS = REASONS;

export const submitReport = async ({ type, targetId, contextText, reason, extra }) => {
  const user = getUser();
  if (!user) throw new Error("რეპორტისთვის საჭიროა ავტორიზაცია");
  if (!TYPES[type]) throw new Error("რეპორტის უცნობი ტიპი");
  if (!targetId) throw new Error("რეპორტის ობიექტი ვერ მოიძებნა");
  if (!firebaseEnabled) throw new Error("რეპორტი მოითხოვს Firebase-ის კონფიგურაციას");
  const fb = await loadFirebase();
  await fb.addDoc(fb.collection(fb.db, "reports"), {
    type,
    targetId: String(targetId),
    targetCollection: TYPES[type].collection,
    contextText: String(contextText || "").slice(0, 600),
    reason: String(reason || "სხვა").slice(0, 120),
    extra: extra || null,
    reporterId: user.uid,
    reporterEmail: user.email || null,
    status: "open",
    createdAt: fb.serverTimestamp(),
  });
};

/* Admin: load all reports (most recent first). */
export const loadAllReports = async (limit = 500) => {
  if (!firebaseEnabled) return [];
  const fb = await loadFirebase();
  const snap = await fb.getDocs(fb.collection(fb.db, "reports"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || +a.createdAt || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || +b.createdAt || 0;
      return tb - ta;
    }).slice(0, limit);
};

export const resolveReport = async (id) => {
  if (!isAdminUser()) throw new Error("მხოლოდ ადმინისთვის");
  const fb = await loadFirebase();
  await fb.updateDoc(fb.doc(fb.db, "reports", id), {
    status: "resolved",
    resolvedAt: fb.serverTimestamp(),
  });
};

export const deleteReport = async (id) => {
  if (!isAdminUser()) throw new Error("მხოლოდ ადმინისთვის");
  const fb = await loadFirebase();
  await fb.deleteDoc(fb.doc(fb.db, "reports", id));
};

/* Delete the reported content itself (admin shortcut). */
export const deleteReportedContent = async (report) => {
  if (!isAdminUser()) throw new Error("მხოლოდ ადმინისთვის");
  const fb = await loadFirebase();
  if (report.type === "forumMessage") {
    // targetId format for forum: `${chatId}::${messageId}`
    const [chatId, msgId] = String(report.targetId).split("::");
    if (!chatId || !msgId) throw new Error("არასწორი წერილის ID");
    await fb.deleteDoc(fb.doc(fb.db, "subjectChats", chatId, "messages", msgId));
  } else {
    const coll = report.targetCollection || TYPES[report.type]?.collection;
    if (!coll) throw new Error("უცნობი ჟანრი");
    await fb.deleteDoc(fb.doc(fb.db, coll, report.targetId));
  }
};
