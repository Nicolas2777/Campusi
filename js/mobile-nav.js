// Mobile bottom tab-bar + "more" sheet
import { toggleTheme, getTheme, getRole } from "./state.js";

// Compact bottom bar — duplicates of header items (news, universities, profile, search) live in "მეტი".
const BASE_TABS = [
  { href: "#/",         icon: "🏠", label: "მთავარი" },
  { href: "#/schedule", icon: "📅", label: "განრიგი" },
  { href: "#/chats",    icon: "💬", label: "ფორუმი" },
  { href: "#/gpa",      icon: "🧮", label: "GPA" },
  { href: "#more",      icon: "⋯",  label: "მეტი", action: "more" },
];

const MORE_LINKS = [
  { href: "#/lecturers",    icon: "👨‍🏫", label: "ლექტორები" },
  { href: "#/academic",     icon: "🎓", label: "სემესტრი",     roles: ["student"] },
  { href: "#/resources",    icon: "📚", label: "რესურსები",   roles: ["student"] },
  { href: "#/faq",          icon: "❓", label: "FAQ" },
];
const linksForRole = () => {
  const r = getRole();
  return MORE_LINKS.filter(l => !l.roles || l.roles.includes(r));
};


function activeHash() {
  return (location.hash || "#/").toLowerCase();
}

function renderTabs() {
  const el = document.getElementById("mobileTabs");
  if (!el) return;
  const cur = activeHash();
  el.innerHTML = BASE_TABS.map(t => {
    const active = t.action ? false : (t.href === "#/" ? cur === "#/" || cur === "" : cur.startsWith(t.href));
    const cls = ["tab-btn"];
    if (active) cls.push("active");
    const attr = t.action ? `data-action="${t.action}" type="button"` : `href="${t.href}"`;
    const tag = t.action ? "button" : "a";
    const aria = active ? ` aria-current="page"` : "";
    return `<${tag} class="${cls.join(" ")}" ${attr}${aria} aria-label="${t.label}">
      <span class="ti" aria-hidden="true">${t.icon}</span>
      <span class="tl">${t.label}</span>
    </${tag}>`;
  }).join("");
}

function closeSheet() {
  document.getElementById("moreSheet").hidden = true;
  document.getElementById("moreBackdrop").hidden = true;
}

function openSheet() {
  const sheet = document.getElementById("moreSheet");
  const back = document.getElementById("moreBackdrop");
  const theme = getTheme();
  sheet.innerHTML = `
    <div class="sheet-handle" aria-hidden="true"></div>
    <div class="sheet-head">
      <h3>მეტი</h3>
      <button class="btn-icon" data-action="close-sheet" type="button" aria-label="დახურვა">✕</button>
    </div>
    <div class="sheet-grid">
      ${linksForRole().map(l => `<a class="sheet-item" href="${l.href}" data-action="link">
        <span class="si" aria-hidden="true">${l.icon}</span><span>${l.label}</span></a>`).join("")}
    </div>
    <div class="sheet-row">
      <button class="btn" data-action="toggle-theme" type="button">${theme === "dark" ? "☀️ ღია თემა" : "🌙 მუქი თემა"}</button>
    </div>
  `;
  sheet.hidden = false;
  back.hidden = false;
}

export function initMobileNav() {
  renderTabs();
  window.addEventListener("hashchange", () => { renderTabs(); closeSheet(); });

  document.getElementById("mobileTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='more']");
    if (btn) { e.preventDefault(); openSheet(); }
  });

  document.getElementById("moreBackdrop").addEventListener("click", closeSheet);

  document.getElementById("moreSheet").addEventListener("click", (e) => {
    const act = e.target.closest("[data-action]")?.dataset.action;
    if (act === "close-sheet") closeSheet();
    else if (act === "link") closeSheet();
    else if (act === "toggle-theme") {
      toggleTheme();
      const btn = document.getElementById("themeBtn");
      if (btn) btn.textContent = getTheme() === "dark" ? "☀️" : "🌙";
      openSheet();
    }
  });
}
