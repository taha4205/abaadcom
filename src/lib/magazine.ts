export type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  read_time: string;
  date: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "dha-phase-6-prices-2025",
    category: "Market Watch",
    title: "DHA Phase 6 Property Prices Rise 14% in 2025",
    excerpt:
      "Demand from overseas Pakistanis and limited supply are pushing prices to record highs in Karachi's most sought-after neighbourhood.",
    cover: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "4 min read",
    date: "June 2025",
  },
  {
    slug: "gulistan-e-johar-area-guide",
    category: "Area Spotlight",
    title: "Gulistan-e-Johar: Karachi's Most Liveable Middle-Class Neighbourhood",
    excerpt:
      "With schools, hospitals, restaurants and connectivity all within reach, Gulistan-e-Johar remains the top choice for families on a budget.",
    cover: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "6 min read",
    date: "May 2025",
  },
  {
    slug: "sahil-realtor-of-the-month",
    category: "Realtor of the Month",
    title: "Meet Sahil Khan: The Realtor Closing Deals the Honest Way",
    excerpt:
      "Sahil Real Estate has built a reputation in Karachi for transparency, fair pricing, and direct WhatsApp communication. We sat down with Sahil to learn his approach.",
    cover: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "5 min read",
    date: "June 2025",
  },
  {
    slug: "first-home-buyers-guide-karachi",
    category: "Buyer Stories",
    title: "How One Family Found Their Dream Home in Clifton Under 3 Weeks",
    excerpt:
      "The Khans had been searching for months on other platforms. Then they tried abaad and found their 3-bed flat in Clifton Block 4 in less than 3 weeks.",
    cover: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "3 min read",
    date: "May 2025",
  },
  {
    slug: "top-investment-areas-karachi-2025",
    category: "Investment Picks",
    title: "3 Areas in Karachi to Invest in Before End of 2025",
    excerpt:
      "From Scheme 33's rapid development to Bahria Town's stable returns, these three neighbourhoods offer the best ROI for property investors right now.",
    cover: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "5 min read",
    date: "June 2025",
  },
  {
    slug: "bahria-town-karachi-guide",
    category: "Area Spotlight",
    title: "Bahria Town Karachi: Is It Still Worth Buying In?",
    excerpt:
      "After years of legal uncertainty, Bahria Town Karachi has stabilised. Here's an honest look at current prices, amenities, and who should consider buying there.",
    cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop",
    author: "abaad Editorial",
    read_time: "7 min read",
    date: "April 2025",
  },
];

export const ARTICLE_CATEGORIES = [
  "All",
  "Market Watch",
  "Area Spotlight",
  "Realtor of the Month",
  "Buyer Stories",
  "Investment Picks",
];

export function categoryColor(c: string) {
  switch (c) {
    case "Market Watch":
      return "bg-green/15 text-green border-green/30";
    case "Area Spotlight":
      return "bg-navy/10 text-navy border-navy/20";
    case "Realtor of the Month":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "Buyer Stories":
      return "bg-blue-500/10 text-blue-700 border-blue-500/30";
    case "Investment Picks":
      return "bg-purple-500/10 text-purple-700 border-purple-500/30";
    default:
      return "bg-secondary text-foreground border-border";
  }
}

export function findArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

// Realistic Karachi-specific article bodies (4-5 paragraphs each)
const BODIES: Record<string, string[]> = {
  "dha-phase-6-prices-2025": [
    "DHA Phase 6 has long been the benchmark for premium living in Karachi, but the first half of 2025 has cemented its status as the city's most resilient property market. Average per-square-yard prices for residential plots are up 14% year-on-year, with prime corner and boulevard plots fetching premiums of 20% or more. Realtors active in the area report that bidding wars on well-located 500 sq yd plots have become routine.",
    "The drivers are familiar but newly intense: a surge in remittances from overseas Pakistanis converting dollars into hard assets, limited new inventory inside the Phase boundaries, and a steady migration of families from older neighbourhoods like PECHS and Bahadurabad seeking modern, gated communities. With construction costs still elevated post-2023, ready-built houses are commanding the steepest premiums.",
    "Rentals have moved in lockstep. A 500 sq yd, four-bedroom house in Khayaban-e-Bukhari that rented for PKR 350,000 in early 2024 is now closer to PKR 425,000 per month. Furnished units aimed at expatriate executives are scarce enough that turnover happens in days, not weeks.",
    "For buyers, the window for entry-level Phase 6 inventory — 250 sq yd plots and three-bedroom flats — is narrowing. Most listings are spending under 30 days on market. Investors looking for capital appreciation should expect another 8–10% growth through the end of the year if remittance flows hold and interest rates begin to ease.",
    "Our recommendation: if you've been waiting for prices to cool, they likely won't this cycle. Engage a verified realtor, secure financing pre-approval, and be ready to move quickly when the right listing appears.",
  ],
  "gulistan-e-johar-area-guide": [
    "Drive through Gulistan-e-Johar on any weekday evening and you'll see what makes it work: kids walking back from school, families heading to neighbourhood restaurants, and shopkeepers who know their customers by name. For Karachi's middle class, this is what 'liveable' actually looks like.",
    "The area's appeal is structural. It sits on the right side of Rashid Minhas Road, putting Shahrah-e-Faisal, the airport, and the universities of Scheme 33 all within a 15-minute drive. Major hospitals — Liaquat National, Aga Khan satellite clinics, and OMI — are close enough for emergencies but not so close that traffic becomes unbearable.",
    "Property-wise, Gulistan-e-Johar offers Karachi's best mix of options under PKR 3 crore. Two- and three-bedroom flats in Block 7, 18 and 19 still trade between PKR 1.2 and 2.5 crore depending on age and floor. Older 240 sq yd houses in the inner blocks can be had for under PKR 4 crore, and the area's many newer apartment buildings keep rental inventory healthy at PKR 50,000 to 90,000 per month.",
    "Schools are a particular strength. The Educators, Beaconhouse, Foundation Public, and a long list of Cambridge-curriculum private schools sit within the neighbourhood, removing one of the biggest hidden costs of moving — a long daily school run.",
    "It's not perfect. Traffic on University Road during peak hours is brutal, and load-shedding still bites in older blocks. But for families who want amenities, schools, and proper urban density without paying DHA prices, Gulistan-e-Johar remains hard to beat.",
  ],
  "sahil-realtor-of-the-month": [
    "Sahil Khan doesn't look or sound like the stereotype of a Karachi property dealer. There's no gold watch, no convoy of black SUVs, no inflated promises. What there is, in plenty, is a quietly growing list of repeat clients across DHA, Clifton, Gulistan-e-Johar and Bahria Town who keep sending him their friends.",
    "Sahil Real Estate, founded by Khan in 2019, operates on a deliberately narrow principle: list only what you've personally verified, quote only the price the seller will actually accept, and stay on WhatsApp from morning until the deal closes. 'Most disputes in this business happen because two people heard two different numbers,' he tells us. 'We just don't let that happen.'",
    "On abaad, his agency holds Platinum status and reliably replies to inquiries in under an hour — a metric most other realtors in the city struggle to match. His current portfolio includes high-end Clifton sea-facing flats, family bungalows in DHA Phase 6, and entry-level plots in Bahria Town for first-time investors.",
    "Asked what he wishes Karachi buyers understood, Sahil is direct: 'Stop chasing the lowest advertised price. It's almost always wrong. Find a realtor who tells you what something will actually transact at, even when it's higher than the listing you saw on three other apps.'",
    "Sahil Real Estate's listings are visible on the abaad homepage, and Sahil can be reached directly on WhatsApp via any of his property pages.",
  ],
  "first-home-buyers-guide-karachi": [
    "When Imran and Sana Khan started looking for their first home in late 2024, they did what most Karachi buyers do: they downloaded three property apps and started scrolling. Three months and dozens of dead-end phone calls later, they were ready to give up. 'Every listing we called was either already sold, priced 30% higher than advertised, or didn't exist at all,' Sana recalls.",
    "A colleague suggested they try abaad. Within a week they had spoken — on WhatsApp, directly — to three verified realtors operating in Clifton. By the end of week two, they had visited five properties that actually matched the descriptions. In week three, they signed the agreement on a three-bedroom flat in Clifton Block 4.",
    "What changed? 'It was the verification,' Imran explains. 'Knowing the realtor had been vetted, the price was real, and the photos were the actual unit — that cut out 90% of the noise we'd been dealing with.'",
    "The Khans' experience isn't unusual. Properties listed by verified realtors on abaad transact, on average, in under 30 days when priced correctly. Most of the friction in Karachi's property market is informational, not financial — and removing it changes everything for first-time buyers who don't have the time or the network to filter signal from noise themselves.",
    "Their advice to other first-time buyers: get pre-approved for financing before you start looking, decide on two areas maximum, and only talk to realtors who'll send you the seller's actual asking price in writing on WhatsApp.",
  ],
  "top-investment-areas-karachi-2025": [
    "Pakistan's property market has rewarded patient investors handsomely over the last two decades, but the next 12 months will reward selectivity more than scale. After surveying transaction data across the city and speaking to a dozen active realtors, three Karachi neighbourhoods stand out for late-2025 entry.",
    "Scheme 33. The rapid build-out around the M-9 motorway interchange has made Scheme 33 the closest thing Karachi has to a frontier. Plots that traded at PKR 35 lakh in 2022 are now PKR 60–70 lakh, and the area still has years of upside as universities and corporate offices continue relocating there. Best suited for investors with a 3–5 year horizon.",
    "Bahria Town Karachi. After a turbulent few years, prices in Bahria Town have stabilised and inventory is once again moving. Precinct 1 villas and Precinct 10A plots offer the cleanest risk-reward today. With infrastructure now fully operational and the legal overhang largely cleared, this is the most under-priced 'finished' development in the city.",
    "DHA Phase 8 (Zone A & B). For investors who want exposure to Karachi's most premium segment without paying Phase 6 prices, Phase 8 remains attractive. Brand-new high-rise apartments in Emaar Crescent Bay and Coral Towers have seen consistent rental yields of 5–6% — high by Karachi standards — and capital appreciation has tracked DHA Phase 6 with a lag.",
    "A word of caution: do not chase 'pre-launch' projects from unknown developers. The next 12 months will sort the serious operators from the rest, and the cheapest entry point is almost never the safest one.",
  ],
  "bahria-town-karachi-guide": [
    "Few property developments in Pakistan have generated as much heat — and as many headlines — as Bahria Town Karachi. After years of legal uncertainty around land titles, the picture in 2025 is finally clear enough to evaluate honestly.",
    "The good news first. Infrastructure inside Bahria Town Karachi is, by any reasonable measure, the best in the city. Wide roads, reliable utilities, functional sewerage, and security that actually works. The internal commercial hubs — Jinnah Avenue, the Eiffel Tower precinct, and the Cinepax mall — are now genuine destinations, not just glossy renderings.",
    "Prices have stabilised. A 250 sq yd plot in a well-developed precinct trades between PKR 1.5 and 2.2 crore, and 500 sq yd plots between PKR 3.5 and 5 crore. Villas range from PKR 4.5 crore for a basic 5-marla unit to PKR 12 crore plus for finished 1-kanal homes in Precinct 1. Rental demand is healthy among families willing to trade central Karachi convenience for security and amenities.",
    "The honest concerns: commute times to Saddar, Clifton, and DHA still range from 45 minutes to over an hour outside peak. Resale liquidity, while improved, is slower than DHA or Clifton — your buyer pool is structurally smaller. And while the legal cloud has lifted, prospective buyers should still insist on seeing the full conveyance documents and a Bahria-issued ownership certificate before any payment.",
    "Who should buy here? Families prioritising lifestyle and security over commute, investors with a 5-year-plus horizon, and overseas Pakistanis looking for a turnkey gated community. Day-to-day Karachi professionals working in Clifton or II Chundrigar should think twice about the daily drive.",
  ],
};

export function getArticleBody(slug: string): string[] {
  return BODIES[slug] ?? [
    "This article is being prepared by the abaad editorial team. Check back shortly for the full piece.",
  ];
}
