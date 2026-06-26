// განრიგი — Calendar-first view: lectures + exams + quizzes
import { expose, escapeHtml, showToast } from "../ui.js";
import { refresh } from "../router.js";
import { getExams, addExam, removeExam } from "../state.js";

const T = (k, v) => (window.T ? window.T(k, v) : k);

const KEY = "campus.schedule";
const DAYS_SHORT = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"];
const DAYS_FULL = ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"];
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

const readLec = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const writeLec = (v) => localStorage.setItem(KEY, JSON.stringify(v));

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const todayYmd = () => ymd(new Date());
const dowMon0 = (d) => (d.getDay() + 6) % 7; // Monday=0
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };

// Lecture occurs on `ymdStr` if: same weekday, within [firstDate, firstDate+27], not skipped.
// Legacy lectures (no firstDate) match every week (backwards compat).
export const lectureOccursOn = (l, ymdStr) => {
  const dow = dowMon0(parseYmd(ymdStr));
  if (l.day !== dow) return false;
  if (l.firstDate) {
    if (ymdStr < l.firstDate) return false;
    if (ymdStr > addDays(l.firstDate, 27)) return false;
  }
  if (Array.isArray(l.skipDates) && l.skipDates.includes(ymdStr)) return false;
  return true;
};

const COLORS = { lecture: "#6d5cf6", exam: "#ef4444", quiz: "#10b981" };
const ICONS = { lecture: "📚", exam: "📝", quiz: "🧠" };
const KIND_LABEL = { lecture: "ლექცია", exam: "გამოცდა", quiz: "ქვიზი" };

const getView = () => {
  const m = location.hash.match(/[?&]m=(\d{4})-(\d{2})/);
  const dm = location.hash.match(/[?&]d=(\d{4}-\d{2}-\d{2})/);
  const now = new Date();
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) - 1 : now.getMonth();
  const sel = dm ? dm[1] : todayYmd();
  return { year, month, sel };
};
const setView = ({ year, month, sel }) => {
  const base = location.hash.split("?")[0];
  location.hash = `${base}?m=${year}-${pad(month + 1)}&d=${sel}`;
};

// Get events for a given YMD string
const eventsForDate = (ymdStr) => {
  const out = [];
  readLec().forEach(l => {
    if (lectureOccursOn(l, ymdStr)) out.push({ ...l, kind: "lecture", date: ymdStr });
  });
  getExams().forEach(e => {
    if (e.date === ymdStr) out.push({ ...e, kind: e.kind || "exam" });
  });
  return out.sort((a, b) => (a.start || "23:59").localeCompare(b.start || "23:59"));
};

const buildAddFormHtml = (defaultDate, defaultKind = "lecture") => {
  const d = defaultDate ? parseYmd(defaultDate) : new Date();
  const dow = dowMon0(d);
  return `
  <div class="modal-head">
    <h3>დაამატე განრიგში</h3>
    <button class="btn-icon" data-close>✕</button>
  </div>
  <form onsubmit="__campus.schAdd(event)" class="modal-body">
    <div class="field"><label>ტიპი</label>
      <select name="kind" onchange="__campus.schToggleKind(this.value)">
        <option value="lecture" ${defaultKind === "lecture" ? "selected" : ""}>📚 ლექცია (კვირეული)</option>
        <option value="exam" ${defaultKind === "exam" ? "selected" : ""}>📝 გამოცდა</option>
        <option value="quiz" ${defaultKind === "quiz" ? "selected" : ""}>🧠 ქვიზი</option>
      </select>
    </div>
    <div class="grid grid-2">
      <div class="field" data-kind-field="lecture"><label>დღე (კვირაში)</label>
        <select name="day">
          ${DAYS_SHORT.map((_, i) => `<option value="${i}" ${i === dow ? "selected" : ""}>${DAYS_FULL[i]}</option>`).join("")}
        </select>
      </div>
      <div class="field" data-kind-field="lecture"><label>დაწყების თარიღი</label>
        <input type="date" name="firstDate" value="${defaultDate || todayYmd()}" />
        <span class="muted" style="font-size:11px;display:block;margin-top:4px">გაგრძელდება 1 თვის განმავლობაში (4 კვირა)</span>
      </div>
      <div class="field" data-kind-field="dated" style="display:${defaultKind === "lecture" ? "none" : ""}"><label>თარიღი</label>
        <input type="date" name="date" value="${defaultDate || todayYmd()}" />
      </div>
      <div class="field"><label>სათაური</label><input name="title" required placeholder="მაგ. კალკულუსი I" /></div>
      <div class="field" data-kind-field="lecture"><label>დაწყება</label><input type="time" name="start" /></div>
      <div class="field" data-kind-field="lecture"><label>დასასრული</label><input type="time" name="end" /></div>
      <div class="field"><label>აუდიტორია</label><input name="location" placeholder="მაგ. 207, კ.II" /></div>
      <div class="field" data-kind-field="lecture"><label>ლექტორი</label><input name="lecturer" placeholder="გვარი, სახელი" /></div>
      <div class="field" data-kind-field="dated" style="display:${defaultKind === "lecture" ? "none" : ""}"><label>შემახსენე — დღით ადრე</label>
        <select name="reminderDays">
          <option value="1">1 დღით ადრე</option>
          <option value="2">2 დღით ადრე</option>
          <option value="3" selected>3 დღით ადრე</option>
          <option value="7">1 კვირით ადრე</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" type="submit">დამატება</button>
  </form>
`;
};

function openAddModal(defaultDate, defaultKind) {
  const card = document.getElementById("modalCard");
  const back = document.getElementById("modalBackdrop");
  card.innerHTML = buildAddFormHtml(defaultDate, defaultKind);
  back.hidden = false;
  const closeBtn = card.querySelector("[data-close]");
  const close = () => { back.hidden = true; card.innerHTML = ""; };
  closeBtn.addEventListener("click", close);
  back.addEventListener("click", (e) => { if (e.target === back) close(); });
}

function renderMonth(year, month, sel) {
  const first = new Date(year, month, 1);
  const startOffset = dowMon0(first);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayYmd();
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return `
    <div class="cal-grid">
      <div class="cal-head">
        ${DAYS_SHORT.map(d => `<div class="cal-dow">${d}</div>`).join("")}
      </div>
      <div class="cal-body">
        ${rows.map(row => `<div class="cal-row">${row.map(d => {
          if (!d) return `<div class="cal-cell cal-empty"></div>`;
          const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
          const evs = eventsForDate(dateStr);
          const isToday = dateStr === today;
          const isSel = dateStr === sel;
          const dots = evs.slice(0, 4).map(e => `<span class="cal-dot" style="background:${COLORS[e.kind]}" title="${escapeHtml(e.title)}"></span>`).join("");
          const more = evs.length > 4 ? `<span class="cal-more">+${evs.length - 4}</span>` : "";
          return `<button type="button" class="cal-cell ${isToday ? "is-today" : ""} ${isSel ? "is-sel" : ""} ${evs.length ? "has-events" : ""}"
            onclick="__campus.schPickDay('${dateStr}')">
            <span class="cal-num">${d}</span>
            <span class="cal-dots">${dots}${more}</span>
          </button>`;
        }).join("")}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderDayEvents(sel) {
  const evs = eventsForDate(sel);
  const d = parseYmd(sel);
  const headTxt = `${d.getDate()} ${MONTHS[d.getMonth()]} · ${DAYS_FULL[dowMon0(d)]}`;
  if (!evs.length) {
    return `<div class="day-pane">
      <div class="day-pane-head"><h2 style="margin:0;font-size:17px">${headTxt}</h2></div>
      <div class="card" style="text-align:center;padding:22px">
        <div style="font-size:32px">🌤</div>
        <p class="muted" style="margin:8px 0 12px">ამ დღეს დაგეგმილი არაფერი გაქვს</p>
        <div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','lecture')">📚 ლექცია</button>
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','exam')">📝 გამოცდა</button>
          <button class="btn btn-primary btn-sm" onclick="__campus.schOpenAdd('${sel}','quiz')">🧠 ქვიზი</button>
        </div>
      </div>
    </div>`;
  }
  return `<div class="day-pane">
    <div class="day-pane-head">
      <h2 style="margin:0;font-size:17px">${headTxt}</h2>
      <span class="muted" style="font-size:13px">${evs.length} ჩანაწერი</span>
    </div>
    <div class="stack">
      ${evs.map(e => `
        <div class="card" style="border-left:4px solid ${COLORS[e.kind]}">
          <div class="card-row" style="align-items:flex-start">
            <div style="min-width:0;flex:1">
              <div class="row" style="gap:6px;align-items:center;flex-wrap:wrap">
                <span class="badge" style="background:${COLORS[e.kind]};color:#fff;font-size:11px">${ICONS[e.kind]} ${KIND_LABEL[e.kind]}</span>
                ${e.start ? `<span class="muted" style="font-size:12px">🕘 ${e.start}${e.end ? "–" + e.end : ""}</span>` : ""}
              </div>
              <h3 style="margin:6px 0 4px;font-size:15px">${escapeHtml(e.title)}</h3>
              <div class="muted" style="font-size:13px;display:flex;gap:10px;flex-wrap:wrap">
                ${e.location ? `<span>📍 ${escapeHtml(e.location)}</span>` : ""}
                ${e.lecturer ? `<span>👤 ${escapeHtml(e.lecturer)}</span>` : ""}
              </div>
            </div>
            ${e.kind === "lecture"
              ? `<div class="row" style="gap:4px;flex-shrink:0">
                  <button class="btn-icon" onclick="__campus.schDelLecDay('${e.id}','${sel}')" title="ამოშალე მხოლოდ ეს დღე" aria-label="ამოშალე მხოლოდ ეს დღე">📅✕</button>
                  <button class="btn-icon" onclick="__campus.schDelLecAll('${e.id}')" title="ამოშალე ყველა კვირაში" aria-label="ამოშალე მთლიანად">🗑</button>
                 </div>`
              : `<button class="btn-icon" onclick="__campus.schDelExam('${e.id}')" title="წაშლა" aria-label="წაშლა">✕</button>`}
          </div>
        </div>`).join("")}
    </div>
  </div>`;
}

export const scheduleView = () => {
  const { year, month, sel } = getView();

  expose("schAdd", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const kind = (fd.get("kind") || "lecture").toString();
    const title = (fd.get("title") || "").toString().trim();
    if (!title) return;
    if (kind === "lecture") {
      const start = (fd.get("start") || "").toString();
      const end = (fd.get("end") || "").toString();
      if (!start || !end) { showToast("შეავსე დროის ველები"); return; }
      const dayNum = Number(fd.get("day"));
      // Align firstDate to the chosen weekday (>= entered date)
      let firstDate = (fd.get("firstDate") || todayYmd()).toString();
      const fd0 = parseYmd(firstDate);
      const diff = (dayNum - dowMon0(fd0) + 7) % 7;
      if (diff) firstDate = addDays(firstDate, diff);
      const all = readLec();
      all.push({
        id: crypto.randomUUID(),
        day: dayNum,
        start, end, title,
        location: (fd.get("location") || "").toString().trim(),
        lecturer: (fd.get("lecturer") || "").toString().trim(),
        firstDate,
        skipDates: [],
      });
      writeLec(all);
    } else {
      const date = (fd.get("date") || "").toString();
      if (!date) { showToast("შეავსე თარიღი"); return; }
      addExam({
        kind, title, date,
        location: (fd.get("location") || "").toString().trim(),
        reminderDays: Number(fd.get("reminderDays")) || 3,
      });
    }
    document.getElementById("modalBackdrop").hidden = true;
    showToast("დაემატა");
    refresh();
  });
  expose("schToggleKind", (k) => {
    const isLec = k === "lecture";
    document.querySelectorAll('[data-kind-field="lecture"]').forEach(el => el.style.display = isLec ? "" : "none");
    document.querySelectorAll('[data-kind-field="dated"]').forEach(el => el.style.display = isLec ? "none" : "");
  });
  expose("schDelLecDay", (id, date) => {
    const all = readLec();
    const l = all.find(x => x.id === id);
    if (!l) return;
    l.skipDates = Array.isArray(l.skipDates) ? l.skipDates : [];
    if (!l.skipDates.includes(date)) l.skipDates.push(date);
    writeLec(all);
    showToast("ამოშლილია ამ დღისთვის");
    refresh();
  });
  expose("schDelLecAll", (id) => {
    if (!confirm("გნებავთ წაშალოთ ეს ლექცია მთლიანად?")) return;
    writeLec(readLec().filter(l => l.id !== id));
    showToast("ამოშლილია მთლიანად");
    refresh();
  });
  expose("schDelExam", (id) => {
    removeExam(id);
    refresh();
  });
  expose("schOpenAdd", (date, kind) => openAddModal(date || sel, kind || "lecture"));
  expose("schPickDay", (dateStr) => setView({ year, month, sel: dateStr }));
  expose("schPrevMonth", () => {
    const nm = month === 0 ? 11 : month - 1;
    const ny = month === 0 ? year - 1 : year;
    setView({ year: ny, month: nm, sel });
  });
  expose("schNextMonth", () => {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    setView({ year: ny, month: nm, sel });
  });
  expose("schToday", () => {
    const t = new Date();
    setView({ year: t.getFullYear(), month: t.getMonth(), sel: todayYmd() });
  });

  return `
    <div class="page-head">
      <div>
        <h1 style="margin:0">📅 განრიგი</h1>
        <p class="muted" style="margin:4px 0 0;font-size:13px">ლექციები, გამოცდები და ქვიზები — ერთ კალენდარში</p>
      </div>
      <button class="btn btn-primary" onclick="__campus.schOpenAdd()">+ დამატება</button>
    </div>

    <div class="cal-toolbar">
      <button class="btn-icon" onclick="__campus.schPrevMonth()" aria-label="წინა თვე">‹</button>
      <h2 class="cal-title">${MONTHS[month]} ${year}</h2>
      <button class="btn-icon" onclick="__campus.schNextMonth()" aria-label="შემდეგი თვე">›</button>
      <button class="btn btn-ghost btn-sm" onclick="__campus.schToday()">დღეს</button>
    </div>

    ${renderMonth(year, month, sel)}

    ${renderDayEvents(sel)}
  `;
};
