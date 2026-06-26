import { grants, GRANT_TYPES } from "../grants-data.js";
import { escapeHtml, expose, daysUntil } from "../ui.js";
import { refresh } from "../router.js";

const FILTER_KEY = "campus.grants.filter";
const readFilter = () => localStorage.getItem(FILTER_KEY) || "all";
const writeFilter = (v) => localStorage.setItem(FILTER_KEY, v);

export const grantsView = () => {
  expose("grantsFilter", (t) => { writeFilter(t); refresh(); });

  const active = readFilter();
  const filtered = active === "all" ? grants : grants.filter(g => g.type === active);
  const sorted = [...filtered].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return `
    <div class="page-head">
      <h1 style="margin:0">💰 გრანტები და სტიპენდიები</h1>
      <p class="muted" style="margin:6px 0 0">სახელმწიფო, საუნივერსიტეტო და საერთაშორისო შესაძლებლობები</p>
    </div>

    <div class="chip-row" style="margin-top:16px">
      <button class="chip ${active === "all" ? "active" : ""}" onclick="__campus.grantsFilter('all')">ყველა</button>
      ${Object.entries(GRANT_TYPES).map(([k, v]) =>
        `<button class="chip ${active === k ? "active" : ""}" onclick="__campus.grantsFilter('${k}')">
          ${escapeHtml(v.label)}
        </button>`).join("")}
    </div>

    <div class="stack" style="margin-top:18px">
      ${sorted.length ? sorted.map(g => {
        const t = GRANT_TYPES[g.type];
        const d = daysUntil(g.deadline);
        const urgent = d >= 0 && d <= 14;
        const expired = d < 0;
        return `<div class="card grant-card" style="--accent:${t.color}">
          <div class="grant-head">
            <span class="badge" style="background:color-mix(in oklab, ${t.color} 18%, transparent);color:${t.color}">
              ${escapeHtml(t.label)}
            </span>
            <span class="badge ${urgent ? "badge-danger" : expired ? "" : "badge-primary"}">
              ${expired ? "ვადა გავიდა" : d === 0 ? "დღეს" : `${d} დღე`}
            </span>
          </div>
          <h3 style="margin:8px 0 4px;font-size:16px">${escapeHtml(g.title)}</h3>
          <p class="muted" style="margin:0;font-size:13px">${escapeHtml(g.org)}</p>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.45">${escapeHtml(g.description)}</p>
          <div class="grant-meta">
            <div><span class="muted">💵</span> ${escapeHtml(g.amount)}</div>
            <div><span class="muted">📅</span> ${g.deadline}</div>
          </div>
          ${g.eligibility?.length ? `<div class="chip-row" style="margin-top:10px">
            ${g.eligibility.map(e => `<span class="chip">${escapeHtml(e)}</span>`).join("")}
          </div>` : ""}
          <div class="row" style="justify-content:flex-end;margin-top:12px">
            <a class="btn btn-primary" href="${g.url}" target="_blank" rel="noopener">დეტალები →</a>
          </div>
        </div>`;
      }).join("") : `<div class="empty"><div class="ico">🤷</div>ამ კატეგორიაში გრანტი ვერ მოიძებნა</div>`}
    </div>
  `;
};
