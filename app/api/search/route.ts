import { listBroadcasts, listPojok } from "@/lib/queries";

// Pencarian cepat untuk command palette (⌘K).
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return Response.json({ broadcasts: [], pojok: [] });
  const [page, pojok] = await Promise.all([listBroadcasts({ q }), listPojok()]);
  const needle = q.toLowerCase();
  return Response.json(
    {
      broadcasts: page.items.slice(0, 8).map((b) => ({ id: b.id, title: b.title, category: b.category, deadline: b.deadline })),
      pojok: pojok
        .filter((p) => `${p.title} ${p.question}`.toLowerCase().includes(needle))
        .slice(0, 4)
        .map((p) => ({ slug: p.slug, title: p.title, question: p.question })),
    },
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
