import { listFaqFor } from "../faq.js";
import { getProfile, isAdminUser } from "../auth.js";
import { escapeHtml } from "../ui.js";

export const faqView = async () => {
  const profile = getProfile();
  const isAdm = isAdminUser();
  let items = [];
  try { items = await listFaqFor(profile, isAdm); } catch (e) { console.warn("faq load", e); }

  const byTopic = items.reduce((acc, f) => { (acc[f.topic] ||= []).push(f); return acc; }, {});
  const topics = Object.keys(byTopic).sort((a, b) => a.localeCompare(b, "ka"));

  const scopeBadge = (f) => {
    if (!isAdm) return "";
    if (f.scope === "all") return `<span class="chip" style="font-size:11px">ყველა</span>`;
    if (f.scope === "uni") return `<span class="chip" style="font-size:11px">უნი: ${escapeHtml(f.uniId)}</span>`;
    if (f.scope === "faculty") return `<span class="chip" style="font-size:11px">ფაკ: ${escapeHtml(f.facultyId)}</span>`;
    return "";
  };

  return `
    <div class="crumbs"><a href="#/">${T("faq.crumbs.home")}</a> / ${T("faq.crumbs.self")}</div>
    <h1>${T("faq.page.title")}</h1>
    <p class="muted">${T("faq.page.sub")}</p>

    ${topics.length ? topics.map(t => `
      <section style="margin-top:22px">
        <h2 style="margin:0 0 10px;font-size:17px">${escapeHtml(t)}</h2>
        <div class="stack" style="gap:8px">
          ${byTopic[t].map(f => `
            <details class="card faq-item">
              <summary style="cursor:pointer;font-weight:600;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span>${escapeHtml(f.title)}</span>
                ${scopeBadge(f)}
              </summary>
              <div style="margin-top:10px;line-height:1.7;white-space:pre-wrap">${escapeHtml(f.body)}</div>
            </details>
          `).join("")}
        </div>
      </section>
    `).join("") : `<div class="empty"><div class="ico">📭</div>${T("faq.empty")}</div>`}
  `;
};
