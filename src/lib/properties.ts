import { supabase } from "@/integrations/supabase/client";

export type Intent = "buy" | "rent";
export type Category = "flat" | "house" | "commercial" | "plot";

export type Property = {
  id: number | string;
  title: string;
  area: string;
  price: string;
  priceNum: number;
  intent: Intent;
  category: Category;
  beds: number;
  baths: number;
  size: number;
  featured: boolean;
  realtor: string;
  image: string;
  tier?: "Silver" | "Gold" | "Platinum";
  verified?: boolean;
  whatsapp?: string;
};

export const KARACHI_AREAS = [
  "Any area",
  "DHA Phase 1", "DHA Phase 2", "DHA Phase 5", "DHA Phase 6", "DHA Phase 8",
  "Clifton", "Bahadurabad", "PECHS", "Gulshan-e-Iqbal", "Gulistan-e-Johar",
  "North Nazimabad", "Bahria Town Karachi", "Malir", "Korangi", "Saddar", "Tariq Road",
];

const U = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;
const DUMMY_WA = "923001234567";

export const SEED_PROPERTIES: Property[] = [
  { id: 1, title: "Modern 3-Bed Apartment with Sea View", area: "Clifton Block 4", price: "PKR 3.2 Cr", priceNum: 32000000, intent: "buy", category: "flat", beds: 3, baths: 2, size: 200, featured: true, realtor: "Coastline Estates", image: U("photo-1545324418-cc1a3fa10c00"), tier: "Platinum", verified: true, whatsapp: "923001234567" },
  { id: 2, title: "Luxury 4-Bed Villa in DHA", area: "DHA Phase 6", price: "PKR 8.5 Cr", priceNum: 85000000, intent: "buy", category: "house", beds: 4, baths: 4, size: 500, featured: true, realtor: "Coastline Estates", image: U("photo-1600596542815-ffad4c1539a9"), tier: "Platinum", verified: true, whatsapp: "923001234567" },
  { id: 3, title: "2-Bed Flat for Rent — Ready to Move", area: "Gulistan-e-Johar Block 7", price: "PKR 55,000/mo", priceNum: 55000, intent: "rent", category: "flat", beds: 2, baths: 2, size: 120, featured: false, realtor: "Metro Homes", image: U("photo-1522708323590-d24dbb6b0267"), tier: "Silver", whatsapp: "923007654321" },
  { id: 4, title: "Studio Apartment Near University Road", area: "University Road", price: "PKR 28,000/mo", priceNum: 28000, intent: "rent", category: "flat", beds: 1, baths: 1, size: 60, featured: false, realtor: "Metro Homes", image: U("photo-1502672260266-1c1ef2d93688"), tier: "Silver", whatsapp: "923007654321" },
  { id: 5, title: "Brand New 3-Bed in Emaar Crescent Bay", area: "DHA Phase 8", price: "PKR 4.5 Cr", priceNum: 45000000, intent: "buy", category: "flat", beds: 3, baths: 3, size: 175, featured: true, realtor: "Skyline Realty", image: U("photo-1512917774080-9991f1c4c750"), tier: "Gold", verified: true, whatsapp: "923331234567" },
  { id: 6, title: "Commercial Shop — Prime Location Tariq Road", area: "Tariq Road", price: "PKR 1.2 Lac/mo", priceNum: 120000, intent: "rent", category: "commercial", beds: 0, baths: 1, size: 80, featured: true, realtor: "Skyline Realty", image: U("photo-1441986300917-64674bd600d8"), tier: "Gold", whatsapp: "923331234567" },
  { id: 7, title: "240 Sq Yd Residential Plot — Bahria Town", area: "Bahria Town Karachi", price: "PKR 1.8 Cr", priceNum: 18000000, intent: "buy", category: "plot", beds: 0, baths: 0, size: 240, featured: false, realtor: "Metro Homes", image: U("photo-1500382017468-9049fed747ef"), tier: "Silver", whatsapp: "923451234567" },
  { id: 8, title: "Spacious 5-Bed House — North Nazimabad", area: "North Nazimabad Block F", price: "PKR 3.8 Cr", priceNum: 38000000, intent: "buy", category: "house", beds: 5, baths: 4, size: 400, featured: true, realtor: "Skyline Realty", image: U("photo-1568605114967-8130f3a36994"), tier: "Gold", whatsapp: "923331234567" },
];

// Cached live listings from supabase (merged with seed on home page).
let liveListings: Property[] = [];
type Listener = () => void;
const listeners = new Set<Listener>();

export function getLiveListings() { return liveListings; }
export function subscribeListings(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; }

function rowToProperty(row: any): Property {
  return {
    id: row.id,
    title: row.title,
    area: row.area,
    price: row.price_text,
    priceNum: Number(row.price_num),
    intent: row.intent,
    category: row.category,
    beds: row.beds ?? 0,
    baths: row.baths ?? 0,
    size: row.size_sqyd ?? 0,
    featured: row.tier === "Platinum" || row.tier === "Gold",
    realtor: row.realtor?.agency_name ?? "abaad realtor",
    image: row.image_url || U("photo-1568605114967-8130f3a36994"),
    tier: row.tier,
    verified: !!row.verified,
    whatsapp: row.whatsapp_number || undefined,
  };
}

export async function fetchLiveListings(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, realtor:realtors!inner(agency_name, status)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    const filtered = data.filter((r: any) => r.realtor?.status === "approved");
    liveListings = filtered.map(rowToProperty);
    listeners.forEach((l) => l());
    return liveListings;
  } catch {
    return [];
  }
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function propertySlug(p: Pick<Property, "id" | "title">) {
  return `${slugify(p.title)}-${p.id}`;
}
export function getAllProperties(): Property[] {
  return [...liveListings, ...SEED_PROPERTIES];
}
export function findPropertyBySlug(slug: string): Property | undefined {
  const m = slug.match(/-([^-]+)$/);
  if (!m) return undefined;
  const id = m[1];
  return getAllProperties().find((p) => String(p.id) === id);
}

export const PACKAGES = [
  { tier: "Silver" as const, price: 50000, perks: ["1 active listing", "30-day visibility", "Standard placement"] },
  { tier: "Gold" as const, price: 75000, perks: ["3 active listings", "60-day visibility", "Featured badge", "AI listing assistant"] },
  { tier: "Platinum" as const, price: 125000, perks: ["10 active listings", "90-day visibility", "Top of search results", "Priority support", "AI listing assistant"] },
];

export function formatPKR(n: number, intent: Intent): string {
  if (intent === "rent") return `PKR ${n.toLocaleString("en-PK")}/mo`;
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(2)} Lac`;
  return `PKR ${n.toLocaleString("en-PK")}`;
}

// Backwards-compat shim (replaced in-memory listings store).
export function getListings(): Property[] { return liveListings; }
export function addListing(_p: Omit<Property, "id">) { /* now persisted via supabase in /list */ }
