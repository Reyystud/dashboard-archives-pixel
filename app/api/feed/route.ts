import { listBroadcasts } from "@/lib/queries";

// Halaman pertama feed untuk ganti kategori/pencarian tanpa navigasi penuh (dipakai FeedBrowser).
// GET (bukan server action) supaya bisa paralel, di-prefetch, dan di-cache CDN.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const cat = sp.get("cat") || undefined;
  const q = sp.get("q")?.trim().slice(0, 100) || undefined;
  const page = await listBroadcasts({ cat, q });
  return Response.json(page, {
    headers: {
      "Cache-Control": q ? "private, max-age=30" : "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
