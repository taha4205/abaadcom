import { supabase } from "@/integrations/supabase/client";

export type BoostTier = "hot" | "super_hot";

export type BoostPlan = {
  tier: BoostTier;
  label: string;
  price: number;
  days: number;
  blurb: string;
};

export const BOOST_PLANS: BoostPlan[] = [
  {
    tier: "hot",
    label: "Hot",
    price: 2500,
    days: 30,
    blurb: "Pinned to the top of its category and search results for 30 days.",
  },
  {
    tier: "super_hot",
    label: "Super Hot",
    price: 8000,
    days: 30,
    blurb: "Pinned to the top of the homepage AND the top of its category for 30 days.",
  },
];

export function boostPlan(tier?: string | null): BoostPlan | undefined {
  return BOOST_PLANS.find((p) => p.tier === tier);
}

export type BoostStatus = {
  active: boolean;
  tier: BoostTier | null;
  label: string | null;
  daysLeft: number;
  expiresAt: Date | null;
};

/** Boosts silently lapse once the expiry passes — no manual action needed. */
export function boostStatus(tier?: string | null, expiresAt?: string | null): BoostStatus {
  const plan = boostPlan(tier);
  const exp = expiresAt ? new Date(expiresAt) : null;
  const active = !!plan && !!exp && exp.getTime() > Date.now();
  const daysLeft = active && exp ? Math.max(1, Math.ceil((exp.getTime() - Date.now()) / 86400000)) : 0;
  return {
    active,
    tier: active ? (plan!.tier) : null,
    label: active ? plan!.label : null,
    daysLeft,
    expiresAt: exp,
  };
}

/** Higher wins: super hot 2, hot 1, none 0. Expired boosts rank 0. */
export function boostRank(tier?: string | null, expiresAt?: string | null): number {
  const s = boostStatus(tier, expiresAt);
  if (!s.active) return 0;
  return s.tier === "super_hot" ? 2 : 1;
}

/**
 * Mock checkout — same flow as the package tiers (no payment processor yet).
 * Sets the boost tier and a 30-day expiry on the listing.
 */
export async function purchaseBoost(listingId: string, tier: BoostTier): Promise<{ error?: string; expiresAt?: string }> {
  const plan = boostPlan(tier);
  if (!plan) return { error: "Unknown boost" };
  const expires = new Date(Date.now() + plan.days * 86400000).toISOString();
  const { error } = await supabase
    .from("listings")
    .update({
      boost_tier: tier,
      boost_expires_at: expires,
      boost_purchased_at: new Date().toISOString(),
    } as never)
    .eq("id", listingId);
  if (error) return { error: error.message };
  return { expiresAt: expires };
}

export async function cancelBoost(listingId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("listings")
    .update({ boost_tier: null, boost_expires_at: null } as never)
    .eq("id", listingId);
  return { error: error?.message };
}
