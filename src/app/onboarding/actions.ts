"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveServices(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const selectedServiceIds = formData.getAll("service_id") as string[];

  await supabase.from("user_services").delete().eq("user_id", user.id);

  if (selectedServiceIds.length > 0) {
    await supabase.from("user_services").insert(
      selectedServiceIds.map((service_id) => ({
        user_id: user.id,
        service_id,
      }))
    );
  }

  await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", user.id);

  redirect("/roster");
}

export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);

  redirect("/roster");
}
