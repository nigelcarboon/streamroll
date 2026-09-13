import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Which services do you use?
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Pick the paid ones you rotate through. You can change this anytime.
      </p>

      <form action={saveServices} className="mt-8 flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {paidServices.map((service) => (
            <li key={service.id}>
              <label className="flex items-center gap-3 rounded-md px-2 py-3 active:bg-neutral-50">
                <input
                  type="checkbox"
                  name="service_id"
                  value={service.id}
                  defaultChecked={selectedIds.has(service.id)}
                  className="h-5 w-5 rounded border-neutral-300"
                />
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: service.colour }}
                  aria-hidden
                />
                <span className="text-base">{service.name}</span>
              </label>
            </li>
          ))}
        </ul>

        {freeServices.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Always free — no need to pick these
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {freeServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center gap-3 px-2 py-1 text-neutral-500"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: service.colour }}
                    aria-hidden
                  />
                  <span className="text-sm">{service.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-3 text-base font-medium text-white"
          >
            Continue
          </button>
        </div>
      </form>

      <form action={skipOnboarding}>
        <button
          type="submit"
          className="mt-3 w-full text-center text-sm text-neutral-400"
        >
          Skip for now
        </button>
      </form>
    </main>
  );
}
