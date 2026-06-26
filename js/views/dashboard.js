import { universities, subjects } from "../data.js";
import { getExams } from "../state.js";
import { getUser, getProfile, getFirstName } from "../auth.js";
import { escapeHtml, daysUntil } from "../ui.js";
import { newsItems } from "../news-data.js";
import { semesterStatusFor } from "./academic.js";
import { firebaseEnabled, loadFirebase } from "../firebase.js";
import { refresh } from "../router.js";
import { expose } from "../ui.js";
import { lectureOccursOn } from "./schedule.js";


/* Students-in-faculty cache (loaded once per session) */
let _facStudents = null;
let _facStudentsFor = null;
let _facStudentsOpen = false;
let _facStudentsLoading = false;
const loadFacultyStudents = async (facultyId) => {
  if (!facultyId || !firebaseEnabled) return [];
  if (_facStudentsFor === facultyId && _facStudents) return _facStudents;
  try {
    _facStudentsLoading = true;
    const fb = await loadFirebase();
    const snap = await fb.getDocs(fb.collection(fb.db, "users"));
    const list = snap.docs
      .map(d => ({ uid: d.id, ...d.data() }))
      .filter(u => u.facultyId === facultyId && u.role !== "admin")
      .sort((a, b) => (a.firstName || a.email || "").localeCompare(b.firstName || b.email || ""));
    _facStudents = list;
    _facStudentsFor = facultyId;
    _facStudentsLoading = false;
    setTimeout(() => { try { refresh(); } catch {} }, 0);
    return list;
  } catch (e) {
    _facStudentsLoading = false;
    console.warn("dashboard students load", e?.message || e);
    return [];
  }
};

expose("dashToggleStudents", (facultyId) => {
  _facStudentsOpen = !_facStudentsOpen;
  if (_facStudentsOpen && facultyId && _facStudentsFor !== facultyId) {
    loadFacultyStudents(facultyId);
  }
  try { refresh(); } catch {}
});

const SCHED_KEY = "campus.schedule";
const readSched = () => { try { return JSON.parse(localStorage.getItem(SCHED_KEY) || "[]"); } catch { return []; } };
const todayIdx = () => (new Date().getDay() + 6) % 7;
const todayYmdStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const toMin = (t) => { if (!t) return 0; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export const dashboardView = () => {

  const user = getUser();
  const name = getFirstName();
  const profile = getProfile();

  
  const exams = getExams();
  const allUpcoming = exams.map(e => ({ ...e, d: daysUntil(e.date) })).filter(e => e.d >= 0);
  const upcomingExams = allUpcoming.filter(e => (e.kind || "exam") === "exam").slice(0, 3);
  const upcomingQuizzes = allUpcoming.filter(e => e.kind === "quiz").slice(0, 3);
  const upcoming = allUpcoming.slice(0, 2);
  const reminders = exams
    .map(e => ({ ...e, d: daysUntil(e.date) }))
    .filter(e => e.d >= 0 && e.d <= (e.reminderDays ?? 3))
    .slice(0, 3);

  const hour = new Date().getHours();
  const greet = hour < 6 ? "კარგი ღამე" : hour < 12 ? "დილა მშვიდობისა" : hour < 18 ? "მოგესალმები" : "საღამო მშვიდობისა";

  const tymd = todayYmdStr();
  const sched = readSched()
    .filter(x => lectureOccursOn(x, tymd))
    .sort((a, b) => a.start.localeCompare(b.start));
  const now = nowMin();
  const todayUpcoming = sched.filter(x => toMin(x.end) > now).slice(0, 3);

  const todayIsoStr = tymd;
  const todayExams = exams.filter(e => e.date === todayIsoStr);
  // Build a swipeable list of today's events (sorted earliest first)
  const todayEvents = [];
  sched.forEach(l => todayEvents.push({
    kind: "lecture",
    kindLabel: "დღევანდელი ლექცია",
    title: l.title || "ლექცია",
    time: l.start + (l.end ? " – " + l.end : ""),
    where: l.location || "",
    who: l.lecturer || "",
    startMin: toMin(l.start),
  }));
  todayExams.forEach(ex => todayEvents.push({
    kind: ex.kind === "quiz" ? "quiz" : "exam",
    kindLabel: ex.kind === "quiz" ? "დღევანდელი ქვიზი" : "დღევანდელი გამოცდა",
    title: ex.title || (ex.kind === "quiz" ? "ქვიზი" : "გამოცდა"),
    time: ex.time || "დღეს",
    where: ex.location || "",
    who: "",
    startMin: ex.time ? toMin(ex.time) : 24 * 60,
  }));
  todayEvents.sort((a, b) => (a.startMin ?? 0) - (b.startMin ?? 0));

  const renderSlide = (ev) => {
    const mins = ev.startMin != null ? Math.max(0, ev.startMin - now) : null;
    const countdown = mins == null ? "" :
      mins === 0 ? "ახლა მიმდინარეობს" :
      mins < 60 ? `იწყება ${mins} წუთში` :
      `იწყება ${Math.floor(mins / 60)} სთ ${mins % 60 ? (mins % 60) + " წთ" : ""}-ში`;
    return `<div class="ne-slide">
      <div class="next-event-kind">${escapeHtml(ev.kindLabel)}</div>
      <div class="next-event-title">${escapeHtml(ev.title)}</div>
      <div class="next-event-meta">
        <span class="ne-meta-item"><span class="ne-meta-lbl">დრო</span>${escapeHtml(ev.time)}</span>
        ${ev.where ? `<span class="ne-meta-item"><span class="ne-meta-lbl">ოთახი</span>${escapeHtml(ev.where)}</span>` : ""}
        ${ev.who ? `<span class="ne-meta-item"><span class="ne-meta-lbl">ლექტორი</span>${escapeHtml(ev.who)}</span>` : ""}
      </div>
      ${countdown ? `<div class="next-event-countdown">${countdown}</div>` : ""}
    </div>`;
  };

  let nextEventCard;
  if (todayEvents.length) {
    const dots = todayEvents.length > 1
      ? `<div class="ne-dots" role="tablist" aria-label="დღევანდელი ღონისძიებები">
          ${todayEvents.map((_, i) => `<span class="ne-dot${i === 0 ? " active" : ""}" data-i="${i}"></span>`).join("")}
        </div>`
      : "";
    nextEventCard = `
      <div class="card next-event-card" aria-label="დღევანდელი ღონისძიებები" data-init="neCarousel">
        <div class="ne-scroll">${todayEvents.map(renderSlide).join("")}</div>
        ${dots}
      </div>`;
  } else {
    nextEventCard = `
      <div class="card next-event-card next-event-card--free" aria-label="დღევანდელი დღე">
        <div class="next-event-kind">დღეს</div>
        <div class="next-event-title">აქტივობა არ არის დაგეგმილი</div>
      </div>`;
  }

  const sidePanels = `<aside class="dash-side">${nextEventCard}</aside>`;

  // Today strip: combined lectures + exams when both empty
  const todayEmpty = !todayUpcoming.length && !upcoming.length;

  return `


    <section class="dash-hero">
      <div class="dash-hero-text">
        <h1>${greet},<br/><span class="text-gradient">${escapeHtml(name)}</span></h1>

      </div>
      ${sidePanels}
    </section>

    ${reminders.length ? `<div class="dash-reminders" role="region" aria-label="შემახსენებლები">
      <div class="dash-reminders-head">
        <span class="section-eyebrow">შემახსენებლები</span>
        <a class="dash-link" href="#/schedule">სრულად →</a>
      </div>
      <div class="dash-reminder-list">
        ${reminders.map(r => {
          const k = r.kind === "quiz" ? "ქვიზი" : "გამოცდა";
          return `<a href="#/schedule" class="dash-reminder-item">
            <span class="dr-kind">${k}</span>
            <span class="dr-title">${escapeHtml(r.title)}</span>
            <span class="dr-date muted">${r.date}</span>
            <span class="badge ${r.d <= 1 ? "badge-danger" : "badge-primary"} dr-badge">${r.d === 0 ? "დღეს" : `${r.d}დ`}</span>
          </a>`;
        }).join("")}
      </div>
    </div>` : ""}

    <div class="dash-block">
      <a class="btn btn-primary btn-lg dash-schedule-btn" href="#/schedule" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 18px;font-size:15px">
        <span aria-hidden="true">📅</span>
        <span>განრიგი</span>
      </a>
    </div>

    ${(() => {
      const status = semesterStatusFor("tsu");
      if (!status) return "";
      const headline = status.finalsLeft != null
        ? `ფინალურამდე — <b>${status.finalsLeft}</b> დღე`
        : status.daysLeft != null
          ? `სემესტრის ბოლომდე — <b>${status.daysLeft}</b> დღე`
          : `${escapeHtml(status.sem.name)}`;
      return `<a href="#/academic" class="card sem-progress-card dash-block-card" aria-label="აკადემიური კალენდარი">
        <div class="row between" style="margin-bottom:10px;flex-wrap:nowrap;gap:8px">
          <div style="min-width:0">
            <div class="section-eyebrow" style="margin-bottom:4px">სემესტრი</div>
            <div style="font-weight:600;font-size:14px">${headline}</div>
            <div class="muted" style="font-size:12px;margin-top:2px">${escapeHtml(status.sem.name)}</div>
          </div>
          <span class="muted" style="font-size:13px;flex-shrink:0;font-variant-numeric:tabular-nums">${status.progress}%</span>
        </div>
        <div class="progress" aria-label="სემესტრის წინსვლა"><div class="progress-bar" style="width:${status.progress}%"></div></div>
      </a>`;
    })()}

    ${(() => {
      const top = [...newsItems]
        .sort((a, b) =>
          (Number(b.pinned) - Number(a.pinned)) ||
          (new Date(b.publishedAt) - new Date(a.publishedAt)))
        .slice(0, 2);
      if (!top.length) return "";
      const uniMap = Object.fromEntries(universities.map(u => [u.id, u]));
      return `<div class="dash-block">
        <div class="dash-col-head">
          <span class="section-eyebrow">სიახლეები</span>
          <a class="dash-link" href="#/news">სრულად →</a>
        </div>
        <div class="stack">
          ${top.map(n => `<a class="card news-mini" href="#/news">
            <div class="news-mini-top">
              <span class="news-uni">${escapeHtml(uniMap[n.uniId]?.name || n.uniId)}</span>
              ${n.pinned ? `<span class="news-pin" aria-label="დაპინული">●</span>` : ""}
            </div>
            <div class="news-mini-title">${escapeHtml(n.title)}</div>
          </a>`).join("")}
        </div>
      </div>`;
    })()}

    <div class="dash-block">
      <div class="dash-col-head"><span class="section-eyebrow">${T("dash.quick.eyebrow")}</span></div>
      <div class="grid grid-3 quick-grid">
        <a class="card quick" href="#/chats"><div class="qi">💬</div><h3>${T("dash.quick.forums.title")}</h3><p class="muted">${T("dash.quick.forums.body")}</p></a>
        <a class="card quick" href="#/resources"><div class="qi">📚</div><h3>${T("dash.quick.resources.title")}</h3><p class="muted">${T("dash.quick.resources.body")}</p></a>
        <a class="card quick" href="#/faq"><div class="qi">❓</div><h3>${T("dash.quick.faq.title")}</h3><p class="muted">${T("dash.quick.faq.body")}</p></a>
        <a class="card quick" href="#/lecturers"><div class="qi">👨‍🏫</div><h3>${T("dash.quick.lecturers.title")}</h3><p class="muted">${T("dash.quick.lecturers.body")}</p></a>
        <a class="card quick" href="#/schedule"><div class="qi">📅</div><h3>${T("dash.quick.calendar.title")}</h3><p class="muted">${T("dash.quick.calendar.body")}</p></a>
        <a class="card quick" href="#/gpa"><div class="qi">🧮</div><h3>${T("dash.quick.gpa.title")}</h3><p class="muted">${T("dash.quick.gpa.body")}</p></a>
      </div>
    </div>

  `;
};
