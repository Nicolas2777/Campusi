// Hash router: #/path/segment
const routes = [];

export const route = (pattern, handler) => routes.push({ pattern, handler });

const parse = (pattern, hash) => {
  const p = pattern.split("/").filter(Boolean);
  const h = hash.split("/").filter(Boolean);
  if (p.length !== h.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(h[i]);
    else if (p[i] !== h[i]) return null;
  }
  return params;
};

let notFound = () => "<div class='empty'><div class='ico'>🤔</div>გვერდი ვერ მოიძებნა</div>";
export const setNotFound = (fn) => { notFound = fn; };

export const navigate = (path) => { location.hash = "#" + path; };

let lastRawHash = null;   // for dedup
let lastPath = null;      // path part only
let renderInFlight = null;

const doRender = async () => {
  const rawHash = (location.hash || "#/").slice(1);
  const hash = rawHash.split("?")[0];

  // Dedup: identical hash + already rendered → skip
  if (rawHash === lastRawHash) return;
  lastRawHash = rawHash;

  const samePath = (hash === lastPath);
  const app = document.getElementById("app");

  for (const r of routes) {
    const params = parse(r.pattern, hash);
    if (params) {
      // Soft transition for in-page (same path) re-renders (e.g. admin ?tab=…)
      if (samePath && app) app.classList.add("view-swap");

      const out = await r.handler(params);
      const noBackPaths = new Set(["/", "/login", "/onboarding"]);
      const backBtn = (hash && !noBackPaths.has(hash))
        ? `<button type="button" class="back-btn" onclick="if(history.length>1){history.back()}else{location.hash='#/'}" aria-label="უკან დაბრუნება">← უკან</button>`
        : "";
      app.innerHTML = backBtn + out;

      // Only scroll to top when actually changing pages
      if (!samePath) window.scrollTo({ top: 0, behavior: "instant" });

      // fade-in
      requestAnimationFrame(() => app.classList.remove("view-swap"));

      lastPath = hash;

      // active nav state
      document.querySelectorAll("#nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + hash);
      });
      // run post-render hooks
      app.querySelectorAll("[data-init]").forEach(el => {
        const fn = window.__campusInit?.[el.dataset.init];
        if (typeof fn === "function") fn(el);
      });
      return;
    }
  }
  app.innerHTML = notFound();
  lastPath = hash;
};

// Coalesce burst hashchanges into one render
const render = () => {
  if (renderInFlight) return renderInFlight;
  renderInFlight = Promise.resolve().then(async () => {
    try { await doRender(); }
    finally { renderInFlight = null; }
  });
  return renderInFlight;
};

let routerStarted = false;
export const startRouter = () => {
  if (routerStarted) return;
  routerStarted = true;
  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = "#/";
  render();
};

export const refresh = () => {
  // Force re-render even if hash unchanged
  lastRawHash = null;
  return render();
};
