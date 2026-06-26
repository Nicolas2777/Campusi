// მცირე ICS (iCalendar) ექსპორტერი — Google Calendar / Apple Calendar-ში დასამატებლად

const pad = (n) => String(n).padStart(2, "0");

// YYYY-MM-DD → YYYYMMDD (all-day event)
const dateToIcsDate = (yyyyMmDd) => yyyyMmDd.replace(/-/g, "");

// Date → YYYYMMDDTHHMMSSZ (UTC, with time)
export const toIcsUtc = (d) => {
  const dt = new Date(d);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
};

// Escape ICS-special chars in text fields
const esc = (s) => String(s ?? "")
  .replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,")
  .replace(/\n/g, "\\n");

// fold lines longer than 75 chars per RFC 5545
const fold = (line) => {
  if (line.length <= 75) return line;
  const out = [];
  let i = 0;
  while (i < line.length) {
    out.push((i === 0 ? "" : " ") + line.slice(i, i + 73));
    i += 73;
  }
  return out.join("\r\n");
};

/**
 * Events: [{ uid, title, description?, location?,
 *   start: "YYYY-MM-DD" (all-day) | Date,
 *   end:   "YYYY-MM-DD" (all-day, exclusive) | Date }]
 */
export const buildIcs = (events, calName = "Campus") => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus//Student Platform//KA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(calName)}`,
  ];
  const stamp = toIcsUtc(new Date());
  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.uid}@campus.local`);
    lines.push(`DTSTAMP:${stamp}`);
    if (typeof e.start === "string") {
      // all-day event — DTEND exclusive (next day)
      const endStr = e.end || addDays(e.start, 1);
      lines.push(`DTSTART;VALUE=DATE:${dateToIcsDate(e.start)}`);
      lines.push(`DTEND;VALUE=DATE:${dateToIcsDate(endStr)}`);
    } else {
      lines.push(`DTSTART:${toIcsUtc(e.start)}`);
      lines.push(`DTEND:${toIcsUtc(e.end)}`);
    }
    lines.push(fold(`SUMMARY:${esc(e.title)}`));
    if (e.description) lines.push(fold(`DESCRIPTION:${esc(e.description)}`));
    if (e.location)    lines.push(fold(`LOCATION:${esc(e.location)}`));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

const addDays = (yyyyMmDd, days) => {
  const d = new Date(yyyyMmDd);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// Add 1 day to an inclusive end date (ICS DTEND is exclusive)
export const dayAfter = (yyyyMmDd) => addDays(yyyyMmDd, 1);

export const downloadIcs = (filename, ics) => {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};
