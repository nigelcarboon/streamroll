"use server";

import { revalidatePath } from "next/cache";
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

/** Pick a stable colour for a custom service from its name. */
const CUSTOM_COLOURS = [
  "#7CF5D0",
  "#FF8FB1",
  "#9DB4FF",
  "#FFD166",
  "#C3A6FF",
  "#5CE68A",
  "#FF9F6B",
  "#6FD3FF",
];

function colourFor(name: string) {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return CUSTOM_COLOURS[hash % CUSTOM_COLOURS.length];
}

export async function addCustomService(formData: FormData) {
  const name = String(formData.get("name") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  const isFree = formData.get("is_free") === "on";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!name) redirect("/onboarding");

  // Built-in and custom services the person can already see.
  const { data: visible } = await supabase.from("services").select("name");
  const clash = (visible ?? []).find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (clash) {
    redirect(`/onboarding?exists=${encodeURIComponent(clash.name)}#add-service`);
  }

  const { data: created, error } = await supabase
    .from("services")
    .insert({ name, colour: colourFor(name), is_free: isFree, user_id: user.id })
    .select("id")
    .single();
  if (error || !created) redirect("/onboarding?error=1#add-service");

  // A paid service someone bothers to add is one they rotate through.
  if (!isFree) {
    await supabase
      .from("user_services")
      .insert({ user_id: user.id, service_id: created.id });
  }

  revalidatePath("/", "layout");
  redirect(`/onboarding?added=${encodeURIComponent(name)}#add-service`);
}

export async function removeCustomService(serviceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row level security only allows removing the person's own services.
  await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
  redirect("/onboarding#add-service");
}
