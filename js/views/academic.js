// აკადემიური კალენდარი — სემესტრის ფაზები, არდადეგები, ICS ექსპორტი
import { universities } from "../data.js";
import { academicCalendar, ACADEMIC_PHASES, getCurrentSemester, getCurrentPhase } from "../academic-data.js";
import { escapeHtml, expose, showToast } from "../ui.js";
import { buildIcs, downloadIcs, dayAfter } from "../ics.js";

const KEY = "campus.academicUni";
const supportedIds = () => Object.keys(academicCalendar);
const supportedUnisList = () => universities.filter(u => supportedIds().includes(u.id));

const readUni = () => {
  const v = localStorage.getItem(KEY);
  const ids = supportedIds();
  if (v && ids.includes(v)) return v;
  return ids[0] || "";
};
const writeUni = (id) => localStorage.setItem(KEY, id);

const fmtDate = (s) =>
  new Date(s).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (s) =>
  new Date(s).toLocaleDateString("ka-GE", { day: "numeric", month: "short" });

const daysBetween = (a, b) =>
  Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

const semProgress = (sem) => {
  const now = Date.now();
  const s = new Date(sem.semester.start).getTime();
  const e = new Date(sem.semester.end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
};

// build ICS events from a single semester (incl. holidays of selected uni)
const buildSemesterIcs = (uniId, semId) => {
  const uni = academicCalendar[uniId];
  const sem = uni.semesters.find(s => s.id === semId);
  const events = [];
  const phaseList = [
    ["registration", "რეგისტრაცია"],
    ["addDrop",      "Add / Drop"],
    ["midterms",     "შუალედური გამოცდები"],
    ["finals",       "ფინალური გამოცდები"],
    ["semester",     "სასწავლო პერიოდი"],
  ];
  for (const [k, label] of phaseList) {
    if (!sem[k]) continue;
    events.push({
      uid: `${uniId}-${sem.id}-${k}`,
      title: `${uni.name} · ${label}`,
      start: sem[k].start,
      end:   dayAfter(sem[k].end),  // DTEND exclusive
      description: `${sem.name} — ${ACADEMIC_PHASES[k]?.label || label}`,
    });
  }
  for (const h of uni.holidays || []) {
    events.push({
      uid: `${uniId}-holiday-${h.date}`,
      title: `🏖 ${h.name}`,
      start: h.date,
      end: dayAfter(h.date),
    });
  }
  return buildIcs(events, `${uni.name} — ${sem.name}`);
};

export const academicView = () => {
  const ids = supportedIds();
  if (!ids.length) {
    return `<nav class="crumbs" aria-label="ნაკადი"><a href="#/">მთავარი</a> / კალენდარი</nav>
      <div class="empty"><div class="ico">📅</div>კალენდარი ცარიელია.<br/><span class="muted">ადმინი დაამატებს.</span></div>`;
  }
  const uniId = readUni();
  const uni = academicCalendar[uniId];
  const today = new Date();
  const currentSem = getCurrentSemester(uniId, today);

  expose("acadSetUni", (id) => {
    if (!supportedIds().includes(id)) return;
    writeUni(id);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  // ICS export disabled per product decision.

  const renderSemester = (sem) => {
    const isCurrent = sem.id === currentSem?.id;
    const phase = isCurrent ? getCurrentPhase(sem, today) : null;
    const progress = semProgress(sem);
    const t = today.toISOString().slice(0, 10);

    // build timeline phases in chronological order
    const phaseOrder = ["registration", "semester", "addDrop", "midterms", "finals"];
    const phaseItems = phaseOrder
      .filter(k => sem[k])
      .map(k => ({ key: k, ...sem[k], meta: ACADEMIC_PHASES[k] }));

    const phaseRow = (p) => {
      const past = p.end < t;
      const live = p.start <= t && t <= p.end;
      const future = p.start > t;
      const status = live ? "live" : past ? "past" : "future";
      let badge = "";
      if (live) {
        const left = daysBetween(today, p.end);
        badge = `<span class="live-pill" style="color:${p.meta.color}">● მიმდინარეობს · ${left}დ დარჩა</span>`;
      } else if (future) {
        badge = `<span class="muted" style="font-size:12px">⏳ დაიწყება ${daysBetween(today, p.start)}დ-ში</span>`;
      } else {
        badge = `<span class="muted" style="font-size:12px">✓ დასრულდა</span>`;
      }
      return `<div class="tl-item ${status}" style="--c:${p.meta.color}">
        <div class="tl-time">
          <div class="tl-start">${fmtShort(p.start)}</div>
          <div class="tl-end muted">${fmtShort(p.end)}</div>
        </div>
        <div class="tl-bar"></div>
        <div class="tl-body">
          <div class="tl-title">${p.meta.icon} ${p.meta.label}</div>
          <div class="tl-meta">${badge}</div>
        </div>
      </div>`;
    };

    return `<article class="card semester-card ${isCurrent ? "is-current" : ""}">
      <div class="row between" style="flex-wrap:wrap;gap:8px;margin-bottom:14px">
        <div>
          <h2 style="margin:0;font-size:18px">${escapeHtml(sem.name)}</h2>
          <p class="muted" style="margin:4px 0 0;font-size:13px">
            ${fmtDate(sem.semester.start)} — ${fmtDate(sem.semester.end)}
          </p>
        </div>
        ${isCurrent ? `<span class="badge badge-primary">${ACADEMIC_PHASES[phase]?.icon || "📚"} ${ACADEMIC_PHASES[phase]?.label || "მიმდინარე"}</span>` : ""}
      </div>

      ${isCurrent ? `
        <div class="progress" aria-label="სემესტრის წინსვლა ${progress}%">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
        <p class="muted" style="font-size:12px;margin:6px 0 16px">სემესტრის ${progress}% დასრულდა</p>
      ` : ""}

      <div class="timeline academic-timeline">
        ${phaseItems.map(phaseRow).join("")}
      </div>
    </article>`;
  };

  const uniChips = supportedUnisList().map(u => `
    <button type="button" class="chip ${u.id === uniId ? "active" : ""}"
      onclick="__campus.acadSetUni('${u.id}')">${escapeHtml(u.name)}</button>`).join("");

  const holidayList = (uni.holidays || []).map(h => `
    <li class="holiday-item">
      <span class="holiday-date">${fmtShort(h.date)}</span>
      <span class="holiday-name">${escapeHtml(h.name)}</span>
    </li>`).join("");

  return `
    <nav class="crumbs" aria-label="ნაკადი"><a href="#/">მთავარი</a> / აკადემიური კალენდარი</nav>
    <div class="page-head">
      <div>
        <h1 style="margin:0">🎓 აკადემიური კალენდარი</h1>
        <p class="muted" style="margin:4px 0 0">სემესტრის ფაზები, შუალედური/ფინალური ვადები და არდადეგები</p>
      </div>
    </div>

    <div class="chip-row" role="group" aria-label="უნივერსიტეტი" style="margin:10px 0 20px">
      ${uniChips}
    </div>

    <div class="stack" style="gap:18px">
      ${uni.semesters.map(renderSemester).join("")}
    </div>

    ${holidayList ? `
      <h2 class="section-title">🏖 ოფიციალური დასვენების დღეები</h2>
      <ul class="holiday-grid card">${holidayList}</ul>
    ` : ""}

    <p class="muted" style="margin-top:24px;font-size:12px;text-align:center">
      ℹ თარიღები მიახლოებითია. უნივერსიტეტებიდან ოფიციალური გრაფიკის მიღების შემდეგ მონაცემები განახლდება.
    </p>
  `;
};

// Helper for dashboard widget
export const semesterStatusFor = (uniId) => {
  if (!supportedIds().includes(uniId)) uniId = readUni();
  if (!uniId) return null;
  const sem = getCurrentSemester(uniId);
  if (!sem) return null;
  const t = new Date().toISOString().slice(0, 10);
  const inSession = sem.semester.start <= t && t <= sem.semester.end;
  const progress = semProgress(sem);
  const daysLeft = inSession ? daysBetween(new Date(), sem.semester.end) : null;
  const finalsLeft = sem.finals && sem.finals.start > t
    ? daysBetween(new Date(), sem.finals.start) : null;
  return { uniId, sem, progress, daysLeft, finalsLeft, inSession };
};
