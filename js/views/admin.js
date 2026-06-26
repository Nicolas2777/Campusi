// Firebase-backed admin panel — users, content, audience-aware management.
import { firebaseEnabled, getFb, loadFirebase } from "../firebase.js";
import { getUser, getProfile, isAdminUser, isModeratorUser, logEvent } from "../auth.js";
import { expose, showToast, escapeHtml, skList } from "../ui.js";
import { refresh } from "../router.js";
import { loadAllReports, resolveReport, deleteReport, deleteReportedContent, REPORT_TYPES } from "../reports.js";

/* TABS grouped by audience so admin always knows what side they're editing */
const TABS = [
  { id: "dashboard",    label: "მიმოხილვა",     group: "general",   audience: "all" },
  { id: "users",        label: "მომხმარებლები", group: "general",   audience: "all" },
  { id: "reports",      label: "📢 გასაჩივრებები", group: "general", audience: "all" },
  { id: "universities", label: "უნივერსიტეტები", group: "shared",   audience: "student" },
  { id: "faculties",    label: "ფაკულტეტები",   group: "shared",    audience: "student" },
  { id: "lecturers",    label: "ლექტორები",     group: "shared",    audience: "student" },
  { id: "lectRatings",  label: "ლექტ. შეფასებები", group: "shared", audience: "student" },
  { id: "subjRatings",  label: "საგნის შეფასებები", group: "shared", audience: "student" },
  { id: "news",         label: "სიახლეები",      group: "shared",   audience: "student" },
  { id: "calendars",    label: "აკადემიური კალენდარი", group: "student", audience: "student" },
  { id: "subjects",     label: "საგნები",        group: "student",  audience: "student" },
  { id: "resources",    label: "რესურსები",      group: "student",  audience: "student" },
  { id: "materials",    label: "მასალები (user)", group: "student", audience: "student" },
  { id: "qa",           label: "Q&A კომენტარები", group: "student", audience: "student" },
  { id: "faq",          label: "❓ FAQ",          group: "general",  audience: "all" },
  { id: "logs",         label: "ლოგები",         group: "general",  audience: "all" },
];

/* Tabs a moderator may see. Admin sees all of TABS. */
const MOD_TABS = new Set([
  "dashboard", "users", "reports", "lecturers", "lectRatings",
  "subjRatings", "news", "calendars", "subjects", "resources",
  "materials", "qa", "logs",
]);

const AUDIENCE_META = {
  all:        { icon: "⚙️", label: "სისტემური",            color: "#64748b" },
  both:       { icon: "👥", label: "ყველა მომხმარებელი",    color: "#7c3aed" },
  student:    { icon: "📚", label: "სტუდენტი",              color: "#2563eb" },
};

const GROUP_LABEL = {
  general: "ზოგადი",
  shared:  "საერთო შინაარსი",
  student: "სტუდენტის გვერდი",
};

/* URL helpers: ?tab=foo&edit=ID */
const qs = () => new URLSearchParams((location.hash.split("?")[1] || ""));
const getTab  = () => qs().get("tab")  || "dashboard";
const getEdit = () => qs().get("edit") || "";
const setTab  = (t, edit) => { location.hash = `#/admin?tab=${t}${edit ? `&edit=${edit}` : ""}`; };

const fmtTime = (ts) => {
  if (!ts) return "—";
  let d;
  if (ts?.toDate) d = ts.toDate();
  else if (ts?.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("ka-GE", { dateStyle: "medium", timeStyle: "short" });
};

const j = (v) => encodeURIComponent(String(v ?? ""));
const unj = (v) => {
  try { return decodeURIComponent(String(v ?? "")); }
  catch { return String(v ?? ""); }
};

/* ---- Generic loaders ---- */
const loadCollection = async (name, opts = {}) => {
  if (!firebaseEnabled) return [];
  const fb = await loadFirebase();
  let q = fb.collection(fb.db, name);
  if (opts.orderBy) q = fb.query(q, fb.orderBy(opts.orderBy, opts.dir || "desc"), fb.limit(opts.limit || 200));
  const snap = await fb.getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
const loadOne = async (name, id) => {
  const fb = await loadFirebase();
  const snap = await fb.getDoc(fb.doc(fb.db, name, id));
  return snap.exists() ? { id, ...snap.data() } : null;
};

/* ---- Generic CRUD helper (collection, fields[]) ---- */
const num = (v) => v === "" || v == null ? null : Number(v);
const trim = (v) => (v == null ? "" : String(v).trim());

/* ---- Audience chip ---- */
const audienceChip = (aud) => {
  const m = AUDIENCE_META[aud];
  return `<div class="audience-chip" style="display:inline-flex;align-items:center;gap:8px;background:${m.color}15;color:${m.color};border:1px solid ${m.color}40;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:14px">
    <span style="font-size:15px">${m.icon}</span>
    <span>ეს ცვლილებები ჩანს: <b>${m.label}</b></span>
  </div>`;
};

export const adminView = async () => {
  const user = getUser();
  const profile = getProfile();

  if (!firebaseEnabled) return `<div class="empty"><div class="ico">⚠️</div>Admin Panel მოითხოვს Firebase-ის კონფიგურაციას.</div>`;
  if (!user) return `<div class="empty"><div class="ico">🔒</div>გთხოვ შეხვიდე.<br/><a href="#/login" class="btn btn-primary" style="margin-top:14px">შესვლა</a></div>`;
  const isAdmin = isAdminUser();
  const isMod = isModeratorUser();
  if (!isMod) return `<div class="empty"><div class="ico">🚫</div>წვდომა მხოლოდ ადმინ/მოდერატორისთვის. შენი როლი: ${escapeHtml(profile?.role || "უცნობი")}</div>`;
  const canSeeTab = (id) => isAdmin || MOD_TABS.has(id);

  let tab = getTab();
  if (!canSeeTab(tab)) tab = "dashboard";
  const editId = getEdit();
  const fb = getFb();

  /* ===================== EXPOSED HANDLERS ===================== */
  expose("adminTab", (t) => setTab(t));
  expose("adminEdit", (t, id) => setTab(t, id));
  expose("adminCancelEdit", (t) => setTab(t));

  /* Users */
  expose("adminToggleBlock", async (uid, blocked) => {
    await fb.updateDoc(fb.doc(fb.db, "users", uid), {
      blocked: !blocked,
      blockedAt: !blocked ? fb.serverTimestamp() : null,
      blockedBy: !blocked ? (user.uid || null) : null,
    });
    await logEvent(blocked ? "user_unblocked" : "user_blocked", { uid });
    showToast(blocked ? "განბლოკილია" : "დაბლოკილია"); refresh();
  });
  expose("adminEditUserName", async (uid, curFirst, curLast) => {
    const f = window.prompt("ახალი სახელი:", decodeURIComponent(curFirst || ""));
    if (f == null) return;
    const l = window.prompt("ახალი გვარი:", decodeURIComponent(curLast || ""));
    if (l == null) return;
    const firstName = f.trim();
    const lastName = l.trim();
    if (!firstName || !lastName) return showToast("ცარიელი ველი არ მიიღება");
    try {
      await fb.updateDoc(fb.doc(fb.db, "users", uid), { firstName, lastName });
      await logEvent("user_renamed", { uid, firstName, lastName });
      showToast("შენახულია"); refresh();
    } catch (err) {
      showToast("შეცდომა: " + (err?.message || err));
    }
  });
  expose("adminUserSearch", (val) => {
    const q = (val || "").toString().trim().toLowerCase();
    document.querySelectorAll("tr[data-user-row]").forEach(tr => {
      const hay = (tr.getAttribute("data-search") || "").toLowerCase();
      tr.style.display = !q || hay.includes(q) ? "" : "none";
    });
  });
  expose("adminToggleAdmin", async (uid, currentRole) => {
    if (!isAdmin) return showToast("მხოლოდ ადმინს შეუძლია როლის შეცვლა");
    if (uid === user.uid) return showToast("საკუთარი როლის შეცვლა აკრძალულია");
    const newRole = currentRole === "admin" ? "student" : "admin";
    await fb.updateDoc(fb.doc(fb.db, "users", uid), { role: newRole });
    await logEvent("role_changed", { uid, newRole });
    showToast(`როლი: ${newRole}`); refresh();
  });
  expose("adminToggleMod", async (uid, currentRole) => {
    if (!isAdmin) return showToast("მხოლოდ ადმინს შეუძლია როლის შეცვლა");
    if (uid === user.uid) return showToast("საკუთარი როლის შეცვლა აკრძალულია");
    if (currentRole === "admin") return showToast("ადმინი ჯერ მოაშორე");
    const newRole = currentRole === "moderator" ? "student" : "moderator";
    await fb.updateDoc(fb.doc(fb.db, "users", uid), { role: newRole });
    await logEvent("role_changed", { uid, newRole });
    showToast(`როლი: ${newRole}`); refresh();
  });

  /* CSV export */
  expose("adminExportUsers", async () => {
    try {
      showToast("ექსპორტი იწყება…");
      const users = await loadCollection("users");
      const cols = ["uid","email","firstName","lastName","role","blocked","facultyId","universityId","personalId","phone","createdAt","lastLoginAt"];
      const esc = (v) => {
        if (v == null) return "";
        if (v?.toDate) v = v.toDate().toISOString();
        else if (v?.seconds) v = new Date(v.seconds * 1000).toISOString();
        const s = String(v).replace(/"/g, '""');
        return /[",\n\r;]/.test(s) ? `"${s}"` : s;
      };
      const rows = [cols.join(",")];
      users.forEach(u => rows.push(cols.map(c => esc(u[c])).join(",")));
      const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0,10).replace(/-/g, "");
      a.href = url; a.download = `campus-users-${stamp}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await logEvent("users_exported", { n: users.length });
      showToast(`გადმოწერა: ${users.length} მომხმარებელი`);
    } catch (err) {
      console.error(err); showToast("შეცდომა: " + (err?.message || err));
    }
  });
  /* Cascade-delete everything a user produced: materials, ratings, chat msgs, chat participation. */
  const cascadeDeleteUser = async (uid) => {
    // materials
    try {
      const mats = await fb.getDocs(fb.query(fb.collection(fb.db, "materials"), fb.where("uploadedBy", "==", uid)));
      await Promise.all(mats.docs.map(d => fb.deleteDoc(d.ref)));
    } catch (e) { console.warn("materials cascade", e); }
    // lecturer ratings
    try {
      const lr = await fb.getDocs(fb.query(fb.collection(fb.db, "lecturerRatings"), fb.where("studentId", "==", uid)));
      await Promise.all(lr.docs.map(d => fb.deleteDoc(d.ref)));
    } catch (e) { console.warn("lecturerRatings cascade", e); }
    // subject ratings
    try {
      const sr = await fb.getDocs(fb.query(fb.collection(fb.db, "subjectRatings"), fb.where("userId", "==", uid)));
      await Promise.all(sr.docs.map(d => fb.deleteDoc(d.ref)));
    } catch (e) { console.warn("subjectRatings cascade", e); }
    // chat messages + participant entries in every subjectChats doc
    try {
      const chats = await fb.getDocs(fb.collection(fb.db, "subjectChats"));
      for (const c of chats.docs) {
        try {
          const col = fb.collection(fb.db, "subjectChats", c.id, "messages");
          const bySender = await fb.getDocs(fb.query(col, fb.where("senderId", "==", uid)));
          const byUid = await fb.getDocs(fb.query(col, fb.where("uid", "==", uid)));
          const refs = new Map();
          bySender.docs.forEach(d => refs.set(d.id, d.ref));
          byUid.docs.forEach(d => refs.set(d.id, d.ref));
          await Promise.all([...refs.values()].map(ref => fb.deleteDoc(ref)));
        } catch (e) { console.warn("chat msgs", c.id, e); }
        const data = c.data();
        if (data?.participants?.[uid]) {
          const np = { ...data.participants };
          delete np[uid];
          try { await fb.setDoc(c.ref, { participants: np }, { merge: true }); } catch (e) { console.warn("participants", e); }
        }
      }
    } catch (e) { console.warn("chats cascade", e); }
  };

  expose("adminDeleteUser", async (uid, email) => {
    if (uid === user.uid) return showToast("საკუთარი ანგარიშის წაშლა აკრძალულია");
    if (!confirm(`წაიშალოს "${email || uid}" და ყველა მისი მონაცემი?\n(login უნდა წაიშალოს ცალკე Firebase Console-დან)`)) return;
    try {
      showToast("იშლება მონაცემები…");
      await cascadeDeleteUser(uid);
      await fb.deleteDoc(fb.doc(fb.db, "users", uid));
      await logEvent("user_deleted", { uid, email });
      showToast("მომხმარებელი და მისი მონაცემები წაიშალა"); refresh();
    } catch (err) {
      console.error(err);
      showToast("შეცდომა: " + (err?.message || err));
    }
  });

  /* Generic save (create or update) */
  const saveRecord = async (coll, id, data, eventType) => {
    if (id) {
      await fb.setDoc(fb.doc(fb.db, coll, id), { ...data, updatedAt: fb.serverTimestamp() }, { merge: true });
      await logEvent(eventType + "_updated", { id });
      showToast("შენახულია");
    } else {
      await fb.addDoc(fb.collection(fb.db, coll), { ...data, createdAt: fb.serverTimestamp() });
      await logEvent(eventType + "_created", {});
      showToast("დაემატა");
    }
  };
  const deleteRecord = async (coll, id, eventType, name) => {
    const label = unj(name);
    if (!confirm(`წაიშალოს${label ? ` "${label}"` : ""}?`)) return;
    try {
      await fb.deleteDoc(fb.doc(fb.db, coll, id));
      try { await logEvent(eventType + "_deleted", { id }); } catch (e) { console.warn("delete log failed", e); }
      showToast("წაიშალა"); refresh();
    } catch (err) {
      console.error("delete failed", coll, id, err);
      showToast("ვერ წაიშალა: " + (err?.message || err));
    }
  };

  /* Universities */
  expose("adminSaveUni", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      name:      trim(f.get("name")),
      shortName: trim(f.get("shortName")),
      fullName:  trim(f.get("fullName")) || trim(f.get("name")),
      city:      trim(f.get("city")),
      founded:   num(f.get("founded")),
      rating:    num(f.get("rating")) || 0,
      logoUrl:   trim(f.get("logoUrl")) || null,
      website:   trim(f.get("website")) || null,
    };
    await saveRecord("universities", f.get("id") || "", data, "university");
    setTab("universities");
  });
  expose("adminDelUni", (id, name) => deleteRecord("universities", id, "university", name));

  /* Faculties */
  expose("adminSaveFac", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      uniId: f.get("uniId"),
      name:  trim(f.get("name")),
      dean:  trim(f.get("dean")) || "—",
      description: trim(f.get("description")) || null,
    };
    await saveRecord("faculties", f.get("id") || "", data, "faculty");
    setTab("faculties");
  });
  expose("adminDelFac", (id, name) => deleteRecord("faculties", id, "faculty", name));

  /* Lecturers */
  expose("adminSaveLect", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      name:       trim(f.get("name")),
      facultyId:  f.get("facultyId") || null,
      uniId:      f.get("uniId") || null,
      subject:    trim(f.get("subject")) || "",
      title:      trim(f.get("title")) || "",
      bio:        trim(f.get("bio")) || "",
      photoUrl:   trim(f.get("photoUrl")) || null,
    };
    await saveRecord("lecturers", f.get("id") || "", data, "lecturer");
    setTab("lecturers");
  });
  expose("adminDelLect", (id, name) => deleteRecord("lecturers", id, "lecturer", name));
  expose("adminDelRating", (id) => deleteRecord("lecturerRatings", id, "rating"));
  expose("adminDelSubjRating", (id) => deleteRecord("subjectRatings", id, "subjectRating"));
  expose("adminDelQA", (id) => deleteRecord("qaComments", id, "qaComment"));

  /* Reports */
  expose("adminReportResolve", async (id) => {
    try { await resolveReport(id); showToast("გასაჩივრება დახურულია"); refresh(); }
    catch (err) { showToast("შეცდომა: " + (err.message || err)); }
  });
  expose("adminReportDelete", async (id) => {
    if (!confirm("წაიშალოს გასაჩივრების ჩანაწერი?")) return;
    try { await deleteReport(id); showToast("გასაჩივრება წაშლილია"); refresh(); }
    catch (err) { showToast("შეცდომა: " + (err.message || err)); }
  });
  expose("adminReportDeleteContent", async (json) => {
    let report;
    try { report = JSON.parse(decodeURIComponent(json)); } catch { return; }
    if (!confirm(`წაიშალოს გასაჩივრებული შინაარსი (${REPORT_TYPES[report.type]?.label || report.type})? ეს ქმედება შეუქცევადია.`)) return;
    try {
      await deleteReportedContent(report);
      await resolveReport(report.id);
      await logEvent("report_content_deleted", { reportId: report.id, type: report.type, targetId: report.targetId });
      showToast("შინაარსი წაიშალა და გასაჩივრება დაიხურა");
      refresh();
    } catch (err) {
      showToast("შეცდომა: " + (err.message || err));
    }
  });
  expose("adminDelMaterial", (id, title) => deleteRecord("materials", id, "material", title));

  /* Subjects (student) */
  expose("adminSaveSubject", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      facultyId: f.get("facultyId"),
      name:      trim(f.get("name")),
      code:      trim(f.get("code")),
      lecturer:  trim(f.get("lecturer")) || "—",
      lecturerId: trim(f.get("lecturerId")) || trim(f.get("lecturer")).toLowerCase().replace(/\s+/g, "-") || "x",
      credits:   num(f.get("credits")) || 0,
      semester:  trim(f.get("semester")) || "—",
      syllabus:  trim(f.get("syllabus")) || null,
    };
    await saveRecord("subjects", f.get("id") || "", data, "subject");
    setTab("subjects");
  });
  expose("adminDelSubject", (id, name) => deleteRecord("subjects", id, "subject", name));

  /* Resources (student) */
  expose("adminSaveResource", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      subjectId: f.get("subjectId"),
      title:     trim(f.get("title")),
      type:      f.get("type") || "PDF",
      url:       trim(f.get("url")),
      upvotes:   num(f.get("upvotes")) || 0,
    };
    await saveRecord("resources", f.get("id") || "", data, "resource");
    setTab("resources");
  });
  expose("adminDelResource", (id, name) => deleteRecord("resources", id, "resource", name));

  /* News */
  expose("adminSaveNews", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      uniId:     f.get("uniId") || null,
      facultyId: f.get("facultyId") || null,
      title:    trim(f.get("title")),
      summary:  trim(f.get("summary")),
      url:      trim(f.get("url")) || null,
      category: f.get("category") || "announcement",
      audience: f.get("audience") || "both",
      pinned:   f.get("pinned") === "on",
      publishedAt: f.get("publishedAt") || new Date().toISOString(),
      source: "manual",
    };
    await saveRecord("news", f.get("id") || "", data, "news");
    setTab("news");
  });
  expose("adminDelNews", (id, title) => deleteRecord("news", id, "news", title));

  /* Calendars */
  expose("adminSaveCalendar", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const uniId = f.get("uniId");
    const semesterId = trim(f.get("semesterId"));
    if (!uniId || !semesterId) return showToast("აარჩიე უნივერსიტეტი და სემესტრის ID");
    const newSem = {
      id: semesterId,
      name: trim(f.get("name")),
      registration: { start: f.get("regStart"), end: f.get("regEnd") },
      semester:     { start: f.get("semStart"), end: f.get("semEnd") },
      addDrop:      { start: f.get("addStart"), end: f.get("addEnd") },
      midterms:     { start: f.get("midStart"), end: f.get("midEnd") },
      finals:       { start: f.get("finStart"), end: f.get("finEnd") },
    };
    const ref = fb.doc(fb.db, "calendars", uniId);
    const snap = await fb.getDoc(ref);
    const cur = snap.exists() ? snap.data() : { semesters: [], holidays: [] };
    const semesters = (cur.semesters || []).filter(s => s.id !== semesterId);
    semesters.push(newSem);
    await fb.setDoc(ref, { ...cur, semesters }, { merge: true });
    await logEvent("calendar_saved", { uniId, semesterId });
    showToast("შენახულია"); e.target.reset(); refresh();
  });
  expose("adminDelSemester", async (uniId, semId) => {
    if (!confirm(`წაიშალოს სემესტრი "${semId}"?`)) return;
    const ref = fb.doc(fb.db, "calendars", uniId);
    const snap = await fb.getDoc(ref);
    if (!snap.exists()) return;
    const cur = snap.data();
    const semesters = (cur.semesters || []).filter(s => s.id !== semId);
    await fb.setDoc(ref, { ...cur, semesters }, { merge: true });
    await logEvent("semester_deleted", { uniId, semId });
    refresh();
  });



  /* ===================== UI BUILDERS ===================== */

  /* Generic form-row helper */
  const F = (label, input) => `<div class="field"><label>${label}</label>${input}</div>`;

  /* ===================== RENDER BODY ===================== */
  let body = skList(4);
  const currentTab = TABS.find(t => t.id === tab) || TABS[0];

  try {
    if (tab === "dashboard") {
      const [users, unis, facs, news, logs] = await Promise.all([
        loadCollection("users"),
        loadCollection("universities"),
        loadCollection("faculties"),
        loadCollection("news"),
        loadCollection("logs", { orderBy: "createdAt", limit: 10 }),
      ]);
      const admins = users.filter(u => u.role === "admin").length;
      const mods   = users.filter(u => u.role === "moderator").length;
      const blocked = users.filter(u => u.blocked).length;
      body = `
        ${audienceChip("all")}
        <div class="admin-stat-grid">
          <div class="admin-stat"><div class="admin-stat-label">მომხმარებლები</div><div class="admin-stat-value">${users.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">ადმინები</div><div class="admin-stat-value">${admins}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">მოდერატორი</div><div class="admin-stat-value">${mods}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">დაბლოკილი</div><div class="admin-stat-value">${blocked}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">უნივერსიტეტი</div><div class="admin-stat-value">${unis.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">ფაკულტეტი</div><div class="admin-stat-value">${facs.length}</div></div>
          <div class="admin-stat"><div class="admin-stat-label">სიახლე</div><div class="admin-stat-value">${news.length}</div></div>
        </div>
        <div class="card" style="margin-top:14px">
          <h3 style="margin-top:0">ბოლო აქტივობა</h3>
          ${logs.length ? logs.map(l => `
            <div class="log-row">
              <span class="log-time">${fmtTime(l.createdAt)}</span>
              <span class="log-type">${escapeHtml(l.type)}</span>
              <span>${escapeHtml(l.actorEmail || "—")}</span>
            </div>`).join("") : `<p class="muted">ლოგები ცარიელია</p>`}
        </div>`;
    }

    else if (tab === "users") {
      const users = await loadCollection("users");
      body = `${audienceChip("all")}
        <div class="card" style="margin-bottom:14px;padding:12px">
          <div class="row between" style="gap:10px;flex-wrap:wrap;align-items:center">
            <input type="search" placeholder="🔎 ძიება სახელით ან გვარით…"
              oninput="__campus.adminUserSearch(this.value)"
              style="flex:1;min-width:220px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card,#fff);color:var(--text)" />
            <button class="btn btn-primary" onclick="__campus.adminExportUsers()" type="button">⬇ CSV ექსპორტი</button>
          </div>
        </div>
        <table class="admin-table">
          <thead><tr><th>სახელი</th><th>ელფოსტა</th><th>როლი</th><th>სტატუსი</th><th>ბოლო შესვლა</th><th></th></tr></thead>
          <tbody>
            ${users.map(u => {
              const first = u.firstName || "";
              const last  = u.lastName  || "";
              const fullName = [first, last].filter(Boolean).join(" ") || "—";
              const name = escapeHtml(fullName);
              const isMe = u.uid === user.uid;
              const searchHay = `${fullName} ${u.email || ""}`;
              return `<tr data-user-row data-search="${escapeHtml(searchHay)}">
                <td>
                  ${name}
                  <button class="btn" title="რედაქტირება" style="padding:2px 6px;font-size:11px;margin-left:6px" onclick="__campus.adminEditUserName('${u.uid}','${encodeURIComponent(first)}','${encodeURIComponent(last)}')">✏️</button>
                </td>
                <td style="font-size:13px">${escapeHtml(u.email || "—")}</td>
                 <td><span class="role-chip ${u.role === "admin" ? "admin" : (u.role === "moderator" ? "mod" : "student")}">${escapeHtml(u.role || "student")}</span></td>
                <td>${u.blocked ? `<span class="role-chip blocked">დაბლოკილი</span>` : `<span class="role-chip verified">აქტიური</span>`}</td>
                <td style="font-size:12px;color:var(--muted)">${fmtTime(u.lastLoginAt)}</td>
                <td>
                  <button class="btn" style="padding:4px 10px;font-size:12px" ${isMe ? "disabled" : ""} onclick="__campus.adminToggleBlock('${u.uid}', ${!!u.blocked})">${u.blocked ? "განბლოკვა" : "ბლოკი"}</button>
                   ${isAdmin ? `
                   <button class="btn" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe ? "disabled" : ""} onclick="__campus.adminToggleAdmin('${u.uid}', '${u.role || ""}')">${u.role === "admin" ? "ადმინის მოშორება" : "ადმინად"}</button>
                   <button class="btn" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe || u.role === "admin" ? "disabled" : ""} onclick="__campus.adminToggleMod('${u.uid}', '${u.role || ""}')">${u.role === "moderator" ? "მოდერ. მოშორება" : "მოდერატორად"}</button>
                   <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" ${isMe ? "disabled" : ""} onclick="__campus.adminDeleteUser('${u.uid}', '${escapeHtml(u.email || "").replace(/'/g, "\\'")}')">წაშლა</button>
                   ` : ""}
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>`;
    }

    else if (tab === "universities") {
      const unis = await loadCollection("universities");
      const edit = editId ? unis.find(u => u.id === editId) : null;
      body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `✏️ რედაქტირება: ${escapeHtml(edit.name)}` : "➕ ახალი უნივერსიტეტი"}</h3>
          <form onsubmit="__campus.adminSaveUni(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("დასახელება *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="თბილისის სახელმწიფო უნივერსიტეტი" />`)}
              ${F("აბრევიატურა *", `<input name="shortName" required value="${escapeHtml(edit?.shortName || "")}" placeholder="TSU" />`)}
              ${F("სრული დასახელება", `<input name="fullName" value="${escapeHtml(edit?.fullName || "")}" placeholder="ი. ჯავახიშვილის სახ. თბ. სახელმწიფო უნივერსიტეტი" />`)}
              ${F("ქალაქი *", `<input name="city" required value="${escapeHtml(edit?.city || "")}" placeholder="თბილისი" />`)}
              ${F("დაარსების წელი", `<input name="founded" type="number" min="1700" max="2100" value="${edit?.founded || ""}" placeholder="1918" />`)}
              
              ${F("რეიტინგი (0–5)", `<input name="rating" type="number" step="0.1" min="0" max="5" value="${edit?.rating || ""}" placeholder="4.5" />`)}
              ${F("ვებგვერდი", `<input name="website" type="url" value="${escapeHtml(edit?.website || "")}" placeholder="https://tsu.ge" />`)}
              ${F("ლოგო URL", `<input name="logoUrl" type="url" value="${escapeHtml(edit?.logoUrl || "")}" placeholder="https://..." />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('universities')">გაუქმება</button>` : ""}
            </div>
          </form>
        </div>
        <table class="admin-table">
          <thead><tr><th>დასახელება</th><th>აბრევ.</th><th>ქალაქი</th><th>რეიტ.</th><th></th></tr></thead>
          <tbody>
            ${unis.length ? unis.map(u => `<tr>
              <td>${escapeHtml(u.name)}</td>
              <td>${escapeHtml(u.shortName || "—")}</td>
              <td>${escapeHtml(u.city || "—")}</td>
              <td>★ ${u.rating || "—"}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('universities','${u.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelUni('${u.id}','${j(u.name)}')">🗑 წაშლა</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">ცარიელია — დაამატე პირველი ☝️</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "faculties") {
      const [unis, facs] = await Promise.all([loadCollection("universities"), loadCollection("faculties")]);
      const uniMap = Object.fromEntries(unis.map(u => [u.id, u.name]));
      const edit = editId ? facs.find(f => f.id === editId) : null;
      body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `✏️ რედაქტირება: ${escapeHtml(edit.name)}` : "➕ ახალი ფაკულტეტი"}</h3>
          ${unis.length ? `<form onsubmit="__campus.adminSaveFac(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("უნივერსიტეტი *", `<select name="uniId" required>${unis.map(u => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("დასახელება *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="ზუსტ და საბუნებისმეტყველო" />`)}
              ${F("დეკანი", `<input name="dean" value="${escapeHtml(edit?.dean || "")}" placeholder="გვარი სახელი" />`)}
              ${F("აღწერა", `<input name="description" value="${escapeHtml(edit?.description || "")}" />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('faculties')">გაუქმება</button>` : ""}
            </div>
          </form>` : `<p class="muted">ჯერ დაამატე უნივერსიტეტი.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>დასახელება</th><th>უნივერსიტეტი</th><th>დეკანი</th><th></th></tr></thead>
          <tbody>
            ${facs.length ? facs.map(f => `<tr>
              <td>${escapeHtml(f.name)}</td>
              <td>${escapeHtml(uniMap[f.uniId] || f.uniId || "—")}</td>
              <td>${escapeHtml(f.dean || "—")}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('faculties','${f.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelFac('${f.id}','${j(f.name)}')">🗑 წაშლა</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="4" class="muted" style="text-align:center;padding:32px">ცარიელია</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "subjects") {
      const [facs, unis, subs] = await Promise.all([loadCollection("faculties"), loadCollection("universities"), loadCollection("subjects")]);
      const uniMap = Object.fromEntries(unis.map(u => [u.id, u.shortName || u.name]));
      const facMap = Object.fromEntries(facs.map(f => [f.id, `${f.name} (${uniMap[f.uniId] || "?"})`]));
      const edit = editId ? subs.find(s => s.id === editId) : null;
      body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `✏️ რედაქტირება: ${escapeHtml(edit.name)}` : "➕ ახალი საგანი"}</h3>
          ${facs.length ? `<form onsubmit="__campus.adminSaveSubject(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("ფაკულტეტი *", `<select name="facultyId" required>${facs.map(f => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}</option>`).join("")}</select>`)}
              ${F("საგნის სახელი *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="ალგებრა I" />`)}
              ${F("კოდი", `<input name="code" value="${escapeHtml(edit?.code || "")}" placeholder="MATH101" />`)}
              ${F("ლექტორი", `<input name="lecturer" value="${escapeHtml(edit?.lecturer || "")}" placeholder="გვარი სახელი" />`)}
              ${F("ლექტორის ID (slug)", `<input name="lecturerId" value="${escapeHtml(edit?.lecturerId || "")}" placeholder="auto" />`)}
              ${F("კრედიტი", `<input name="credits" type="number" min="0" value="${edit?.credits || ""}" />`)}
              ${F("სემესტრი", `<input name="semester" value="${escapeHtml(edit?.semester || "")}" placeholder="შემოდგომა 2026" />`)}
            </div>
            ${F("სილაბუსი", `<textarea name="syllabus" rows="3">${escapeHtml(edit?.syllabus || "")}</textarea>`)}
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('subjects')">გაუქმება</button>` : ""}
            </div>
          </form>` : `<p class="muted">ჯერ დაამატე ფაკულტეტი.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>სახელი</th><th>კოდი</th><th>ფაკულტეტი</th><th>ლექტორი</th><th>კრედ.</th><th></th></tr></thead>
          <tbody>
            ${subs.length ? subs.map(s => `<tr>
              <td>${escapeHtml(s.name)}</td>
              <td>${escapeHtml(s.code || "—")}</td>
              <td style="font-size:12px">${escapeHtml(facMap[s.facultyId] || "—")}</td>
              <td>${escapeHtml(s.lecturer || "—")}</td>
              <td>${s.credits || 0}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('subjects','${s.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelSubject('${s.id}','${j(s.name)}')">🗑 წაშლა</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="6" class="muted" style="text-align:center;padding:32px">ცარიელია</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "resources") {
      const [subs, ress] = await Promise.all([loadCollection("subjects"), loadCollection("resources")]);
      const subMap = Object.fromEntries(subs.map(s => [s.id, s.name]));
      const edit = editId ? ress.find(r => r.id === editId) : null;
      body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `✏️ რედაქტირება` : "➕ ახალი რესურსი"}</h3>
          ${subs.length ? `<form onsubmit="__campus.adminSaveResource(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("საგანი *", `<select name="subjectId" required>${subs.map(s => `<option value="${s.id}" ${edit?.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}</select>`)}
              ${F("ტიპი", `<select name="type">${["PDF","Video","Link","Notes","Book"].map(t => `<option ${edit?.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>`)}
              ${F("სათაური *", `<input name="title" required value="${escapeHtml(edit?.title || "")}" />`)}
              ${F("URL *", `<input name="url" type="url" required value="${escapeHtml(edit?.url || "")}" />`)}
              ${F("ხმები", `<input name="upvotes" type="number" min="0" value="${edit?.upvotes || 0}" />`)}
            </div>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('resources')">გაუქმება</button>` : ""}
            </div>
          </form>` : `<p class="muted">ჯერ დაამატე საგანი.</p>`}
        </div>
        <table class="admin-table">
          <thead><tr><th>სათაური</th><th>ტიპი</th><th>საგანი</th><th>ხმები</th><th></th></tr></thead>
          <tbody>
            ${ress.length ? ress.map(r => `<tr>
              <td>${escapeHtml(r.title)}</td>
              <td>${escapeHtml(r.type)}</td>
              <td style="font-size:12px">${escapeHtml(subMap[r.subjectId] || "—")}</td>
              <td>▲ ${r.upvotes || 0}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('resources','${r.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelResource('${r.id}','${j(r.title)}')">🗑 წაშლა</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">ცარიელია</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "news") {
      const [unis, facs, items] = await Promise.all([
        loadCollection("universities"),
        loadCollection("faculties"),
        loadCollection("news", { orderBy: "createdAt" }),
      ]);
      const uniMap = Object.fromEntries(unis.map(u => [u.id, u.name]));
      const facMap = Object.fromEntries(facs.map(f => [f.id, f.name]));
      const edit = editId ? items.find(n => n.id === editId) : null;
      const cats = ["registration","event","deadline","scholarship","announcement"];
      const auds = [["both","ყველა"],["student","მხოლოდ სტუდენტი"]];
      body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? "✏️ რედაქტირება" : "➕ ახალი სიახლე"}</h3>
          <form onsubmit="__campus.adminSaveNews(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("უნივერსიტეტი", `<select name="uniId"><option value="">— ყველა (გლობალური) —</option>${unis.map(u => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("ვის ეჩვენება (ფაკულტეტი)", `<select name="facultyId"><option value="">— ყველა ფაკულტეტს —</option>${facs.map(f => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}${uniMap[f.uniId] ? ` (${escapeHtml(uniMap[f.uniId])})` : ""}</option>`).join("")}</select>`)}
              ${F("კატეგორია", `<select name="category">${cats.map(c => `<option value="${c}" ${edit?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
              ${F("აუდიენცია", `<select name="audience">${auds.map(([v,l]) => `<option value="${v}" ${edit?.audience === v ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
              ${F("ბმული", `<input name="url" type="url" value="${escapeHtml(edit?.url || "")}" />`)}
            </div>
            ${F("სათაური *", `<input name="title" required maxlength="200" value="${escapeHtml(edit?.title || "")}" />`)}
            ${F("მოკლე აღწერა *", `<textarea name="summary" rows="3" required>${escapeHtml(edit?.summary || "")}</textarea>`)}
            <label style="display:flex;align-items:center;gap:8px;margin:8px 0"><input type="checkbox" name="pinned" ${edit?.pinned ? "checked" : ""} /> 📌 დაამაგრე ზევით</label>
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('news')">გაუქმება</button>` : ""}
            </div>
          </form>
        </div>
        ${items.length ? items.map(n => `
          <div class="card" style="margin-bottom:10px">
            <div class="row between" style="align-items:flex-start;gap:14px">
              <div style="flex:1;min-width:0">
                <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:4px">
                  <span class="badge badge-primary" style="font-size:11px">${escapeHtml(uniMap[n.uniId] || (n.uniId ? n.uniId : "გლობალური"))}</span>
                  ${n.facultyId ? `<span class="badge" style="font-size:11px;background:#dbeafe;color:#1e40af">🏛 ${escapeHtml(facMap[n.facultyId] || n.facultyId)}</span>` : ""}
                  <span class="badge" style="font-size:11px">${escapeHtml(n.category || "—")}</span>
                  <span class="badge" style="font-size:11px;background:#f1f5f9;color:#475569">👁 ${escapeHtml(n.audience || "both")}</span>
                  ${n.pinned ? `<span class="badge" style="font-size:11px">📌</span>` : ""}
                </div>
                <h4 style="margin:0">${escapeHtml(n.title)}</h4>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${escapeHtml(n.summary || "")}</p>
              </div>
              <div style="white-space:nowrap;flex-shrink:0">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('news','${n.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelNews('${n.id}','${j(n.title)}')">🗑 წაშლა</button>
              </div>
            </div>
          </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">სიახლე ცარიელია</p>`}`;
    }

    else if (tab === "calendars") {
      const [unis, cals] = await Promise.all([loadCollection("universities"), loadCollection("calendars")]);
      const calMap = Object.fromEntries(cals.map(c => [c.id, c]));
      body = `${audienceChip("student")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">➕ სემესტრის დამატება / განახლება</h3>
          ${unis.length ? `<form onsubmit="__campus.adminSaveCalendar(event)">
            <div class="grid grid-2">
              ${F("უნივერსიტეტი *", `<select name="uniId" required>${unis.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("სემესტრის ID *", `<input name="semesterId" required placeholder="2026-spring" />`)}
            </div>
            ${F("დასახელება *", `<input name="name" required placeholder="გაზაფხულის სემესტრი 2026" />`)}
            ${[["regStart","regEnd","რეგისტრაცია"],["semStart","semEnd","სასწავლო პერიოდი"],["addStart","addEnd","Add/Drop"],["midStart","midEnd","შუალედური"],["finStart","finEnd","ფინალური"]].map(([a,b,l]) => `<div class="grid grid-2">
              ${F(`${l} — დაწყება`, `<input name="${a}" type="date" required />`)}
              ${F(`${l} — დასრულება`, `<input name="${b}" type="date" required />`)}
            </div>`).join("")}
            <button class="btn btn-primary" type="submit">შენახვა</button>
          </form>` : `<p class="muted">ჯერ დაამატე უნივერსიტეტი.</p>`}
        </div>
        ${unis.map(u => {
          const c = calMap[u.id];
          const sems = c?.semesters || [];
          return `<div class="card" style="margin-bottom:12px">
            <h4 style="margin:0 0 8px">${escapeHtml(u.name)}</h4>
            ${sems.length ? sems.map(s => `<div class="row between" style="padding:6px 0;border-top:1px solid var(--border)">
              <div style="min-width:0">
                <div style="font-weight:600;font-size:14px">${escapeHtml(s.name || s.id)}</div>
                <div class="muted" style="font-size:12px">სასწავლო: ${s.semester?.start || "—"} — ${s.semester?.end || "—"} · ფინალები: ${s.finals?.start || "—"} — ${s.finals?.end || "—"}</div>
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelSemester('${u.id}','${s.id}')">🗑 წაშლა</button>
            </div>`).join("") : `<p class="muted" style="margin:0;font-size:13px">სემესტრები ჯერ არ არის</p>`}
          </div>`;
        }).join("")}`;
    }


    else if (tab === "logs") {
      const logs = await loadCollection("logs", { orderBy: "createdAt", limit: 100 });
      body = `${audienceChip("all")}
        <div class="card" style="padding:0">
          <div class="log-row" style="background:var(--surface-2);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">
            <span>დრო</span><span>ტიპი</span><span>მომხმარებელი</span><span>დეტალები</span>
          </div>
          ${logs.length ? logs.map(l => `
            <div class="log-row">
              <span class="log-time">${fmtTime(l.createdAt)}</span>
              <span class="log-type">${escapeHtml(l.type)}</span>
              <span style="font-size:13px">${escapeHtml(l.actorEmail || "—")}</span>
              <span class="muted" style="font-size:12px;font-family:monospace">${escapeHtml(JSON.stringify(l.meta || {}))}</span>
            </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">ლოგები ცარიელია</p>`}
        </div>`;
    }

    else if (tab === "lecturers") {
      const [lects, facs, unis] = await Promise.all([
        loadCollection("lecturers"),
        loadCollection("faculties"),
        loadCollection("universities"),
      ]);
      const uniMap = Object.fromEntries(unis.map(u => [u.id, u.shortName || u.name]));
      const facMap = Object.fromEntries(facs.map(f => [f.id, `${f.name} (${uniMap[f.uniId] || "?"})`]));
      const edit = editId ? lects.find(l => l.id === editId) : null;
      body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">${edit ? `✏️ რედაქტირება: ${escapeHtml(edit.name)}` : "➕ ახალი ლექტორი"}</h3>
          <form onsubmit="__campus.adminSaveLect(event)">
            <input type="hidden" name="id" value="${edit?.id || ""}" />
            <div class="grid grid-2">
              ${F("სახელი გვარი *", `<input name="name" required value="${escapeHtml(edit?.name || "")}" placeholder="გვარი სახელი" />`)}
              ${F("წოდება/თანამდებობა", `<input name="title" value="${escapeHtml(edit?.title || "")}" placeholder="პროფესორი / ასისტენტი" />`)}
              ${F("უნივერსიტეტი", `<select name="uniId"><option value="">— აირჩიე —</option>${unis.map(u => `<option value="${u.id}" ${edit?.uniId === u.id ? "selected" : ""}>${escapeHtml(u.name)}</option>`).join("")}</select>`)}
              ${F("ფაკულტეტი", `<select name="facultyId"><option value="">— აირჩიე —</option>${facs.map(f => `<option value="${f.id}" ${edit?.facultyId === f.id ? "selected" : ""}>${escapeHtml(facMap[f.id])}</option>`).join("")}</select>`)}
              ${F("ძირითადი საგანი", `<input name="subject" value="${escapeHtml(edit?.subject || "")}" placeholder="ალგებრა" />`)}
              ${F("ფოტო URL", `<input name="photoUrl" type="url" value="${escapeHtml(edit?.photoUrl || "")}" />`)}
            </div>
            ${F("ბიოგრაფია", `<textarea name="bio" rows="3">${escapeHtml(edit?.bio || "")}</textarea>`)}
            <div class="row" style="gap:8px;margin-top:8px">
              <button class="btn btn-primary" type="submit">${edit ? "შენახვა" : "დამატება"}</button>
              ${edit ? `<button type="button" class="btn" onclick="__campus.adminCancelEdit('lecturers')">გაუქმება</button>` : ""}
            </div>
          </form>
        </div>
        <table class="admin-table">
          <thead><tr><th>სახელი</th><th>წოდება</th><th>ფაკულტეტი</th><th>საგანი</th><th></th></tr></thead>
          <tbody>
            ${lects.length ? lects.map(l => `<tr>
              <td>${escapeHtml(l.name)}</td>
              <td>${escapeHtml(l.title || "—")}</td>
              <td style="font-size:12px">${escapeHtml(facMap[l.facultyId] || "—")}</td>
              <td>${escapeHtml(l.subject || "—")}</td>
              <td style="white-space:nowrap">
                <button class="btn" style="padding:4px 10px;font-size:12px" onclick="__campus.adminEdit('lecturers','${l.id}')">✏️</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="__campus.adminDelLect('${l.id}','${j(l.name)}')">🗑 წაშლა</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">ცარიელია — დაამატე პირველი ლექტორი ☝️</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "lectRatings") {
      const [ratings, lects] = await Promise.all([
        loadCollection("lecturerRatings", { orderBy: "createdAt" }),
        loadCollection("lecturers"),
      ]);
      const lectMap = Object.fromEntries(lects.map(l => [l.id, l.name]));
      // aggregate
      const agg = {};
      ratings.forEach(r => {
        const k = r.lecturerId;
        if (!agg[k]) agg[k] = { sum: 0, n: 0 };
        agg[k].sum += Number(r.rating) || 0;
        agg[k].n += 1;
      });
      const summary = Object.entries(agg).map(([id, a]) => ({ id, name: lectMap[id] || id, avg: a.sum / a.n, n: a.n }))
        .sort((a, b) => b.avg - a.avg);
      body = `${audienceChip("both")}
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin-top:0">📊 საშუალო რეიტინგი</h3>
          ${summary.length ? `<table class="admin-table">
            <thead><tr><th>ლექტორი</th><th>საშუალო</th><th>შეფასებები</th></tr></thead>
            <tbody>${summary.map(s => `<tr>
              <td>${escapeHtml(s.name)}</td>
              <td>⭐ ${s.avg.toFixed(2)} / 5</td>
              <td>${s.n}</td>
            </tr>`).join("")}</tbody>
          </table>` : `<p class="muted">ჯერ არცერთი შეფასება არ არის</p>`}
        </div>
        <h3>ყველა შეფასება</h3>
        ${ratings.length ? ratings.map(r => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(lectMap[r.lecturerId] || r.lecturerId)} — ⭐ ${r.rating}/5</div>
                <div class="muted" style="font-size:12px">${escapeHtml(r.semester || "")} · ${escapeHtml(r.studentEmail || r.studentId || "")} · ${fmtTime(r.createdAt)}</div>
                ${r.comment ? `<p style="margin:6px 0 0">${escapeHtml(r.comment)}</p>` : ""}
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelRating('${r.id}')">🗑 წაშლა</button>
            </div>
          </div>`).join("") : `<p class="muted">ცარიელია</p>`}`;
    }

    else if (tab === "subjRatings") {
      const [ratings, subs] = await Promise.all([
        loadCollection("subjectRatings"),
        loadCollection("subjects"),
      ]);
      const subMap = Object.fromEntries(subs.map(s => [s.id, s.name]));
      const sorted = ratings.slice().sort((a,b) => {
        const ta = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
        const tb = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
        return tb - ta;
      });
      body = `${audienceChip("student")}
        <p class="muted">სტუდენტების მიერ მიცემული საგნის სირთულის შეფასებები. სულ: <b>${ratings.length}</b></p>
        ${sorted.length ? sorted.map(r => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(subMap[r.subjectId] || r.subjectId)}</div>
                <div class="muted" style="font-size:12px">
                  სირთულე ${r.difficulty}/5 · დატვ. ${r.workload}/5 · გამოცდა ${r.examHardness}/5 · გასაგებლობა ${r.clarity}/5 · ღირს ${r.worthIt}/5
                </div>
                <div class="muted" style="font-size:12px">user: ${escapeHtml(r.userId || "")} · ${fmtTime(r.updatedAt || r.createdAt)}</div>
                ${r.comment ? `<p style="margin:6px 0 0;white-space:pre-wrap">${escapeHtml(r.comment)}</p>` : ""}
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelSubjRating('${r.id}')">🗑 წაშლა</button>
            </div>
          </div>`).join("") : `<p class="muted">ცარიელია</p>`}`;
    }

    else if (tab === "qa") {
      const [items, subs] = await Promise.all([
        loadCollection("qaComments"),
        loadCollection("subjects"),
      ]);
      const subMap = Object.fromEntries(subs.map(s => [s.id, s.name]));
      const sorted = items.slice().sort((a,b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
      body = `${audienceChip("student")}
        <p class="muted">სტუდენტების Q&A კომენტარები საგნებზე. სულ: <b>${items.length}</b></p>
        ${sorted.length ? sorted.map(c => `
          <div class="card" style="margin-bottom:8px">
            <div class="row between" style="align-items:flex-start;gap:12px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${escapeHtml(c.author || "სტუდენტი")} <span class="muted" style="font-weight:400;font-size:12px">· ${escapeHtml(c.authorEmail || "")}</span></div>
                <div class="muted" style="font-size:12px">საგანი: <a href="#/subject/${escapeHtml(c.subjectId)}?tab=qa">${escapeHtml(subMap[c.subjectId] || c.subjectId)}</a> · ${fmtTime(c.createdAt)}</div>
                <p style="margin:8px 0 0;white-space:pre-wrap;word-break:break-word">${escapeHtml(c.text || "")}</p>
              </div>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelQA('${c.id}')">🗑 წაშლა</button>
            </div>
          </div>`).join("") : `<p class="muted" style="text-align:center;padding:32px">Q&A კომენტარები ცარიელია</p>`}`;
    }

    else if (tab === "materials") {
      const [mats, subs] = await Promise.all([
        loadCollection("materials"),
        loadCollection("subjects"),
      ]);
      const subMap = Object.fromEntries(subs.map(s => [s.id, s.name]));
      const sorted = mats.slice().sort((a,b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
      body = `${audienceChip("student")}
        <p class="muted">სტუდენტების მიერ ატვირთული მასალები. სულ: <b>${mats.length}</b></p>
        <table class="admin-table">
          <thead><tr><th>სათაური</th><th>საგანი</th><th>ატვირთა</th><th>დრო</th><th></th></tr></thead>
          <tbody>
            ${sorted.length ? sorted.map(m => `<tr>
              <td>${escapeHtml(m.title || "—")}${m.url ? ` <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener" style="font-size:12px">↗</a>` : ""}</td>
              <td style="font-size:12px">${escapeHtml(subMap[m.subjectId] || m.subjectId || "—")}</td>
              <td style="font-size:12px">${escapeHtml(m.uploadedByEmail || m.uploadedBy || "—")}</td>
              <td style="font-size:12px">${fmtTime(m.createdAt)}</td>
              <td><button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="__campus.adminDelMaterial('${m.id}','${j(m.title || "")}')">🗑 წაშლა</button></td>
            </tr>`).join("") : `<tr><td colspan="5" class="muted" style="text-align:center;padding:32px">ცარიელია</td></tr>`}
          </tbody>
        </table>`;
    }

    else if (tab === "reports") {
      const reports = await loadAllReports(500);
      const open = reports.filter(r => r.status === "open");
      const resolved = reports.filter(r => r.status !== "open");
      const card = (r, isOpen) => {
        const meta = REPORT_TYPES[r.type] || { label: r.type };
        const payload = encodeURIComponent(JSON.stringify({
          id: r.id, type: r.type, targetId: r.targetId, targetCollection: r.targetCollection,
        }));
        return `<div class="card" style="margin-bottom:10px;border-left:4px solid ${isOpen ? "#dc2626" : "#16a34a"}">
          <div class="row between" style="align-items:flex-start;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:240px">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span class="badge" style="background:#dc262615;color:#dc2626;border-color:#dc262640">${escapeHtml(meta.label)}</span>
                <span class="badge ${isOpen ? "badge-danger" : "badge-primary"}">${isOpen ? "ღია" : "დახურული"}</span>
                <span class="muted" style="font-size:12px">${fmtTime(r.createdAt)}</span>
              </div>
              <div style="margin-top:8px;font-weight:600">მიზეზი: ${escapeHtml(r.reason || "—")}</div>
              <div class="muted" style="font-size:12px;margin-top:4px">გასაჩივრება: <b>${escapeHtml(r.reporterEmail || r.reporterId || "—")}</b></div>
              <div class="muted" style="font-size:12px">ობიექტი: <code>${escapeHtml(r.targetId || "")}</code></div>
              ${r.contextText ? `<div class="card" style="background:var(--bg);padding:10px 12px;margin-top:8px;font-size:13px;white-space:pre-wrap;word-break:break-word">${escapeHtml(r.contextText)}</div>` : ""}
            </div>
            <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">
              ${isOpen ? `
                <button class="btn btn-danger" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportDeleteContent('${payload}')">🗑 შინაარსის წაშლა</button>
                <button class="btn" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportResolve('${r.id}')">✓ უარყოფა</button>
              ` : ""}
              <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="__campus.adminReportDelete('${r.id}')">წაშლა</button>
            </div>
          </div>
        </div>`;
      };
      body = `${audienceChip("all")}
        <p class="muted">სტუდენტების გასაჩივრებები კონტენტზე. ღია ჩანაწერების მოდერაცია პრიორიტეტულია.</p>
        <div class="grid grid-3" style="margin-bottom:18px">
          <div class="card stat"><div class="stat-num" style="color:#dc2626">${open.length}</div><div class="stat-label">ღია</div></div>
          <div class="card stat"><div class="stat-num">${resolved.length}</div><div class="stat-label">დახურული</div></div>
          <div class="card stat"><div class="stat-num">${reports.length}</div><div class="stat-label">სულ</div></div>
        </div>
        <h3 style="margin:0 0 10px">🔴 ღია გასაჩივრებები</h3>
        ${open.length ? open.map(r => card(r, true)).join("") : `<p class="muted" style="text-align:center;padding:20px">ღია გასაჩივრებები არ არის. 🎉</p>`}
        ${resolved.length ? `<h3 style="margin:22px 0 10px">✅ დახურული გასაჩივრებები</h3>${resolved.slice(0, 50).map(r => card(r, false)).join("")}` : ""}
      `;
    }

    else if (tab === "faq") {
      const { listFaqAll, addFaq, deleteFaq } = await import("../faq.js");
      const { universities, faculties } = await import("../data.js");

      expose("adminFaqAdd", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await addFaq({
            topic: fd.get("topic"),
            title: fd.get("title"),
            body:  fd.get("body"),
            scope: fd.get("scope"),
            uniId: fd.get("uniId") || "",
            facultyId: fd.get("facultyId") || "",
          });
          showToast("დაემატა"); e.target.reset(); refresh();
        } catch (err) { showToast(err.message || "შეცდომა"); }
      });
      expose("adminFaqDel", async (id) => {
        if (!confirm("წავშალო?")) return;
        await deleteFaq(id); showToast("წაიშალა"); refresh();
      });
      // dynamic faculty dropdown
      expose("adminFaqScope", (sel) => {
        const form = sel.form;
        const sc = form.scope.value;
        form.querySelector("[data-uni-row]").style.display  = (sc === "uni" || sc === "faculty") ? "" : "none";
        form.querySelector("[data-fac-row]").style.display  = (sc === "faculty") ? "" : "none";
      });
      expose("adminFaqUni", (sel) => {
        const form = sel.form;
        const uniId = form.uniId.value;
        const facSel = form.facultyId;
        const opts = faculties.filter(f => f.uniId === uniId)
          .map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`).join("");
        facSel.innerHTML = `<option value="">— აირჩიე ფაკულტეტი —</option>${opts}`;
      });

      const items = await listFaqAll();
      const uniName = (id) => universities.find(u => u.id === id)?.name || id || "—";
      const facName = (id) => faculties.find(f => f.id === id)?.name || id || "—";
      const scopeLabel = (f) => {
        if (f.scope === "uni")     return `🏛 ${escapeHtml(uniName(f.uniId))}`;
        if (f.scope === "faculty") return `🎓 ${escapeHtml(uniName(f.uniId))} · ${escapeHtml(facName(f.facultyId))}`;
        return `🌐 ყველა სტუდენტი`;
      };

      body = `${audienceChip("all")}
        <p class="muted">ხშირად დასმული კითხვების ბაზის მართვა (Firestore). შესაძლებელია მითითება, რომელი უნივერსიტეტის რომელი ფაკულტეტის სტუდენტები ნახავენ თემას.</p>
        <div class="card" style="margin-bottom:14px">
          <h3 style="margin:0 0 10px">+ ახალი ჩანაწერი</h3>
          <form onsubmit="__campus.adminFaqAdd(event)" class="stack" style="gap:10px">
            <input name="topic" placeholder="თემა (მაგ. მობილობა)" required maxlength="60" />
            <input name="title" placeholder="კითხვა (სათაური)" required maxlength="160" />
            <textarea name="body" placeholder="პასუხის ტექსტი" required rows="4" maxlength="2000"></textarea>

            <label class="muted" style="font-size:12px;margin-bottom:-4px">ვის ნახავს?</label>
            <select name="scope" onchange="__campus.adminFaqScope(this)" required>
              <option value="all">🌐 ყველა სტუდენტი</option>
              <option value="uni">🏛 კონკრეტული უნივერსიტეტი</option>
              <option value="faculty">🎓 კონკრეტული ფაკულტეტი</option>
            </select>

            <div data-uni-row style="display:none">
              <select name="uniId" onchange="__campus.adminFaqUni(this)">
                <option value="">— აირჩიე უნივერსიტეტი —</option>
                ${universities.map(u => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.name)}</option>`).join("")}
              </select>
            </div>
            <div data-fac-row style="display:none">
              <select name="facultyId">
                <option value="">— ჯერ აირჩიე უნივერსიტეტი —</option>
              </select>
            </div>

            <button class="btn btn-primary" type="submit">დამატება</button>
          </form>
        </div>
        <h3 style="margin:18px 0 10px">არსებული ჩანაწერები (${items.length})</h3>
        ${items.length ? `<div class="stack">${items.map(f => `
          <div class="card">
            <div class="row between" style="gap:8px;flex-wrap:wrap">
              <div style="min-width:0">
                <div style="font-weight:600">${escapeHtml(f.title)}</div>
                <div class="muted" style="font-size:12px">თემა: ${escapeHtml(f.topic)} · ხილვადობა: ${scopeLabel(f)}</div>
              </div>
              <button class="btn btn-ghost" onclick="__campus.adminFaqDel('${f.id}')">წაშლა</button>
            </div>
            <div style="margin-top:8px;line-height:1.6;white-space:pre-wrap">${escapeHtml(f.body)}</div>
          </div>
        `).join("")}</div>` : `<p class="muted">ჯერ ცარიელია.</p>`}
      `;
    }


  } catch (err) {
    console.error("admin load error", err);
    body = `<div class="card"><h3>შეცდომა</h3><p class="muted">${escapeHtml(err.message || "უცნობი შეცდომა")}</p></div>`;
  }

  /* ===== SIDEBAR NAV grouped by audience ===== */
  const groups = ["general","shared","student"];
  const nav = groups.map(g => {
    const items = TABS.filter(t => t.group === g && canSeeTab(t.id));
    if (!items.length) return "";
    const meta = g === "student" ? AUDIENCE_META.student
              : g === "shared"  ? AUDIENCE_META.both
              : AUDIENCE_META.all;
    return `<div class="admin-nav-group">
      <div class="admin-nav-group-label" style="color:${meta.color}">${meta.icon} ${GROUP_LABEL[g]}</div>
      ${items.map(t => `<button class="${tab === t.id ? "active" : ""}" onclick="__campus.adminTab('${t.id}')">${escapeHtml(t.label)}</button>`).join("")}
    </div>`;
  }).join("");

  return `
    <div class="admin-shell">
      <aside class="admin-side">
        <h2>${isAdmin ? "🛡️ Admin Panel" : "🧑‍⚖️ Moderator Panel"}</h2>
        <nav class="admin-nav">${nav}</nav>
      </aside>
      <section class="admin-main">
        <div class="admin-header">
          <h1>${escapeHtml(currentTab.label)}</h1>
          <p>შესული ხარ როგორც <b>${escapeHtml(user.email)}</b></p>
        </div>
        ${body}
      </section>
    </div>`;
};
