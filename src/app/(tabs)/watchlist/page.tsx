import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ServiceDot } from "@/components/ServiceDot";
import {
  type Availability,
  availabilityFor,
  availabilityRank,
  getToday,
  shortMonth,
} from "@/lib/roster";
import {
  addWatchlistItem,
  removeWatchlistItem,
  setWatchlistStatus,
} from "./actions";

function AvailabilityTag({ availability }: { availability: Availability }) {
  switch (availability.kind) {
    case "now": {
      const closing = availability.daysLeft <= 7;
      return (
        <span className={closing ? "text-renewal" : "text-signal"}>
          On now · {availability.daysLeft}{" "}
          {availability.daysLeft === 1 ? "day" : "days"} left
        </span>
      );
    }
    case "free":
      return <span className="text-paper">Free now</span>;
    case "due":
      return (
        <span>
          Due {shortMonth(availability.month)} {availability.year}
        </span>
      );
    case "unscheduled":
      return <span>Not on the roster</span>;
    case "unmatched":
      return <span>No service set</span>;
  }
}

export default async function WatchlistPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; skipped?: string }>;
}) {
  const params = await searchParams;
  const added = Number.parseInt(params.added ?? "", 10);
  const skipped = Number.parseInt(params.skipped ?? "", 10) || 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: services }, { data: items }, { data: slots }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id, name, colour, is_free")
        .order("name"),
      supabase
        .from("watchlist_items")
        .select("id, title, matched_service_id, status")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false }),
      supabase
        .from("roster_slots")
        .select("month, year, service_id")
        .eq("user_id", user.id),
    ]);

  const today = getToday();
  const serviceById = new Map((services ?? []).map((s) => [s.id, s]));

  const rows = (items ?? []).map((item) => {
    const service = item.matched_service_id
      ? serviceById.get(item.matched_service_id)
      : undefined;
    return {
      item,
      service,
      availability: availabilityFor(service, slots ?? [], today),
    };
  });
  type RowData = (typeof rows)[number];

  // Unwatched: what can be watched soonest comes first. Sort is stable,
  // so newest-added stays first within a group.
  const unwatched = rows
    .filter((r) => r.item.status === "unwatched")
    .sort(
      (a, b) =>
        availabilityRank(a.availability) - availabilityRank(b.availability)
    );
  const watched = rows.filter((r) => r.item.status === "watched");

  function Row({ item, service, availability }: RowData) {
    const isWatched = item.status === "watched";

    return (
      <li className="flex items-center gap-3 border-b border-line py-3">
        <form
          action={setWatchlistStatus.bind(
            null,
            item.id,
            isWatched ? "unwatched" : "watched"
          )}
        >
          <button
            type="submit"
            aria-label={
              isWatched
                ? `Mark ${item.title} as unwatched`
                : `Mark ${item.title} as watched`
            }
            className="-m-2 p-2"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                isWatched
                  ? "border-static bg-static text-ground"
                  : "border-static"
              }`}
            >
              {isWatched ? "✓" : ""}
            </span>
          </button>
        </form>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-base ${
              isWatched ? "text-static line-through" : ""
            }`}
          >
            {item.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-static">
            {service && (
              <span className="flex items-center gap-1.5">
                <ServiceDot colour={service.colour} size={8} />
                {service.name}
              </span>
            )}
            {!isWatched && (
              <span className="data">
                <AvailabilityTag availability={availability} />
              </span>
            )}
          </p>
        </div>
        <form action={removeWatchlistItem.bind(null, item.id)}>
          <button
            type="submit"
            aria-label={`Remove ${item.title}`}
            className="-m-1 p-3 text-lg leading-none text-static"
          >
            ×
          </button>
        </form>
      </li>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Watchlist
        </h1>
        <Link href="/watchlist/import" className="text-sm text-paper underline">
          Paste a list
        </Link>
      </div>

      {Number.isFinite(added) && (
        <p role="status" className="data mt-3 text-xs text-signal">
          Added {added}
          {skipped > 0 && ` · ${skipped} already on the list`}
        </p>
      )}

      <form action={addWatchlistItem} className="mt-4 flex flex-col gap-2">
        <label htmlFor="title" className="sr-only">
          Title
        </label>
        <input
          id="title"
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="Add a show or film"
          className="rounded-md border border-line bg-standby px-3 py-2.5 text-base text-paper outline-none placeholder:text-static focus:border-signal"
        />
        <div className="flex gap-2">
          <select
            name="service_id"
            aria-label="Service"
            defaultValue=""
            className="min-w-0 flex-1 rounded-md border border-line bg-standby px-2 py-2.5 text-base text-paper"
          >
            <option value="">Which service? (optional)</option>
            {(services ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-signal px-5 py-2.5 text-base font-semibold text-ground"
          >
            Add
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-static">
          Nothing here yet. Add the first thing you want to watch.
        </p>
      ) : (
        <>
          <ul className="mt-6">
            {unwatched.map((row) => (
              <Row key={row.item.id} {...row} />
            ))}
          </ul>
          {watched.length > 0 && (
            <>
              <p className="data mt-8 text-xs text-static">
                Watched · {watched.length}
              </p>
              <ul className="mt-2">
                {watched.map((row) => (
                  <Row key={row.item.id} {...row} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
