// Utilitas kalender murni (tanpa I/O) untuk halaman /kalender, feed .ics, dan tautan Google Calendar.
// Tanggal selalu string "YYYY-MM-DD" (tenggat tidak punya jam), dihitung di UTC supaya bebas zona waktu.

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function parseMonth(m: string | undefined, fallback: string): { y: number; m: number } {
  const src = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : fallback.slice(0, 7);
  const [y, mm] = src.split("-").map(Number);
  return { y, m: mm };
}

export const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

export function shiftMonth(y: number, m: number, delta: number) {
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
}

/** 6 minggu x 7 hari, mulai Senin, yang mencakup bulan (y, m). */
export function monthGrid(y: number, m: number): string[] {
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = addDays(first.toISOString().slice(0, 10), -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const compact = (date: string) => date.replaceAll("-", "");

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}

/** Lipat baris > 75 oktet sesuai RFC 5545. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length;
    if (bytes + b > 75) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n");
}

export type CalEvent = { id: string; title: string; deadline: string; body?: string };

export function buildIcs(events: CalEvent[], siteUrl: string, stamp = new Date()): string {
  const dtstamp = stamp.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PIXEL25 HMIF ITB//Tenggat Broadcast//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Tenggat PIXEL'25",
    "X-WR-TIMEZONE:Asia/Jakarta",
  ];
  for (const e of events) {
    const url = `${siteUrl.replace(/\/$/, "")}/b/${e.id}`;
    const desc = `${(e.body ?? "").slice(0, 600)}\n\n${url}`.trim();
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@pixel25`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(e.deadline)}`,
      `DTEND;VALUE=DATE:${compact(addDays(e.deadline, 1))}`,
      `SUMMARY:${icsEscape(`Tenggat: ${e.title}`)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      `URL:${url}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: CalEvent, siteUrl: string): string {
  const url = `${siteUrl.replace(/\/$/, "")}/b/${e.id}`;
  const sp = new URLSearchParams({
    action: "TEMPLATE",
    text: `Tenggat: ${e.title}`,
    dates: `${compact(e.deadline)}/${compact(addDays(e.deadline, 1))}`,
    details: url,
    ctz: "Asia/Jakarta",
  });
  return `https://calendar.google.com/calendar/render?${sp}`;
}
