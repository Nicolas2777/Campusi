import { universities, resources, getSubject, facultiesByUni, faculties } from "../data.js";
import { getExams, addExam, removeExam, isAdmin,
         getPoints, getBadges, BADGES, POINTS, levelOf, addPoints,
         getCompare, toggleCompare, clearCompare,
         getRole, setRole, ROLES } from "../state.js";
import { getUser, login, register, logout, getDisplayName, setDisplayName, getProfile, isAdminUser } from "../auth.js";
import { showToast, expose, escapeHtml, daysUntil, skGrid } from "../ui.js";
import { refresh, navigate } from "../router.js";
import { firebaseEnabled } from "../firebase.js";
import { getTheme, toggleTheme } from "../state.js";
import { getAvg, getMyRating, rateMaterial } from "../materialRatings.js";



/* Rankings — redirects to universities sorted by rating */
export const rankingsView = () => {
  setTimeout(() => { location.hash = "#/universities?sort=rating"; }, 0);
  return `<div class="empty">გადამისამართება...</div>`;
};

/* Resources — Firebase-backed, faculty-filtered, student-uploadable */
let _resState = { subjectId: "", type: "all", minRating: 0 };
let _resData = { subs: null, items: null };
let _resLoading = false;



const _loadRes = async () => {
  if (_resLoading) return;
  _resLoading = true;
  try {
    const { loadFirebase } = await import("../firebase.js");
    const fb = await loadFirebase();
    const [s, r] = await Promise.all([
      fb.getDocs(fb.collection(fb.db, "subjects")),
      fb.getDocs(fb.collection(fb.db, "resources")),
    ]);
    _resData.subs = s.docs.map(d => ({ id: d.id, ...d.data() }));
    _resData.items = r.docs.map(d => ({ id: d.id, ...d.data() }));
    refresh();
  } catch (e) { console.warn("resources load", e); }
  finally { _resLoading = false; }
};

const RES_TYPES = ["ლინკი"];

export const resourcesView = () => {
  const user = getUser();
  const realProfile = getProfile();
  const facultyId = realProfile?.facultyId || "";
  const isAdminLocal = isAdminUser();

  if (_resData.subs == null) {
    _loadRes();
    return `<h1>📚 რესურსები</h1>${skGrid(6, 3)}`;
  }

  const facSubs = isAdminLocal ? _resData.subs : _resData.subs.filter(s => s.facultyId === facultyId);
  const subMap = Object.fromEntries(_resData.subs.map(s => [s.id, s]));
  const facSubIds = new Set(facSubs.map(s => s.id));

  if (_resState.subjectId && !facSubIds.has(_resState.subjectId)) _resState.subjectId = "";

  let items = _resData.items.filter(r => facSubIds.has(r.subjectId));
  if (_resState.subjectId) items = items.filter(r => r.subjectId === _resState.subjectId);
  if (_resState.type !== "all") items = items.filter(r => r.type === _resState.type);
  if (_resState.minRating > 0) {
    items = items.filter(r => getAvg(r.id).avg >= _resState.minRating);
  }
  // Sort: by avg rating desc, then newest
  items = items.slice().sort((a, b) => {
    const ra = getAvg(a.id).avg, rb = getAvg(b.id).avg;
    if (rb !== ra) return rb - ra;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  expose("resSetSubject", (id) => { _resState.subjectId = id; refresh(); });
  expose("resSetType", (t) => { _resState.type = t; refresh(); });
  expose("resSetMinRating", (n) => { _resState.minRating = +n || 0; refresh(); });
  expose("resAddSubmit", async (e) => {
    e.preventDefault();
    if (!user) { showToast("გთხოვ შეხვიდე"); return; }
    const f = new FormData(e.target);
    const data = {
      subjectId: f.get("subjectId"),
      title: (f.get("title") || "").toString().trim(),
      type: "ლინკი",
      url: (f.get("url") || "").toString().trim(),
      uploadedBy: user.uid,
      uploaderName: (getDisplayName ? getDisplayName() : (user.email || "—")),
      upvotes: 0,
      createdAt: Date.now(),
    };
    if (!data.subjectId || !data.title || !data.url) { showToast("ყველა ველი აუცილებელია"); return; }
    try {
      const { loadFirebase } = await import("../firebase.js");
      const fb = await loadFirebase();
      await fb.addDoc(fb.collection(fb.db, "resources"), data);
      recordEvent("material");
      showToast("რესურსი დაემატა ✓");
      e.target.reset();
      _resData.subs = null; _resData.items = null;
      _loadRes();
    } catch (err) {
      console.error(err);
      showToast("ვერ დაემატა: " + (err?.message || err));
    }
  });
  // favorites feature removed — resFav is a no-op kept for legacy onclick handlers
  expose("resFav", () => {});
  expose("resRate", (id, n) => {
    try { rateMaterial(id, +n); showToast(`შეფასდა: ${n} ★`); refresh(); }
    catch (err) { showToast(err.message || "შეცდომა"); }
  });
  expose("resDelete", async (id) => {
    if (!confirm("წაიშალოს ეს რესურსი?")) return;
    try {
      const { loadFirebase } = await import("../firebase.js");
      const fb = await loadFirebase();
      await fb.deleteDoc(fb.doc(fb.db, "resources", id));
      _resData.items = _resData.items.filter(r => r.id !== id);
      showToast("წაიშალა"); refresh();
    } catch (err) { showToast("ვერ წაიშალა: " + (err?.message || err)); }
  });


  const subjOptions = facSubs.map(s => `<option value="${s.id}" ${_resState.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}${s.code ? ` (${escapeHtml(s.code)})` : ""}</option>`).join("");

  return `
    <h1>📚 რესურსები</h1>
    <p class="muted">ფაკულტეტის გაზიარებული მასალები.</p>

    ${!facultyId && !isAdminLocal ? `<div class="empty"><div class="ico">🎓</div>ჯერ აირჩიე ფაკულტეტი. <a class="btn btn-primary" href="#/onboarding" style="margin-top:12px">ფაკულტეტის არჩევა</a></div>` : `

    <div class="card" style="margin-top:14px">
      <div class="grid grid-3" style="gap:12px">
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">საგანი</label>
          <select onchange="__campus.resSetSubject(this.value)" style="width:100%">
            <option value="">— ყველა საგანი —</option>
            ${subjOptions}
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">ტიპი</label>
          <select onchange="__campus.resSetType(this.value)" style="width:100%">
            <option value="all" ${_resState.type === "all" ? "selected" : ""}>— ყველა ტიპი —</option>
            ${RES_TYPES.map(t => `<option value="${t}" ${_resState.type === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">მინიმუმ შეფასება</label>
          <select onchange="__campus.resSetMinRating(this.value)" style="width:100%">
            <option value="0" ${_resState.minRating === 0 ? "selected" : ""}>ნებისმიერი</option>
            <option value="3" ${_resState.minRating === 3 ? "selected" : ""}>3★ ან მეტი</option>
            <option value="4" ${_resState.minRating === 4 ? "selected" : ""}>4★ ან მეტი</option>
            <option value="4.5" ${_resState.minRating === 4.5 ? "selected" : ""}>4.5★ ან მეტი</option>
          </select>
        </div>
      </div>
    </div>


    ${user ? `<details class="card" style="margin-top:12px" ${items.length === 0 ? "open" : ""}>
      <summary style="cursor:pointer;font-weight:600">➕ რესურსის დამატება</summary>
      <form onsubmit="__campus.resAddSubmit(event)" style="margin-top:12px">
        <div class="grid grid-2" style="gap:10px">
          <div>
            <label style="font-size:12px;color:var(--muted)">საგანი *</label>
            <select name="subjectId" required style="width:100%">
              <option value="">— აირჩიე —</option>
              ${facSubs.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size:12px;color:var(--muted)">ტიპი *</label>
            <select name="type" required style="width:100%">
              ${RES_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
            </select>
          </div>
        </div>
        <div style="margin-top:10px">
          <label style="font-size:12px;color:var(--muted)">სათაური *</label>
          <input name="title" required maxlength="160" placeholder="მაგ.: ალგებრა I — შუალედური კონსპექტი" style="width:100%" />
        </div>
        <div style="margin-top:10px">
          <label style="font-size:12px;color:var(--muted)">Drive / ბმული *</label>
          <input name="url" type="url" required placeholder="https://drive.google.com/..." style="width:100%" />
        </div>
        <div style="margin-top:12px;text-align:right">
          <button type="submit" class="btn btn-primary">გაზიარება</button>
        </div>
      </form>
    </details>` : `<p class="muted" style="margin-top:10px;font-size:13px">რესურსის დასამატებლად <a href="#/login">შედი სისტემაში</a>.</p>`}

    <div class="grid grid-2" style="margin-top:18px">
      ${items.length ? items.map(r => {
        const s = subMap[r.subjectId];
        const mine = user && r.uploadedBy === user.uid;
        const canDel = mine || isAdminLocal;
        const ag = getAvg(r.id);
        const mine2 = user && r.uploadedBy === user.uid;
        const myR = getMyRating(r.id);
        const starsRow = [1,2,3,4,5].map(n =>
          `<button type="button" class="mr-star ${myR >= n ? "on" : ""}" aria-label="${n} ვარსკვლავი" onclick="__campus.resRate('${r.id}',${n})" ${(!user || mine2) ? "disabled" : ""}>★</button>`
        ).join("");
        return `<div class="card">
          <div class="card-row">
            <h3 style="margin:0">${escapeHtml(r.title)}</h3>
          </div>
          <p class="muted" style="margin:6px 0 0;font-size:13px">📘 ${escapeHtml(s?.name || "—")}${r.uploaderName ? ` · 👤 ${escapeHtml(r.uploaderName)}` : ""}</p>
          <div class="mr-row" style="margin-top:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div class="mr-stars" aria-label="შეფასება">${starsRow}</div>
            <span class="muted" style="font-size:12px">${ag.count ? `${ag.avg.toFixed(1)}/5 · ${ag.count} შეფასება` : "ჯერ არ შეფასებულა"}</span>
          </div>
          <div class="row between" style="margin-top:10px;gap:8px;flex-wrap:wrap">
            <a class="btn btn-primary" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">გახსნა →</a>
            <div class="row" style="gap:6px">
              ${user && !mine ? `<button class="btn btn-ghost" title="გასაჩივრება" style="padding:6px 10px;font-size:12px" onclick="__campus.report('material','${r.id}',${JSON.stringify(r.title || '').replace(/'/g,'&#39;')})">⚑</button>` : ""}
              ${canDel ? `<button class="btn btn-ghost" onclick="__campus.resDelete('${r.id}')">🗑 წაშლა</button>` : ""}
            </div>
          </div>
        </div>`;
      }).join("") : `<div class="empty" style="grid-column:1/-1"><div class="ico">📭</div>ჯერ არაფერია — დაამატე პირველი ☝️</div>`}

    </div>

    `}
  `;
};

/* Favorites — feature removed */

/* Calendar — exams & quizzes with per-item reminders */
export const calendarView = () => {
  const exams = getExams();
  expose("addExam", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addExam({
      kind: (fd.get("kind") || "exam").toString(),
      title: fd.get("title"),
      subjectId: fd.get("subjectId") || "",
      date: fd.get("date"),
      location: fd.get("location") || "",
      reminderDays: Number(fd.get("reminderDays")) || 3,
    });
    const p = addPoints("exam");
    if (p) showToast(`+${p} ქულა`);
    e.target.reset(); refresh();
  });
  expose("removeExam", (id) => { removeExam(id); refresh(); });

  // upcoming reminders
  const reminders = exams
    .map(e => ({ ...e, d: daysUntil(e.date) }))
    .filter(e => e.d >= 0 && e.d <= (e.reminderDays ?? 3));

  const kindLabel = (k) => k === "quiz" ? "🧠 ქვიზი" : "📝 გამოცდა";

  return `
    <h1>⏰ გამოცდები და ქვიზები</h1>
    <p class="muted">პირადი შემახსენებლები — ხილვადია მხოლოდ შენთვის.</p>

    ${reminders.length ? `<div class="card" style="margin-top:14px;border-left:4px solid var(--primary)">
      <h3 style="margin:0 0 8px">🔔 უახლოესი შემახსენებლები</h3>
      <div class="stack">
        ${reminders.map(r => `<div class="row between" style="gap:8px;flex-wrap:nowrap">
          <div style="min-width:0">
            <b>${kindLabel(r.kind)} — ${escapeHtml(r.title)}</b>
            <div class="muted" style="font-size:12px">📅 ${r.date}${r.location ? ` · 📍 ${escapeHtml(r.location)}` : ""}</div>
          </div>
          <span class="badge ${r.d <= 1 ? "badge-danger" : "badge-primary"}">${r.d === 0 ? "დღეს" : `${r.d} დღე`}</span>
        </div>`).join("")}
      </div>
    </div>` : ""}

    <div class="card" style="margin:16px 0">
      <h3 style="margin-top:0">დაამატე გამოცდა ან ქვიზი</h3>
      <form onsubmit="__campus.addExam(event)">
        <div class="grid grid-2">
          <div class="field"><label>ტიპი</label>
            <select name="kind">
              <option value="exam">📝 გამოცდა</option>
              <option value="quiz">🧠 ქვიზი</option>
            </select>
          </div>
          <div class="field"><label>თარიღი</label><input type="date" name="date" required /></div>
          <div class="field"><label>სათაური</label><input name="title" required placeholder="მაგ. ალგორითმები — შუალედური" /></div>
          <div class="field"><label>ლოკაცია</label><input name="location" placeholder="აუდიტორია / ბმული" /></div>
          <div class="field"><label>შემახსენე — დღით ადრე</label>
            <select name="reminderDays">
              <option value="1">1 დღით ადრე</option>
              <option value="2">2 დღით ადრე</option>
              <option value="3" selected>3 დღით ადრე</option>
              <option value="5">5 დღით ადრე</option>
              <option value="7">1 კვირით ადრე</option>
              <option value="14">2 კვირით ადრე</option>
            </select>
          </div>
          <div class="field"><label>საგნის ID (ოპც.)</label><input name="subjectId" placeholder="algo101" /></div>
        </div>
        <button class="btn btn-primary" type="submit">დამატება</button>
      </form>
    </div>
    ${exams.length ? `<div class="stack">${exams.map(e => {
      const d = daysUntil(e.date);
      const rd = e.reminderDays ?? 3;
      const urgent = d >= 0 && d <= Math.min(rd, 3);
      return `<div class="card">
        <div class="card-row">
          <div style="min-width:0">
            <h3 style="margin:0">${kindLabel(e.kind)} — ${escapeHtml(e.title)}</h3>
            <p>📅 ${e.date}${e.location ? " · " + escapeHtml(e.location) : ""}<span class="muted" style="margin-left:8px;font-size:12px">🔔 ${rd} დღით ადრე</span></p>
          </div>
          <div class="row" style="gap:8px;flex-wrap:nowrap">
            <span class="badge ${urgent ? "badge-danger" : d < 0 ? "" : "badge-primary"}">
              ${d < 0 ? "გასული" : d === 0 ? "დღეს" : `${d} დღე`}
            </span>
            <button class="btn-icon" onclick="__campus.removeExam('${e.id}')" title="წაშლა">✕</button>
          </div>
        </div>
      </div>`;
    }).join("")}</div>` : `<p class="muted">გამოცდები/ქვიზები ჯერ არ დაგიმატებია</p>`}
  `;
};


/* Auth (legacy) */
export const authView = () => {
  expose("doAuth", async (e, mode) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      if (mode === "login") await login(fd.get("email"), fd.get("password"));
      else await register(fd.get("email"), fd.get("password"));
      showToast("წარმატება!");
      navigate("/profile");
      refresh();
    } catch (err) {
      showToast("შეცდომა: " + err.message);
    }
  });
  return `
    <h1>შესვლა / რეგისტრაცია</h1>
    ${!firebaseEnabled ? `<div class="card" style="margin-bottom:16px">
      <p class="muted">ℹ️ ლოკალური რეჟიმი — შენი ანგარიში შეინახება ბრაუზერში.</p>
    </div>` : ""}
    <div class="grid grid-2">
      <div class="card">
        <h3>შესვლა</h3>
        <form onsubmit="__campus.doAuth(event,'login')">
          <div class="field"><label>ელფოსტა</label><input type="email" name="email" required /></div>
          <div class="field"><label>პაროლი</label><input type="password" name="password" required minlength="6" /></div>
          <button class="btn btn-primary" type="submit">შესვლა</button>
        </form>
      </div>
      <div class="card">
        <h3>რეგისტრაცია</h3>
        <form onsubmit="__campus.doAuth(event,'register')">
          <div class="field"><label>ელფოსტა</label><input type="email" name="email" required /></div>
          <div class="field"><label>პაროლი</label><input type="password" name="password" required minlength="6" /></div>
          <button class="btn btn-primary" type="submit">დარეგისტრირება</button>
        </form>
      </div>
    </div>
  `;
};

/* Profile with tabs: overview / favorites / badges / settings */
const getTab = () => {
  const m = location.hash.match(/[?&]tab=([a-z]+)/);
  return m ? m[1] : "overview";
};
const setTabUrl = (t) => {
  // Update URL without triggering hashchange (which would re-render the whole view)
  const newHash = `#/profile?tab=${t}`;
  if (location.hash !== newHash) {
    try { history.replaceState(null, "", newHash); }
    catch { location.hash = newHash; }
  }
};

const renderProfileBody = (tab) => {
  const user = getUser();
  if (!user) return "";
  
  const exams = getExams();
  const pts = getPoints();
  const unlocked = getBadges();
  const next = BADGES.find(b => !unlocked.includes(b.id));
  const progress = next ? Math.min(100, Math.round((pts / next.req) * 100)) : 100;
  const displayName = getDisplayName();
  const theme = getTheme();

  // favorites tab removed — redirect to overview if URL still references it
  if (tab === "favorites") return renderProfileBody("overview");
  if (tab === "badges") {
    return `
      <div class="card" style="margin-bottom:16px">
        <div class="row between"><h3 style="margin:0">პროგრესი</h3>
          <span class="muted">${next ? `${pts}/${next.req} → ${next.icon} ${next.name}` : "ყველა badge შესრულდა 🎉"}</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
      </div>
      <div class="grid grid-4">
        ${BADGES.map(b => {
          const got = unlocked.includes(b.id);
          return `<div class="card stat badge-card ${got ? "got" : "locked"}">
            <div style="font-size:42px">${got ? b.icon : "🔒"}</div>
            <div class="stat-label" style="margin-top:6px">${b.name}</div>
            <div class="muted" style="font-size:12px">${b.req} ქულა</div>
          </div>`;
        }).join("")}
      </div>
      <p class="muted" style="margin-top:18px;font-size:13px">ქულები: შეფასება +${POINTS.review} · კომენტარი +${POINTS.comment} · რესურსი +${POINTS.resource} · გამოცდა +${POINTS.exam}</p>
    `;
  }
  if (tab === "settings") {
    return `
      <div class="card">
        <h3 style="margin-top:0">პირადი მონაცემები</h3>
        <p class="muted" style="font-size:13px;margin:4px 0 12px">სახელი და გვარი მითითებულია რეგისტრაციისას და მისი ცვლილება პარამეტრებიდან შეუძლებელია. შესწორებისთვის დაუკავშირდით ადმინისტრაციას.</p>
        <div class="field"><label class="muted" style="font-size:12px">სახელი და გვარი</label>
          <input value="${escapeHtml(displayName)}" disabled readonly aria-readonly="true" style="opacity:.75;cursor:not-allowed" />
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="card-row">
          <div>
            <h3 style="margin:0">თემა</h3>
            <p class="muted" style="font-size:13px;margin:4px 0 0">ამჟამად: ${theme === "dark" ? "მუქი 🌙" : "ღია ☀️"}</p>
          </div>
          <button class="btn" onclick="__campus.toggleThemeBtn()">გადართვა</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">📲 აპლიკაციის დაყენება ტელეფონზე</h3>
        <p class="muted" style="font-size:13px;margin:0 0 12px">Campus შეგიძლიათ მთავარ ეკრანზე დაამატოთ აპლიკაციის ფორმატით — გაიხსნება ცალკე ფანჯრად, ბრაუზერის ზოლის გარეშე.</p>

        <details style="margin-bottom:10px" open>
          <summary style="cursor:pointer;font-weight:600;padding:8px 0"> iPhone / iPad (Safari)</summary>
          <ol style="margin:6px 0 0 18px;padding:0;font-size:13.5px;line-height:1.65">
            <li>გახსენი Campus <b>Safari</b>-ში (Chrome-ში არ მუშაობს).</li>
            <li>დააჭირე ქვედა (ან ზედა) ზოლზე <b>გაზიარების</b> ღილაკს — კვადრატი ისრით ზემოთ.</li>
            <li>ჩამოწიე და აირჩიე <b>„Add to Home Screen" / „დაამატე მთავარ ეკრანზე"</b>.</li>
            <li>დაადასტურე <b>„Add" / „დამატება"</b>.</li>
          </ol>
        </details>

        <details>
          <summary style="cursor:pointer;font-weight:600;padding:8px 0"> Android (Chrome)</summary>
          <ol style="margin:6px 0 0 18px;padding:0;font-size:13.5px;line-height:1.65">
            <li>გახსენი Campus <b>Chrome</b>-ში.</li>
            <li>დააჭირე ზედა მარჯვენა <b>⋮</b> მენიუს.</li>
            <li>აირჩიე <b>„Install app" / „აპის დაყენება"</b> ან <b>„Add to Home screen"</b>.</li>
            <li>დაადასტურე <b>„Install" / „დაყენება"</b>.</li>
          </ol>
        </details>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="card-row">
          <div>
            <h3 style="margin:0">ანგარიში</h3>
            <p class="muted" style="font-size:13px;margin:4px 0 0">ელფოსტა: ${user.email}</p>
          </div>
          <button class="btn btn-danger" onclick="__campus.clearLocal()">ლოკ. მონაცემების გასუფთავება</button>
        </div>
      </div>
      <div style="margin-top:28px;display:flex;justify-content:center">
        <button class="btn btn-danger" onclick="__campus.doLogout()" style="padding:14px 32px;font-size:15px">⎋ გასვლა</button>
      </div>
    `;
  }
  // overview
  return `
    <div class="grid grid-2">
      <div class="card stat"><div class="stat-num text-gradient">${exams.length}</div><div class="stat-label">გამოცდა</div></div>
      <div class="card stat"><div class="stat-num text-gradient">${pts}</div><div class="stat-label">ქულა</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="row between"><h3 style="margin:0">პროგრესი</h3>
        <span class="muted">${next ? `${pts}/${next.req} → ${next.icon} ${next.name}` : "ყველა badge შესრულდა 🎉"}</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
    </div>
  `;
};

export const profileView = () => {
  const user = getUser();
  if (!user) { setTimeout(() => navigate("/login"), 0); return `<div class="empty">გადამისამართება...</div>`; }
  const pts = getPoints();
  const lvl = levelOf(pts);
  const displayName = getDisplayName();
  const tab = getTab();

  // Smooth in-place tab swap — no full re-render, no scroll jump
  expose("profTab", (t) => {
    const current = getTab();
    if (t === current) return;
    setTabUrl(t);
    const body = document.getElementById("profBody");
    const tabsRoot = document.querySelector(".prof-tabs");
    if (tabsRoot) {
      tabsRoot.querySelectorAll(".prof-tab").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === t);
      });
    }
    if (!body) return;
    body.classList.add("swapping");
    const swap = () => {
      body.innerHTML = renderProfileBody(t);
      // force reflow so the transition retriggers
      void body.offsetWidth;
      body.classList.remove("swapping");
    };
    // Short fade-out, then swap; total ~140ms feels instant but smooth
    setTimeout(swap, 90);
  });
  expose("saveName", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setDisplayName((fd.get("name") || "").toString());
    showToast("სახელი განახლდა");
    // Re-render only the body of current tab to avoid full refresh
    const body = document.getElementById("profBody");
    if (body) body.innerHTML = renderProfileBody(getTab());
    // Also update hero name
    const heroName = document.querySelector(".profile-hero h3");
    if (heroName) heroName.textContent = getDisplayName();
  });
  expose("toggleThemeBtn", () => {
    toggleTheme();
    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = getTheme() === "dark" ? "☀️" : "🌙";
    const body = document.getElementById("profBody");
    if (body) body.innerHTML = renderProfileBody(getTab());
  });
  expose("clearLocal", () => {
    if (!confirm("წავშალოთ ლოკალური მონაცემები (ცხრილი, ჩანაწერები, GPA, გამოცდები)? ეს ქმედება შეუქცევადია.")) return;
    ["campus.comments","campus.reviews","campus.exams",
     "campus.points","campus.badges","campus.schedule","campus.notes","campus.gpa.courses","campus.quoteIx"
    ].forEach(k => localStorage.removeItem(k));
    showToast("გასუფთავდა");
    refresh();
  });
  expose("doLogout", async () => {
    await logout();
    navigate("/login");
    refresh();
  });
  // favorites removed — no-op stub kept for legacy onclick handlers
  expose("removeFav", () => {});
  expose("changeRole", (r) => {
    setRole(r); showToast(`როლი: ${ROLES[r].name}`); refresh();
  });
  const role = getRole();
  const roleMeta = role ? ROLES[role] : null;

  const tabBtn = (id, label) =>
    `<button class="prof-tab ${tab === id ? "active" : ""}" data-tab="${id}" onclick="__campus.profTab('${id}')">${label}</button>`;

  return `
    <h1>👤 პროფილი</h1>
    <div class="card profile-hero">
      <div class="avatar">${displayName[0].toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <h3 style="margin:0">${escapeHtml(displayName)}</h3>
        <p class="muted" style="overflow:hidden;text-overflow:ellipsis">${user.email}</p>
        <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">
          ${roleMeta ? `<span class="badge badge-primary">${roleMeta.icon} ${roleMeta.name}</span>` : ""}
          <span class="badge">დონე ${lvl}</span>
          <span class="badge">${pts} ქულა</span>
          ${isAdmin(user.email) ? `<span class="badge badge-danger">ადმინი</span>` : ""}
        </div>
      </div>
    </div>

    <div class="prof-tabs">
      ${tabBtn("overview", "📊 მიმოხილვა")}
      ${tabBtn("badges", "🏆 ბეჯები")}
      ${tabBtn("settings", "⚙️ პარამეტრები")}
    </div>

    <div id="profBody" class="prof-body" style="margin-top:18px">${renderProfileBody(tab)}</div>
  `;
};


/* ============= Admin Panel ============= */

const ADMIN_OVERRIDES_KEY = "campus.adminOverrides";
const readOverrides = () => { try { return JSON.parse(localStorage.getItem(ADMIN_OVERRIDES_KEY) || "{}"); } catch { return {}; } };
const writeOverrides = (o) => localStorage.setItem(ADMIN_OVERRIDES_KEY, JSON.stringify(o));
const getDeletedIds = (kind) => (readOverrides()[`deleted_${kind}`] || []);
const getAdded = (kind) => (readOverrides()[`added_${kind}`] || []);

export const effectiveUniversities = () => {
  const del = new Set(getDeletedIds("uni"));
  return [...universities.filter(u => !del.has(u.id)), ...getAdded("uni")];
};
export const effectiveFaculties = () => {
  const del = new Set(getDeletedIds("fac"));
  return [...faculties.filter(f => !del.has(f.id)), ...getAdded("fac")];
};

const adminTab = () => new URLSearchParams((location.hash.split("?")[1] || "")).get("tab") || "users";

const readDemoUsers = () => { try { return JSON.parse(localStorage.getItem("campus.demoUsers") || "{}"); } catch { return {}; } };
const writeDemoUsers = (u) => localStorage.setItem("campus.demoUsers", JSON.stringify(u));

export const adminView = () => {
  const user = getUser();
  if (!user || !isAdmin(user.email)) {
    return `<div class="empty"><div class="ico">🔒</div>ადმინისტრატორის წვდომა საჭიროა.<br/><span class="muted">nika.gogokhiya27@gmail.com</span></div>`;
  }

  const tab = adminTab();
  const ov = readOverrides();
  const delUni = new Set(ov.deleted_uni || []);
  const delFac = new Set(ov.deleted_fac || []);
  const addedUni = ov.added_uni || [];
  const addedFac = ov.added_fac || [];
  const allUnis = [...universities.filter(u => !delUni.has(u.id)), ...addedUni];

  const allFac = [...faculties.filter(f => !delFac.has(f.id)), ...addedFac];

  const demoUsers = readDemoUsers();
  const usersList = Object.entries(demoUsers).map(([email, rec]) => ({ email, ...rec.profile }));

  /* ----- handlers ----- */
  expose("admTab", (t) => { location.hash = `#/admin?tab=${t}`; });

  expose("admDelUser", (email) => {
    if (!confirm(`წავშალო ${email}?`)) return;
    const u = readDemoUsers(); delete u[email]; writeDemoUsers(u); showToast("წაშლილია"); refresh();
  });

  expose("admDelUni", (id) => {
    if (!confirm("წავშალო ეს უნივერსიტეტი?")) return;
    const o = readOverrides();
    o.deleted_uni = [...new Set([...(o.deleted_uni || []), id])];
    o.added_uni = (o.added_uni || []).filter(u => u.id !== id);
    writeOverrides(o); showToast("წაიშალა"); refresh();
  });
  expose("admAddUni", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = (fd.get("id") || "").toString().trim();
    const name = (fd.get("name") || "").toString().trim();
    const city = (fd.get("city") || "").toString().trim();
    if (!id || !name) { showToast("შეავსე ID და სახელი"); return; }
    const o = readOverrides();
    o.added_uni = [...(o.added_uni || []), { id, name, fullName: name, city, rating: 4.0, students: 0 }];
    writeOverrides(o); showToast("დაემატა"); e.target.reset(); refresh();
  });

  expose("admDelFac", (id) => {
    if (!confirm("წავშალო ეს ფაკულტეტი?")) return;
    const o = readOverrides();
    o.deleted_fac = [...new Set([...(o.deleted_fac || []), id])];
    o.added_fac = (o.added_fac || []).filter(f => f.id !== id);
    writeOverrides(o); showToast("წაიშალა"); refresh();
  });
  expose("admAddFac", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = (fd.get("id") || "").toString().trim();
    const name = (fd.get("name") || "").toString().trim();
    const uniId = (fd.get("uniId") || "").toString();
    if (!id || !name || !uniId) { showToast("შეავსე ყველა ველი"); return; }
    const o = readOverrides();
    o.added_fac = [...(o.added_fac || []), { id, name, uniId, dean: "—" }];
    writeOverrides(o); showToast("დაემატა"); e.target.reset(); refresh();
  });

  expose("admResetAll", () => {
    if (!confirm("გავასუფთავო ადმინის ცვლილებები?")) return;
    localStorage.removeItem(ADMIN_OVERRIDES_KEY);
    showToast("გასუფთავდა"); refresh();
  });

  /* ----- panel body ----- */
  let body = "";
  if (tab === "users") {
    body = `
      <div class="card">
        <h2 style="margin:0 0 12px">👥 რეგისტრირებული მომხმარებლები (${usersList.length})</h2>
        ${usersList.length ? `<div class="stack">
          ${usersList.map(u => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-weight:600">${escapeHtml(u.firstName || "")} ${escapeHtml(u.lastName || "")}</div>
              <div class="muted" style="font-size:12px">${escapeHtml(u.email)} · ${escapeHtml(u.role || "?")}${u.uniId ? ` · ${escapeHtml(u.uniId)}/${escapeHtml(u.facultyId || "")}` : ""}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelUser('${u.email}')">წაშლა</button>
          </div>`).join("")}
        </div>` : `<p class="muted">ჯერ არავინ დარეგისტრირებულა (localStorage demo režim-ში).</p>`}
        <p class="muted" style="margin-top:10px;font-size:12px">⚠ ეს მონაცემები ლოკალურია (ბრაუზერში). Firebase-ის ჩართვის შემდეგ ნახავ ყველა მომხმარებელს.</p>
      </div>`;
  } else if (tab === "unis") {
    body = `
      <div class="card">
        <h2 style="margin:0 0 12px">🏛 უნივერსიტეტები (${allUnis.length})</h2>
        <div class="stack">
          ${allUnis.map(u => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;gap:8px">
            <div style="min-width:0">
              <div style="font-weight:600">${escapeHtml(u.name)}</div>
              <div class="muted" style="font-size:12px">${escapeHtml(u.city || "")} · ID: ${u.id}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelUni('${u.id}')">წაშლა</button>
          </div>`).join("")}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 10px">+ ახალი უნივერსიტეტი</h3>
        <form onsubmit="__campus.admAddUni(event)" class="stack" style="gap:10px">
          <input name="id" placeholder="ID (მაგ. caucasus)" required />
          <input name="name" placeholder="სახელი" required />
          <input name="city" placeholder="ქალაქი" />
          <button class="btn btn-primary" type="submit">დამატება</button>
        </form>
      </div>`;
  } else if (tab === "facs") {
    body = `
      <div class="card">
        <h2 style="margin:0 0 12px">📚 ფაკულტეტები (${allFac.length})</h2>
        <div class="stack" style="max-height:400px;overflow:auto">
          ${allFac.map(f => `<div class="row between" style="padding:10px;border:1px solid var(--border);border-radius:10px;gap:8px">
            <div style="min-width:0">
              <div style="font-weight:600;font-size:13px">${escapeHtml(f.name)}</div>
              <div class="muted" style="font-size:11px">უნი: ${f.uniId}</div>
            </div>
            <button class="btn btn-ghost" onclick="__campus.admDelFac('${f.id}')">წაშლა</button>
          </div>`).join("")}
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 10px">+ ახალი ფაკულტეტი</h3>
        <form onsubmit="__campus.admAddFac(event)" class="stack" style="gap:10px">
          <input name="id" placeholder="ID (მაგ. tsu-it)" required />
          <input name="name" placeholder="სახელი" required />
          <select name="uniId" required>
            <option value="">— უნივერსიტეტი —</option>
            ${allUnis.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")}
          </select>
          <button class="btn btn-primary" type="submit">დამატება</button>
        </form>
      </div>`;
  } else if (tab === "stats") {
    body = `
      <div class="grid grid-4">
        <div class="card stat"><div class="stat-num text-gradient">${allUnis.length}</div><div class="stat-label">უნივერსიტეტი</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${allFac.length}</div><div class="stat-label">ფაკულტეტი</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${usersList.length}</div><div class="stat-label">მომხმარებელი</div></div>
        <div class="card stat"><div class="stat-num text-gradient">${resources.length}</div><div class="stat-label">რესურსი</div></div>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">⚠ მონაცემთა გასუფთავება</h3>
        <p class="muted" style="margin:0 0 10px;font-size:13px">გააუქმოს ადმინის მიერ ჩატარებული ცვლილებები (უნი/ფაკ. დამატება/წაშლა).</p>
        <button class="btn btn-ghost" onclick="__campus.admResetAll()">ცვლილებების გასუფთავება</button>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">🔥 Firebase სტატუსი</h3>
        <p class="muted" style="margin:0;font-size:13px">
          ${firebaseEnabled ? "✅ ჩართულია — მონაცემები სინქრონიზდება ღრუბელში" : "⚪ ლოკალური რეჟიმი (localStorage). Firebase-ის ჩასართავად შეავსე <code>js/firebase.js</code>."}
        </p>
      </div>
      <div class="card" style="margin-top:14px">
        <h3 style="margin:0 0 8px">📋 მომავალი ფუნქციები</h3>
        <ul class="muted" style="margin:0;padding-left:20px;font-size:13px;line-height:1.8">
          <li>👨‍🏫 ლექტორების მართვა</li>
          <li>💬 ციტატების მართვა</li>
          <li>📰 სიახლეების დამატება</li>
          <li>📆 აკადემიური კალენდრის მართვა (ფაკულტეტებზე გაფილტრული)</li>
          <li>📅 ღონისძიებების კალენდარი</li>
        </ul>
        <p class="muted" style="margin:10px 0 0;font-size:12px">↑ ეს ფუნქციები მზადდება. Firebase-ის ჩართვის შემდეგ გააქტიურდება.</p>
      </div>`;
  }

  const tabBtn = (id, label) => `<button class="role-switch-btn ${tab===id?"active":""}" onclick="__campus.admTab('${id}')">${label}</button>`;

  return `
    <h1>🛡 ადმინ პანელი</h1>
    <p class="muted" style="margin:4px 0 18px">${escapeHtml(user.email)}</p>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">
      ${tabBtn("users", "👥 მომხმარებლები")}
      ${tabBtn("unis",  "🏛 უნივერსიტეტები")}
      ${tabBtn("facs",  "📚 ფაკულტეტები")}
      ${tabBtn("stats", "📊 სტატისტიკა")}
    </div>
    ${body}
  `;
};

