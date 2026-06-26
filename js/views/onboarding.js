import { universities, faculties } from "../data.js";
import { getProfile, updateProfileData, getFirstName } from "../auth.js";
import { expose, escapeHtml, showToast } from "../ui.js";
import { navigate, refresh } from "../router.js";

const T = (k, v) => (window.T ? window.T(k, v) : k);

expose("onboardingSubmit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const uniId = (fd.get("uniId") || "").toString();
  const facultyId = (fd.get("facultyId") || "").toString();
  if (!uniId || !facultyId) {
    showToast(T("onb.toast.choose"));
    return;
  }
  try {
    await updateProfileData({ uniId, facultyId });
    showToast(T("onb.toast.saved"));
    navigate("/");
  } catch (err) {
    showToast(err.message || T("onb.toast.err"));
  }
});

// Find all uni docs sharing the same name as `uniId` (handles duplicate uni docs).
const siblingUniIds = (uniId) => {
  const me = universities.find(u => u.id === uniId);
  if (!me) return [uniId];
  const nm = (me.name || "").trim().toLowerCase();
  if (!nm) return [uniId];
  return universities.filter(u => (u.name || "").trim().toLowerCase() === nm).map(u => u.id);
};

const facultiesForUniName = (uniId) => {
  const ids = new Set(siblingUniIds(uniId));
  return dedupBy(faculties.filter(f => ids.has(f.uniId)), "name");
};

expose("onboardingUniChange", (sel) => {
  const facSel = document.getElementById("ob-fac");
  const opts = facultiesForUniName(sel.value);
  facSel.innerHTML = `<option value="">${T("onb.opt.pickFac")}</option>` +
    opts.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("");
  facSel.disabled = opts.length === 0;
});

const dedupBy = (arr, key) => {
  const seen = new Set();
  return arr.filter(x => {
    const k = (x?.[key] ?? "").toString().trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const onboardingView = () => {
  const p = getProfile();
  const name = getFirstName();
  const currentUni = p?.uniId || "";
  const uniList = dedupBy(universities, "name");
  const initialFacs = currentUni ? facultiesForUniName(currentUni) : [];

  return `
    <section class="auth-card" style="max-width:540px;margin:40px auto">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:42px">🎓</div>
        <h1 style="margin:8px 0 4px">${T("onb.hello", { name: escapeHtml(name) })}</h1>
        <p class="muted" style="margin:0">${T("onb.sub")}</p>
        <p class="muted" style="margin:8px 0 0;font-size:12px">${T("onb.warn")}</p>
      </div>

      <form onsubmit="__campus.onboardingSubmit(event)" class="stack" style="gap:14px">
        <label class="field">
          <span>${T("onb.label.uni")}</span>
          <select name="uniId" required onchange="__campus.onboardingUniChange(this)">
            <option value="">${T("onb.opt.pickUni")}</option>
            ${uniList.map(u => `<option value="${u.id}" ${u.id===currentUni?"selected":""}>${escapeHtml(u.name)} — ${escapeHtml(u.city||"")}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>${T("onb.label.fac")}</span>
          <select name="facultyId" id="ob-fac" required ${initialFacs.length?"":"disabled"}>
            <option value="">${initialFacs.length?T("onb.opt.pickFac"):T("onb.opt.pickUniFirst")}</option>
            ${initialFacs.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("")}
          </select>
        </label>
        <button class="btn btn-primary" type="submit" style="margin-top:6px">${T("onb.submit")}</button>
      </form>
    </section>
  `;
};
