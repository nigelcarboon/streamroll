"use client";

import { useState, useTransition } from "react";
import { ServiceDot } from "@/components/ServiceDot";
import { setRosterSlot } from "./actions";

type Service = { id: string; name: string; colour: string };

export function RosterMonthRow({
  month,
  year,
  label,
  monthColour,
  isCurrent,
  services,
  initialServiceId,
}: {
  month: number;
  year: number;
  label: string;
  monthColour: string;
  isCurrent: boolean;
  services: Service[];
  initialServiceId: string | null;
}) {
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const previous = serviceId;
    const value = e.target.value;
    setServiceId(value);
    setFailed(false);
    startTransition(async () => {
      const { ok } = await setRosterSlot(month, year, value || null);
      if (!ok) {
        setServiceId(previous);
        setFailed(true);
      }
    });
  }

  const selected = services.find((s) => s.id === serviceId);

  return (
    <li
      className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-md border bg-standby py-3 pr-3 pl-5 ${
        isCurrent ? "border-signal" : "border-line"
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: monthColour }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-base">
          {label}
          {isCurrent && <span className="data text-xs text-signal">Now</span>}
        </p>
        {failed && (
          <p role="alert" className="text-xs text-renewal">
            Didn&apos;t save. Try again.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ServiceDot colour={selected?.colour} />
        <select
          aria-label={`Service for ${label}`}
          value={serviceId}
          onChange={handleChange}
          disabled={isPending}
          className={`max-w-40 rounded-md border border-line bg-ground px-2 py-2 text-base disabled:opacity-50 ${
            selected ? "text-paper" : "text-static"
          }`}
        >
          <option value="">Nothing</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
