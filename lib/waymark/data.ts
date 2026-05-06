"use client";

export const WAYMARK_EXPERIENCES_KEY = "waymark_experiences";

export interface Experience {
  id: string;
  country: string;
  imageCid: string;
  text: string;
  date: string;
  txHash?: string;
}

export interface MemoryEntry extends Experience {
  countryId: string;
}

export interface CountrySummary {
  countryId: string;
  country: string;
  memories: Experience[];
  firstDate: string;
  latestDate: string;
  topMemory?: Experience;
  meta: CountryMeta;
}

export interface CountryMeta {
  region: string;
  subregion: string;
  flagCode: string;
  displayName?: string;
}

export interface Badge {
  id: string;
  label: string;
  detail: string;
  earned: boolean;
  progress: number;
}

export interface TravelStats {
  countryCount: number;
  regionCount: number;
  memoryCount: number;
  proofCount: number;
  streakDays: number;
  rareCount: number;
  score: number;
}

const FALLBACK_META: CountryMeta = {
  region: "World",
  subregion: "Unmapped",
  flagCode: "WM",
};

const COUNTRY_META: Record<string, CountryMeta> = {
  "albania": { region: "Europe", subregion: "Balkans", flagCode: "AL" },
  "bosnia and herz.": { region: "Europe", subregion: "Balkans", flagCode: "BA", displayName: "Bosnia and Herzegovina" },
  "bulgaria": { region: "Europe", subregion: "Balkans", flagCode: "BG" },
  "croatia": { region: "Europe", subregion: "Balkans", flagCode: "HR" },
  "greece": { region: "Europe", subregion: "Balkans", flagCode: "GR" },
  "kosovo": { region: "Europe", subregion: "Balkans", flagCode: "XK" },
  "macedonia": { region: "Europe", subregion: "Balkans", flagCode: "MK", displayName: "North Macedonia" },
  "montenegro": { region: "Europe", subregion: "Balkans", flagCode: "ME" },
  "romania": { region: "Europe", subregion: "Balkans", flagCode: "RO" },
  "serbia": { region: "Europe", subregion: "Balkans", flagCode: "RS" },
  "slovenia": { region: "Europe", subregion: "Balkans", flagCode: "SI" },
  "benin": { region: "Africa", subregion: "West Africa", flagCode: "BJ" },
  "burkina faso": { region: "Africa", subregion: "West Africa", flagCode: "BF" },
  "cote d'ivoire": { region: "Africa", subregion: "West Africa", flagCode: "CI", displayName: "Cote d'Ivoire" },
  "cã´te d'ivoire": { region: "Africa", subregion: "West Africa", flagCode: "CI", displayName: "Cote d'Ivoire" },
  "gambia": { region: "Africa", subregion: "West Africa", flagCode: "GM" },
  "ghana": { region: "Africa", subregion: "West Africa", flagCode: "GH" },
  "guinea": { region: "Africa", subregion: "West Africa", flagCode: "GN" },
  "guinea-bissau": { region: "Africa", subregion: "West Africa", flagCode: "GW" },
  "liberia": { region: "Africa", subregion: "West Africa", flagCode: "LR" },
  "mali": { region: "Africa", subregion: "West Africa", flagCode: "ML" },
  "mauritania": { region: "Africa", subregion: "West Africa", flagCode: "MR" },
  "niger": { region: "Africa", subregion: "West Africa", flagCode: "NE" },
  "nigeria": { region: "Africa", subregion: "West Africa", flagCode: "NG" },
  "senegal": { region: "Africa", subregion: "West Africa", flagCode: "SN" },
  "sierra leone": { region: "Africa", subregion: "West Africa", flagCode: "SL" },
  "togo": { region: "Africa", subregion: "West Africa", flagCode: "TG" },
  "denmark": { region: "Europe", subregion: "Nordic", flagCode: "DK" },
  "finland": { region: "Europe", subregion: "Nordic", flagCode: "FI" },
  "iceland": { region: "Europe", subregion: "Nordic", flagCode: "IS" },
  "norway": { region: "Europe", subregion: "Nordic", flagCode: "NO" },
  "sweden": { region: "Europe", subregion: "Nordic", flagCode: "SE" },
  "united states of america": { region: "North America", subregion: "Northern America", flagCode: "US", displayName: "United States" },
  "canada": { region: "North America", subregion: "Northern America", flagCode: "CA" },
  "mexico": { region: "North America", subregion: "Central America", flagCode: "MX" },
  "brazil": { region: "South America", subregion: "South America", flagCode: "BR" },
  "argentina": { region: "South America", subregion: "South America", flagCode: "AR" },
  "chile": { region: "South America", subregion: "South America", flagCode: "CL" },
  "peru": { region: "South America", subregion: "South America", flagCode: "PE" },
  "colombia": { region: "South America", subregion: "South America", flagCode: "CO" },
  "france": { region: "Europe", subregion: "Western Europe", flagCode: "FR" },
  "germany": { region: "Europe", subregion: "Western Europe", flagCode: "DE" },
  "italy": { region: "Europe", subregion: "Southern Europe", flagCode: "IT" },
  "spain": { region: "Europe", subregion: "Southern Europe", flagCode: "ES" },
  "portugal": { region: "Europe", subregion: "Southern Europe", flagCode: "PT" },
  "united kingdom": { region: "Europe", subregion: "Western Europe", flagCode: "GB" },
  "ireland": { region: "Europe", subregion: "Western Europe", flagCode: "IE" },
  "netherlands": { region: "Europe", subregion: "Western Europe", flagCode: "NL" },
  "belgium": { region: "Europe", subregion: "Western Europe", flagCode: "BE" },
  "switzerland": { region: "Europe", subregion: "Western Europe", flagCode: "CH" },
  "austria": { region: "Europe", subregion: "Central Europe", flagCode: "AT" },
  "czechia": { region: "Europe", subregion: "Central Europe", flagCode: "CZ" },
  "poland": { region: "Europe", subregion: "Central Europe", flagCode: "PL" },
  "japan": { region: "Asia", subregion: "East Asia", flagCode: "JP" },
  "china": { region: "Asia", subregion: "East Asia", flagCode: "CN" },
  "south korea": { region: "Asia", subregion: "East Asia", flagCode: "KR" },
  "india": { region: "Asia", subregion: "South Asia", flagCode: "IN" },
  "thailand": { region: "Asia", subregion: "Southeast Asia", flagCode: "TH" },
  "vietnam": { region: "Asia", subregion: "Southeast Asia", flagCode: "VN" },
  "indonesia": { region: "Asia", subregion: "Southeast Asia", flagCode: "ID" },
  "australia": { region: "Oceania", subregion: "Australia and New Zealand", flagCode: "AU" },
  "new zealand": { region: "Oceania", subregion: "Australia and New Zealand", flagCode: "NZ" },
  "south africa": { region: "Africa", subregion: "Southern Africa", flagCode: "ZA" },
  "kenya": { region: "Africa", subregion: "East Africa", flagCode: "KE" },
  "tanzania": { region: "Africa", subregion: "East Africa", flagCode: "TZ" },
  "morocco": { region: "Africa", subregion: "North Africa", flagCode: "MA" },
  "egypt": { region: "Africa", subregion: "North Africa", flagCode: "EG" },
};

const SUBREGION_TARGETS: Record<string, string[]> = {
  "Balkans": ["Albania", "Bosnia and Herz.", "Bulgaria", "Croatia", "Greece", "Kosovo", "Macedonia", "Montenegro", "Romania", "Serbia", "Slovenia"],
  "West Africa": ["Benin", "Burkina Faso", "Cote d'Ivoire", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Mauritania", "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo"],
  "Nordic": ["Denmark", "Finland", "Iceland", "Norway", "Sweden"],
};

const RARE_COUNTRIES = new Set([
  "Fiji",
  "Iceland",
  "Mongolia",
  "Namibia",
  "Papua New Guinea",
  "Timor-Leste",
  "Vanuatu",
]);

export function normalizeCountryName(country: string) {
  return country.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getCountryMeta(country: string): CountryMeta {
  const normalized = normalizeCountryName(country);
  const meta = COUNTRY_META[normalized];
  if (meta) return meta;

  const letters = country.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
  return { ...FALLBACK_META, flagCode: letters || FALLBACK_META.flagCode };
}

export function getDisplayCountryName(country: string) {
  return getCountryMeta(country).displayName || country;
}

export function loadExperiences(): Record<string, Experience[]> {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(WAYMARK_EXPERIENCES_KEY);
    if (!saved) return {};
    return JSON.parse(saved) as Record<string, Experience[]>;
  } catch {
    return {};
  }
}

export function flattenExperiences(records: Record<string, Experience[]>): MemoryEntry[] {
  return Object.entries(records)
    .flatMap(([countryId, memories]) => memories.map((memory) => ({ ...memory, countryId })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function summarizeCountries(records: Record<string, Experience[]>): CountrySummary[] {
  return Object.entries(records)
    .filter(([, memories]) => memories.length > 0)
    .map(([countryId, memories]) => {
      const sorted = [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const latest = sorted[sorted.length - 1];
      const country = latest?.country || sorted[0]?.country || countryId;

      return {
        countryId,
        country: getDisplayCountryName(country),
        memories: sorted,
        firstDate: sorted[0]?.date || "",
        latestDate: latest?.date || "",
        topMemory: latest,
        meta: getCountryMeta(country),
      };
    })
    .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
}

export function calculateStreakDays(memories: MemoryEntry[]) {
  const dates = Array.from(new Set(memories.map((memory) => memory.date).filter(Boolean))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (!dates.length) return 0;

  let streak = 1;
  let previous = new Date(dates[0]);
  for (let index = 1; index < dates.length; index++) {
    const current = new Date(dates[index]);
    const diffDays = Math.round((previous.getTime() - current.getTime()) / 86_400_000);
    if (diffDays === 1) {
      streak += 1;
      previous = current;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
}

export function calculateTravelStats(summaries: CountrySummary[], memories: MemoryEntry[]): TravelStats {
  const regions = new Set(summaries.map((summary) => summary.meta.region));
  const rareCount = summaries.filter((summary) => RARE_COUNTRIES.has(summary.country)).length;
  const proofCount = memories.filter((memory) => memory.txHash).length;
  const streakDays = calculateStreakDays(memories);
  const score = summaries.length * 140 + regions.size * 90 + memories.length * 25 + proofCount * 35 + rareCount * 80 + streakDays * 15;

  return {
    countryCount: summaries.length,
    regionCount: regions.size,
    memoryCount: memories.length,
    proofCount,
    streakDays,
    rareCount,
    score,
  };
}

export function getCompletionBadges(summaries: CountrySummary[]): Badge[] {
  const countries = new Set(summaries.map((summary) => normalizeCountryName(summary.country)));

  return Object.entries(SUBREGION_TARGETS).map(([subregion, targets]) => {
    const visited = targets.filter((target) => countries.has(normalizeCountryName(getDisplayCountryName(target))) || countries.has(normalizeCountryName(target)));
    return {
      id: subregion.toLowerCase().replace(/\s+/g, "-"),
      label: `${subregion} Pathfinder`,
      detail: `${visited.length}/${targets.length} countries`,
      earned: visited.length === targets.length,
      progress: visited.length / targets.length,
    };
  });
}

export function getSeasonalBadges(memories: MemoryEntry[]): Badge[] {
  const summer2026Count = memories.filter((memory) => {
    const date = new Date(memory.date);
    return date.getFullYear() === 2026 && date.getMonth() >= 5 && date.getMonth() <= 7;
  }).length;

  return [
    {
      id: "summer-2026",
      label: "Summer 2026 Explorer",
      detail: `${summer2026Count} summer memories`,
      earned: summer2026Count > 0,
      progress: Math.min(summer2026Count / 3, 1),
    },
    {
      id: "first-proof",
      label: "Proof Keeper",
      detail: `${memories.filter((memory) => memory.txHash).length} archived proofs`,
      earned: memories.some((memory) => memory.txHash),
      progress: memories.some((memory) => memory.txHash) ? 1 : 0,
    },
  ];
}

export function getAptosExplorerUrl(txHash?: string) {
  if (!txHash) return "";
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=shelbynet`;
}

export function compactHash(hash?: string, start = 8, end = 6) {
  if (!hash) return "No transaction";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}
