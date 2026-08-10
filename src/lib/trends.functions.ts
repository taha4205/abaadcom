import { createServerFn } from "@tanstack/react-start";

export type AreaTrend = {
  area: string;
  activeListings: number;
  avgPrice: number;
  recentAvgPrice: number | null;
  olderAvgPrice: number | null;
  priceChangePct: number | null;
  views: number;
  recentListings: number;
  olderListings: number;
  interestChangePct: number | null;
};

/**
 * Market trends from our own first-party data only.
 * Google Trends (429) and Zameen.com (404) are not usable from this runtime,
 * so area interest is derived from our listing_views + listing volume, and
 * price trends from our own listings table (sale listings only).
 */
export const getAreaTrends = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.rpc("area_trends");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    area: string;
    active_listings: number;
    avg_price: number | null;
    recent_avg_price: number | null;
    older_avg_price: number | null;
    recent_listings: number;
    older_listings: number;
    views: number;
  }>;

  const trends: AreaTrend[] = rows.map((r) => {
    const recent = r.recent_avg_price === null ? null : Number(r.recent_avg_price);
    const older = r.older_avg_price === null ? null : Number(r.older_avg_price);
    const priceChangePct = recent !== null && older !== null && older > 0
      ? ((recent - older) / older) * 100
      : null;
    const recentListings = Number(r.recent_listings ?? 0);
    const olderListings = Number(r.older_listings ?? 0);
    const interestChangePct = olderListings > 0
      ? ((recentListings - olderListings) / olderListings) * 100
      : recentListings > 0
        ? 100
        : null;
    return {
      area: r.area,
      activeListings: Number(r.active_listings ?? 0),
      avgPrice: Number(r.avg_price ?? 0),
      recentAvgPrice: recent,
      olderAvgPrice: older,
      priceChangePct,
      views: Number(r.views ?? 0),
      recentListings,
      olderListings,
      interestChangePct,
    };
  });

  return { trends, source: "first-party" as const };
});
