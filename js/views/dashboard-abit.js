import { universities } from "../data.js";
import { getPoints, getBadges, BADGES, levelOf } from "../state.js";
import { getFirstName } from "../auth.js";
import { escapeHtml, daysUntil, expose } from "../ui.js";
import { newsItems } from "../news-data.js";
import { refresh } from "../router.js";

// placeholder — სანამ ოფიციალური თარიღი დადგინდება, ვიყენებთ ზაფხულის სავარაუდო თარიღს
export const NATIONAL_EXAM_DATE = "2026-07-01";

const GOALS_KEY = "campus.abit.goals";
const readGoals = () => { try { return JSON.parse(localStorage.getItem(GOALS_KEY) || "[]"); } catch { return []; } };
const writeGoals = (g) => localStorage.setItem(GOALS_KEY, JSON.stringify(g));

const PREP_SUBJECTS = [
  { id: "geo",  icon: "📖", name: "ქართული" },
  { id: "math", icon: "➗", name: "მათემატიკა" },
  { id: "eng",  icon: "🇬🇧", name: "ინგლისური" },
  { id: "hist", icon: "🏛", name: "ისტორია" },
];

export const abiturientDashboard = () => {
  const name = getFirstName();
  const hour = new Date().getHours();
  const greet = hour < 6 ? "კარგი ღამე" : hour < 12 ? "დილა მშვიდობისა" : hour < 18 ? "შუადღე მშვიდობისა" : "საღამო მშვიდობისა";

  const pts = getPoints();
  const lvl = levelOf(pts);
  const unlocked = getBadges();
  const next = BADGES.find(b => !unlocked.includes(b.id));
  const progress = next ? Math.min(100, Math.round((pts / next.req) * 100)) : 100;

  const daysLeft = daysUntil(NATIONAL_EXAM_DATE);
  const goals = readGoals();
  const goalsDone = goals.filter(g => g.done).length;

  expose("toggleGoal", (i) => {
    const g = readGoals();
    if (g[i]) { g[i].done = !g[i].done; writeGoals(g); refresh(); }
  });
  expose("addGoal", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = (fd.get("text") || "").toString().trim();
    if (!text) return;
    const g = readGoals();
    g.push({ text, done: false });
    writeGoals(g);
    e.target.reset();
    refresh();
  });
  expose("rmGoal", (i) => {
    const g = readGoals();
    g.splice(i, 1); writeGoals(g); refresh();
  });

  const topUnis = [...universities]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  // აბიტურიენტს არ ვაჩვენებთ უნივერსიტეტში საგნებზე რეგისტრაციის სიახლეებს
  const latestNews = [...newsItems]
    .filter(n => n.category !== "registration")
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 2);
  const uniMap = Object.fromEntries(universities.map(u => [u.id, u]));

  return `
    <section class="dash-hero">
      <div>
        <span class="badge badge-primary">🎓 აბიტურიენტი</span>
        <h1 style="margin:12px 0 4px">${greet},<br/><span class="text-gradient">${escapeHtml(name)}</span></h1>
        <p class="muted">დღევანდელი ფოკუსი ნახე ერთ ეკრანზე.</p>
      </div>
      <div class="dash-level">
        <div class="ring" style="--p:${progress}">
          <div class="ring-inner">
            <div class="lvl-num">${lvl}</div>
            <div class="lvl-lbl">დონე</div>
          </div>
        </div>
        <div style="text-align:center;margin-top:8px">
          <div style="font-weight:700;font-size:13px">${pts} ქულა</div>
          <div class="muted" style="font-size:11px">${next ? `→ ${next.icon} ${next.name}` : "🎉"}</div>
        </div>
      </div>
    </section>

    <a href="#/prep" class="card countdown-card" style="margin-top:18px" aria-label="ეროვნულ გამოცდებამდე დარჩენილი დრო">
      <div class="row between" style="flex-wrap:nowrap;gap:12px;align-items:center">
        <div style="min-width:0;flex:1">
          <div class="muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.05em">ეროვნულ გამოცდებამდე</div>
          <div class="countdown-num">${daysLeft >= 0 ? daysLeft : 0}<span> დღე</span></div>
          <div class="muted" style="font-size:12px">სავარაუდო თარიღი: ${NATIONAL_EXAM_DATE}</div>
        </div>
        <div class="countdown-ico" aria-hidden="true">⏳</div>
      </div>
    </a>

    <div class="row between" style="margin-top:28px;margin-bottom:12px">
      <h2 style="margin:0;font-size:18px">🎯 დღევანდელი მიზნები</h2>
      <span class="muted" style="font-size:13px">${goalsDone}/${goals.length}</span>
    </div>
    <div class="card">
      ${goals.length ? `<ul class="goals-list">
        ${goals.map((g, i) => `<li class="goal-item ${g.done ? "done" : ""}">
          <label>
            <input type="checkbox" ${g.done ? "checked" : ""} onchange="__campus.toggleGoal(${i})" />
            <span>${escapeHtml(g.text)}</span>
          </label>
          <button class="btn-icon" onclick="__campus.rmGoal(${i})" aria-label="წაშლა">✕</button>
        </li>`).join("")}
      </ul>` : `<p class="muted" style="margin:0 0 12px">დღევანდელი მიზნები ცარიელია — დაამატე ერთი.</p>`}
      <form onsubmit="__campus.addGoal(event)" class="goal-form">
        <input name="text" placeholder="მაგ. მათემატიკის 5 ამოცანის ამოხსნა" maxlength="120" />
        <button class="btn btn-primary" type="submit">+</button>
      </form>
    </div>

    <div class="row between" style="margin-top:28px;margin-bottom:12px">
      <h2 style="margin:0;font-size:18px">📚 მოემზადე საგნებზე</h2>
      <a class="muted" href="#/prep" style="font-size:13px">ყველა →</a>
    </div>
    <div class="grid grid-4">
      ${PREP_SUBJECTS.map(s => `
        <a class="card quick" href="#/prep/${s.id}" aria-label="${s.name}">
          <div class="qi">${s.icon}</div>
          <h3>${s.name}</h3>
          <p class="muted" style="font-size:12px">თემები · მასალები</p>
        </a>`).join("")}
    </div>

    ${latestNews.length ? `<div style="margin-top:28px">
      <div class="row between" style="margin-bottom:12px">
        <h2 style="margin:0;font-size:18px">📰 სიახლეები</h2>
        <a class="muted" href="#/news" style="font-size:13px">სრულად →</a>
      </div>
      <div class="stack">
        ${latestNews.map(n => `<a class="card news-mini" href="#/news">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:4px">
            <span class="badge badge-primary" style="font-size:11px">${escapeHtml(uniMap[n.uniId]?.name || n.uniId)}</span>
          </div>
          <div class="sm-title" style="font-size:14px">${escapeHtml(n.title)}</div>
        </a>`).join("")}
      </div>
    </div>` : ""}

    <hr style="margin:36px 0 0;border:0;border-top:1px solid var(--border,#e5e7eb)" />

    <div style="margin-top:24px">
      <div class="row between" style="margin-bottom:6px">
        <h2 style="margin:0;font-size:20px">🏛 უნივერსიტეტები</h2>
        <a class="muted" href="#/universities" style="font-size:13px">ყველა →</a>
      </div>
      <p class="muted" style="margin:0 0 14px;font-size:13px">გაეცანი წამყვან უნივერსიტეტებს და აირჩიე შენთვის შესაფერისი.</p>
      <div class="grid grid-3">
        ${topUnis.map(u => `<a class="card" href="#/university/${u.id}">
          <div class="card-row">
            <div style="min-width:0">
              <h3 style="margin:0;font-size:15px">${escapeHtml(u.name)}</h3>
              <p class="muted" style="font-size:12px;margin:2px 0 0">${escapeHtml(u.city || "")}</p>
            </div>
            <span class="badge badge-primary">★ ${u.rating || "—"}</span>
          </div>
        </a>`).join("")}
      </div>
    </div>

    <div class="chip-row" style="margin-top:28px">
      <a class="chip" href="#/prep">📚 მომზადება</a>
      <a class="chip" href="#/study-plan">🗓 გეგმა</a>
      <a class="chip" href="#/career">🧭 ტესტი</a>
      <a class="chip" href="#/grants">💰 გრანტები</a>
      <a class="chip" href="#/universities">🏛 უნივერსიტეტები</a>
      <a class="chip" href="#/news">📰 სიახლეები</a>
      <a class="chip" href="#/profile">👤 პროფილი</a>
    </div>
  `;
};
