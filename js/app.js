import { startRouter, route, navigate, refresh } from "./router.js";
import { getTheme, setTheme, toggleTheme, getRole, setRole } from "./state.js";
import { onUser, logout, isAuthReady, onAuthReady, getUser, getDisplayName, getProfile, isAdminUser, isModeratorUser } from "./auth.js";
import { startStore } from "./store.js";
import { initPalette } from "./palette.js";
import { initMobileNav } from "./mobile-nav.js";
import { prefetchAfterAuth } from "./prefetch.js";

import { dashboardView } from "./views/dashboard.js";
import { loginView } from "./views/login.js";
import { universitiesView, universityView, facultyView, subjectView } from "./views/catalog.js";
import {
  rankingsView, resourcesView,
  profileView
} from "./views/misc.js";

import { adminView } from "./views/admin.js";

import { searchView } from "./views/search.js";
import { gpaView } from "./views/gpa.js";
import { scheduleView } from "./views/schedule.js";

import { newsView } from "./views/news.js";
import { academicView } from "./views/academic.js";
import { onboardingView } from "./views/onboarding.js";
import { lecturersView } from "./views/lecturers.js";
import { chatsView, chatRoomView } from "./views/chats.js";
import { submitReport, REPORT_REASONS, REPORT_TYPES } from "./reports.js";
import { faqView } from "./views/faq.js";

const hashPath = () => ((location.hash || "#/").slice(1).split("?")[0]);

/* ------- Theme init ------- */
setTheme(getTheme());
const themeBtn = document.getElementById("themeBtn");
const setIcon = () => themeBtn.textContent = getTheme() === "dark" ? "☀️" : "🌙";
setIcon();
themeBtn.addEventListener("click", () => { toggleTheme(); setIcon(); });
document.getElementById("year").textContent = new Date().getFullYear();

/* ------- Global helpers ------- */
window.__campus = window.__campus || {};
window.__campus.logout = async () => { await logout(); navigate("/login"); };

/* Universal report modal: __campus.report(type, targetId, contextText, extra?) */
window.__campus.report = (type, targetId, contextText, extra) => {
  if (!getUser()) { location.hash = "#/login"; return; }
  const host = document.getElementById("reportModalHost") || (() => {
    const d = document.createElement("div"); d.id = "reportModalHost"; document.body.appendChild(d); return d;
  })();
  const ctx = String(contextText || "").slice(0, 220);
  const meta = REPORT_TYPES[type];
  if (!meta) return;
  host.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this)__campus.reportClose()">
      <div class="modal-card" style="max-width:440px">
        <h3 style="margin:0 0 4px">გასაჩივრება</h3>
        <p class="muted" style="margin:0 0 12px;font-size:13px">ობიექტი: <b>${meta.label}</b></p>
        ${ctx ? `<div class="card" style="background:var(--bg);padding:10px 12px;margin-bottom:12px;font-size:13px;color:var(--ink-secondary,var(--muted));max-height:120px;overflow:auto">${ctx.replace(/[<>&]/g, c => ({ "<":"&lt;",">":"&gt;","&":"&amp;" }[c]))}</div>` : ""}
        <form onsubmit="__campus.reportSubmit(event,'${type}','${String(targetId).replace(/'/g,"\\'")}',${extra ? JSON.stringify(extra).replace(/'/g,"&#39;") : "null"})">
          <div class="field">
            <label style="font-size:12px;color:var(--muted)">გასაჩივრების მიზეზი</label>
            <select name="reason" required style="width:100%">
              ${REPORT_REASONS.map(r => `<option value="${r}">${r}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label style="font-size:12px;color:var(--muted)">დამატებითი კომენტარი (არასავალდებულო)</label>
            <textarea name="note" rows="2" maxlength="300" placeholder="ხანმოკლე ახსნა, რა ჩათვალეთ პრობლემურად"></textarea>
          </div>
          <div class="row" style="gap:8px;justify-content:flex-end;margin-top:10px">
            <button type="button" class="btn btn-ghost" onclick="__campus.reportClose()">გაუქმება</button>
            <button type="submit" class="btn btn-primary">გასაჩივრების გაგზავნა</button>
          </div>
        </form>
      </div>
    </div>`;
};
window.__campus.reportClose = () => {
  const h = document.getElementById("reportModalHost");
  if (h) h.innerHTML = "";
};
window.__campus.reportSubmit = async (e, type, targetId, extra) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const reason = fd.get("reason");
  const note = (fd.get("note") || "").toString().trim();
  const ctx = e.target.previousElementSibling?.textContent?.trim() || "";
  try {
    await submitReport({
      type, targetId,
      contextText: ctx,
      reason: note ? `${reason} — ${note}` : reason,
      extra: extra || null,
    });
    window.__campus.reportClose();
    const { showToast } = await import("./ui.js");
    showToast("გასაჩივრება გადაიგზავნა მოდერაციისთვის");
  } catch (err) {
    const { showToast } = await import("./ui.js");
    showToast("შეცდომა: " + (err.message || err));
  }
};

/* ------- Auth slot in header ------- */
const slot = document.getElementById("authSlot");
const renderSlot = (u) => {
  if (!u) { slot.innerHTML = `<a href="#/login" class="btn btn-primary">შესვლა</a>`; return; }
  const dn = getDisplayName();
  const admin = isAdminUser();
  const mod   = !admin && isModeratorUser();
  const panel = admin || mod;
  const adminBtn = panel
    ? `<a href="#/admin" class="btn btn-ghost admin-link" title="${admin ? "Admin Panel" : "Moderator Panel"}" style="margin-right:6px;border:1px solid var(--primary);color:var(--primary);font-weight:700">${admin ? "🛡️ Admin" : "🧑‍⚖️ Mod"}</a>`
    : "";
  const badge = admin
    ? `<span class="admin-badge" style="margin-left:6px;font-size:10px;background:var(--primary);color:#fff;padding:2px 6px;border-radius:999px;font-weight:700;letter-spacing:.04em">ADMIN</span>`
    : (mod ? `<span class="admin-badge" style="margin-left:6px;font-size:10px;background:#7c3aed;color:#fff;padding:2px 6px;border-radius:999px;font-weight:700;letter-spacing:.04em">MOD</span>` : "");
  slot.innerHTML = `${adminBtn}<a href="#/profile" class="btn btn-ghost user-chip" title="პროფილი">
       <span class="user-dot">${dn[0].toUpperCase()}</span>
       <span class="user-name">${dn}</span>${badge}
     </a>`;
};
onUser(renderSlot);

/* ------- Auth + role gate ------- */
// apply role attribute on boot
setRole(getRole());

const applyChrome = () => {
  const hash = hashPath();
  const onAuth = (hash === "/login");
  document.body.classList.toggle("is-auth-page", onAuth && !getUser());
};

/* hashchange listener is registered once inside onAuthReady (below) */

/* ------- Routes ------- */
route("/", dashboardView);
route("/login", loginView);
route("/universities", universitiesView);
route("/university/:id", universityView);
route("/faculty/:id", facultyView);
route("/subject/:id", subjectView);
route("/rankings", rankingsView);
route("/resources", resourcesView);
// /favorites route removed (feature deprecated)
route("/favorites", () => { setTimeout(() => { location.hash = "#/profile"; }, 0); return `<div class="empty">გადამისამართება...</div>`; });
route("/calendar", () => { setTimeout(() => { location.hash = "#/schedule"; }, 0); return `<div class="empty">გადამისამართება...</div>`; });
route("/profile", profileView);
route("/admin", adminView);

route("/search", searchView);
route("/gpa", gpaView);
route("/schedule", scheduleView);

route("/news", newsView);
route("/academic", academicView);
route("/onboarding", onboardingView);
route("/lecturers", lecturersView);
route("/chats", chatsView);
route("/chat/:chatId", chatRoomView);
route("/forum/:chatId", chatRoomView);
route("/faq", faqView);

/* ------- Boot ------- */
const enforceGate = () => {
  const h = hashPath();
  // Not logged in → login is the only entry
  if (!getUser()) {
    if (h !== "/login") { location.hash = "#/login"; return; }
    return;
  }
  // Logged in → apply profile role and bounce off auth pages
  const prof = getProfile();
  if (prof?.role && getRole() !== prof.role) setRole(prof.role);
  if (h === "/login") { location.hash = "#/"; return; }
  // Student must pick uni + faculty once
  if (prof?.role === "student" && (!prof.uniId || !prof.facultyId) && h !== "/onboarding") {
    location.hash = "#/onboarding"; return;
  }
  if (prof?.role !== "student" && h === "/onboarding") { location.hash = "#/"; return; }
};

onAuthReady(() => {
  enforceGate();
  applyChrome();
  // Single hashchange listener: gate + chrome. Router has its own listener.
  window.addEventListener("hashchange", () => { enforceGate(); applyChrome(); });
  startRouter();
  initPalette();
  initMobileNav();

  // Register post-render hooks (consumed by router's [data-init] sweep)
  window.__campusInit = window.__campusInit || {};
  window.__campusInit.neCarousel = (el) => {
    const scroll = el.querySelector(".ne-scroll");
    const dots = el.querySelectorAll(".ne-dot");
    if (!scroll || !dots.length) return;
    let raf = 0;
    const update = () => {
      const w = scroll.clientWidth || 1;
      const i = Math.round(scroll.scrollLeft / w);
      dots.forEach((d, j) => d.classList.toggle("active", j === i));
    };
    scroll.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });
    dots.forEach((d, i) => d.addEventListener("click", () => {
      scroll.scrollTo({ left: i * scroll.clientWidth, behavior: "smooth" });
    }));
  };
  startStore();

  onUser(() => { enforceGate(); applyChrome(); });

  // Warm images and likely-next views after first paint, on idle.
  if (getUser()) { prefetchAfterAuth(); }
  onUser((u) => { if (u) { prefetchAfterAuth(); } });
});

