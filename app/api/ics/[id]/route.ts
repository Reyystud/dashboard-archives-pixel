import { getBroadcast } from "@/lib/queries";
import { buildIcs } from "@/lib/calendar";
import { clientEnv } from "@/lib/env";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const b = await getBroadcast((await params).id);
  if (!b?.deadline) return new Response("Tidak ditemukan", { status: 404 });
  const ics = buildIcs([{ id: b.id, title: b.title, deadline: b.deadline, body: b.body }], clientEnv.NEXT_PUBLIC_SITE_URL);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="tenggat-${b.id.slice(0, 8)}.ics"`,
    },
  });
}
