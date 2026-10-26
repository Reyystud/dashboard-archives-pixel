import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MomentManager } from "@/components/admin/MomentManager";
import type { Moment } from "@/lib/queries";

export const metadata = { title: "Momen" };

export default async function AdminMomen() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("moments")
    .select("*")
    .order("taken_on", { ascending: false })
    .order("sort_order", { ascending: true });
  return (
    <div className="mx-auto max-w-[1200px]">
      <MomentManager rows={(data ?? []) as Moment[]} missingTable={!!error} />
    </div>
  );
}
