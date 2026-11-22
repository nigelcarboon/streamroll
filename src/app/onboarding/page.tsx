import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceDot } from "@/components/ServiceDot";
import { Wordmark } from "@/components/Wordmark";
import {
  addCustomService,
  removeCustomService,
  saveServices,
  skipOnboarding,
} from "./actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; exists?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: services }, { data: existingSelections }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, colour, is_free, user_id")
      .order("name"),
    supabase.from("user_services").select("service_id").eq("user_id", user.id),
  ]);

  const paidServices = (services ?? []).filter((s) => !s.is_free);
  const freeServices = (services ?? []).filter((s) => s.is_free);
  const customServices = (services ?? []).filter((s) => s.user_id);
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
                {service.user_id && (
                  <span className="data ml-auto text-xs text-static">Yours</span>
                )}
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

      <section
        id="add-service"
        className="mt-10 flex flex-col gap-3 border-t border-line pt-8"
      >
        <h2 className="font-display text-lg font-bold tracking-tight">
          Missing a service?
        </h2>
        <p className="text-sm text-static">
          Add any service that isn&apos;t listed, like BritBox or Kanopy. Only
          you will see it.
        </p>

        {params.added && (
          <p role="status" className="text-sm text-signal">
            Added {params.added.slice(0, 40)}.
          </p>
        )}
        {params.exists && (
          <p role="status" className="text-sm text-renewal">
            {params.exists.slice(0, 40)} is already on the list.
          </p>
        )}
        {params.error && (
          <p role="alert" className="text-sm text-renewal">
            That didn&apos;t save. Try again.
          </p>
        )}

        <form action={addCustomService} className="flex flex-col gap-2">
          <label htmlFor="service-name" className="sr-only">
            Service name
          </label>
          <div className="flex gap-2">
            <input
              id="service-name"
              name="name"
              required
              maxLength={40}
              placeholder="Service name"
              className="min-w-0 flex-1 rounded-md border border-line bg-standby px-3 py-2.5 text-base text-paper outline-none placeholder:text-static focus:border-signal"
            />
            <button
              type="submit"
              className="rounded-md border border-static px-4 py-2.5 text-base font-medium text-paper"
            >
              Add
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-static">
            <input
              type="checkbox"
              name="is_free"
              className="h-4 w-4 accent-signal"
            />
            It&apos;s free, no subscription
          </label>
        </form>

        {customServices.length > 0 && (
          <ul className="mt-2 flex flex-col">
            {customServices.map((service) => (
              <li
                key={service.id}
                className="flex items-center gap-3 border-b border-line py-2.5"
              >
                <ServiceDot colour={service.colour} />
                <span className="flex-1 text-base">{service.name}</span>
                <span className="data text-xs text-static">
                  {service.is_free ? "Free" : "Paid"}
                </span>
                <form action={removeCustomService.bind(null, service.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove ${service.name}`}
                    className="-m-1 p-3 text-lg leading-none text-static"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

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
