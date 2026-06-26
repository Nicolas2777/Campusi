// Post-auth prefetch: warms images and likely-next view renders on idle,
// so the next navigation feels instant. Safe — only reads from `state`,
// never mutates anything visible.

import { state } from "./store.js";
import { getProfile } from "./auth.js";

const idle = (fn, timeout = 1500) =>
  (window.requestIdleCallback || ((cb) => setTimeout(cb, 200)))(fn, { timeout });

const warmedImages = new Set();
const warmImage = (url) => {
  if (!url || warmedImages.has(url)) return;
  warmedImages.add(url);
  try {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;
    if (img.decode) img.decode().catch(() => {});
  } catch {}
};

const warmedViews = new Set();
const warmView = async (name, fn, params = {}) => {
  if (warmedViews.has(name)) return;
  warmedViews.add(name);
  try { await fn(params); } catch {}
};

let kicked = false;

/** Call once after auth ready. Spreads work across idle slices. */
export const prefetchAfterAuth = async () => {
  if (kicked) return;
  kicked = true;

  // 1) Image warm-up — universities + lecturers + news covers
  idle(() => {
    const unis = state.universities || [];
    for (const u of unis.slice(0, 30)) warmImage(u.logoUrl);
    const news = state.news || [];
    for (const n of news.slice(0, 12)) warmImage(n.coverUrl || n.imageUrl);
  });

  // 2) Pre-render likely-next views into a detached node, so template
  // strings, sorting and derived computations are already JIT-hot.
  idle(async () => {
    try {
      const [
        { dashboardView },
        { universitiesView },
        { newsView },
        { scheduleView },
        { profileView },
      ] = await Promise.all([
        import("./views/dashboard.js"),
        import("./views/catalog.js").then((m) => ({ universitiesView: m.universitiesView })),
        import("./views/news.js"),
        import("./views/schedule.js"),
        import("./views/misc.js").then((m) => ({ profileView: m.profileView })),
      ]);

      const sink = document.createElement("div");
      const run = async (name, viewFn) => {
        try {
          const out = await viewFn({});
          if (typeof out === "string") sink.innerHTML = out; // parse cost only
        } catch {}
      };

      const prof = getProfile();
      await warmView("dashboard", () => run("dashboard", dashboardView));
      await warmView("universities", () => run("universities", universitiesView));
      await warmView("news", () => run("news", newsView));
      if (prof?.role === "student") {
        await warmView("schedule", () => run("schedule", scheduleView));
      }
      await warmView("profile", () => run("profile", profileView));
    } catch {}
  }, 3000);

  // 3) Image warm-up — lecturer photos (lower priority, separate slice)
  idle(() => {
    // lecturers may live in state via collections; if not present yet, skip
    const lecs = state.lecturers || [];
    for (const l of lecs.slice(0, 24)) warmImage(l.photoUrl);
  }, 3500);
};
