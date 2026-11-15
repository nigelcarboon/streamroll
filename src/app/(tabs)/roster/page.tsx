import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MONTH_COLOURS,
  MONTH_NAMES,
  getToday,
  rollingMonths,
} from "@/lib/roster";
import { RosterMonthRow } from "./RosterMonthRow";

export default async function RosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = getToday();
  const months = rollingMonths(today);

  const [{ data: userServiceRows }, { data: allServices }, { data: slots }] =
    await Promise.all([
      supabase.from("user_services").select("service_id").eq("user_id", user.id),
      supabase.from("services").select("id, name, colour").order("name"),
      supabase
        .from("roster_slots")
        .select("month, year, service_id")
        .eq("user_id", user.id),
    ]);

  const selectedIds = new Set((userServiceRows ?? []).map((r) => r.service_id));
  const services = (allServices ?? []).filter((s) => selectedIds.has(s.id));

  const slotMap = new Map(
    (slots ?? []).map((s) => [`${s.year}-${s.month}`, s.service_id])
  );
  const planned = months.filter((m) => slotMap.has(`${m.year}-${m.month}`));

  if (services.length === 0) {
    return (
      <div className="px-6 py-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Roster
        </h1>
        <p className="mt-2 text-sm text-static">
          No services picked yet.{" "}
          <Link href="/onboarding" className="text-paper underline">
            Pick your services
          </Link>{" "}
          to start the rotation.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Roster</h1>
      <p className="mt-2 text-sm text-static">
        One paid service a month.{" "}
        <span className="data text-xs">
          {planned.length} of {months.length} months planned
        </span>
      </p>
      <ul className="mt-6 flex flex-col gap-2">
        {months.map(({ month, year }, i) => (
          <RosterMonthRow
            key={`${year}-${month}`}
            month={month}
            year={year}
            label={`${MONTH_NAMES[month - 1]} ${year}`}
            monthColour={MONTH_COLOURS[month - 1]}
            isCurrent={i === 0}
            services={services}
            initialServiceId={slotMap.get(`${year}-${month}`) ?? null}
          />
        ))}
      </ul>
    </div>
  );
}
