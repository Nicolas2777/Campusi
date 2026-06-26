import { universities, facultiesByUni, getUni, getFaculty, subjectsByFaculty, getSubject, resourcesBySubject } from "../data.js";
import { addPoints } from "../state.js";
import { escapeHtml, showToast, expose, skList } from "../ui.js";
import { getUser, isAdminUser } from "../auth.js";
import { refresh } from "../router.js";
import { subscribeQA, addQAComment, deleteQAComment } from "../qaComments.js";

/* ---- safe field helpers ---- */
const safe = (v, fallback = "—") => (v == null || v === "") ? fallback : v;
const fmtNum = (n) => (n == null || isNaN(+n)) ? "—" : (+n).toLocaleString();

/* Universities list — with sort */
const getSort = () => {
  const m = location.hash.match(/[?&]sort=([a-z]+)/);
  return m ? m[1] : "name";
};
const setSort = (s) => {
  const base = location.hash.split("?")[0];
  location.hash = `${base}?sort=${s}`;
};

export const universitiesView = () => {
  const sort = getSort();
  let list = [...universities];
  if (sort === "rating")        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === "students") list.sort((a, b) => (b.students || 0) - (a.students || 0));
  else if (sort === "city")     list.sort((a, b) => (a.city || "").localeCompare(b.city || "", "ka"));
  else                          list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ka"));

  expose("uniSort", (s) => setSort(s));

  const sortBtn = (id, label) =>
    `<button class="seg ${sort === id ? "active" : ""}" onclick="__campus.uniSort('${id}')">${label}</button>`;

  return `
    <div class="crumbs"><a href="#/">მთავარი</a> / უნივერსიტეტები</div>
    <div class="page-head">
      <div>
        <h1 style="margin:0">🎓 უნივერსიტეტები</h1>
        <p class="muted" style="margin:4px 0 0">${universities.length} ბაზაში</p>
      </div>
    </div>


    ${list.length ? `<div class="grid grid-3">
      ${list.map((u, i) => {
        return `<div class="card uni-card">
          <a href="#/university/${u.id}" class="uni-link">
            <div class="card-row">
              <div style="min-width:0;flex:1">
                <h3 class="uni-card-title">${sort === "rating" && u.rating ? `<span class="text-gradient" style="margin-right:6px">#${i+1}</span>` : ""}${escapeHtml(u.name || "—")}</h3>
                <p class="uni-card-desc">${escapeHtml(u.fullName || u.name || "")}</p>
              </div>
              ${u.rating ? `<span class="badge badge-primary">★ ${u.rating}</span>` : ""}
            </div>
            <div class="row muted uni-card-meta">
              <span>📍 ${escapeHtml(safe(u.city))}</span>
              ${u.students ? `<span>👥 ${fmtNum(u.students)}</span>` : ""}
              ${u.founded ? `<span>📅 ${u.founded}</span>` : ""}
            </div>
          </a>
        </div>`;
      }).join("")}
    </div>` : `<div class="empty"><div class="ico">🏛</div>უნივერსიტეტი ჯერ არ დამატებულა.</div>`}
  `;
};

/* University detail */
export const universityView = ({ id }) => {
  const u = getUni(id);
  if (!u) return `<div class="empty"><div class="ico">🤔</div>უნივერსიტეტი ვერ მოიძებნა<br/><a href="#/universities" class="btn" style="margin-top:14px">დაბრუნება</a></div>`;
  const fac = facultiesByUni(id);
  const meta = [
    u.city ? `📍 ${escapeHtml(u.city)}` : "",
    u.founded ? `📅 დაარსდა ${u.founded}` : "",
    u.students ? `👥 ${fmtNum(u.students)} სტუდენტი` : "",
  ].filter(Boolean).join(" · ");
  return `
    <div class="crumbs"><a href="#/">მთავარი</a> / <a href="#/universities">უნივერსიტეტები</a> / ${escapeHtml(u.name || "")}</div>
    <div class="card-row" style="margin-bottom:24px">
      <div style="min-width:0">
        <h1 style="margin:0">${escapeHtml(u.fullName || u.name || "")}</h1>
        ${meta ? `<p class="muted">${meta}</p>` : ""}
        ${u.rating ? `<span class="badge badge-primary">★ ${u.rating}</span>` : ""}
      </div>
    </div>
    ${u.website ? `<p><a class="btn" href="${escapeHtml(u.website)}" target="_blank" rel="noopener">🌐 ოფიციალური საიტი</a></p>` : ""}
    <h2 class="section-title">ფაკულტეტები</h2>
    ${fac.length ? `<div class="grid grid-2">${fac.map(f => `
      <a class="card" href="#/faculty/${f.id}">
        <h3>${escapeHtml(f.name || "")}</h3>
        <p class="muted">დეკანი: ${escapeHtml(safe(f.dean))}</p>
      </a>`).join("")}</div>` : `<p class="muted">ფაკულტეტები ჯერ არ დამატებულა</p>`}
  `;
};

/* Faculty detail */
export const facultyView = ({ id }) => {
  const f = getFaculty(id);
  if (!f) return `<div class="empty"><div class="ico">🤔</div>ფაკულტეტი ვერ მოიძებნა</div>`;
  const u = getUni(f.uniId);
  const subs = subjectsByFaculty(id);
  return `
    <div class="crumbs">
      ${u ? `<a href="#/universities">უნივერსიტეტები</a> / <a href="#/university/${u.id}">${escapeHtml(u.name)}</a> / ` : ""}
      ${escapeHtml(f.name || "")}
    </div>
    <h1>${escapeHtml(f.name || "")}</h1>
    <p class="muted">დეკანი: ${escapeHtml(safe(f.dean))}</p>
    ${f.description ? `<p>${escapeHtml(f.description)}</p>` : ""}
    <h2 class="section-title">საგნები</h2>
    ${subs.length ? `<div class="grid grid-2">${subs.map(s => `
      <a class="card" href="#/subject/${s.id}">
        <div class="card-row"><h3>${escapeHtml(s.name || "")}</h3>${s.code ? `<span class="badge">${escapeHtml(s.code)}</span>` : ""}</div>
        <p>ლექტორი: ${escapeHtml(safe(s.lecturer))} · ${s.credits || 0} კრედიტი</p>
      </a>`).join("")}</div>` : `<p class="muted">საგნები არ მოიძებნა</p>`}
  `;
};

/* Subject detail with reviews + comments */
const getSubjTab = () => {
  const m = location.hash.match(/[?&]tab=([a-z]+)/);
  return m ? m[1] : "overview";
};
const setSubjTab = (id, t) => { location.hash = `#/subject/${id}?tab=${t}`; };

export const subjectView = ({ id }) => {
  const s = getSubject(id);
  if (!s) return `<div class="empty"><div class="ico">🤔</div>საგანი ვერ მოიძებნა</div>`;
  const f = getFaculty(s.facultyId);
  const u = f ? getUni(f.uniId) : null;
  const res = resourcesBySubject(id);
  const user = getUser();
  const isAdmin = isAdminUser();
  const tab = getSubjTab();

  const credits = s.credits || 0;
  const lecturer = safe(s.lecturer);
  const semester = safe(s.semester);

  expose("subjTab", (t) => setSubjTab(s.id, t));
  expose("submitComment", async (e) => {
    e.preventDefault();
    if (!user) { location.hash = "#/login"; return; }
    const fd = new FormData(e.target);
    try {
      await addQAComment(id, fd.get("text"));
      const p = addPoints("comment");
      showToast(`+${p} ქულა`);
      e.target.reset();
    } catch (err) {
      showToast(err.message || "შეცდომა");
    }
  });
  expose("qaDelete", async (cid, ownerUid) => {
    if (!confirm("წაიშალოს ეს კომენტარი?")) return;
    try { await deleteQAComment(cid, ownerUid); showToast("წაიშალა"); }
    catch (err) { showToast(err.message || "შეცდომა"); }
  });

  const tabOverview = `
    <div class="subj-overview">
      <div class="card">
        <h4 class="pn-head">📄 სილაბუსი</h4>
        ${s.syllabus ? `<p style="margin:0;line-height:1.6">${escapeHtml(s.syllabus)}</p>` : `<p class="muted" style="margin:0">სილაბუსი ჯერ არ დაემატებულა.</p>`}
      </div>
    </div>
  `;
  const tabQA = `
    <div class="card">
      <h4 class="pn-head">💬 დასვი კითხვა ან დატოვე კომენტარი</h4>
      <form onsubmit="__campus.submitComment(event)">
        <div class="field">
          <textarea name="text" rows="3" required maxlength="1000" ${user ? "" : "disabled"} placeholder="${user ? "შენი კითხვა..." : "შესვლა საჭიროა"}"></textarea>
        </div>
        ${user ? `<button class="btn btn-primary" type="submit">გაგზავნა</button>` : `<a href="#/login" class="btn btn-primary">შესვლა</a>`}
      </form>
    </div>
    <div id="qaList" class="stack" style="margin-top:14px">
      ${skList(3)}
    </div>
  `;

  /* Q&A live subscription */
  const renderQA = (items) => {
    const box = document.getElementById("qaList");
    if (!box) return;
    const myUid = user?.uid;
    box.innerHTML = items.length ? items.map(c => {
      const t = c.createdAt?.toDate ? c.createdAt.toDate()
              : c.createdAt?.seconds ? new Date(c.createdAt.seconds*1000)
              : new Date(+c.createdAt || Date.now());
      const canDel = isAdmin || (myUid && c.userId === myUid);
      const safeOwner = String(c.userId || "").replace(/'/g, "\\'");
      const reportArg = `'qaComment','${c.id}',${JSON.stringify((c.text||"").slice(0,180)).replace(/'/g,"&#39;")}`;
      return `<div class="card comment-item">
        <div class="comment-meta">
          <span class="comment-avatar">${escapeHtml((c.author || "?")[0].toUpperCase())}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px">${escapeHtml(c.author || "სტუდენტი")}</div>
            <div class="muted" style="font-size:12px">${t.toLocaleString("ka-GE")}</div>
          </div>
          ${!canDel && myUid && c.userId !== myUid ? `<button class="btn btn-ghost" title="გასაჩივრება" style="padding:4px 8px;font-size:12px" onclick="__campus.report(${reportArg})">⚑</button>` : ""}
          ${canDel ? `<button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" onclick="__campus.qaDelete('${escapeHtml(c.id)}','${escapeHtml(safeOwner)}')">🗑</button>` : ""}
        </div>
        <div style="margin-top:10px;white-space:pre-wrap;word-break:break-word">${escapeHtml(c.text)}</div>
      </div>`;
    }).join("") : `<div class="empty"><div class="ico">💬</div>კომენტარები ჯერ არ გამოქვეყნებულა</div>`;
    const cntEl = document.getElementById("qaCount");
    if (cntEl) cntEl.textContent = items.length;
  };
  if (tab === "qa") {
    queueMicrotask(() => {
      if (window.__campus.__qaUnsub) { try { window.__campus.__qaUnsub(); } catch {} }
      window.__campus.__qaUnsub = subscribeQA(id, renderQA);
    });
  }

  const tabResources = res.length
    ? `<div class="grid grid-2">${res.map(r => {
        const reportArg = `'resource','${r.id}',${JSON.stringify(r.title || "").replace(/'/g,"&#39;")}`;
        return `
        <div class="card">
          <div class="card-row">
            <h3 style="margin:0;font-size:15px">${escapeHtml(r.title)}</h3>
            <span class="badge badge-primary">${escapeHtml(r.type)}</span>
          </div>
          <div class="row between" style="margin-top:10px;gap:8px;flex-wrap:wrap">
            <span class="muted">▲ ${r.upvotes || 0}</span>
            <div class="row" style="gap:6px">
              ${user ? `<button class="btn btn-ghost" title="გასაჩივრება" style="padding:4px 10px;font-size:12px" onclick="__campus.report(${reportArg})">⚑</button>` : ""}
              <a class="btn" href="${escapeHtml(r.url || "#")}" target="_blank" rel="noopener">გახსნა →</a>
            </div>
          </div>
        </div>`;
      }).join("")}</div>`
    : `<div class="empty"><div class="ico">📚</div>რესურსები ჯერ არ დაემატებინათ</div>`;

  const tabBtn = (id, label) => `<button class="prof-tab ${tab === id ? "active" : ""}" onclick="__campus.subjTab('${id}')">${label}</button>`;
  let body = tabOverview;
  if (tab === "qa")              body = tabQA;
  else if (tab === "resources")  body = tabResources;

  return `
    <div class="crumbs">
      ${u ? `<a href="#/university/${u.id}">${escapeHtml(u.name)}</a> / ` : ""}
      ${f ? `<a href="#/faculty/${f.id}">${escapeHtml(f.name)}</a> / ` : ""}
      ${escapeHtml(s.name || "")}
    </div>
    <div class="subj-hero">
      <div style="min-width:0;flex:1">
        <h1 style="margin:0;font-size:clamp(20px,4.5vw,28px);line-height:1.25">${escapeHtml(s.name || "")}</h1>
        <p class="muted" style="margin:6px 0 0;font-size:13px">${escapeHtml(s.code || "")}</p>
      </div>
      
    </div>
    <div class="subj-stats">
      <div class="subj-stat"><div class="ss-ico">🎯</div><div><div class="ss-val">${credits || "—"}</div><div class="ss-lbl">კრედიტი</div></div></div>
      <div class="subj-stat"><div class="ss-ico">📅</div><div><div class="ss-val">${escapeHtml(semester)}</div><div class="ss-lbl">სემესტრი</div></div></div>
      <div class="subj-stat"><div class="ss-ico">👨‍🏫</div><div><div class="ss-val" style="font-size:14px">${escapeHtml(lecturer)}</div><div class="ss-lbl">ლექტორი</div></div></div>
    </div>
    <div class="prof-tabs">
      ${tabBtn("overview",   "📊 მიმოხილვა")}
      ${tabBtn("qa",         `💬 კომენტარები (<span id="qaCount">0</span>)`)}
      ${tabBtn("resources",  `📚 რესურსები (${res.length})`)}
    </div>
    <div style="margin-top:18px">${body}</div>
  `;
};
