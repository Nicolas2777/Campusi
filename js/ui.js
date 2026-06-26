export const showToast = (msg, ms = 2200) => {
  const t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.hidden = true, ms);
};

export const escapeHtml = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const stars = (n) => {
  const full = Math.round(n);
  return `<span class="stars">${"★".repeat(full)}${"☆".repeat(5 - full)}</span>`;
};

export const daysUntil = (dateStr) => {
  const d = new Date(dateStr); const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

// მარტივი global function registry inline ღილაკებისთვის
window.__campus = window.__campus || {};
export const expose = (name, fn) => { window.__campus[name] = fn; };

/* ============ Skeleton helpers (perceived-speed loaders) ============ */
export const skLine = (w = "w-70", extra = "") =>
  `<div class="sk sk-line ${w} ${extra}"></div>`;

export const skCard = (lines = 3) => {
  const widths = ["w-90", "w-70", "w-50", "w-30"];
  const rows = Array.from({ length: lines }, (_, i) =>
    `<div class="sk sk-line ${widths[i % widths.length]}"></div>`
  ).join("");
  return `<div class="sk-card">
    <div class="sk sk-line lg w-50" style="margin-bottom:14px"></div>
    ${rows}
  </div>`;
};

export const skList = (n = 3) => {
  const items = Array.from({ length: n }, () => `<div class="sk-card">
    <div class="sk-row">
      <div class="sk sk-circle"></div>
      <div style="flex:1">
        <div class="sk sk-line w-30"></div>
        <div class="sk sk-line sm w-50"></div>
      </div>
    </div>
    <div class="sk sk-line w-90" style="margin-top:10px"></div>
    <div class="sk sk-line w-70"></div>
  </div>`).join("");
  return `<div class="stack">${items}</div>`;
};

export const skGrid = (n = 6, lines = 3) =>
  `<div class="sk-grid">${Array.from({ length: n }, () => skCard(lines)).join("")}</div>`;
