export type PackageTier = "Starter" | "Growth" | "Pro" | "Silver" | "Gold" | "Platinum";

/** Every realtor — individual or agency, any tier — gets these free listing slots. */
export const FREE_SLOTS = 2;

/** Paid listing capacity per package tier (excludes the 2 free slots). */
export const TIER_CAPS: Record<PackageTier, number> = {
  Starter: 3,
  Growth: 5,
  Pro: 7,
  // Agency tiers all share a flat 75-listing cap.
  Silver: 75,
  Gold: 75,
  Platinum: 75,
};

export const AGENCY_TIERS: PackageTier[] = ["Silver", "Gold", "Platinum"];
export const AGENCY_LISTING_CAP = 75;

export function paidCap(tier?: string | null): number {
  return TIER_CAPS[(tier as PackageTier) ?? "Starter"] ?? 0;
}

/** Total listings a realtor may publish: paid cap + free slots. */
export function totalAllowance(tier?: string | null): number {
  return paidCap(tier) + FREE_SLOTS;
}

export function freeSlotsUsed(listingCount: number): number {
  return Math.min(listingCount, FREE_SLOTS);
}
