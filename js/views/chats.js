// Subject-based academic forums: chatId = `${facultyId}__${subjectId}`.
// Access: only students whose profile.facultyId matches the forum's facultyId.
import { firebaseEnabled, loadFirebase } from "../firebase.js";
import { getUser, getProfile, getDisplayName, isAdminUser, canModerate, isBlockedUser } from "../auth.js";
import { expose, escapeHtml, showToast } from "../ui.js";
import { refresh } from "../router.js";
import { ensureForumSub, clearUnread, notifyPermissionState, requestNotifyPermission } from "../notifications.js";

const chatIdFor = (facultyId, subjectId) => `${facultyId}__${subjectId}`;

const fmtTs = (ts) => {
  if (!ts) return "";
  let d;
  if (ts?.toDate) d = ts.toDate();
  else if (ts?.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ka-GE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
};

let _subjectsCache = null;
let _subjectsCacheFor = null;
let _allSubsCache = null;
let _allFacsCache = null;

const loadFacultySubjects = async (facultyId) => {
  if (!facultyId) return [];
  if (_subjectsCacheFor === facultyId && _subjectsCache) return _subjectsCache;
  const fb = await loadFirebase();
  const snap = await fb.getDocs(fb.collection(fb.db, "subjects"));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.facultyId === facultyId);
  _subjectsCache = list;
  _subjectsCacheFor = facultyId;
  setTimeout(() => { try { refresh(); } catch {} }, 0);
  return list;
};

const loadAllSubjectsAndFaculties = async () => {
  if (_allSubsCache && _allFacsCache) return { subs: _allSubsCache, facs: _allFacsCache };
  const fb = await loadFirebase();
  const [s, f] = await Promise.all([
    fb.getDocs(fb.collection(fb.db, "subjects")),
    fb.getDocs(fb.collection(fb.db, "faculties")),
  ]);
  _allSubsCache = s.docs.map(d => ({ id: d.id, ...d.data() }));
  _allFacsCache = f.docs.map(d => ({ id: d.id, ...d.data() }));
  setTimeout(() => { try { refresh(); } catch {} }, 0);
  return { subs: _allSubsCache, facs: _allFacsCache };
};

/* ============ List view: /chats ============ */
export const chatsView = async () => {
  const user = getUser();
  const profile = getProfile();
  const admin = isAdminUser();
  const T = window.T || ((k) => k);
  if (!firebaseEnabled) return `<div class="empty"><div class="ico">⚠️</div>${T("forum.required.firebase")}</div>`;
  if (!user) return `<div class="empty"><div class="ico">🔒</div>${T("forum.required.auth")}</div>`;

  if (admin) {
    loadAllSubjectsAndFaculties();
    const subs = _allSubsCache || [];
    const facs = _allFacsCache || [];
    const facMap = Object.fromEntries(facs.map(f => [f.id, f.name]));
    const groups = {};
    subs.forEach(s => { (groups[s.facultyId] ||= []).push(s); });
    const facIds = Object.keys(groups).sort((a,b) => (facMap[a]||"").localeCompare(facMap[b]||"","ka"));
    return `
      <h1>${T("forum.admin.title")} <span class="badge badge-primary">${T("forum.admin.badge")}</span></h1>
      <p class="muted">${T("forum.admin.sub")}</p>
      ${facIds.length ? facIds.map(fid => `
        <h2 style="margin:22px 0 10px;font-size:16px">🏛 ${escapeHtml(facMap[fid] || fid)}</h2>
        <div class="grid grid-2">
          ${groups[fid].sort((a,b)=>(a.name||"").localeCompare(b.name||"","ka")).map(s => {
            const cid = chatIdFor(fid, s.id);
            return `<a class="card forum-card" href="#/chat/${encodeURIComponent(cid)}" style="text-decoration:none;color:inherit;padding:12px 14px">
              <div class="row between" style="gap:10px">
                <div style="min-width:0">
                  <h3 style="margin:0;font-size:14px;font-weight:700">📘 ${escapeHtml(s.name)}</h3>
                  <p class="muted" style="margin:3px 0 0;font-size:11.5px">${escapeHtml(s.code || "")}${s.lecturer ? ` · ${escapeHtml(s.lecturer)}` : ""}</p>
                </div>
                <span class="badge badge-primary" style="font-size:11px">${T("forum.card.enter")}</span>
              </div>
            </a>`;
          }).join("")}
        </div>
      `).join("") : `<div class="empty"><div class="ico">📭</div>${T("forum.empty.subjects")}</div>`}
    `;
  }

  if (!profile?.facultyId) return `<div class="empty"><div class="ico">🎓</div>${T("forum.faculty.required")} <a href="#/onboarding" class="btn btn-primary" style="margin-top:14px">${T("forum.faculty.cta")}</a></div>`;

  loadFacultySubjects(profile.facultyId);
  const subs = (_subjectsCacheFor === profile.facultyId ? _subjectsCache : null) || [];

  return `
    <h1>${T("forum.list.title")}</h1>
    <p class="muted">${T("forum.list.sub")}</p>


    ${subs.length ? `<div class="grid grid-2" style="margin-top:18px">
      ${[...subs].sort((a,b)=>(a.name||"").localeCompare(b.name||"","ka")).map(s => {
        const cid = chatIdFor(profile.facultyId, s.id);
        return `<a class="card forum-card" href="#/chat/${encodeURIComponent(cid)}" style="text-decoration:none;color:inherit;padding:12px 14px">
          <div class="row between" style="gap:10px">
            <div style="min-width:0">
              <h3 style="margin:0;font-size:14px;font-weight:700">📘 ${escapeHtml(s.name)}</h3>
              <p class="muted" style="margin:3px 0 0;font-size:11.5px">${escapeHtml(s.code || "")}${s.lecturer ? ` · ${escapeHtml(s.lecturer)}` : ""}</p>
            </div>
            <span class="badge badge-primary" style="font-size:11px">${T("forum.card.enter")}</span>
          </div>
        </a>`;
      }).join("")}
    </div>` : `<div class="empty" style="margin-top:18px"><div class="ico">📭</div>${T("forum.list.empty")}</div>`}
  `;
};

/* ============ Chat room view: /chat/:chatId ============ */
let _unsub = null;
let _metaUnsub = null;
let _msgs = [];
let _meta = null;
let _activeChatId = null;
let _knownUserIds = null;

const msgUid = (m) => m.senderId || m.uid || m.userId || "";

const detachListener = () => {
  if (_unsub) { try { _unsub(); } catch {} }
  if (_metaUnsub) { try { _metaUnsub(); } catch {} }
  _unsub = null;
  _metaUnsub = null;
  _msgs = [];
  _meta = null;
  _activeChatId = null;
};

// Detach when leaving chat
window.addEventListener("hashchange", () => {
  if (!location.hash.startsWith("#/chat/")) detachListener();
});

const ensureChatDoc = async (fb, chatId, facultyId, subjectId, subjectName, user, profile) => {
  const ref = fb.doc(fb.db, "subjectChats", chatId);
  const snap = await fb.getDoc(ref);
  const dn = getDisplayName();
  const me = {
    name: dn,
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || user.email || "",
    joinedAt: Date.now(),
  };
  if (!snap.exists()) {
    await fb.setDoc(ref, {
      chatId,
      facultyId,
      subjectId,
      subjectName: subjectName || "",
      createdAt: fb.serverTimestamp(),
      participants: { [user.uid]: me },
    });
  } else {
    const data = snap.data();
    const existing = data.participants?.[user.uid];
    if (!existing || !existing.email || !existing.lastName) {
      await fb.setDoc(ref, {
        participants: { ...(data.participants || {}), [user.uid]: me },
      }, { merge: true });
    }
  }
};

const attachListener = async (chatId) => {
  const fb = await loadFirebase();
  try {
    const usersSnap = await fb.getDocs(fb.collection(fb.db, "users"));
    _knownUserIds = new Set(usersSnap.docs.map(d => d.id));
  } catch (e) {
    console.warn("chat users filter", e);
    _knownUserIds = null;
  }
  const msgsCol = fb.collection(fb.db, "subjectChats", chatId, "messages");
  const q = fb.query(msgsCol, fb.orderBy("createdAt", "asc"), fb.limit(200));
  _unsub = fb.onSnapshot(q, (snap) => {
    _msgs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(m => !_knownUserIds || _knownUserIds.has(msgUid(m)));
    renderMessagesIntoDOM();
  }, (err) => {
    console.warn("chat messages", err);
    const box = document.getElementById("chatMsgs");
    if (box) box.innerHTML = `<p class="muted" style="text-align:center;padding:32px">${(window.T||((k)=>k))("forum.msgs.loadFail", { err: escapeHtml(err?.message || err) })}</p>`;
  });
  // meta listener
  const metaRef = fb.doc(fb.db, "subjectChats", chatId);
  _metaUnsub = fb.onSnapshot(metaRef, (s) => {
    if (s.exists()) {
      _meta = s.data();
      const parts = _meta.participants || {};
      const count = Object.keys(parts).length;
      const cEl = document.getElementById("chatPartCount");
      if (cEl) cEl.textContent = count;
      const cEl2 = document.getElementById("chatPartCount2");
      if (cEl2) cEl2.textContent = count;
      renderParticipantsIntoDOM();
    }
  });
};

const renderParticipantsIntoDOM = () => {
  const box = document.getElementById("chatParts");
  if (!box) return;
  const parts = _meta?.participants || {};
  const entries = Object.entries(parts)
    .filter(([uid]) => !_knownUserIds || _knownUserIds.has(uid))
    .sort((a, b) => {
    const an = `${a[1].firstName || ""} ${a[1].lastName || ""}`.trim() || a[1].name || "";
    const bn = `${b[1].firstName || ""} ${b[1].lastName || ""}`.trim() || b[1].name || "";
    return an.localeCompare(bn, "ka");
  });
  const myUid = getUser()?.uid;
  const admin = canModerate();
  const T = window.T || ((k) => k);
  box.innerHTML = entries.length ? entries.map(([uid, p]) => {
    const full = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || T("forum.parts.unknown");
    const initials = ((p.firstName?.[0] || p.name?.[0] || "?") + (p.lastName?.[0] || "")).toUpperCase();
    const me = uid === myUid ? ` <span class="muted" style="font-size:11px">${T("forum.parts.you")}</span>` : "";
    const kickBtn = (admin && uid !== myUid)
      ? `<button type="button" class="chat-part-kick" title="${T("forum.parts.kickTitle")}" onclick="event.stopPropagation();__campus.chatKickParticipant('${escapeHtml(uid)}','${escapeHtml(full).replace(/'/g,"&#39;")}')">⛔</button>`
      : "";
    return `<div class="chat-part-row" style="display:flex;align-items:center;gap:6px">
      <button type="button" class="chat-part" style="flex:1;min-width:0" onclick="__campus.chatShowMember('${escapeHtml(uid)}')">
        <span class="chat-part-av">${escapeHtml(initials)}</span>
        <span class="chat-part-name">${escapeHtml(full)}${me}</span>
      </button>
      ${kickBtn}
    </div>`;
  }).join("") : `<p class="muted" style="padding:10px;font-size:12px">${T("forum.parts.empty")}</p>`;
};

const renderMessagesIntoDOM = () => {
  const box = document.getElementById("chatMsgs");
  if (!box) return;
  const user = getUser();
  const myUid = user?.uid;
  const admin = canModerate();
  const T = window.T || ((k) => k);
  const DELETE_WINDOW_MS = 15 * 60 * 1000;
  const now = Date.now();
  box.innerHTML = _msgs.length ? _msgs.map(m => {
    const senderUid = msgUid(m);
    const mine = senderUid === myUid;
    const ts = m.createdAt && typeof m.createdAt.toMillis === "function" ? m.createdAt.toMillis()
             : (m.createdAt instanceof Date ? m.createdAt.getTime() : 0);
    const withinWindow = ts > 0 && (now - ts) <= DELETE_WINDOW_MS;
    const canDelete = admin || (mine && withinWindow);
    const safeText = escapeHtml(m.text || "");
    const reportArg = `'forumMessage','${_activeChatId}::${m.id}',${JSON.stringify((m.text||"").slice(0,180)).replace(/'/g,"&#39;")}`;
    const delBtn = canDelete ? `<button type="button" class="chat-msg-del chat-msg-del-left" title="${T("forum.msg.delTitle")}" onclick="__campus.chatDelMsg('${escapeHtml(m.id)}')">🗑</button>` : "";
    const reportBtn = !mine ? `<button type="button" class="chat-msg-del" title="${T("forum.msg.reportTitle")}" onclick="__campus.report(${reportArg})">⚑</button>` : "";
    return `<div class="chat-msg ${mine ? "mine" : "other"}">
      ${mine ? "" : `<div class="chat-msg-name" style="cursor:pointer" onclick="__campus.chatShowMember('${escapeHtml(senderUid)}')">${escapeHtml(m.senderName || T("forum.msg.unknownSender"))}</div>`}
      <div class="chat-msg-row">${delBtn}<div class="chat-msg-bubble">${safeText}${reportBtn}</div></div>
      <div class="chat-msg-time">${fmtTs(m.createdAt)}</div>
    </div>`;
  }).join("") : `<p class="muted" style="text-align:center;padding:32px">${T("forum.msgs.empty")}</p>`;
  box.scrollTop = box.scrollHeight;
};

export const chatRoomView = async (params) => {
  const chatId = decodeURIComponent(params.chatId || "");
  const user = getUser();
  const profile = getProfile();
  const T = window.T || ((k, v) => k);
  if (!firebaseEnabled) return `<div class="empty"><div class="ico">⚠️</div>${T("forum.room.firebase")}</div>`;
  if (!user) return `<div class="empty"><div class="ico">🔒</div>${T("forum.room.signin")}</div>`;
  if (!profile?.facultyId && !isAdminUser()) return `<div class="empty"><div class="ico">🎓</div>${T("forum.faculty.required")}</div>`;

  // chatId format: facultyId__subjectId
  const [facultyId, subjectId] = chatId.split("__");
  if (!facultyId || !subjectId) return `<div class="empty">${T("forum.room.invalidId")}</div>`;

  // Access check: admins always allowed; students must match faculty
  const admin = isAdminUser();
  if (!admin && profile.facultyId !== facultyId) {
    return `<div class="empty"><div class="ico">🚫</div>${T("forum.room.accessDenied")}</div>`;
  }

  // Load subject info to get its name
  await loadFacultySubjects(facultyId);
  const subj = (_subjectsCache || []).find(s => s.id === subjectId);
  const subjectName = subj?.name || subjectId;

  // Ensure chat doc exists. Students join as participants; admins only ensure the parent doc exists so they can post/moderate.
  const fb = await loadFirebase();
  try {
    if (admin) {
      const ref = fb.doc(fb.db, "subjectChats", chatId);
      const snap = await fb.getDoc(ref);
      if (!snap.exists()) {
        await fb.setDoc(ref, {
          chatId, facultyId, subjectId, subjectName: subjectName || "",
          createdAt: fb.serverTimestamp(), participants: {},
        });
      }
    } else {
      await ensureChatDoc(fb, chatId, facultyId, subjectId, subjectName, user, profile);
    }
  } catch (err) {
    return `<div class="empty"><div class="ico">⚠️</div>${T("forum.room.loadFail", { err: escapeHtml(err.message || "") })}</div>`;
  }

  // Subscribe to forum notifications (auto on entry, students only) + clear unread
  if (!admin) {
    ensureForumSub(chatId, subjectName);
    clearUnread(chatId);
  }

  // Attach realtime listener (only once per active chat)
  if (_activeChatId !== chatId) {
    detachListener();
    _activeChatId = chatId;
    attachListener(chatId).catch(e => console.warn("listener", e));
  }

  // Handlers
  expose("chatSend", async (e) => {
    e.preventDefault();
    const input = e.target.elements.text;
    const text = (input.value || "").trim();
    if (!text) return;
    if (isBlockedUser()) { showToast("ანგარიში დაბლოკილია — წერა შეზღუდულია"); return; }
    const fb2 = await loadFirebase();
    try {
      await fb2.addDoc(fb2.collection(fb2.db, "subjectChats", chatId, "messages"), {
        senderId: user.uid,
        uid: user.uid,
        senderName: getDisplayName(),
        text,
        createdAt: fb2.serverTimestamp(),
      });
      input.value = "";
      input.focus();
    } catch (err) {
      showToast(T("forum.send.fail", { err: err.message || err }));
    }
  });

  expose("chatKickParticipant", async (uid, name) => {
    if (!uid) return;
    if (!isAdminUser()) { showToast(T("forum.kick.adminOnly")); return; }
    if (!confirm(T("forum.kick.confirm", { name: name || uid }))) return;
    const fb2 = await loadFirebase();
    try {
      // Delete this user's messages in this chat
      try {
        const col = fb2.collection(fb2.db, "subjectChats", chatId, "messages");
        const bySender = await fb2.getDocs(fb2.query(col, fb2.where("senderId", "==", uid)));
        const byUid = await fb2.getDocs(fb2.query(col, fb2.where("uid", "==", uid)));
        const refs = new Map();
        bySender.docs.forEach(d => refs.set(d.id, d.ref));
        byUid.docs.forEach(d => refs.set(d.id, d.ref));
        await Promise.all([...refs.values()].map(ref => fb2.deleteDoc(ref)));
      } catch (e) { console.warn("kick: msgs", e); }
      // Remove from participants map
      const ref = fb2.doc(fb2.db, "subjectChats", chatId);
      const snap = await fb2.getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const np = { ...(data.participants || {}) };
        delete np[uid];
        await fb2.setDoc(ref, { participants: np }, { merge: true });
      }
      showToast(T("forum.kick.ok"));
    } catch (err) {
      showToast(T("forum.kick.fail", { err: err?.message || err }));
    }
  });

  expose("chatDelMsg", async (msgId) => {
    if (!msgId) return;
    if (!confirm(T("forum.del.confirm"))) return;
    const fb2 = await loadFirebase();
    try {
      await fb2.deleteDoc(fb2.doc(fb2.db, "subjectChats", chatId, "messages", msgId));
      showToast(T("forum.del.ok"));
    } catch (err) {
      showToast(T("forum.del.fail", { err: err.message || err }));
    }
  });

  expose("chatShowMember", (uid) => {
    const p = _meta?.participants?.[uid];
    if (!p || (_knownUserIds && !_knownUserIds.has(uid))) { showToast(T("forum.member.notFound")); return; }
    const full = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || T("forum.parts.unknown");
    const email = p.email || "";
    const initials = ((p.firstName?.[0] || p.name?.[0] || "?") + (p.lastName?.[0] || "")).toUpperCase();
    const html = `
      <div class="modal-backdrop" onclick="if(event.target===this)__campus.chatCloseMember()">
        <div class="modal-card" style="max-width:380px">
          <div style="text-align:center;padding:8px 0 14px">
            <div class="chat-part-av" style="width:64px;height:64px;font-size:24px;margin:0 auto 10px">${escapeHtml(initials)}</div>
            <h3 style="margin:0">${escapeHtml(full)}</h3>
            ${p.firstName ? `<p class="muted" style="margin:6px 0 0;font-size:13px">${T("forum.member.fn")}: <b>${escapeHtml(p.firstName)}</b></p>` : ""}
            ${p.lastName ? `<p class="muted" style="margin:2px 0 0;font-size:13px">${T("forum.member.ln")}: <b>${escapeHtml(p.lastName)}</b></p>` : ""}
            ${email ? `<p class="muted" style="margin:8px 0 0;font-size:13px">📧 <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : `<p class="muted" style="margin:8px 0 0;font-size:13px">${T("forum.member.noEmail")}</p>`}
          </div>
          <div class="row" style="gap:8px;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" onclick="__campus.chatCloseMember()">${T("forum.member.close")}</button>
            ${email ? `<a class="btn btn-primary" href="mailto:${escapeHtml(email)}">${T("forum.member.sendMail")}</a>` : ""}
          </div>
        </div>
      </div>`;
    const host = document.getElementById("chatMemberModal");
    if (host) host.innerHTML = html;
  });
  expose("chatCloseMember", () => {
    const host = document.getElementById("chatMemberModal");
    if (host) host.innerHTML = "";
  });

  // initial participant count (from cache if any)
  const partCount = _meta?.participants ? Object.keys(_meta.participants).length : "—";

  // schedule a paint of any existing messages after route render
  setTimeout(() => { renderMessagesIntoDOM(); renderParticipantsIntoDOM(); }, 50);

  return `
    <div class="chat-layout">
      <aside class="chat-sidebar">
        <div class="chat-sidebar-head">
          <h3 style="margin:0;font-size:14px">${T("forum.parts.title")} (<span id="chatPartCount2">${partCount}</span>)</h3>
        </div>
        <div id="chatParts" class="chat-parts"></div>
      </aside>

      <div class="chat-shell">
        <header class="chat-head">
          <a href="#/chats" class="btn btn-ghost" style="padding:4px 10px">${T("forum.back")}</a>
          <div style="flex:1;min-width:0">
            <h2 style="margin:0;font-size:17px">📘 ${escapeHtml(subjectName)}</h2>
            <p class="muted" style="margin:2px 0 0;font-size:12px">
              <span id="chatPartCount">${partCount}</span> ${T("forum.head.partsSuffix")} · ${escapeHtml(subj?.code || "")}
            </p>
          </div>
        </header>

        <div id="chatMsgs" class="chat-msgs"></div>

        <form class="chat-composer" onsubmit="__campus.chatSend(event)">
          <input name="text" required maxlength="2000" autocomplete="off" placeholder="${T("forum.composer.placeholder")}" />
          <button class="btn btn-primary" type="submit">${T("forum.composer.send")}</button>
        </form>
      </div>
    </div>
    <div id="chatMemberModal"></div>
  `;
};
