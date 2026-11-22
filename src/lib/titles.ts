/**
 * Loose title matching, so "S2 The Paper", "The Paper S2" and
 * "The Paper - Season 2" count as the same entry. Case, accents,
 * punctuation, a leading "The", a release year and where the season
 * marker sits are all ignored. The season number itself is kept, so
 * season 1 and season 2 of a show are related but not identical.
 */

const SEASON =
  /\b(?:s|season|series|seas\.?)\s*0*(\d{1,2})(?:\s*e\s*\d{1,3})?\b/i;
const YEAR = /[([]\s*(?:19|20)\d{2}\s*[)\]]/g;

export type TitleKey = {
  /** The show itself, ignoring season. */
  base: string;
  /** Season number if the title names one. */
  season: number | null;
  /** base plus season: equal keys mean the same entry. */
  key: string;
};

export function titleKey(title: string): TitleKey {
  let t = title.normalize("NFKD").replace(/[̀-ͯ]/g, "");

  let season: number | null = null;
  const match = t.match(SEASON);
  if (match) {
    season = Number(match[1]);
    t = t.replace(SEASON, " ");
  }

  t = t
    .replace(YEAR, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the /, "")
    .replace(/\s+/g, " ");

  return { base: t, season, key: `${t}#${season ?? ""}` };
}

export type DuplicateMatch =
  | { kind: "same"; existing: string }
  | { kind: "other-season"; existing: string };

/** Index existing titles so new ones can be checked quickly. */
export function duplicateIndex(existingTitles: string[]) {
  const byKey = new Map<string, string>();
  const byBase = new Map<string, string>();
  for (const title of existingTitles) {
    const { key, base } = titleKey(title);
    if (!base) continue;
    if (!byKey.has(key)) byKey.set(key, title);
    if (!byBase.has(base)) byBase.set(base, title);
  }

  return function find(title: string): DuplicateMatch | null {
    const { key, base } = titleKey(title);
    if (!base) return null;
    const same = byKey.get(key);
    if (same) return { kind: "same", existing: same };
    const related = byBase.get(base);
    if (related) return { kind: "other-season", existing: related };
    return null;
  };
}
