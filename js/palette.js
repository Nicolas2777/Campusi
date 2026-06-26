import { universities, faculties, subjects } from "./data.js";
import { newsItems } from "./news-data.js";
import { navigate } from "./router.js";

let _inited = false;
let backdrop = null;
let input = null;
let list = null;

const PAGES = [
  { kind: "page", title: "მთავარი", path: "/" },
  { kind: "page", title: "განრიგი", path: "/schedule" },
  { kind: "page", title: "სიახლეები", path: "/news" },
  { kind: "page", title: "აკადემიური კალენდარი", path: "/academic" },
  { kind: "page", title: "GPA", path: "/gpa" },
  
  { kind: "page", title: "უნივერსიტეტები", path: "/universities" },
  { kind: "page", title: "გაფართოებული ძიება", path: "/search" },
  { kind: "page", title: "რესურსები", path: "/resources" },
  
  { kind: "page", title: "პროფილი", path: "/profile" },
  { kind: "page", title: "ადმინი", path: "/admin" },
];

const allItems = () => [
  ...PAGES,
  ...universities.map(u => ({ kind: "უნივ.", title: u.name, subtitle: u.fullName, path: `/university/${u.id}` })),
  ...faculties.map(f => ({ kind: "ფაკულტ.", title: f.name, path: `/faculty/${f.id}` })),
  ...subjects.map(s => ({ kind: "საგანი", title: s.name, subtitle: s.code, path: `/subject/${s.id}` })),
  ...newsItems.map(n => ({ kind: "სიახლე", title: n.title, subtitle: n.summary.slice(0, 60), path: `/news` })),
];

let selected = 0;
let filtered = [];

const open = () => {
  backdrop.hidden = false;
  input.value = "";
  search("");
  setTimeout(() => input.focus(), 0);
};
const close = () => { backdrop.hidden = true; };

const search = (q) => {
  const ql = q.trim().toLowerCase();
  filtered = allItems().filter(i =>
    !ql || i.title.toLowerCase().includes(ql) || (i.subtitle || "").toLowerCase().includes(ql)
  ).slice(0, 30);
  selected = 0;
  list.innerHTML = filtered.map((i, ix) => `
    <li class="${ix === selected ? "selected" : ""}" data-ix="${ix}">
      <span>${i.title}</span>
      ${i.subtitle ? `<span class="muted" style="font-size:12px">${i.subtitle}</span>` : ""}
      <span class="kind">${i.kind}</span>
    </li>
  `).join("") || `<li class="muted" style="padding:14px">ვერაფერი მოიძებნა</li>`;
};

const go = (ix) => {
  const item = filtered[ix]; if (!item) return;
  navigate(item.path); close();
};

const onInputKeydown = e => {
  if (e.key === "ArrowDown") { selected = Math.min(selected + 1, filtered.length - 1); updateSel(); e.preventDefault(); }
  else if (e.key === "ArrowUp") { selected = Math.max(selected - 1, 0); updateSel(); e.preventDefault(); }
  else if (e.key === "Enter") { go(selected); }
  else if (e.key === "Escape") { close(); }
};
const updateSel = () => list.querySelectorAll("li").forEach((el, ix) =>
  el.classList.toggle("selected", ix === selected));

export const initPalette = () => {
  if (_inited) return;
  backdrop = document.getElementById("paletteBackdrop");
  input = document.getElementById("paletteInput");
  list = document.getElementById("paletteResults");
  const btn = document.getElementById("searchBtn");
  if (!backdrop || !input || !list || !btn) return;
  _inited = true;
  input.addEventListener("input", e => search(e.target.value));
  input.addEventListener("keydown", onInputKeydown);
  list.addEventListener("click", e => {
    const li = e.target.closest("li[data-ix]"); if (li) go(+li.dataset.ix);
  });
  backdrop.addEventListener("click", e => { if (e.target === backdrop) close(); });
  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
  });
  btn.addEventListener("click", open);
};
