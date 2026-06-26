import { universities, faculties, subjects, resources, getUni, getFaculty } from "../data.js";
import { escapeHtml, expose } from "../ui.js";

let q = "", uniFilter = "all", credFilter = "all", typeFilter = "all", kindFilter = "all";

export const searchView = () => {
  expose("setQ", (v) => { q = v; refreshResults(); });
  expose("setFilter", (k, v) => {
    if (k === "uni") uniFilter = v;
    if (k === "cred") credFilter = v;
    if (k === "type") typeFilter = v;
    if (k === "kind") kindFilter = v;
    refreshResults();
  });
  expose("resetFilters", () => {
    q = ""; uniFilter = "all"; credFilter = "all"; typeFilter = "all"; kindFilter = "all";
    const qi = document.getElementById("searchQ"); if (qi) qi.value = "";
    document.querySelectorAll("#filterForm select").forEach(s => { s.value = "all"; });
    refreshResults();
    document.getElementById("searchQ")?.focus();
  });

  setTimeout(() => { refreshResults(); document.getElementById("searchQ")?.focus(); }, 0);

  return `
    <nav class="crumbs" aria-label="ნაკადი"><a href="#/">მთავარი</a> / გაფართოებული ძიება</nav>
    <h1>გაფართოებული ძიება</h1>
    <p class="muted">მოძებნე საგანი, ფაკულტეტი, ლექტორი ან რესურსი</p>

    <form id="filterForm" class="card search-panel" role="search" aria-label="ძიება ფილტრებით"
          onsubmit="event.preventDefault()">
      <label for="searchQ" class="sr-only">საძიებო სიტყვა</label>
      <input id="searchQ" type="search" placeholder="ძიება..." value="${escapeHtml(q)}"
             autocomplete="off" enterkeyhint="search"
             aria-controls="searchResults" aria-describedby="resultsCount"
             oninput="__campus.setQ(this.value)" />

      <fieldset class="filter-row" aria-label="ფილტრები">
        <legend class="sr-only">ფილტრები</legend>

        <div class="field" style="margin:0">
          <label for="fKind" class="sr-only">ტიპი</label>
          <select id="fKind" aria-label="შედეგის ტიპი" onchange="__campus.setFilter('kind', this.value)">
            <option value="all">ყველაფერი</option>
            <option value="subject">საგნები</option>
            <option value="faculty">ფაკულტეტი</option>
            <option value="lecturer">ლექტორი</option>
            <option value="resource">რესურსი</option>
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fUni" class="sr-only">უნივერსიტეტი</label>
          <select id="fUni" aria-label="უნივერსიტეტი" onchange="__campus.setFilter('uni', this.value)">
            <option value="all">ყველა უნივ.</option>
            ${universities.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fCred" class="sr-only">კრედიტი</label>
          <select id="fCred" aria-label="კრედიტი" onchange="__campus.setFilter('cred', this.value)">
            <option value="all">კრედიტი</option>
            <option value="lt5">&lt; 5</option>
            <option value="5">5</option>
            <option value="6">6+</option>
          </select>
        </div>

        <div class="field" style="margin:0">
          <label for="fType" class="sr-only">რესურსის ტიპი</label>
          <select id="fType" aria-label="რესურსის ტიპი" onchange="__campus.setFilter('type', this.value)">
            <option value="all">რესურს. ტიპი</option>
            <option value="PDF">PDF</option>
            <option value="YouTube">YouTube</option>
            <option value="Drive">Drive</option>
          </select>
        </div>
      </fieldset>

      <div class="row between" style="margin-top:12px">
        <span id="resultsCount" class="muted" aria-live="polite" style="font-size:13px"></span>
        <button type="button" class="btn btn-ghost" onclick="__campus.resetFilters()">გასუფთავება</button>
      </div>
    </form>

    <div id="searchResults" class="stack" role="region" aria-label="ძიების შედეგები"
         aria-live="polite" aria-busy="false" style="margin-top:20px"></div>
  `;
};

function refreshResults() {
  const root = document.getElementById("searchResults");
  if (!root) return;
  const ql = q.trim().toLowerCase();
  const match = (s) => !ql || s.toLowerCase().includes(ql);
  const uniOfSubject = (s) => getUni(getFaculty(s.facultyId)?.uniId)?.id;

  const out = [];

  if (kindFilter === "all" || kindFilter === "subject") {
    subjects.filter(s => {
      if (!(match(s.name) || match(s.code) || match(s.lecturer))) return false;
      if (uniFilter !== "all" && uniOfSubject(s) !== uniFilter) return false;
      if (credFilter === "lt5" && !(s.credits < 5)) return false;
      if (credFilter === "5" && s.credits !== 5) return false;
      if (credFilter === "6" && !(s.credits >= 6)) return false;
      return true;
    }).forEach(s => out.push({
      kind: "საგანი", href: `#/subject/${s.id}`,
      title: s.name, sub: `${s.code} · ${s.credits} კრედიტი · ${s.lecturer}`
    }));
  }
  if (kindFilter === "all" || kindFilter === "faculty") {
    faculties.filter(f => match(f.name) && (uniFilter === "all" || f.uniId === uniFilter))
      .forEach(f => out.push({ kind: "ფაკულტეტი", href: `#/faculty/${f.id}`, title: f.name, sub: getUni(f.uniId).name }));
  }
  if (kindFilter === "all" || kindFilter === "lecturer") {
    const seen = new Set();
    subjects.filter(s => match(s.lecturer)).forEach(s => {
      if (uniFilter !== "all" && uniOfSubject(s) !== uniFilter) return;
      if (seen.has(s.lecturerId)) return;
      seen.add(s.lecturerId);
      out.push({ kind: "ლექტორი", href: `#/subject/${s.id}`, title: s.lecturer, sub: `საგანი: ${s.name}` });
    });
  }
  if (kindFilter === "all" || kindFilter === "resource") {
    resources.filter(r => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      const s = subjects.find(x => x.id === r.subjectId);
      if (uniFilter !== "all" && (!s || uniOfSubject(s) !== uniFilter)) return false;
      return match(r.title) || (s && match(s.name));
    }).forEach(r => {
      const s = subjects.find(x => x.id === r.subjectId);
      out.push({ kind: r.type, href: `#/subject/${r.subjectId}`, title: r.title, sub: s?.name || "" });
    });
  }

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.textContent = out.length ? `მოიძებნა ${out.length} შედეგი` : "შედეგი ვერ მოიძებნა";

  root.innerHTML = out.length
    ? `<ul class="stack" style="list-style:none;padding:0;margin:0">${out.map(r => `
        <li><a class="card result-card" href="${r.href}" aria-label="${escapeHtml(r.kind)}: ${escapeHtml(r.title)}">
          <div class="card-row">
            <div><h3 style="margin:0">${escapeHtml(r.title)}</h3><p>${escapeHtml(r.sub)}</p></div>
            <span class="badge badge-primary">${escapeHtml(r.kind)}</span>
          </div></a></li>`).join("")}</ul>`
    : `<div class="empty" role="status"><div class="ico" aria-hidden="true">🔍</div>ვერაფერი მოიძებნა</div>`;
}
