"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setRosterSlot(
  month: number,
  year: number,
  serviceId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (serviceId) {
    await supabase
      .from("roster_slots")
      .upsert(
        { user_id: user.id, service_id: serviceId, month, year },
        { onConflict: "user_id,month,year" }
      );
  } else {
    await supabase
      .from("roster_slots")
      .delete()
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year);
  }

  revalidatePath("/roster");
}
