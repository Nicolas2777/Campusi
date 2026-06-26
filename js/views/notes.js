// სწრაფი ჩანაწერები
import { expose, escapeHtml } from "../ui.js";
import { refresh } from "../router.js";

const KEY = "campus.notes";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

export const notesView = () => {
  const notes = read().sort((a, b) => b.ts - a.ts);

  expose("noteAdd", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = (fd.get("text") || "").toString().trim();
    if (!text) return;
    const all = read();
    all.push({ id: crypto.randomUUID(), text, ts: Date.now() });
    write(all);
    e.target.reset();
    refresh();
  });
  expose("noteDel", (id) => { write(read().filter(n => n.id !== id)); refresh(); });

  return `
    <div>
      <span class="badge badge-primary">🗒 ჩანაწერები</span>
      <h1 style="margin:10px 0 4px">სწრაფი ჩანაწერები</h1>
      <p class="muted">დაფიქსირე იდეები, დავალებები, შესასწავლი საკითხები.</p>
    </div>

    <div class="card" style="margin-top:18px">
      <form onsubmit="__campus.noteAdd(event)">
        <div class="field">
          <textarea name="text" required rows="3" placeholder="ჩაწერე ჩანაწერი..."></textarea>
        </div>
        <button class="btn btn-primary" type="submit">დამატება</button>
      </form>
    </div>

    ${notes.length ? `
      <div class="grid grid-2" style="margin-top:20px">
        ${notes.map(n => `
          <div class="card">
            <p style="white-space:pre-wrap;margin:0 0 10px">${escapeHtml(n.text)}</p>
            <div class="row between">
              <span class="muted" style="font-size:12px">${new Date(n.ts).toLocaleString("ka-GE")}</span>
              <button class="btn btn-danger" onclick="__campus.noteDel('${n.id}')">წაშლა</button>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<p class="muted" style="margin-top:18px">ჩანაწერები ცარიელია.</p>`}
  `;
};
