import { universities, facultiesByUni } from "../data.js";
import { getCompare, toggleCompare, clearCompare } from "../state.js";
import { refresh } from "../router.js";
import { expose, showToast } from "../ui.js";

export const compareView = () => {
  const ids = getCompare();
  const list = universities.map(u => ({ ...u, picked: ids.includes(u.id) }));
  const selected = list.filter(u => u.picked);

  expose("cmpToggle", (id) => {
    const ok = toggleCompare(id);
    if (!ok) showToast("მაქსიმუმ 4 უნივერსიტეტი");
    refresh();
  });
  expose("cmpClear", () => { clearCompare(); refresh(); });

  const rows = [
    { label: "ქალაქი", get: u => `📍 ${u.city}` },
    { label: "დაარსდა", get: u => u.founded },
    { label: "სტუდენტი", get: u => u.students.toLocaleString() },
    { label: "ფაკულტეტი", get: u => facultiesByUni(u.id).length },
    { label: "რეიტინგი", get: u => `★ ${u.rating}` },
  ];

  return `
    <div class="crumbs"><a href="#/">მთავარი</a> / შედარება</div>
    <h1>უნივერსიტეტების შედარება</h1>
    <p class="muted">აირჩიე 2-4 უნივერსიტეტი ერთმანეთთან შესადარებლად</p>

    <div class="grid grid-3" style="margin-top:20px">
      ${list.map(u => `
        <div class="card ${u.picked ? "card-active" : ""}" onclick="__campus.cmpToggle('${u.id}')" style="cursor:pointer">
          <div class="card-row">
            <div><h3 style="margin:0">${u.name}</h3><p>${u.city}</p></div>
            <div class="check ${u.picked ? "on" : ""}">${u.picked ? "✓" : ""}</div>
          </div>
        </div>`).join("")}
    </div>

    ${selected.length >= 2 ? `
      <div class="row between" style="margin-top:32px">
        <h2 class="section-title" style="margin:0">შედარების ცხრილი</h2>
        <button class="btn btn-ghost" onclick="__campus.cmpClear()">გასუფთავება</button>
      </div>
      <div class="compare-wrap">
        <table class="compare-table">
          <thead><tr><th></th>${selected.map(u => `<th>${u.name}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.map(r => `<tr>
              <td class="muted">${r.label}</td>
              ${selected.map(u => `<td>${r.get(u)}</td>`).join("")}
            </tr>`).join("")}
          </tbody>
        </table>
      </div>` : `<p class="muted" style="margin-top:24px">აირჩიე მინიმუმ 2 უნივერსიტეტი</p>`}
  `;
};
