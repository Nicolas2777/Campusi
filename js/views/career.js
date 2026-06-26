import { QUESTIONS, CATEGORIES, scoreToTop } from "../career-data.js";
import { universities } from "../data.js";
import { escapeHtml, expose, showToast } from "../ui.js";
import { refresh, navigate } from "../router.js";

const KEY_STATE = "campus.career.state";   // {ix, scores}
const KEY_RESULT = "campus.career.result"; // scores

const readState = () => { try { return JSON.parse(localStorage.getItem(KEY_STATE) || "null"); } catch { return null; } };
const writeState = (v) => localStorage.setItem(KEY_STATE, JSON.stringify(v));
const readResult = () => { try { return JSON.parse(localStorage.getItem(KEY_RESULT) || "null"); } catch { return null; } };
const writeResult = (v) => localStorage.setItem(KEY_RESULT, JSON.stringify(v));
const clearAll = () => { localStorage.removeItem(KEY_STATE); localStorage.removeItem(KEY_RESULT); };

const renderIntro = () => `
  <div class="page-head">
    <h1 style="margin:0">🧭 რა მაინტერესებს?</h1>
    <p class="muted" style="margin:6px 0 0">
      ${QUESTIONS.length}-კითხვიანი ტესტი დაგეხმარება მიმართულების არჩევაში — პროფესია, ფაკულტეტი, უნივერსიტეტი.
    </p>
  </div>
  <div class="card" style="margin-top:18px;text-align:center;padding:32px 20px">
    <div style="font-size:64px;line-height:1">🧭</div>
    <p style="margin:12px 0 20px">დაახლოებით 2 წუთი დაგჭირდება.</p>
    <button class="btn btn-primary" onclick="__campus.careerStart()">დაწყება →</button>
  </div>
`;

const renderQuestion = (ix, q) => `
  <div class="page-head">
    <h1 style="margin:0;font-size:22px">კითხვა ${ix + 1} / ${QUESTIONS.length}</h1>
    <div class="progress" style="margin-top:10px">
      <div class="progress-bar" style="width:${Math.round((ix / QUESTIONS.length) * 100)}%"></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(q.q)}</h2>
    <div class="stack" style="gap:10px">
      ${q.opts.map((o, i) => `
        <button class="career-opt" onclick="__campus.careerAnswer(${i})">
          ${escapeHtml(o.t)}
        </button>`).join("")}
    </div>
  </div>
  ${ix > 0 ? `<div style="margin-top:14px">
    <button class="btn btn-ghost" onclick="__campus.careerBack()">← უკან</button>
  </div>` : ""}
`;

const renderResult = (scores) => {
  const top = scoreToTop(scores, 3);
  const uniMap = Object.fromEntries(universities.map(u => [u.id, u]));

  return `
    <div class="page-head">
      <h1 style="margin:0">🎯 შენი შედეგი</h1>
      <p class="muted" style="margin:6px 0 0">ტოპ მიმართულებები შენი პასუხების მიხედვით</p>
    </div>

    <div class="stack" style="margin-top:18px">
      ${top.map((t, i) => {
        const c = t.cat;
        const recommendedUnis = c.uniIds.map(id => uniMap[id]).filter(Boolean);
        return `<div class="card result-card">
          <div class="result-head">
            <div class="result-rank">${i + 1}</div>
            <div class="result-ico" aria-hidden="true">${c.icon}</div>
            <div style="min-width:0;flex:1">
              <h3 style="margin:0;font-size:17px">${escapeHtml(c.name)}</h3>
              <p class="muted" style="margin:4px 0 0;font-size:13px">დამთხვევა: ${t.score} ქულა</p>
            </div>
          </div>
          <div class="result-section">
            <h4>💼 პროფესიები</h4>
            <div class="chip-row">${c.professions.map(p => `<span class="chip">${escapeHtml(p)}</span>`).join("")}</div>
          </div>
          <div class="result-section">
            <h4>🎓 ფაკულტეტები</h4>
            <div class="chip-row">${c.faculties.map(f => `<span class="chip">${escapeHtml(f)}</span>`).join("")}</div>
          </div>
          ${recommendedUnis.length ? `<div class="result-section">
            <h4>🏛 უნივერსიტეტები</h4>
            <div class="stack" style="gap:6px">
              ${recommendedUnis.map(u => `<a class="chip" href="#/university/${u.id}" style="justify-content:flex-start">
                ${escapeHtml(u.name)}${u.city ? ` · <span class="muted">${escapeHtml(u.city)}</span>` : ""}
              </a>`).join("")}
            </div>
          </div>` : ""}
        </div>`;
      }).join("")}
    </div>

    <div class="row" style="justify-content:center;gap:10px;margin-top:24px">
      <button class="btn btn-ghost" onclick="__campus.careerRestart()">🔁 თავიდან</button>
      <a class="btn btn-primary" href="#/universities">უნივერსიტეტების ნახვა →</a>
    </div>
  `;
};

export const careerView = () => {
  expose("careerStart", () => {
    writeState({ ix: 0, scores: {} });
    refresh();
  });
  expose("careerAnswer", (optIx) => {
    const st = readState() || { ix: 0, scores: {} };
    const q = QUESTIONS[st.ix];
    const opt = q.opts[optIx];
    Object.entries(opt.add || {}).forEach(([k, v]) => {
      st.scores[k] = (st.scores[k] || 0) + v;
    });
    st.ix += 1;
    if (st.ix >= QUESTIONS.length) {
      writeResult(st.scores);
      localStorage.removeItem(KEY_STATE);
    } else {
      writeState(st);
    }
    refresh();
  });
  expose("careerBack", () => {
    const st = readState();
    if (!st || st.ix === 0) return;
    st.ix -= 1;
    writeState(st);
    refresh();
  });
  expose("careerRestart", () => {
    if (!confirm("თავიდან დავიწყოთ?")) return;
    clearAll();
    refresh();
  });

  const result = readResult();
  if (result) return renderResult(result);
  const st = readState();
  if (st && st.ix < QUESTIONS.length) return renderQuestion(st.ix, QUESTIONS[st.ix]);
  return renderIntro();
};
