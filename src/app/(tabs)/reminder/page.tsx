import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ServiceDot } from "@/components/ServiceDot";
import {
  MONTH_NAMES,
  changeovers,
  daysInMonth,
  getToday,
  monthIndex,
  shortMonth,
} from "@/lib/roster";

/** A changeover inside this many days is flagged in renewal amber. */
const CLOSE_DAYS = 7;

export default async function ReminderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: services }, { data: slots }, { data: unwatchedItems }] =
    await Promise.all([
      supabase.from("services").select("id, name, colour, is_free"),
      supabase
        .from("roster_slots")
        .select("month, year, service_id")
        .eq("user_id", user.id),
      supabase
        .from("watchlist_items")
        .select("id, title, matched_service_id")
        .eq("user_id", user.id)
        .eq("status", "unwatched")
        .order("added_at", { ascending: false }),
    ]);

  const today = getToday();
  const serviceById = new Map((services ?? []).map((s) => [s.id, s]));
  const name = (id: string | null) =>
    (id && serviceById.get(id)?.name) || null;

  const currentIndex = monthIndex(today.year, today.month);
  const currentSlot = (slots ?? []).find(
    (s) => monthIndex(s.year, s.month) === currentIndex
  );
  const current = currentSlot ? serviceById.get(currentSlot.service_id) : null;
  const upcoming = changeovers(slots ?? [], today);
  const next = upcoming[0];

  const leftOnCurrent = current
    ? (unwatchedItems ?? []).filter((i) => i.matched_service_id === current.id)
    : [];
  const lastDay = daysInMonth(today.year, today.month);
  const hasRoster = (slots ?? []).some(
    (s) => monthIndex(s.year, s.month) >= currentIndex
  );

  if (!hasRoster) {
    return (
      <div className="px-6 py-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Reminder
        </h1>
        <p className="mt-2 text-sm text-static">
          Nothing to remind you about yet.{" "}
          <Link href="/roster" className="text-paper underline">
            Plan a month on the roster
          </Link>{" "}
          and the changeover dates show up here.
        </p>
      </div>
    );
  }

  const close = next !== undefined && next.daysAway <= CLOSE_DAYS;

  return (
    <div className="px-6 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Reminder
      </h1>

      <section className="mt-6 rounded-md border border-line bg-standby p-5">
        <p className="data text-xs text-static">
          {MONTH_NAMES[today.month - 1]} {today.year}
        </p>
        {current ? (
          <>
            <p className="mt-2 flex items-center gap-2.5 font-display text-2xl font-bold">
              <ServiceDot colour={current.colour} size={12} />
              {current.name}
            </p>
            <p className="mt-2 text-sm text-static">
              On until {lastDay} {MONTH_NAMES[today.month - 1]}.{" "}
              {leftOnCurrent.length === 0
                ? "Nothing unwatched on your list."
                : `${leftOnCurrent.length} ${
                    leftOnCurrent.length === 1 ? "title" : "titles"
                  } unwatched.`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-base">No paid service this month.</p>
        )}
      </section>

      {next && (
        <section
          className={`mt-3 rounded-md border bg-standby p-5 ${
            close ? "border-renewal" : "border-line"
          }`}
        >
          <p className={`data text-xs ${close ? "text-renewal" : "text-static"}`}>
            Next change · {next.daysAway}{" "}
            {next.daysAway === 1 ? "day" : "days"}
          </p>
          <ol className="mt-3 flex flex-col gap-2 text-base">
            {next.fromServiceId && (
              <li>
                Cancel {name(next.fromServiceId)} before 1{" "}
                {MONTH_NAMES[next.month - 1]}.
              </li>
            )}
            {next.toServiceId && (
              <li>
                Start {name(next.toServiceId)} on 1{" "}
                {MONTH_NAMES[next.month - 1]}.
              </li>
            )}
          </ol>
          <p className="mt-3 text-xs text-static">
            Check each service&apos;s own billing date. Cancelling early usually
            keeps access until the paid period ends.
          </p>
        </section>
      )}

      {leftOnCurrent.length > 0 && current && (
        <section className="mt-8">
          <h2 className="data text-xs text-static">Left on {current.name}</h2>
          <ul className="mt-2">
            {leftOnCurrent.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="truncate border-b border-line py-2.5 text-base"
              >
                {item.title}
              </li>
            ))}
          </ul>
          {leftOnCurrent.length > 6 && (
            <Link
              href="/watchlist"
              className="mt-2 inline-block text-sm text-static underline"
            >
              {leftOnCurrent.length - 6} more on the watchlist
            </Link>
          )}
        </section>
      )}

      {upcoming.length > 1 && (
        <section className="mt-8">
          <h2 className="data text-xs text-static">After that</h2>
          <ul className="mt-2">
            {upcoming.slice(1).map((c) => (
              <li
                key={`${c.year}-${c.month}`}
                className="flex items-baseline gap-4 border-b border-line py-2.5"
              >
                <span className="data w-20 shrink-0 text-xs text-static">
                  1 {shortMonth(c.month)} {String(c.year).slice(2)}
                </span>
                <span className="text-base">
                  {name(c.fromServiceId) ?? "Nothing"}{" "}
                  <span className="text-static">→</span>{" "}
                  {name(c.toServiceId) ?? "Nothing"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs text-static">
        Email reminders aren&apos;t switched on yet. For now, the dates live
        here.
      </p>
    </div>
  );
}
