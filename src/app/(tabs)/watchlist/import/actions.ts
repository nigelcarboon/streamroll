"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Row = { title: string; serviceId: string | null; watched: boolean };

export async function importWatchlist(rows: Row[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: services }, { data: existing }] = await Promise.all([
    supabase.from("services").select("id"),
    supabase.from("watchlist_items").select("title").eq("user_id", user.id),
  ]);

  const validServiceIds = new Set((services ?? []).map((s) => s.id));
  const have = new Set((existing ?? []).map((i) => i.title.toLowerCase()));

  const toInsert = [];
  let skipped = 0;
  for (const row of Array.isArray(rows) ? rows.slice(0, 500) : []) {
    const title = String(row?.title ?? "").trim().slice(0, 200);
    if (!title) continue;
    const key = title.toLowerCase();
    if (have.has(key)) {
      skipped++;
      continue;
    }
    have.add(key);
    toInsert.push({
      user_id: user.id,
      title,
      matched_service_id:
        row.serviceId && validServiceIds.has(row.serviceId)
          ? row.serviceId
          : null,
      status: row.watched ? ("watched" as const) : ("unwatched" as const),
      source: "paste" as const,
    });
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("watchlist_items").insert(toInsert);
    if (error) return { ok: false as const };
  }

  revalidatePath("/watchlist");
  revalidatePath("/reminder");
  redirect(`/watchlist?added=${toInsert.length}&skipped=${skipped}`);
}
