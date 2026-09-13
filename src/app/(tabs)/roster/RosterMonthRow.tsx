"use client";

import { useState, useTransition } from "react";
import { setRosterSlot } from "./actions";

type Service = { id: string; name: string; colour: string };

export function RosterMonthRow({
  month,
  year,
  label,
  services,
  initialServiceId,
}: {
  month: number;
  year: number;
  label: string;
  services: Service[];
  initialServiceId: string | null;
}) {
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setServiceId(value);
    startTransition(() => {
      setRosterSlot(month, year, value || null);
    });
  }

  const selected = services.find((s) => s.id === serviceId);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-3">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: selected?.colour ?? "transparent" }}
          aria-hidden
        />
        <span className="text-base">{label}</span>
      </div>
      <select
        value={serviceId}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
      >
        <option value="">—</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
