import { broadcastsByIds } from "@/lib/queries";

// Dipakai halaman /disimpan: id disimpan di localStorage pengunjung.
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const items = await broadcastsByIds(ids);
  return Response.json({ items }, { headers: { "Cache-Control": "private, max-age=30" } });
}
