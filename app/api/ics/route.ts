import { deadlinesInRange } from "@/lib/queries";
import { addDays, buildIcs } from "@/lib/calendar";
import { todayJakarta } from "@/lib/classify/rules";
import { clientEnv } from "@/lib/env";

export const revalidate = 600;

// Feed langganan: tenggat 60 hari ke belakang s.d. 1 tahun ke depan.
export async function GET() {
  const today = todayJakarta();
  const items = await deadlinesInRange(addDays(today, -60), addDays(today, 365));
  const ics = buildIcs(items.map((i) => ({ ...i, deadline: i.deadline! })), clientEnv.NEXT_PUBLIC_SITE_URL);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="tenggat-pixel25.ics"',
    },
  });
}
