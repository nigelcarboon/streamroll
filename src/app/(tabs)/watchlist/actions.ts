"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { duplicateIndex } from "@/lib/titles";
import { createClient } from "@/lib/supabase/server";

export async function addWatchlistItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const serviceId = String(formData.get("service_id") ?? "");
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("title")
    .eq("user_id", user.id);
  const match = duplicateIndex((existing ?? []).map((i) => i.title))(title);
  if (match?.kind === "same") {
    redirect(`/watchlist?dupe=${encodeURIComponent(match.existing)}`);
  }

  await supabase.from("watchlist_items").insert({
    user_id: user.id,
    title,
    matched_service_id: serviceId || null,
    source: "manual",
  });

  revalidatePath("/watchlist");
  revalidatePath("/reminder");
}

export async function setWatchlistStatus(
  id: string,
  status: "unwatched" | "watched"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watchlist_items")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/watchlist");
  revalidatePath("/reminder");
}

export async function removeWatchlistItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watchlist_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/watchlist");
  revalidatePath("/reminder");
}
