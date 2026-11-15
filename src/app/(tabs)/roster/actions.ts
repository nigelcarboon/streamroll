"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setRosterSlot(
  month: number,
  year: number,
  serviceId: string | null
): Promise<{ ok: boolean }> {
  if (!Number.isInteger(month) || month < 1 || month > 12) return { ok: false };
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = serviceId
    ? await supabase
        .from("roster_slots")
        .upsert(
          { user_id: user.id, service_id: serviceId, month, year },
          { onConflict: "user_id,month,year" }
        )
    : await supabase
        .from("roster_slots")
        .delete()
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);

  revalidatePath("/roster");
  revalidatePath("/watchlist");
  revalidatePath("/reminder");
  return { ok: !error };
}
