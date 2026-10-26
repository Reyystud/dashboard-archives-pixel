import { describe, expect, it } from "vitest";
import { addDays, buildIcs, googleCalendarUrl, monthGrid, parseMonth, shiftMonth } from "@/lib/calendar";
import { parseSaved, toggleId } from "@/lib/client/saved";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

describe("calendar dates", () => {
  it("adds days across month and year", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("month grid starts on Monday and covers the month", () => {
    const g = monthGrid(2026, 10);
    expect(g).toHaveLength(42);
    expect(g[0]).toBe("2026-09-28"); // 1 Okt 2026 = Kamis
    expect(g).toContain("2026-10-31");
  });
  it("parses month with fallback", () => {
    expect(parseMonth("2026-02", "2026-10-26")).toEqual({ y: 2026, m: 2 });
    expect(parseMonth("2026-13", "2026-10-26")).toEqual({ y: 2026, m: 10 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
  });
});

describe("ics", () => {
  const ics = buildIcs([{ id: A, title: "Daftar, lomba; CTF", deadline: "2026-11-05", body: "baris1\nbaris2" }], "https://x.id/", new Date("2026-10-26T00:00:00Z"));
  it("emits all-day event with escaped text", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261105");
    expect(ics).toContain("DTEND;VALUE=DATE:20261106");
    expect(ics).toContain("SUMMARY:Tenggat: Daftar\\, lomba\\; CTF");
    expect(ics).toContain("baris1\\nbaris2");
    expect(ics).toContain(`URL:https://x.id/b/${A}`);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("folds long lines to 75 octets", () => {
    const long = buildIcs([{ id: A, title: "x".repeat(200), deadline: "2026-11-05" }], "https://x.id");
    for (const line of long.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
  it("google calendar url", () => {
    const u = new URL(googleCalendarUrl({ id: A, title: "Lomba", deadline: "2026-11-05" }, "https://x.id"));
    expect(u.searchParams.get("dates")).toBe("20261105/20261106");
  });
});

describe("saved", () => {
  it("parses defensively", () => {
    expect(parseSaved(null)).toEqual([]);
    expect(parseSaved("not json")).toEqual([]);
    expect(parseSaved(JSON.stringify([A, "bad", 3]))).toEqual([A]);
  });
  it("toggles with newest first", () => {
    expect(toggleId([A], B)).toEqual([B, A]);
    expect(toggleId([B, A], B)).toEqual([A]);
  });
});
