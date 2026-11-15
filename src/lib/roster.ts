/**
 * Roster date logic. The roster is planned in calendar months, and "today"
 * is taken in the launch region's time zone, not the server's (which runs
 * in UTC and would call the 1st of the month a day late for Australia).
 */
export const TIME_ZONE = "Australia/Sydney";

export const MONTH_NAMES = [
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
] as const;

/** Southern-hemisphere colour year from the identity work, one hue a month. */
export const MONTH_COLOURS = [
  "#2F6FB5",
  "#5B8BD0",
  "#4FA08B",
  "#1F6F5C",
  "#7A7A2E",
  "#E8552A",
  "#C1352B",
  "#8E3C63",
  "#6C4E9E",
  "#C98A2B",
  "#D9B23C",
  "#3F8FCB",
] as const;

export type Today = { year: number; month: number; day: number };
export type Slot = { month: number; year: number; service_id: string };

export function getToday(now: Date = new Date()): Today {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Months since year 0, so months can be compared and subtracted. */
export function monthIndex(year: number, month: number) {
  return year * 12 + (month - 1);
}

export function fromMonthIndex(index: number) {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The next `count` months starting with the current one. */
export function rollingMonths(today: Today, count = 12) {
  const start = monthIndex(today.year, today.month);
  return Array.from({ length: count }, (_, i) => fromMonthIndex(start + i));
}

/** Whole days from today until the 1st of the given month. */
export function daysUntilMonth(today: Today, year: number, month: number) {
  const from = Date.UTC(today.year, today.month - 1, today.day);
  const to = Date.UTC(year, month - 1, 1);
  return Math.round((to - from) / 86_400_000);
}

export function shortMonth(month: number) {
  return MONTH_NAMES[month - 1].slice(0, 3);
}

export type Availability =
  | { kind: "free" }
  | { kind: "now"; daysLeft: number }
  | { kind: "due"; year: number; month: number; monthsAway: number }
  | { kind: "unscheduled" }
  | { kind: "unmatched" };

/**
 * Where a watchlist title stands against the roster: on a free service,
 * on the service that is active this month, due in a later month, on a
 * service with no month planned, or not matched to a service at all.
 */
export function availabilityFor(
  service: { id: string; is_free: boolean } | undefined,
  slots: Slot[],
  today: Today
): Availability {
  if (!service) return { kind: "unmatched" };
  if (service.is_free) return { kind: "free" };

  const current = monthIndex(today.year, today.month);
  let best: number | null = null;
  for (const slot of slots) {
    if (slot.service_id !== service.id) continue;
    const index = monthIndex(slot.year, slot.month);
    if (index < current) continue;
    if (best === null || index < best) best = index;
  }

  if (best === null) return { kind: "unscheduled" };
  if (best === current) {
    return {
      kind: "now",
      daysLeft: daysInMonth(today.year, today.month) - today.day + 1,
    };
  }
  return { kind: "due", ...fromMonthIndex(best), monthsAway: best - current };
}

/** Sort key: watch-now first, then by how soon the title comes around. */
export function availabilityRank(a: Availability) {
  switch (a.kind) {
    case "now":
      return 0;
    case "free":
      return 1;
    case "due":
      return 1 + a.monthsAway;
    case "unscheduled":
      return 1000;
    case "unmatched":
      return 1001;
  }
}

export type Changeover = {
  year: number;
  month: number;
  fromServiceId: string | null;
  toServiceId: string | null;
  daysAway: number;
};

/** Every month in the window where the active service changes. */
export function changeovers(slots: Slot[], today: Today, count = 12) {
  const byIndex = new Map(
    slots.map((s) => [monthIndex(s.year, s.month), s.service_id])
  );
  const months = rollingMonths(today, count);
  const result: Changeover[] = [];
  for (let i = 1; i < months.length; i++) {
    const { year, month } = months[i];
    const prev = months[i - 1];
    const from = byIndex.get(monthIndex(prev.year, prev.month)) ?? null;
    const to = byIndex.get(monthIndex(year, month)) ?? null;
    if (from !== to) {
      result.push({
        year,
        month,
        fromServiceId: from,
        toServiceId: to,
        daysAway: daysUntilMonth(today, year, month),
      });
    }
  }
  return result;
}
