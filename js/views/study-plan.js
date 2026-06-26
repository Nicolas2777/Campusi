import { escapeHtml, expose, showToast, daysUntil } from "../ui.js";
import { refresh } from "../router.js";
import { NATIONAL_EXAM_DATE } from "./dashboard-abit.js";
import { prepSubjects } from "../prep-data.js";

// კვირის გეგმა: localStorage["campus.plan"] = { week: ISOweek, items: [{id, day, subjectId, title, done}] }
const KEY = "campus.plan";
const DAY_NAMES = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"];

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

export const studyPlanView = () => {
  const items = read();
  const total = items.length;
  const done = items.filter(i => i.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const left = daysUntil(NATIONAL_EXAM_DATE);

  expose("planAdd", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = (fd.get("title") || "").toString().trim();
    if (!title) return;
    const all = read();
    all.push({
      id: crypto.randomUUID(),
      day: Number(fd.get("day")),
      subjectId: fd.get("subjectId") || "",
      title, done: false,
    });
    write(all);
    e.target.reset();
    refresh();
  });
  expose("planToggle", (id) => {
    const all = read();
    const it = all.find(x => x.id === id);
    if (it) { it.done = !it.done; write(all); refresh(); }
  });
  expose("planRm", (id) => {
    write(read().filter(x => x.id !== id));
    refresh();
  });
  expose("planClearDone", () => {
    if (!confirm("გასუფთავდეს დასრულებული პუნქტები?")) return;
    write(read().filter(x => !x.done));
    showToast("გასუფთავდა");
    refresh();
  });

  const byDay = {};
  for (let i = 0; i < 7; i++) byDay[i] = [];
  items.forEach(it => { (byDay[it.day] ||= []).push(it); });

  const subjMap = Object.fromEntries(prepSubjects.map(s => [s.id, s]));

  return `
    <div class="page-head">
      <h1 style="margin:0">🗓 სასწავლო გეგმა</h1>
      <p class="muted" style="margin:6px 0 0">
        დაგეგმე კვირა დღეების მიხედვით${left >= 0 ? ` — გამოცდამდე <b>${left} დღე</b>.` : ""}
      </p>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="row between" style="margin-bottom:8px">
        <h3 style="margin:0;font-size:15px">პროგრესი</h3>
        <span class="muted" style="font-size:13px">${done}/${total} · ${pct}%</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>

    <form class="card plan-form" onsubmit="__campus.planAdd(event)" style="margin-top:14px">
      <h3 style="margin:0 0 10px;font-size:15px">+ ახალი დავალება</h3>
      <div class="grid grid-3" style="gap:10px">
        <div class="field">
          <label>დღე</label>
          <select name="day" required>
            ${DAY_NAMES.map((d, i) => `<option value="${i}">${d}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>საგანი (ოპც.)</label>
          <select name="subjectId">
            <option value="">—</option>
            ${prepSubjects.map(s => `<option value="${s.id}">${s.icon} ${escapeHtml(s.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>დავალება</label>
          <input name="title" required placeholder="მაგ. 5 ამოცანა ალგებრაში" maxlength="120" />
        </div>
      </div>
      <button class="btn btn-primary" type="submit">დამატება</button>
    </form>

    ${done ? `<div class="row" style="justify-content:flex-end;margin:14px 0 0">
      <button class="btn btn-ghost" onclick="__campus.planClearDone()">დასრულებულის გასუფთავება (${done})</button>
    </div>` : ""}

    <div class="plan-week" style="margin-top:14px">
      ${DAY_NAMES.map((dName, i) => {
        const list = byDay[i] || [];
        return `<div class="plan-day ${list.length ? "" : "empty"}">
          <div class="plan-day-head">
            <span class="pd-name">${dName}</span>
            <span class="muted" style="font-size:12px">${list.length}</span>
          </div>
          ${list.length ? `<ul class="plan-list">
            ${list.map(it => {
              const s = subjMap[it.subjectId];
              return `<li class="plan-item ${it.done ? "done" : ""}">
                <label>
                  <input type="checkbox" ${it.done ? "checked" : ""} onchange="__campus.planToggle('${it.id}')" />
                  <span>
                    ${s ? `<span class="plan-chip" style="--accent:${s.color}">${s.icon}</span>` : ""}
                    ${escapeHtml(it.title)}
                  </span>
                </label>
                <button class="btn-icon" onclick="__campus.planRm('${it.id}')" aria-label="წაშლა">✕</button>
              </li>`;
            }).join("")}
          </ul>` : `<p class="muted" style="margin:6px 0 0;font-size:12px">—</p>`}
        </div>`;
      }).join("")}
    </div>
  `;
};
