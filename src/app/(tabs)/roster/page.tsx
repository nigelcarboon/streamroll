import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RosterMonthRow } from "./RosterMonthRow";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function RosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const [{ data: userServiceRows }, { data: allServices }, { data: slots }] =
    await Promise.all([
      supabase.from("user_services").select("service_id").eq("user_id", user.id),
      supabase.from("services").select("id, name, colour"),
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

  if (services.length === 0) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-xl font-semibold">Roster</h1>
        <p className="mt-2 text-sm text-neutral-500">
          You haven&apos;t picked any services yet.{" "}
          <Link href="/onboarding" className="underline">
            Pick your services
          </Link>{" "}
          to start building your rotation.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold">Roster</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Pick which service is active each month.
      </p>
      <div className="mt-6">
        {months.map(({ month, year }) => (
          <RosterMonthRow
            key={`${year}-${month}`}
            month={month}
            year={year}
            label={`${MONTH_NAMES[month - 1]} ${year}`}
            services={services}
            initialServiceId={slotMap.get(`${year}-${month}`) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
