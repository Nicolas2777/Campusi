// GPA კალკულატორი — ქართული 100-ქულიანი სისტემა + 4.0 კონვერსია.
// დამატებული: "რა-თუ" სცენარი — გათვალისწინებული ქულების სიმულაცია.
import { expose, showToast } from "../ui.js";
import { refresh } from "../router.js";

const KEY = "campus.gpa.courses";
const WHAT_KEY = "campus.gpa.whatIf";
const TAB_KEY = "campus.gpa.tab";

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));
const readWhat = () => { try { return JSON.parse(localStorage.getItem(WHAT_KEY) || "[]"); } catch { return []; } };
const writeWhat = (v) => localStorage.setItem(WHAT_KEY, JSON.stringify(v));

// ქართული 100-ქულიანი სკალის კონვერსია 4.0-ში (თსუ-ს მიდგომა)
const to4 = (score) => {
  const s = Number(score);
  if (isNaN(s)) return 0;
  if (s >= 91) return 4.0;
  if (s >= 81) return 3.5;
  if (s >= 71) return 3.0;
  if (s >= 61) return 2.5;
  if (s >= 51) return 2.0;
  return 0;
};
const letter = (score) => {
  const s = Number(score);
  if (s >= 91) return "A";
  if (s >= 81) return "B";
  if (s >= 71) return "C";
  if (s >= 61) return "D";
  if (s >= 51) return "E";
  if (s >= 41) return "FX";
  return "F";
};

const computeGPA = (rows) => {
  const totalCredits = rows.reduce((a, c) => a + Number(c.credits || 0), 0);
  const weighted4   = rows.reduce((a, c) => a + to4(c.score) * Number(c.credits || 0), 0);
  const weighted100 = rows.reduce((a, c) => a + Number(c.score || 0) * Number(c.credits || 0), 0);
  return {
    totalCredits,
    gpa4: totalCredits ? +(weighted4 / totalCredits).toFixed(2) : 0,
    avg100: totalCredits ? +(weighted100 / totalCredits).toFixed(1) : 0,
  };
};

const getTab = () => localStorage.getItem(TAB_KEY) || "actual";
const setTab = (t) => { localStorage.setItem(TAB_KEY, t); refresh(); };

export const gpaView = () => {
  const courses = read();
  const tab = getTab();

  expose("gpaTab", (t) => setTab(t));

  expose("gpaAdd", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get("name") || "").toString().trim();
    const credits = Number(fd.get("credits"));
    const score = Number(fd.get("score"));
    if (!name || !credits || isNaN(score)) return;
    const list = read();
    list.push({ id: crypto.randomUUID(), name, credits, score });
    write(list);
    e.target.reset();
    refresh();
  });
  expose("gpaDel", (id) => { write(read().filter(c => c.id !== id)); refresh(); });
  expose("gpaClear", () => {
    if (confirm("წაიშალოს ყველა საგანი?")) { write([]); refresh(); }
  });

  /* ----- What-If სცენარი ----- */
  expose("whatAdd", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get("name") || "").toString().trim();
    const credits = Number(fd.get("credits"));
    const score = Number(fd.get("score"));
    if (!name || !credits || isNaN(score)) return;
    const list = readWhat();
    list.push({ id: crypto.randomUUID(), name, credits, score, virtual: true });
    writeWhat(list);
    e.target.reset();
    refresh();
  });
  expose("whatDel", (id) => { writeWhat(readWhat().filter(c => c.id !== id)); refresh(); });
  expose("whatUpd", (id, val) => {
    const v = Math.max(0, Math.min(100, Number(val) || 0));
    const list = readWhat().map(c => c.id === id ? { ...c, score: v } : c);
    writeWhat(list);
    // Recalculate the summary live without full re-render
    const all = [...read(), ...list];
    const r = computeGPA(all);
    const g = document.getElementById("whatGpa"); if (g) g.textContent = r.gpa4.toFixed(2);
    const a = document.getElementById("whatAvg"); if (a) a.textContent = r.avg100.toFixed(1);
    const c = document.getElementById("whatCred"); if (c) c.textContent = r.totalCredits;
  });
  expose("whatReset", () => {
    if (confirm("გასუფთავდეს რა-თუ სცენარი?")) { writeWhat([]); refresh(); }
  });
  expose("whatImport", () => {
    if (!confirm("გადმოვიტანო რეალური საგნები სცენარის საწყის წერტილად?")) return;
    const copy = read().map(c => ({
      id: crypto.randomUUID(),
      name: c.name + " (პროგნოზი)",
      credits: c.credits,
      score: c.score,
      virtual: true,
    }));
    writeWhat([...readWhat(), ...copy]);
    refresh();
  });

  const actual = computeGPA(courses);
  const whatIf = readWhat();
  const combined = computeGPA([...courses, ...whatIf]);

  /* ---------- TABS ---------- */
  const tabBtn = (id, label) =>
    `<button class="prof-tab ${tab === id ? "active" : ""}" onclick="__campus.gpaTab('${id}')">${label}</button>`;

  /* ---------- Actual GPA tab ---------- */
  const actualPane = `
    <div class="grid grid-3" style="margin-top:18px">
      <div class="card stat tile-grad-1"><div class="stat-num">${actual.gpa4.toFixed(2)}</div><div class="stat-label">GPA (4.0)</div></div>
      <div class="card stat tile-grad-2"><div class="stat-num">${actual.avg100.toFixed(1)}</div><div class="stat-label">საშუალო (100)</div></div>
      <div class="card stat tile-grad-3"><div class="stat-num">${actual.totalCredits}</div><div class="stat-label">სულ კრედიტი</div></div>
    </div>

    <div class="card" style="margin-top:20px">
      <h3 style="margin-top:0">საგნის დამატება</h3>
      <form onsubmit="__campus.gpaAdd(event)">
        <div class="grid grid-3">
          <div class="field"><label>საგანი</label><input name="name" required placeholder="მაგ. კალკულუსი I" /></div>
          <div class="field"><label>კრედიტი</label><input name="credits" type="number" min="1" max="30" required placeholder="6" /></div>
          <div class="field"><label>ქულა (0-100)</label><input name="score" type="number" min="0" max="100" step="0.1" required placeholder="85" /></div>
        </div>
        <button class="btn btn-primary" type="submit">დამატება</button>
      </form>
    </div>

    ${courses.length ? `
      <div class="row between" style="margin-top:22px">
        <h2 class="section-title" style="margin:0">საგნები</h2>
        <button class="btn btn-danger" onclick="__campus.gpaClear()" style="padding:6px 12px;font-size:13px">გასუფთავება</button>
      </div>
      <div class="stack" style="margin-top:8px">
        ${courses.map(c => `
          <div class="card">
            <div class="card-row">
              <div>
                <h3 style="margin:0">${c.name}</h3>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${c.credits} კრედიტი · ქულა ${c.score}</p>
              </div>
              <div class="row">
                <span class="badge badge-primary">${letter(c.score)} · ${to4(c.score).toFixed(1)}</span>
                <button class="btn btn-danger" onclick="__campus.gpaDel('${c.id}')">წაშლა</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<p class="muted" style="margin-top:18px">საგნები ჯერ არ დაგიმატებიათ — გამოიყენეთ ზემოთ მოცემული ფორმა.</p>`}
  `;

  /* ---------- What-If tab ---------- */
  const delta = (whatIf.length || courses.length)
    ? (combined.gpa4 - actual.gpa4)
    : 0;
  const deltaColor = delta > 0.005 ? "#16a34a" : delta < -0.005 ? "#dc2626" : "var(--muted)";
  const deltaArrow = delta > 0.005 ? "▲" : delta < -0.005 ? "▼" : "→";

  const whatPane = `
    <div class="card" style="margin-top:18px">
      <h3 style="margin-top:0">რა-თუ სცენარი</h3>
      <p class="muted" style="font-size:13px;margin:0 0 4px">
        პროგნოზული საგნები — შედეგი ერთიანდება მიმდინარე GPA-სთან.
      </p>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        ${courses.length ? `<button type="button" class="btn btn-ghost" onclick="__campus.whatImport()">⤓ რეალური საგნების გადმოტანა</button>` : ""}
        ${whatIf.length ? `<button type="button" class="btn btn-danger" onclick="__campus.whatReset()" style="padding:6px 12px;font-size:13px">გასუფთავება</button>` : ""}
      </div>
    </div>

    <div class="grid grid-3" style="margin-top:14px">
      <div class="card stat tile-grad-1"><div class="stat-num" id="whatGpa">${combined.gpa4.toFixed(2)}</div><div class="stat-label">პროგნოზული GPA</div></div>
      <div class="card stat tile-grad-2"><div class="stat-num" id="whatAvg">${combined.avg100.toFixed(1)}</div><div class="stat-label">საშუალო (100)</div></div>
      <div class="card stat tile-grad-3"><div class="stat-num" id="whatCred">${combined.totalCredits}</div><div class="stat-label">სულ კრედიტი</div></div>
    </div>

    <div class="card" style="margin-top:14px;text-align:center">
      <span class="muted" style="font-size:13px">ცვლილება მიმდინარე GPA-სთან:</span>
      <span style="font-size:22px;font-weight:700;color:${deltaColor};margin-left:10px">
        ${deltaArrow} ${(delta >= 0 ? "+" : "")}${delta.toFixed(2)}
      </span>
      <span class="muted" style="font-size:12px;margin-left:6px">(${actual.gpa4.toFixed(2)} → ${combined.gpa4.toFixed(2)})</span>
    </div>

    <div class="card" style="margin-top:18px">
      <h3 style="margin-top:0">პროგნოზული საგნის დამატება</h3>
      <form onsubmit="__campus.whatAdd(event)">
        <div class="grid grid-3">
          <div class="field"><label>საგანი</label><input name="name" required placeholder="მაგ. ალგორითმები II" /></div>
          <div class="field"><label>კრედიტი</label><input name="credits" type="number" min="1" max="30" required placeholder="5" /></div>
          <div class="field"><label>მოსალოდნელი ქულა</label><input name="score" type="number" min="0" max="100" step="0.5" required placeholder="80" /></div>
        </div>
        <button class="btn btn-primary" type="submit">დამატება</button>
      </form>
    </div>

    ${whatIf.length ? `
      <h2 class="section-title" style="margin-top:22px">სცენარის საგნები</h2>
      <div class="stack">
        ${whatIf.map(c => `
          <div class="card">
            <div class="card-row" style="gap:12px;flex-wrap:wrap">
              <div style="min-width:160px;flex:1">
                <h3 style="margin:0">${c.name}</h3>
                <p class="muted" style="margin:4px 0 0;font-size:13px">${c.credits} კრედიტი</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px;min-width:240px;flex:1">
                <input type="range" min="0" max="100" step="1" value="${c.score}"
                  oninput="document.getElementById('val_${c.id}').textContent=this.value;__campus.whatUpd('${c.id}',this.value)"
                  style="flex:1" />
                <span id="val_${c.id}" style="font-weight:700;min-width:34px;text-align:right">${c.score}</span>
                <span class="badge badge-primary">${letter(c.score)} · ${to4(c.score).toFixed(1)}</span>
                <button class="btn btn-danger" onclick="__campus.whatDel('${c.id}')" style="padding:4px 10px;font-size:12px">წაშლა</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<p class="muted" style="margin-top:18px">პროგნოზული საგანი ჯერ არ დაგიმატებია.</p>`}
  `;

  return `
    <div class="row between" style="align-items:flex-end;flex-wrap:wrap;gap:12px">
      <div>
        <span class="badge badge-primary">🧮 კალკულატორი</span>
        <h1 style="margin:10px 0 4px">GPA კალკულატორი</h1>
        <p class="muted">100-ქულიანი სისტემა · 4.0 სკალა.</p>
      </div>
    </div>

    <div style="margin-top:14px">
      ${actualPane}
    </div>

    <div class="card" style="margin-top:24px">
      <h3 style="margin-top:0">შეფასების სკალა</h3>
      <p class="muted" style="font-size:13px;line-height:1.7">
        A (91-100) → 4.0 · B (81-90) → 3.5 · C (71-80) → 3.0 · D (61-70) → 2.5 · E (51-60) → 2.0 · FX/F (&lt;51) → 0
      </p>
    </div>
  `;
};
