// Public lecturers list + comment form. Students leave anonymous comments.
import { firebaseEnabled, loadFirebase } from "../firebase.js";
import { getUser, getProfile, isBlockedUser } from "../auth.js";
import { expose, escapeHtml, showToast } from "../ui.js";
import { refresh } from "../router.js";

let _cache = null;
const loadAll = async () => {
  if (_cache) return _cache;
  if (!firebaseEnabled) return { lecturers: [], ratings: [] };
  const fb = await loadFirebase();
  const [lSnap, rSnap] = await Promise.all([
    fb.getDocs(fb.collection(fb.db, "lecturers")),
    fb.getDocs(fb.collection(fb.db, "lecturerRatings")),
  ]);
  _cache = {
    lecturers: lSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ratings:   rSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  };
  setTimeout(() => { try { refresh(); } catch {} }, 0);
  return _cache;
};
const invalidate = () => { _cache = null; };

// current semester (Spring/Fall + year)
const currentSemester = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth(); // 0–11
  return m < 6 ? `Spring ${y}` : `Fall ${y}`;
};

export const lecturersView = async () => {
  const user = getUser();
  const profile = getProfile();
  const data = await loadAll();
  const { lecturers, ratings } = data;
  // Group comments by lecturer (most recent first)
  const byLect = {};
  ratings.forEach(r => {
    if (!byLect[r.lecturerId]) byLect[r.lecturerId] = [];
    byLect[r.lecturerId].push(r);
  });
  Object.values(byLect).forEach(arr => arr.sort((a,b) => {
    const ta = a.createdAt?.seconds || 0, tb = b.createdAt?.seconds || 0;
    return tb - ta;
  }));

  // open comment modal
  expose("lectOpenRate", (lectId) => {
    if (!user) return showToast("გთხოვ შეხვიდე");
    const lect = lecturers.find(l => l.id === lectId);
    if (!lect) return;
    const card = document.getElementById("modalCard");
    const back = document.getElementById("modalBackdrop");
    const sem = currentSemester();
    card.innerHTML = `
      <div class="modal-head">
        <h3>კომენტარი: ${escapeHtml(lect.name)}</h3>
        <button class="btn-icon" data-close>✕</button>
      </div>
      <form class="modal-body" onsubmit="__campus.lectSubmit(event, '${lect.id}')">
        <div class="field"><label>სემესტრი</label><input name="semester" value="${sem}" /></div>
        <div class="field"><label>კომენტარი (ანონიმური) *</label>
          <textarea name="comment" rows="4" required minlength="5" maxlength="600" placeholder="რა მოგეწონა? რა შეიძლება გაუმჯობესდეს?"></textarea>
        </div>
        <button class="btn btn-primary" type="submit">გაგზავნა</button>
      </form>`;
    back.hidden = false;
    const close = () => { back.hidden = true; card.innerHTML = ""; };
    card.querySelector("[data-close]").addEventListener("click", close);
    back.addEventListener("click", e => { if (e.target === back) close(); });
  });

  expose("lectSubmit", async (e, lectId) => {
    e.preventDefault();
    if (!firebaseEnabled || !user) return;
    if (isBlockedUser()) { showToast("ანგარიში დაბლოკილია — შეფასება შეზღუდულია"); return; }
    const f = new FormData(e.target);
    const comment = (f.get("comment") || "").toString().trim();
    if (comment.length < 5) { showToast("კომენტარი ცარიელია"); return; }
    const fb = await loadFirebase();
    try {
      await fb.addDoc(fb.collection(fb.db, "lecturerRatings"), {
        lecturerId: lectId,
        studentId: user.uid,
        studentEmail: user.email || "",
        facultyId: profile?.facultyId || "",
        semester: (f.get("semester") || "").toString().trim() || currentSemester(),
        rating: 0,
        comment,
        createdAt: fb.serverTimestamp(),
      });
      document.getElementById("modalBackdrop").hidden = true;
      showToast("მადლობა კომენტარისთვის!");
      invalidate();
      refresh();
    } catch (err) {
      showToast("შეცდომა: " + (err.message || err));
    }
  });

  if (!firebaseEnabled) {
    return `<div class="empty"><div class="ico">⚠️</div>ლექტორების სია მოითხოვს Firebase-ის კონფიგურაციას.</div>`;
  }

  // filter to my faculty if I have one, else show all
  const facId = profile?.facultyId || "";
  let shown = lecturers;
  if (facId) {
    const mine = lecturers.filter(l => l.facultyId === facId);
    if (mine.length) shown = mine;
  }
  shown = [...shown].sort((a, b) => (byLect[b.id]?.length || 0) - (byLect[a.id]?.length || 0));

  return `
    <h1>👨‍🏫 ლექტორები</h1>
    <p class="muted">სტუდენტთა ანონიმური კომენტარები. დატოვე უკუკავშირი სემესტრის ბოლოს.</p>
    ${shown.length ? `<div class="grid grid-2" style="margin-top:18px">
      ${shown.map(l => {
        const comments = byLect[l.id] || [];
        const n = comments.length;
        const preview = comments.slice(0, 2);
        return `<div class="card">
          <div class="row between" style="gap:10px;align-items:flex-start">
            <div style="min-width:0;flex:1">
              <h3 style="margin:0">${escapeHtml(l.name)}</h3>
              <p class="muted" style="margin:2px 0 0;font-size:13px">${escapeHtml(l.title || "")}${l.subject ? ` · ${escapeHtml(l.subject)}` : ""}</p>
              ${l.bio ? `<p style="margin:8px 0 0;font-size:13px">${escapeHtml(l.bio)}</p>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:22px;font-weight:700">💬 ${n}</div>
              <div class="muted" style="font-size:11px">კომენტარი</div>
            </div>
          </div>
          ${preview.length ? `<div class="stack" style="margin-top:10px;gap:8px">
            ${preview.map(c => `<div class="card" style="padding:8px 10px;background:var(--bg);font-size:13px">
              <div style="white-space:pre-wrap">${escapeHtml((c.comment || "").slice(0, 220))}${(c.comment || "").length > 220 ? "…" : ""}</div>
              <div class="muted" style="font-size:11px;margin-top:4px">${escapeHtml(c.semester || "")}</div>
            </div>`).join("")}
          </div>` : ""}
          <div class="row" style="gap:6px;margin-top:10px">
            <button class="btn btn-primary" style="flex:1" onclick="__campus.lectOpenRate('${l.id}')">✍️ კომენტარის დატოვება</button>
            ${user ? `<button class="btn btn-ghost" title="ლექტორის შესახებ ცრუ/აგრესიული შინაარსის გასაჩივრება" style="padding:8px 12px" onclick="__campus.report('lecturerRating','${l.id}',${JSON.stringify(l.name || '').replace(/'/g,'&#39;')})">⚑</button>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>` : `<div class="empty"><div class="ico">📭</div>ლექტორები ჯერ არ დაემატა.</div>`}`;
};
