export type Intent = "buy" | "rent";
export type Category = "flat" | "house" | "commercial" | "plot";

export type Property = {
  id: number;
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
};

export const KARACHI_AREAS = [
  "Any area",
  "DHA Phase 1", "DHA Phase 2", "DHA Phase 5", "DHA Phase 6", "DHA Phase 8",
  "Clifton", "Bahadurabad", "PECHS", "Gulshan-e-Iqbal", "Gulistan-e-Johar",
  "North Nazimabad", "Bahria Town Karachi", "Malir", "Korangi", "Saddar", "Tariq Road",
];

const U = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

export const SEED_PROPERTIES: Property[] = [
  { id: 1, title: "Modern 3-Bed Apartment with Sea View", area: "Clifton", price: "PKR 4.85 Cr", priceNum: 48500000, intent: "buy", category: "flat", beds: 3, baths: 3, size: 2200, featured: true, realtor: "Skyline Realty", image: U("photo-1545324418-cc1a3fa10c00") },
  { id: 2, title: "500 Sq Yd Corner Plot, Prime Location", area: "DHA Phase 8", price: "PKR 9.2 Cr", priceNum: 92000000, intent: "buy", category: "plot", beds: 0, baths: 0, size: 500, featured: true, realtor: "Coastline Estates", image: U("photo-1500382017468-9049fed747ef") },
  { id: 3, title: "Furnished 2-Bed Flat for Rent", area: "Bahadurabad", price: "PKR 145,000/mo", priceNum: 145000, intent: "rent", category: "flat", beds: 2, baths: 2, size: 1400, featured: false, realtor: "Metro Homes", image: U("photo-1502672260266-1c1ef2d93688") },
  { id: 4, title: "Commercial Ground Floor Shop", area: "Tariq Road", price: "PKR 380,000/mo", priceNum: 380000, intent: "rent", category: "commercial", beds: 0, baths: 1, size: 900, featured: true, realtor: "Prime Commercial", image: U("photo-1604328698692-f76ea9498e76") },
  { id: 5, title: "5-Bed Bungalow with Lawn & Servant Quarters", area: "DHA Phase 6", price: "PKR 18.5 Cr", priceNum: 185000000, intent: "buy", category: "house", beds: 5, baths: 6, size: 4500, featured: false, realtor: "Coastline Estates", image: U("photo-1568605114967-8130f3a36994") },
  { id: 6, title: "240 Sq Yd Residential Plot", area: "Bahria Town Karachi", price: "PKR 1.65 Cr", priceNum: 16500000, intent: "buy", category: "plot", beds: 0, baths: 0, size: 240, featured: false, realtor: "Bahria Listings", image: U("photo-1486325212027-8081e485255e") },
  { id: 7, title: "Studio Apartment, Brand New Building", area: "Gulshan-e-Iqbal", price: "PKR 65,000/mo", priceNum: 65000, intent: "rent", category: "flat", beds: 1, baths: 1, size: 650, featured: false, realtor: "Metro Homes", image: U("photo-1522708323590-d24dbb6b0267") },
  { id: 8, title: "1,000 Sq Ft Office on Sharah-e-Faisal", area: "Saddar", price: "PKR 2.4 Cr", priceNum: 24000000, intent: "buy", category: "commercial", beds: 0, baths: 2, size: 1000, featured: false, realtor: "Prime Commercial", image: U("photo-1497366216548-37526070297c") },
  { id: 9, title: "Double-Storey Bungalow, Fully Renovated", area: "DHA Phase 5", price: "PKR 12.75 Cr", priceNum: 127500000, intent: "buy", category: "house", beds: 4, baths: 5, size: 3200, featured: true, realtor: "Skyline Realty", image: U("photo-1600596542815-ffad4c1539a9") },
];

// In-memory cross-page listing store (user-added listings).
let listings: Property[] = [];
let nextId = 1000;
type Listener = () => void;
const listeners = new Set<Listener>();

export function getListings() { return listings; }
export function addListing(p: Omit<Property, "id">) {
  const item = { ...p, id: nextId++ };
  listings = [item, ...listings];
  listeners.forEach((l) => l());
  return item;
}
export function subscribeListings(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
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
