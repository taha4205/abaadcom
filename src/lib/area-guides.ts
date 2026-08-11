import { slugify } from "@/lib/properties";

export type AreaGuide = {
  area: string;
  blurb: string;
  amenities: string[];
  vibe: string;
};

/** Editorial notes for Karachi areas we carry listings in. */
export const AREA_GUIDES: AreaGuide[] = [
  { area: "DHA Phase 5", vibe: "Upscale, walkable", blurb: "One of Karachi's most established upmarket neighbourhoods, DHA Phase 5 mixes older bungalows with new low-rise apartment projects. Khayaban-e-Bukhari and Khayaban-e-Muslim carry most of the commercial activity.", amenities: ["Zamzama & Bukhari commercial strips", "Private schools", "Aga Khan / South City access", "Reliable water tankers"] },
  { area: "DHA Phase 6", vibe: "Family bungalows", blurb: "Wide streets, large plots and a strong resale market. Phase 6 is the classic choice for families upgrading from Gulshan or PECHS, with Khayaban-e-Shamsheer and Ittehad as its retail spine.", amenities: ["Ittehad Commercial", "Parks & jogging tracks", "Cafés and clinics", "Good road access to Korangi"] },
  { area: "DHA Phase 8", vibe: "Sea-facing towers", blurb: "Karachi's high-rise frontier. Emaar Crescent Bay, Creek Vista and Al-Murtaza dominate the skyline, with sea-view apartments commanding the city's highest per-square-yard rates.", amenities: ["Sea-view apartments", "Do Darya restaurants", "Gyms & clubs", "Backup power in most towers"] },
  { area: "Clifton", vibe: "Central, mixed-use", blurb: "Old-money Karachi. Blocks 2, 5 and 8 hold a dense mix of apartment buildings, offices and schools, minutes from the business district and the beach.", amenities: ["Beach access", "Dolmen Mall", "Hospitals nearby", "Metro / bus links"] },
  { area: "Bahadurabad", vibe: "Established, central", blurb: "A dense, well-serviced central neighbourhood with strong rental demand from families who want to stay close to the city core without DHA pricing.", amenities: ["Bahadurabad Chowrangi shopping", "Schools within walking distance", "Bakeries & clinics", "Short commute to Saddar"] },
  { area: "PECHS", vibe: "Central, leafy", blurb: "PECHS blocks 2 and 6 offer older bungalows and portions on tree-lined lanes, popular with tenants working around Tariq Road and Shahra-e-Faisal.", amenities: ["Tariq Road retail", "Good public transport", "Mosques & parks", "Portions for rent"] },
  { area: "Gulshan-e-Iqbal", vibe: "Mid-market, dense", blurb: "One of the largest planned townships in Karachi. Blocks 10-A and 13-D see steady flat sales and rentals, driven by proximity to universities and hospitals.", amenities: ["NIPA & University Road corridor", "Hospitals", "Millennium Mall", "Affordable flats"] },
  { area: "Gulistan-e-Johar", vibe: "Value flats", blurb: "Johar's blocks 14 and 19 are the go-to for value apartments — new buildings keep coming up, and rents stay well below DHA levels.", amenities: ["Safari Park nearby", "University access", "Grocery & bazaars", "Lift-equipped new buildings"] },
  { area: "North Nazimabad", vibe: "Quiet, family", blurb: "Blocks F and N remain among the calmest family neighbourhoods in the city, with wide plots, mature trees and a strong local rental market.", amenities: ["Five Star Chowrangi", "Hospitals & schools", "Parks", "Sui gas & KE reliability"] },
  { area: "Nazimabad", vibe: "Old Karachi", blurb: "Affordable portions and small houses close to the old city, with strong community life and quick access to the M.A. Jinnah corridor.", amenities: ["Local bazaars", "Schools", "Public transport", "Mosques"] },
  { area: "Bahria Town Karachi", vibe: "Gated, new-build", blurb: "A self-contained gated township on the Super Highway. Precincts 8, 12 and 17 offer new villas, apartments and plots with township-managed utilities and security.", amenities: ["24/7 gated security", "Bahria Adventure Land", "Grand Mosque", "In-township schools & hospital"] },
  { area: "Scheme 33", vibe: "Emerging", blurb: "Saadi Town and its neighbours are Karachi's fastest-growing affordable belt, with plots and new houses aimed at first-time buyers.", amenities: ["Saadi Hospital", "Universities nearby", "Wide new roads", "Plot investment options"] },
  { area: "Federal B Area", vibe: "Affordable, central", blurb: "Block 16 and its surroundings offer some of the best value per square yard in central Karachi, with dense retail and short commutes.", amenities: ["Water Pump market", "Schools", "Clinics", "Public transport"] },
  { area: "Malir", vibe: "Low-density", blurb: "Malir's housing schemes and Falcon Complex offer larger plots at lower prices, popular with buyers commuting toward the airport and Port Qasim.", amenities: ["Airport access", "Malir Cantt facilities", "Open land", "New schemes"] },
  { area: "Malir Cantonment", vibe: "Secure, planned", blurb: "Cantonment-managed sectors with controlled entry, planned utilities and steady long-term appreciation.", amenities: ["Cantt security", "Planned sectors", "Schools", "Parks"] },
  { area: "Korangi", vibe: "Industrial-adjacent", blurb: "Affordable homes near Karachi's largest industrial belt, with strong demand from workers and small business owners.", amenities: ["Korangi Industrial Area jobs", "Local markets", "Schools", "Transport links"] },
  { area: "Shah Faisal Colony", vibe: "Budget, connected", blurb: "Compact houses and portions right off Shahra-e-Faisal, with quick access to the airport and the city centre.", amenities: ["Shahra-e-Faisal access", "Airport nearby", "Markets", "Bus routes"] },
  { area: "Surjani Town", vibe: "Entry-level", blurb: "One of the most affordable formal housing belts in Karachi — small houses and plots for first-time buyers on the northern edge.", amenities: ["Northern bypass access", "Local bazaars", "Schools", "New development"] },
  { area: "Saddar", vibe: "Old city core", blurb: "Historic commercial heart of Karachi with heritage buildings, wholesale markets and apartment blocks above shopfronts.", amenities: ["Empress Market", "Heritage architecture", "Transport hub", "Wholesale trade"] },
  { area: "Tariq Road", vibe: "Retail heart", blurb: "Karachi's best-known shopping district — commercial demand drives values, with residential flats above and around the strip.", amenities: ["Tariq Road shopping", "Restaurants", "Banks", "High footfall commercial"] },
  { area: "University Road", vibe: "Student belt", blurb: "The corridor between NIPA and Safari Park serves students and faculty, so compact rentals move fast here.", amenities: ["Karachi University", "NED & Dow", "Hospitals", "Bus corridor"] },
  { area: "DHA Phase 1", vibe: "Established", blurb: "Older DHA with generous plots, close to Korangi Road and the Nursery commercial belt.", amenities: ["Nursery commercial", "Schools", "Parks", "Quick city access"] },
  { area: "DHA Phase 2", vibe: "Quiet DHA", blurb: "Low-traffic residential lanes with solid bungalow stock and steady rental demand.", amenities: ["Nearby commercials", "Mosques", "Parks", "Security patrols"] },
];

export function areaGuideSlug(area: string) {
  return slugify(area);
}

export function findAreaGuide(slug: string): AreaGuide | undefined {
  return AREA_GUIDES.find((g) => areaGuideSlug(g.area) === slug);
}
