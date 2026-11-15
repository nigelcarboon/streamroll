import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceDot } from "@/components/ServiceDot";
import { Wordmark } from "@/components/Wordmark";
import { saveServices, skipOnboarding } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: services }, { data: existingSelections }] = await Promise.all([
    supabase.from("services").select("id, name, colour, is_free").order("name"),
    supabase.from("user_services").select("service_id").eq("user_id", user.id),
  ]);

  const paidServices = (services ?? []).filter((s) => !s.is_free);
  const freeServices = (services ?? []).filter((s) => s.is_free);
  const selectedIds = new Set(
    (existingSelections ?? []).map((row) => row.service_id)
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
      <Wordmark />
      <h1 className="mt-10 font-display text-2xl font-bold tracking-tight">
        Which services do you pay for?
      </h1>
      <p className="mt-2 text-sm text-static">
        Pick the ones you rotate through. You can change this anytime.
      </p>

      <form action={saveServices} className="mt-6 flex flex-1 flex-col">
        <ul className="flex flex-col gap-2">
          {paidServices.map((service) => (
            <li key={service.id}>
              <label className="flex items-center gap-3 rounded-md border border-line bg-standby px-4 py-3.5 has-checked:border-signal">
                <input
                  type="checkbox"
                  name="service_id"
                  value={service.id}
                  defaultChecked={selectedIds.has(service.id)}
                  className="h-5 w-5 accent-signal"
                />
                <ServiceDot colour={service.colour} />
                <span className="text-base">{service.name}</span>
              </label>
            </li>
          ))}
        </ul>

        {freeServices.length > 0 && (
          <div className="mt-8">
            <p className="data text-xs text-static">Always free. Nothing to pick.</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {freeServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center gap-2 text-sm text-static"
                >
                  <ServiceDot colour={service.colour} size={8} />
                  {service.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-10">
          <button
            type="submit"
            className="w-full rounded-md bg-signal px-4 py-3 text-base font-semibold text-ground"
          >
            Continue
          </button>
        </div>
      </form>

      <form action={skipOnboarding}>
        <button
          type="submit"
          className="mt-3 w-full py-2 text-center text-sm text-static"
        >
          Skip for now
        </button>
      </form>
    </main>
  );
}
