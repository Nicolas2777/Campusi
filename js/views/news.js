// უნივერსიტეტების სიახლეების სია — ფილტრებით (უნივ. + კატეგორია)
import { universities } from "../data.js";
import { newsItems, NEWS_CATEGORIES } from "../news-data.js";
import { escapeHtml, expose } from "../ui.js";
import { getProfile, isAdminUser } from "../auth.js";

let uniF = "all";
let catF = "all";

// აუდიენციის + ფაკულტეტის ფილტრი
const visibleNews = () => {
  const profile = getProfile();
  const myFac = profile?.facultyId || "";
  const admin = isAdminUser();
  return newsItems.filter(n => {
    const aud = n.audience || "both";
    if (aud !== "both" && aud !== "student") return false;
    // ფაკულტეტური სიახლე — მხოლოდ ამ ფაკულტეტის სტუდენტს ეჩვენება (ადმინს ყველა)
    if (n.facultyId && !admin && n.facultyId !== myFac) return false;
    return true;
  });
};



const fmtAcademicDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
};
const fmtRelative = (iso) => {
  const t = new Date(iso).getTime();
  const diff = Math.round((Date.now() - t) / 1000);
  if (diff < 60) return "ახლახან";
  const m = Math.round(diff / 60);
  if (m < 60) return `${m} წთ წინ`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} სთ წინ`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} დღის წინ`;
  return fmtAcademicDate(iso);
};

const uniMap = Object.fromEntries(universities.map(u => [u.id, u]));

const render = () => {
  const root = document.getElementById("newsList");
  if (!root) return;
  let items = visibleNews();
  if (uniF !== "all") items = items.filter(n => n.uniId === uniF);
  if (catF !== "all") items = items.filter(n => n.category === catF);
  items.sort((a, b) =>
    (Number(b.pinned) - Number(a.pinned)) ||
    (new Date(b.publishedAt) - new Date(a.publishedAt))
  );

  const countEl = document.getElementById("newsCount");
  if (countEl) countEl.textContent = items.length
    ? `${items.length} ჩანაწერი` : "შედეგი ვერ მოიძებნა";

  root.innerHTML = items.length ? items.map(n => {
    const uni = uniMap[n.uniId];
    const cat = NEWS_CATEGORIES[n.category] || NEWS_CATEGORIES.announcement;
    return `<article class="news-item ${n.pinned ? "pinned" : ""}">
      ${n.pinned ? `<span class="news-pin-tag">დამაგრებული</span>` : ""}
      <div class="news-meta-row">
        <time class="news-date-iso" datetime="${escapeHtml(n.publishedAt)}">${fmtAcademicDate(n.publishedAt)}</time>
        <span class="news-meta-sep">·</span>
        <span class="news-uni-name">${escapeHtml(uni?.name || n.uniId)}</span>
        <span class="news-meta-sep">·</span>
        <span class="news-cat-label">${cat.label}</span>
      </div>
      <h3 class="news-title">${escapeHtml(n.title)}</h3>
      <p class="news-summary">${escapeHtml(n.summary)}</p>
      <div class="news-foot">
        <a class="news-link" href="${escapeHtml(n.url)}" target="_blank" rel="noopener noreferrer"
           aria-label="გადადი ${escapeHtml(uni?.name || "უნივ.")} გვერდზე">წყაროზე გადასვლა →</a>
        <span class="muted news-rel">${fmtRelative(n.publishedAt)}</span>
      </div>
    </article>`;
  }).join("") : `<div class="empty" role="status">
    <div class="ico" aria-hidden="true">📰</div>
    არჩეული ფილტრით ჩანაწერი ვერ მოიძებნა
  </div>`;
};

export const newsView = () => {
  expose("newsSetUni", (v) => { uniF = v; render(); });
  expose("newsSetCat", (v) => { catF = v; render(); });
  expose("newsReset", () => { uniF = "all"; catF = "all";
    document.querySelectorAll("#newsFilters .chip").forEach(c => c.classList.toggle("active", c.dataset.val === "all"));
    render();
  });

  setTimeout(render, 0);

  const uniChips = [
    `<button type="button" class="chip active" data-grp="uni" data-val="all" onclick="__campus.newsSetUni('all')">ყველა</button>`,
    ...universities.map(u =>
      `<button type="button" class="chip" data-grp="uni" data-val="${u.id}"
        onclick="document.querySelectorAll('[data-grp=uni]').forEach(c=>c.classList.remove('active'));this.classList.add('active');__campus.newsSetUni('${u.id}')">${escapeHtml(u.name)}</button>`
    ),
  ].join("");

  const catChips = [
    `<button type="button" class="chip active" data-grp="cat" data-val="all" onclick="__campus.newsSetCat('all')">ყველა</button>`,
    ...Object.entries(NEWS_CATEGORIES).map(([id, c]) =>

      `<button type="button" class="chip" data-grp="cat" data-val="${id}"
        onclick="document.querySelectorAll('[data-grp=cat]').forEach(c=>c.classList.remove('active'));this.classList.add('active');__campus.newsSetCat('${id}')">${c.label}</button>`
    ),
  ].join("");

  // wire "all" chip active behavior for the uni group too
  setTimeout(() => {
    document.querySelectorAll("#newsFilters [data-grp=uni][data-val=all], #newsFilters [data-grp=cat][data-val=all]")
      .forEach(b => b.addEventListener("click", () => {
        b.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        b.classList.add("active");
      }));
  }, 0);

  return `
    <nav class="crumbs" aria-label="ნაკადი"><a href="#/">მთავარი</a> / სიახლეები</nav>
    <header class="news-hero">
      <span class="news-eyebrow">აკადემიური ბიულეტენი</span>
      <h1 class="news-h1">უნივერსიტეტების სიახლეები</h1>
      <p class="news-sub">ოფიციალური განცხადებები: მიღების ვადები, საგამოცდო პერიოდი, კონფერენციები, სტიპენდიები და სასწავლო პროცესის ცვლილებები.</p>
    </header>

    <section id="newsFilters" class="news-filters" aria-label="ფილტრები">
      <div class="news-filter-row">
        <span class="news-filter-label">უნივერსიტეტი</span>
        <div class="chip-row" role="group" aria-label="უნივერსიტეტი">${uniChips}</div>
      </div>
      <div class="news-filter-row">
        <span class="news-filter-label">კატეგორია</span>
        <div class="chip-row" role="group" aria-label="კატეგორია">${catChips}</div>
      </div>
      <div class="news-filter-foot">
        <span id="newsCount" class="muted" aria-live="polite"></span>
        <button type="button" class="btn btn-ghost" onclick="__campus.newsReset()">ფილტრების გასუფთავება</button>
      </div>
    </section>

    <div id="newsList" class="news-grid" role="region" aria-label="სიახლეების სია" aria-live="polite"></div>

    <p class="news-disclaimer">
      მონაცემები მოწოდებულია უნივერსიტეტების ოფიციალური წყაროებიდან. ავტომატური RSS-სინქრონიზაცია ჩაირთვება მას შემდეგ, რაც დაწესებულებები გასცემენ შესაბამის ნებართვას.
    </p>
  `;
};
