/**
 * Indicative Karachi per-sq-yd asking-price benchmarks collected from public
 * portal listing data (Zameen area pages) during our earlier price survey.
 * Sale prices in PKR per sq yd of plot/land area. Treat as a coarse reference
 * band, not a valuation.
 */
export type AreaBenchmark = { area: string; low: number; high: number };

export const AREA_BENCHMARKS: AreaBenchmark[] = [
  { area: "DHA Phase 1", low: 200000, high: 320000 },
  { area: "DHA Phase 2", low: 210000, high: 330000 },
  { area: "DHA Phase 5", low: 320000, high: 520000 },
  { area: "DHA Phase 6", low: 300000, high: 480000 },
  { area: "DHA Phase 8", low: 260000, high: 460000 },
  { area: "Clifton", low: 300000, high: 550000 },
  { area: "Bahadurabad", low: 220000, high: 340000 },
  { area: "PECHS", low: 210000, high: 330000 },
  { area: "Gulshan-e-Iqbal", low: 130000, high: 220000 },
  { area: "Gulistan-e-Johar", low: 110000, high: 190000 },
  { area: "North Nazimabad", low: 130000, high: 220000 },
  { area: "Nazimabad", low: 110000, high: 180000 },
  { area: "Bahria Town Karachi", low: 55000, high: 110000 },
  { area: "Scheme 33", low: 45000, high: 95000 },
  { area: "Federal B Area", low: 100000, high: 170000 },
  { area: "Malir", low: 45000, high: 95000 },
  { area: "Malir Cantonment", low: 70000, high: 130000 },
  { area: "Korangi", low: 55000, high: 100000 },
  { area: "Shah Faisal Colony", low: 60000, high: 110000 },
  { area: "Surjani Town", low: 25000, high: 55000 },
  { area: "Saddar", low: 150000, high: 280000 },
  { area: "Tariq Road", low: 250000, high: 420000 },
  { area: "University Road", low: 120000, high: 210000 },
];

export function benchmarkFor(area: string): AreaBenchmark | undefined {
  return AREA_BENCHMARKS.find((b) => b.area.toLowerCase() === area.trim().toLowerCase());
}
