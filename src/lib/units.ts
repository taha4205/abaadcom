/** Area unit conversions used across abaad tools. Base unit = square foot. */
export const AREA_UNITS = {
  sqft: { label: "Square Feet", short: "sq ft", inSqft: 1 },
  sqyd: { label: "Square Yards (Gaz)", short: "sq yd", inSqft: 9 },
  sqm: { label: "Square Meters", short: "sq m", inSqft: 10.7639 },
  marla: { label: "Marla", short: "marla", inSqft: 225 },
  kanal: { label: "Kanal", short: "kanal", inSqft: 4500 },
  acre: { label: "Acre", short: "acre", inSqft: 43560 },
} as const;

export type AreaUnit = keyof typeof AREA_UNITS;

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  if (!Number.isFinite(value)) return 0;
  return (value * AREA_UNITS[from].inSqft) / AREA_UNITS[to].inSqft;
}

export function fmtNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
  return rounded.toLocaleString("en-PK", { maximumFractionDigits: digits });
}

/* ---------------- Construction cost (Karachi) ---------------- */

export type FinishTier = "basic" | "standard" | "premium";

/** Indicative Karachi construction rates, PKR per sq ft of covered area. */
export const CONSTRUCTION_RATES: Record<FinishTier, { label: string; grey: [number, number]; finish: [number, number]; note: string }> = {
  basic: {
    label: "Basic",
    grey: [1900, 2300],
    finish: [1700, 2100],
    note: "Standard bricks, local tiles, basic fittings — typical rental or budget build.",
  },
  standard: {
    label: "Standard",
    grey: [2300, 2800],
    finish: [2600, 3400],
    note: "Good quality tiles, wooden work, branded sanitary and wiring.",
  },
  premium: {
    label: "Premium",
    grey: [2800, 3500],
    finish: [4200, 6500],
    note: "Imported finishes, false ceilings, modular kitchen, designer bathrooms.",
  },
};

/** Typical covered area is ~ground+1 on 60-70% of the plot. */
export function coveredAreaSqft(plotSqft: number, floors: number, coverage = 0.7): number {
  return plotSqft * coverage * floors;
}

export function constructionEstimate(coveredSqft: number, tier: FinishTier) {
  const r = CONSTRUCTION_RATES[tier];
  return {
    greyLow: coveredSqft * r.grey[0],
    greyHigh: coveredSqft * r.grey[1],
    finishLow: coveredSqft * r.finish[0],
    finishHigh: coveredSqft * r.finish[1],
    totalLow: coveredSqft * (r.grey[0] + r.finish[0]),
    totalHigh: coveredSqft * (r.grey[1] + r.finish[1]),
  };
}

export function fmtPKRShort(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)} Lac`;
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}
