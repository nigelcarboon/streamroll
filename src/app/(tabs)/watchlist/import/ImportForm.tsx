"use client";

import { useMemo, useState, useTransition } from "react";
import { parsePaste } from "@/lib/paste";
import { importWatchlist } from "./actions";

type Service = { id: string; name: string };

export function ImportForm({ services }: { services: Service[] }) {
  const [text, setText] = useState("");
  // Per-line edits made in the preview, keyed by title.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [serviceOverride, setServiceOverride] = useState<
    Record<string, string>
  >({});
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const parsed = useMemo(() => parsePaste(text, services), [text, services]);
  const rows = parsed.map((row) => ({
    ...row,
    serviceId:
      row.title in serviceOverride
        ? serviceOverride[row.title] || null
        : row.serviceId,
    included: !excluded.has(row.title),
  }));
  const chosen = rows.filter((r) => r.included);
  const matched = chosen.filter((r) => r.serviceId).length;

  function toggle(title: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  function submit() {
    setFailed(false);
    startTransition(async () => {
      const result = await importWatchlist(
        chosen.map(({ title, serviceId, watched }) => ({
          title,
          serviceId,
          watched,
        }))
      );
      if (result && !result.ok) setFailed(true);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <label htmlFor="paste" className="sr-only">
        Your list
      </label>
      <textarea
        id="paste"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={"Paste your list here, one title per line.\n\nColin from Accounts (Binge)\nThe Bear - Disney+\nFisk"}
        className="w-full rounded-md border border-line bg-standby px-3 py-2.5 text-base text-paper outline-none placeholder:text-static focus:border-signal"
      />

      {rows.length > 0 && (
        <>
          <p className="data text-xs text-static">
            {chosen.length} to add · {matched} with a service
          </p>
          <ul>
            {rows.map((row) => (
              <li
                key={row.title}
                className="flex items-center gap-3 border-b border-line py-2.5"
              >
                <input
                  id={`row-${row.title}`}
                  type="checkbox"
                  checked={row.included}
                  onChange={() => toggle(row.title)}
                  aria-label={`Include ${row.title}`}
                  className="h-5 w-5 shrink-0 accent-signal"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-base ${
                      row.included ? "" : "text-static line-through"
                    }`}
                  >
                    {row.title}
                  </p>
                  {row.watched && (
                    <p className="data text-xs text-static">Already watched</p>
                  )}
                </div>
                <select
                  aria-label={`Service for ${row.title}`}
                  value={row.serviceId ?? ""}
                  disabled={!row.included}
                  onChange={(e) =>
                    setServiceOverride((prev) => ({
                      ...prev,
                      [row.title]: e.target.value,
                    }))
                  }
                  className={`w-32 shrink-0 rounded-md border border-line bg-ground px-2 py-1.5 text-sm disabled:opacity-40 ${
                    row.serviceId ? "text-paper" : "text-static"
                  }`}
                >
                  <option value="">No service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          {failed && (
            <p role="alert" className="text-sm text-renewal">
              That didn&apos;t save. Try again.
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={isPending || chosen.length === 0}
            className="rounded-md bg-signal px-4 py-3 text-base font-semibold text-ground disabled:opacity-50"
          >
            {isPending
              ? "Adding…"
              : `Add ${chosen.length} ${chosen.length === 1 ? "title" : "titles"}`}
          </button>
        </>
      )}
    </div>
  );
}
