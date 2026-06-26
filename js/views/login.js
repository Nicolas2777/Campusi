import { login, register, resendVerification, EmailNotVerifiedError } from "../auth.js";
import { firebaseEnabled } from "../firebase.js";
import { expose, showToast } from "../ui.js";
import { navigate, refresh } from "../router.js";
import { setRole, ROLES } from "../state.js";

const T = (k, v) => (window.T ? window.T(k, v) : k);


const setStatus = (id, msg, kind = "error") => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("error", kind === "error");
  el.classList.toggle("success", kind === "success");
};

const setFieldError = (id, msg) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("aria-invalid", msg ? "true" : "false");
  const hint = document.getElementById(id + "Err");
  if (hint) hint.textContent = msg || "";
};

const clearFieldErrors = (ids) => ids.forEach(id => setFieldError(id, ""));

const readQuery = () => {
  try {
    const q = (location.hash.split("?")[1] || "");
    return new URLSearchParams(q);
  } catch { return new URLSearchParams(); }
};
const getPendingRole = () => {
  const fromUrl = readQuery().get("role");
  if (fromUrl && ROLES[fromUrl]) return fromUrl;
  try {
    const stored = localStorage.getItem("campus.pendingRole");
    if (stored && ROLES[stored]) return stored;
  } catch {}
  return "";
};
const getInitialMode = () => {
  const m = readQuery().get("mode");
  if (m === "login" || m === "register") return m;
  return getPendingRole() ? "register" : "login";
};

export const loginView = () => {
  const pendingRole = getPendingRole();
  const initialMode = getInitialMode();

  /* ---- LOGIN ---- */
  expose("doLogin", async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const btn = form.querySelector("button[type=submit]");
    clearFieldErrors(["loginEmail", "loginPassword"]);
    setStatus("loginStatus", "");
    btn.disabled = true; btn.setAttribute("aria-busy", "true");
    const orig = btn.textContent; btn.textContent = T("auth.btn.loading");
    try {
      await login(fd.get("email"), fd.get("password"));
      showToast(T("auth.toast.welcome"));
      navigate("/");
    } catch (err) {
      if (err instanceof EmailNotVerifiedError || err.code === "auth/email-not-verified") {
        setStatus("loginStatus", err.message, "error");
        // Show resend block
        const resendBox = document.getElementById("resendBox");
        if (resendBox) resendBox.hidden = false;
      } else {
        setFieldError("loginEmail", " ");
        setFieldError("loginPassword", " ");
        setStatus("loginStatus", err.message || T("auth.toast.failed"), "error");
      }
    } finally {
      btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = orig;
    }
  });

  expose("doResend", async (btn) => {
    btn.disabled = true; const orig = btn.textContent; btn.textContent = T("auth.btn.sending");
    try {
      await resendVerification();
      showToast(T("auth.resend.ok"));
    } catch (err) {
      showToast(err.message || T("auth.resend.fail"));
    } finally {
      btn.disabled = false; btn.textContent = orig;
    }
  });

  /* ---- REGISTER ---- */
  expose("pickRole", () => {});
  expose("changeRole", () => {});


  expose("doRegister", async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const btn = form.querySelector("button[type=submit]");
    const ids = ["regFirstName","regLastName","regEmail","regPersonalId","regPhone","regPassword"];
    clearFieldErrors(ids);

    setStatus("regStatus", "");
    btn.disabled = true; btn.setAttribute("aria-busy", "true");
    const orig = btn.textContent; btn.textContent = T("auth.btn.loading");
    try {
      const result = await register({
        role:       "student",
        firstName:  fd.get("firstName"),
        lastName:   fd.get("lastName"),
        email:      fd.get("email"),
        personalId: fd.get("personalId"),
        phone:      fd.get("phone"),
        password:   fd.get("password"),
      });
      setRole("student");
      try { localStorage.removeItem("campus.pendingRole"); } catch {}

      if (result?.verificationSent) {
        // Show verification screen
        const regCard = document.getElementById("regCard");
        if (regCard) {
          regCard.innerHTML = `
            <div class="verify-notice">
              <h3>${T("auth.verify.title")}</h3>
              <p>${T("auth.verify.body", { email: result.email })}</p>
              <button class="btn" onclick="__campus.doResend(this)">${T("auth.verify.resendBtn")}</button>
              <button class="btn btn-primary" style="margin-left:8px" onclick="__campus.toggleAuth('login')">${T("auth.verify.toLogin")}</button>
            </div>`;
        }
        showToast(T("auth.toast.checkEmail"));
      } else {
        showToast(T("auth.toast.registered"));
        navigate("/");
      }
    } catch (err) {
      if (err.fields) {
        const map = {
          firstName: "regFirstName", lastName: "regLastName",
          email: "regEmail", personalId: "regPersonalId", phone: "regPhone", password: "regPassword",
        };
        Object.entries(err.fields).forEach(([k, msg]) => setFieldError(map[k], msg));
      }

      setStatus("regStatus", err.message || T("auth.toast.failed"), "error");
    } finally {
      btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = orig;
    }
  });

  expose("toggleAuth", (mode) => {
    const loginCard = document.getElementById("loginCard");
    const regCard   = document.getElementById("regCard");
    loginCard.hidden = mode !== "login";
    regCard.hidden   = mode !== "register";
    document.querySelectorAll(".auth-tabs button").forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
    (mode === "login" ? loginCard : regCard).querySelector("input,button[data-role]")?.focus();
  });

  expose("authTabKey", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = e.target.dataset.mode === "login" ? "register" : "login";
    window.__campus.toggleAuth(next);
  });

  // post-render init: apply initial mode
  window.__campusInit = window.__campusInit || {};
  window.__campusInit.authInit = () => {
    const firebaseNote = document.querySelector("[data-firebase-note]");
    if (firebaseNote) firebaseNote.hidden = firebaseEnabled;
    window.__campus.toggleAuth(initialMode);
  };

  const TERMS_CONTENT = {
    terms: {
      en: "Terms of Use",
      ka: "Campus-ის გამოყენების წესები და პირობები",
      body: `
        <p>Campus-ის გამოყენებით თქვენ ეთანხმებით ქვემოთ მოცემულ პირობებს.</p>
        <h4>პლატფორმის მიზანი</h4>
        <p>Campus წარმოადგენს დამოუკიდებელ სტუდენტურ ციფრულ პლატფორმას, რომელიც შექმნილია აკადემიური ინფორმაციის, რესურსების და სტუდენტური სერვისების ხელმისაწვდომობის მიზნით.</p>
        <p>Campus არ წარმოადგენს უნივერსიტეტის ოფიციალურ სისტემას, გარდა იმ შემთხვევისა, როდესაც კონკრეტული პარტნიორობა პირდაპირ არის მითითებული.</p>
        <h4>ანგარიშის შექმნა</h4>
        <p>რეგისტრაციისას მომხმარებელი ვალდებულია მიუთითოს სწორი ინფორმაცია.</p>
        <p>მომხმარებელი პასუხისმგებელია საკუთარი ანგარიშის უსაფრთხოებაზე და პაროლის დაცვაზე.</p>
        <h4>აკრძალული ქმედებები</h4>
        <p>აკრძალულია:</p>
        <ul>
          <li>ყალბი ინფორმაციის გავრცელება</li>
          <li>სხვისი ანგარიშის გამოყენება</li>
          <li>სპამის გავრცელება</li>
          <li>შეურაცხმყოფელი ან მავნე შინაარსის განთავსება</li>
          <li>პლატფორმის ბოროტად გამოყენება</li>
          <li>საავტორო უფლებების დარღვევა</li>
        </ul>
        <h4>ანგარიშის შეზღუდვა</h4>
        <p>Campus უფლებას იტოვებს დროებით ან მუდმივად შეზღუდოს ანგარიში წესების დარღვევის შემთხვევაში.</p>
        <h4>პასუხისმგებლობის შეზღუდვა</h4>
        <p>Campus არ იძლევა გარანტიას პლატფორმაზე არსებული ყველა ინფორმაციის სრულ სიზუსტეზე. მომხმარებლის მიერ გამოქვეყნებული შეფასებები და კომენტარები წარმოადგენს მათი ავტორების პირად მოსაზრებებს.</p>
        <h4>პირობების ცვლილება</h4>
        <p>Campus უფლებას იტოვებს შეცვალოს პირობები და საჭიროების შემთხვევაში აცნობოს მომხმარებლებს.</p>
      `,
    },
    privacy: {
      en: "Privacy Policy",
      ka: "როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს მონაცემებს",
      body: `
        <p>Campus პატივს სცემს მომხმარებლის კონფიდენციალურობას.</p>
        <h4>რა ინფორმაციას ვაგროვებთ</h4>
        <p>ჩვენ შეიძლება შევაგროვოთ:</p>
        <ul>
          <li>სახელი</li><li>ელფოსტა</li><li>უნივერსიტეტი</li><li>ფაკულტეტი</li>
          <li>პროფილის ინფორმაცია</li><li>აქტივობის მონაცემები</li><li>ტექნიკური ინფორმაცია</li>
        </ul>
        <h4>მონაცემების გამოყენება</h4>
        <p>მონაცემები გამოიყენება:</p>
        <ul>
          <li>ავტორიზაციისთვის</li><li>პერსონალიზაციისთვის</li>
          <li>პლატფორმის უსაფრთხოებისთვის</li><li>ფუნქციების გაუმჯობესებისთვის</li>
        </ul>
        <h4>მონაცემების დაცვა</h4>
        <p>Campus იყენებს ტექნიკურ და ორგანიზაციულ ზომებს მომხმარებლის მონაცემების დასაცავად.</p>
        <h4>მონაცემების გაზიარება</h4>
        <p>Campus არ ყიდის მომხმარებლის პერსონალურ მონაცემებს მესამე პირებზე.</p>
        <h4>მომხმარებლის უფლებები</h4>
        <p>მომხმარებელს შეუძლია:</p>
        <ul>
          <li>საკუთარი მონაცემების ნახვა</li>
          <li>მათი განახლება</li>
          <li>ანგარიშის ან მონაცემების წაშლის მოთხოვნა</li>
        </ul>
      `,
    },
    community: {
      en: "Community Guidelines",
      ka: "საზოგადოების წესები უსაფრთხო სტუდენტური გარემოსთვის",
      body: `
        <p>Campus-ის მიზანია უსაფრთხო და პატივისცემაზე დაფუძნებული სტუდენტური სივრცის შექმნა.</p>
        <h4>დაშვებულია:</h4>
        <ul>
          <li>✓ აკადემიური დისკუსიები</li>
          <li>✓ გამოცდილების გაზიარება</li>
          <li>✓ სასწავლო რესურსების გაზიარება</li>
          <li>✓ დახმარება სხვა სტუდენტებისთვის</li>
        </ul>
        <h4>აკრძალულია:</h4>
        <ul>
          <li>✗ შეურაცხმყოფელი კომენტარები</li>
          <li>✗ სიძულვილის ენა</li>
          <li>✗ მუქარა</li>
          <li>✗ სპამი</li>
          <li>✗ ყალბი ინფორმაცია</li>
          <li>✗ სხვისი პერსონალური ინფორმაციის გამოქვეყნება</li>
        </ul>
        <p>ლექტორების შეფასებები უნდა ეფუძნებოდეს პირად გამოცდილებას და წარმოდგენილი იყოს პატივისცემით.</p>
      `,
    },
    copyright: {
      en: "Copyright / Takedown Policy",
      ka: "საავტორო უფლებების დაცვისა და მოთხოვნების პროცედურა",
      body: `
        <p>თუ თვლით, რომ Campus-ზე არსებული მასალა არღვევს თქვენს საავტორო უფლებებს, დაგვიკავშირდით და მოგვაწოდეთ:</p>
        <ul>
          <li>სახელი</li>
          <li>საკონტაქტო ინფორმაცია</li>
          <li>მასალის აღწერა</li>
          <li>ბმული</li>
          <li>მოთხოვნის საფუძველი</li>
        </ul>
        <p>Campus განიხილავს მოთხოვნას გონივრულ ვადაში და საჭიროების შემთხვევაში შეზღუდავს ან წაშლის მასალას.</p>
      `,
    },
  };

  const getTermsContent = (key) => {
    const tpl = document.getElementById(`termsTemplate-${key}`);
    if (tpl) {
      return {
        en: tpl.dataset.en || "",
        ka: tpl.dataset.ka || "",
        body: tpl.innerHTML,
      };
    }
    return TERMS_CONTENT[key];
  };

  expose("openTerms", (key) => {
    let host = document.getElementById("termsModalRoot");
    if (!host) {
      host = document.createElement("div");
      host.id = "termsModalRoot";
      document.body.appendChild(host);
    }
    const active = getTermsContent(key) ? key : "terms";
    const tabIds = ["terms", "privacy", "community", "copyright"];
    const cur = getTermsContent(active);
    host.innerHTML = `
      <div class="terms-backdrop" onclick="if(event.target===this)__campus.closeTerms()">
        <div class="modal-card terms-modal" role="dialog" aria-modal="true" aria-labelledby="termsTitle">
          <div class="terms-head">
            <div>
              <h2 id="termsTitle" class="terms-title">${cur.en}</h2>
              <p class="terms-sub">${cur.ka}</p>
            </div>
            <button type="button" class="btn btn-ghost terms-close" onclick="__campus.closeTerms()" aria-label="${T("auth.terms.close")}">✕</button>
          </div>
          <nav class="terms-tabs" role="tablist">
            ${tabIds.map(id => {
              const item = getTermsContent(id);
              return `<button type="button" role="tab" aria-selected="${id===active}" class="terms-tab ${id===active?'active':''}" onclick="__campus.openTerms('${id}')">${item.en}</button>`;
            }).join("")}
          </nav>
          <div class="terms-body">${cur.body}</div>
          <div class="terms-foot">
            <button type="button" class="btn btn-primary" onclick="__campus.closeTerms()">${T("auth.terms.ok")}</button>
          </div>
        </div>
      </div>`;
    document.body.style.overflow = "hidden";
  });
  expose("closeTerms", () => {
    const host = document.getElementById("termsModalRoot");
    if (host) host.innerHTML = "";
    document.body.style.overflow = "";
  });

  const loginTabActive = initialMode === "login";
  const regTabActive   = initialMode === "register";

  const rolePickerHtml = "";

  const termsLinksHtml = `
    <div class="terms-links" aria-label="${T("auth.terms.linksAria")}">
      <button type="button" class="terms-link" onclick="__campus.openTerms('terms')">${T("auth.terms.link.terms")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('privacy')">${T("auth.terms.link.privacy")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('community')">${T("auth.terms.link.community")}</button>
      <button type="button" class="terms-link" onclick="__campus.openTerms('copyright')">${T("auth.terms.link.copyright")}</button>
    </div>`;

  const template = document.getElementById("loginPageTemplate");
  if (template) {
    return template.innerHTML
      .replaceAll("{{logintabactiveclass}}", loginTabActive ? "active" : "")
      .replaceAll("{{logintabselected}}", String(loginTabActive))
      .replaceAll("{{logintabindex}}", String(loginTabActive ? 0 : -1))
      .replaceAll("{{regtabactiveclass}}", regTabActive ? "active" : "")
      .replaceAll("{{regtabselected}}", String(regTabActive))
      .replaceAll("{{regtabindex}}", String(regTabActive ? 0 : -1))
      .replaceAll("{{logincardhidden}}", loginTabActive ? "" : "hidden")
      .replaceAll("{{regcardhidden}}", regTabActive ? "" : "hidden")
      .replaceAll("{{rolepickerhtml}}", rolePickerHtml)
      .replaceAll("{{termslinkshtml}}", termsLinksHtml);
  }

  return `<div class="empty">Login template is missing from index.html.</div>`;
};
