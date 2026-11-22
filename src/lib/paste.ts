/**
 * Smart-paste: turn a pasted block of text (Apple Notes, a message, a
 * spreadsheet column) into watchlist entries. No content database yet,
 * so this only reads what is on the page: one title per line, with any
 * service the line or a heading above it names.
 */

export type PasteService = { id: string; name: string };

export type ParsedLine = {
  title: string;
  serviceId: string | null;
  watched: boolean;
};

/** Other names people write for each service, keyed by its real name. */
const ALIASES: Record<string, string[]> = {
  Netflix: ["netflix"],
  Stan: ["stan", "stan."],
  "Disney+": ["disney+", "disney plus", "disney", "disneyplus"],
  "Prime Video": ["prime video", "prime", "amazon prime", "amazon", "amazon prime video"],
  "Apple TV+": ["apple tv+", "apple tv plus", "apple tv", "appletv+", "appletv", "apple"],
  "HBO Max": ["hbo max", "hbo", "max"],
  Binge: ["binge"],
  "Paramount+": ["paramount+", "paramount plus", "paramount"],
  "ABC iview": ["abc iview", "iview", "abc"],
  "SBS On Demand": ["sbs on demand", "sbs"],
  "10 Play": ["10 play", "10play", "ten play", "tenplay", "channel 10", "10"],
};

const MAX_LINES = 500;
const MAX_TITLE = 200;

const CHECKED = /^\s*(?:[-*•◦‣·–—]\s*)?(?:\[[xX✓✔]\]|[☑✅✓✔])\s*/;
const UNCHECKED = /^\s*(?:[-*•◦‣·–—]\s*)?(?:\[\s?\]|[☐⬜○◯])\s*/;
const BULLET = /^\s*(?:[-*•◦‣·–—]+|\d{1,3}[.)])\s+/;

function buildLookup(services: PasteService[]) {
  const lookup = new Map<string, string>();
  for (const service of services) {
    lookup.set(service.name.toLowerCase(), service.id);
    for (const alias of ALIASES[service.name] ?? []) {
      if (!lookup.has(alias)) lookup.set(alias, service.id);
    }
  }
  return lookup;
}

/**
 * Pull a service off the end or start of a line when it is clearly set
 * apart: "Title - Netflix", "Title (Stan)", "Title [Binge]",
 * "Title on Netflix", "Title | SBS", "Netflix: Title".
 */
function splitService(line: string, lookup: Map<string, string>) {
  const find = (s: string) => lookup.get(s.trim().toLowerCase()) ?? null;

  const bracket = line.match(/^(.*\S)\s*[([{]([^)\]}]+)[)\]}]\s*$/);
  if (bracket) {
    const id = find(bracket[2]);
    if (id) return { title: bracket[1], serviceId: id };
  }

  const trailing = line.match(/^(.*\S)\s+(?:[-–—|/,@]|on)\s+(.+)$/i);
  if (trailing) {
    const id = find(trailing[2]);
    if (id) return { title: trailing[1], serviceId: id };
  }

  const leading = line.match(/^([^:–—|]{2,20})\s*[:–—|]\s+(.+)$/);
  if (leading) {
    const id = find(leading[1]);
    if (id) return { title: leading[2], serviceId: id };
  }

  return { title: line, serviceId: null };
}

export function parsePaste(
  text: string,
  services: PasteService[],
  defaultServiceId: string | null = null
): ParsedLine[] {
  const lookup = buildLookup(services);
  const seen = new Set<string>();
  const result: ParsedLine[] = [];
  // A line that is just a service name ("Netflix" or "Stan:") is a
  // heading: it applies to the lines under it until the next heading.
  // A blank line after the heading's titles ends it.
  let headingServiceId: string | null = null;
  let titlesUnderHeading = 0;

  for (const raw of text.split(/\r?\n/).slice(0, MAX_LINES * 2)) {
    let line = raw.replace(/\s+/g, " ").trim();
    if (!line) {
      if (titlesUnderHeading > 0) headingServiceId = null;
      continue;
    }

    let watched = false;
    if (CHECKED.test(line)) {
      watched = true;
      line = line.replace(CHECKED, "");
    } else if (UNCHECKED.test(line)) {
      line = line.replace(UNCHECKED, "");
    } else {
      line = line.replace(BULLET, "");
    }
    line = line.trim();
    if (!line) continue;

    const heading = lookup.get(line.replace(/[:\s]+$/, "").toLowerCase());
    if (heading) {
      headingServiceId = heading;
      titlesUnderHeading = 0;
      continue;
    }

    const { title: rawTitle, serviceId } = splitService(line, lookup);
    const title = rawTitle.trim().slice(0, MAX_TITLE);
    if (!title) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (headingServiceId) titlesUnderHeading++;

    result.push({
      title,
      serviceId: serviceId ?? headingServiceId ?? defaultServiceId,
      watched,
    });
    if (result.length >= MAX_LINES) break;
  }

  return result;
}
