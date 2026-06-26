import { ROLES } from "../state.js";
import { expose } from "../ui.js";

export const welcomeView = () => {
  expose("pickWelcomeRole", (r) => {
    try { localStorage.setItem("campus.pendingRole", r); } catch {}
    location.hash = "#/login?mode=register&role=" + encodeURIComponent(r);
  });

  expose("goLogin", () => {
    location.hash = "#/login?mode=login";
  });

  const card = (r) => `
    <button class="role-card" onclick="__campus.pickWelcomeRole('${r.id}')"
      aria-label="ვარ ${r.name}">
      <div class="role-ico" aria-hidden="true">${r.icon}</div>
      <h2 class="role-name">ვარ ${r.name}</h2>
      <p class="role-desc">${r.tagline}</p>
      <span class="role-cta">გაგრძელება →</span>
    </button>
  `;

  return `
    <section class="welcome-hero">
      <span class="badge badge-primary">👋 Campus</span>
      <h1 style="margin:14px 0 6px">კეთილი იყოს თქვენი<br/><span class="text-gradient">მობრძანება Campus-ში</span></h1>
      <p class="muted" style="font-size:16px;margin:0">ჯერ აირჩიე ვინ ხარ, შემდეგ გაიარე რეგისტრაცია</p>
    </section>
    <div class="role-grid">
      ${card(ROLES.abiturient)}
      ${card(ROLES.student)}
    </div>
    <p class="muted" style="text-align:center;margin-top:24px;font-size:13px">
      უკვე გაქვს ანგარიში?
      <a href="#" onclick="event.preventDefault();__campus.goLogin()">შესვლა</a>
    </p>
  `;
};
