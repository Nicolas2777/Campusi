import { prepSubjects, getPrepSubject, matMeta } from "../prep-data.js";
import { escapeHtml } from "../ui.js";
import { NATIONAL_EXAM_DATE } from "./dashboard-abit.js";
import { daysUntil } from "../ui.js";

export const prepView = () => {
  const left = daysUntil(NATIONAL_EXAM_DATE);
  return `
    <div class="page-head">
      <h1 style="margin:0">📚 მომზადება ეროვნულ გამოცდებზე</h1>
      <p class="muted" style="margin:6px 0 0">
        აირჩიე საგანი — ნახე თემები, მასალები და სავარჯიშოები.
        ${left >= 0 ? `<b>გამოცდამდე ${left} დღე</b>.` : ""}
      </p>
    </div>
    <div class="grid grid-2" style="margin-top:18px">
      ${prepSubjects.map(s => {
        const totalMat = s.topics.reduce((n, t) => n + t.materials.length, 0);
        return `<a class="card prep-card" href="#/prep/${s.id}"
          style="--accent:${s.color}">
          <div class="prep-ico" aria-hidden="true">${s.icon}</div>
          <div style="min-width:0;flex:1">
            <h3 style="margin:0;font-size:16px">${escapeHtml(s.name)}</h3>
            <p class="muted" style="margin:4px 0 0;font-size:13px">
              ${s.topics.length} თემა · ${totalMat} მასალა
            </p>
          </div>
          <span class="prep-arrow" aria-hidden="true">→</span>
        </a>`;
      }).join("")}
    </div>
  `;
};

export const prepSubjectView = ({ id }) => {
  const s = getPrepSubject(id);
  if (!s) return `<div class="empty"><div class="ico">🤔</div>საგანი ვერ მოიძებნა <br/><a class="btn" href="#/prep" style="margin-top:14px">უკან</a></div>`;

  return `
    <a href="#/prep" class="muted" style="font-size:13px;text-decoration:none">← ყველა საგანი</a>
    <div class="prep-header" style="--accent:${s.color}">
      <div class="prep-ico-lg" aria-hidden="true">${s.icon}</div>
      <div style="min-width:0">
        <h1 style="margin:0">${escapeHtml(s.name)}</h1>
        <p class="muted" style="margin:4px 0 0;font-size:13px">
          ${s.topics.length} თემა — სასწავლო მასალები
        </p>
      </div>
    </div>

    <div class="empty" style="margin-top:24px" role="status">
      <div class="ico" aria-hidden="true">📭</div>
      <div style="font-weight:600;margin-bottom:4px">მასალები ჯერ არ არის დამატებული</div>
      <p class="muted" style="margin:0;font-size:13px">ამ საგნისთვის მალე გამოჩნდება თემები, ვიდეოები და სავარჯიშოები.</p>
      <a class="btn" href="#/prep" style="margin-top:14px">← სხვა საგნები</a>
    </div>
  `;
};

