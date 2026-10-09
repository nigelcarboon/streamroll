import { createClient } from "@/lib/supabase/server";
import {
  addWatchlistItem,
  removeWatchlistItem,
  setWatchlistStatus,
} from "./actions";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: services }, { data: items }] = await Promise.all([
    supabase.from("services").select("id, name, colour").order("name"),
    supabase
      .from("watchlist_items")
      .select("id, title, matched_service_id, status")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false }),
  ]);

  const serviceById = new Map((services ?? []).map((s) => [s.id, s]));
  const unwatched = (items ?? []).filter((i) => i.status === "unwatched");
  const watched = (items ?? []).filter((i) => i.status === "watched");

  function Row({ item }: { item: NonNullable<typeof items>[number] }) {
    const service = item.matched_service_id
      ? serviceById.get(item.matched_service_id)
      : undefined;
    const isWatched = item.status === "watched";

    return (
      <li className="flex items-center gap-3 border-b border-neutral-100 py-3">
        <form
          action={setWatchlistStatus.bind(
            null,
            item.id,
            isWatched ? "unwatched" : "watched"
          )}
        >
          <button
            type="submit"
            aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
              isWatched
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300"
            }`}
          >
            {isWatched ? "✓" : ""}
          </button>
        </form>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-base ${
              isWatched ? "text-neutral-400 line-through" : ""
            }`}
          >
            {item.title}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            {service ? (
              <>
                <span
                  className="h-2 w-2 rounded-full border border-neutral-200"
                  style={{ backgroundColor: service.colour }}
                  aria-hidden
                />
                {service.name}
              </>
            ) : (
              "No service set"
            )}
          </p>
        </div>
        <form action={removeWatchlistItem.bind(null, item.id)}>
          <button
            type="submit"
            aria-label="Remove"
            className="px-2 text-lg text-neutral-300"
          >
            ×
          </button>
        </form>
      </li>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold">Watchlist</h1>

      <form action={addWatchlistItem} className="mt-4 flex flex-col gap-2">
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="Add a show or film"
          className="rounded-md border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
        />
        <div className="flex gap-2">
          <select
            name="service_id"
            defaultValue=""
            className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm"
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
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>
      </form>

      {(items ?? []).length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          Nothing here yet. Add the first thing you want to watch.
        </p>
      ) : (
        <>
          <ul className="mt-6">
            {unwatched.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
          {watched.length > 0 && (
            <>
              <p className="mt-8 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Watched
              </p>
              <ul className="mt-2">
                {watched.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
