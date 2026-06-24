import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Bed, Bath, Maximize, Star, Building2, Home, Store, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "abaad.com — Find your next property in Karachi" },
      { name: "description", content: "Karachi's curated marketplace for buying, renting, and listing properties. Browse flats, plots, and commercial spaces from verified realtors." },
      { property: "og:title", content: "abaad.com" },
      { property: "og:description", content: "Find your next property in Karachi." },
    ],
  }),
  component: Index,
});

const KARACHI_AREAS = [
  "Any area",
  "DHA Phase 1", "DHA Phase 2", "DHA Phase 5", "DHA Phase 6", "DHA Phase 8",
  "Clifton", "Bahadurabad", "PECHS", "Gulshan-e-Iqbal", "Gulistan-e-Johar",
  "North Nazimabad", "Bahria Town", "Malir", "Korangi", "Saddar",
];

type Intent = "buy" | "rent";
type Category = "flat" | "house" | "commercial" | "plot";

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

const PROPERTIES = [
  {
    id: 1, title: "Modern 3-Bed Apartment with Sea View", area: "Clifton Block 2",
    price: "PKR 4.85 Cr", priceNum: 48500000, intent: "buy" as Intent, category: "flat" as Category,
    beds: 3, baths: 3, size: 2200, featured: true, realtor: "Skyline Realty",
    image: UNSPLASH("photo-1545324418-cc1a3fa10c00"),
  },
  {
    id: 2, title: "500 Sq Yd Corner Plot, Prime Location", area: "DHA Phase 8",
    price: "PKR 9.2 Cr", priceNum: 92000000, intent: "buy" as Intent, category: "plot" as Category,
    beds: 0, baths: 0, size: 500, featured: true, realtor: "Coastline Estates",
    image: UNSPLASH("photo-1500382017468-9049fed747ef"),
  },
  {
    id: 3, title: "Furnished 2-Bed Flat for Rent", area: "Bahadurabad",
    price: "PKR 145,000/mo", priceNum: 145000, intent: "rent" as Intent, category: "flat" as Category,
    beds: 2, baths: 2, size: 1400, featured: false, realtor: "Metro Homes",
    image: UNSPLASH("photo-1502672260266-1c1ef2d93688"),
  },
  {
    id: 4, title: "Commercial Ground Floor Shop", area: "Tariq Road",
    price: "PKR 380,000/mo", priceNum: 380000, intent: "rent" as Intent, category: "commercial" as Category,
    beds: 0, baths: 1, size: 900, featured: true, realtor: "Prime Commercial",
    image: UNSPLASH("photo-1604328698692-f76ea9498e76"),
  },
  {
    id: 5, title: "5-Bed Bungalow with Lawn & Servant Quarters", area: "DHA Phase 6",
    price: "PKR 18.5 Cr", priceNum: 185000000, intent: "buy" as Intent, category: "house" as Category,
    beds: 5, baths: 6, size: 4500, featured: false, realtor: "Coastline Estates",
    image: UNSPLASH("photo-1568605114967-8130f3a36994"),
  },
  {
    id: 6, title: "240 Sq Yd Residential Plot", area: "Bahria Town Karachi",
    price: "PKR 1.65 Cr", priceNum: 16500000, intent: "buy" as Intent, category: "plot" as Category,
    beds: 0, baths: 0, size: 240, featured: false, realtor: "Bahria Listings",
    image: UNSPLASH("photo-1486325212027-8081e485255e"),
  },
  {
    id: 7, title: "Studio Apartment, Brand New Building", area: "Gulshan-e-Iqbal",
    price: "PKR 65,000/mo", priceNum: 65000, intent: "rent" as Intent, category: "flat" as Category,
    beds: 1, baths: 1, size: 650, featured: false, realtor: "Metro Homes",
    image: UNSPLASH("photo-1522708323590-d24dbb6b0267"),
  },
  {
    id: 8, title: "1,000 Sq Ft Office on Sharah-e-Faisal", area: "Saddar",
    price: "PKR 2.4 Cr", priceNum: 24000000, intent: "buy" as Intent, category: "commercial" as Category,
    beds: 0, baths: 2, size: 1000, featured: false, realtor: "Prime Commercial",
    image: UNSPLASH("photo-1497366216548-37526070297c"),
  },
  {
    id: 9, title: "Double-Storey Bungalow, Fully Renovated", area: "DHA Phase 5",
    price: "PKR 12.75 Cr", priceNum: 127500000, intent: "buy" as Intent, category: "house" as Category,
    beds: 4, baths: 5, size: 3200, featured: true, realtor: "Skyline Realty",
    image: UNSPLASH("photo-1600596542815-ffad4c1539a9"),
  },
];

const ADS = [
  { tier: "Platinum", realtor: "Coastline Estates", line: "Curated luxury portfolio across DHA & Clifton.", hue: 230 },
  { tier: "Gold", realtor: "Skyline Realty", line: "High-rise apartments with sea views, 0% commission.", hue: 165 },
  { tier: "Silver", realtor: "Metro Homes", line: "Rentals from PKR 50k. Move-in ready listings.", hue: 215 },
];

function Index() {
  const [intent, setIntent] = useState<Intent>("buy");
  const [category, setCategory] = useState<Category>("flat");
  const [area, setArea] = useState("Any area");
  const [plotSize, setPlotSize] = useState<[number, number]>([120, 1000]);
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    if (!submitted) return PROPERTIES;
    return PROPERTIES.filter((p) => {
      if (p.intent !== intent) return false;
      if (p.category !== category) return false;
      if (area !== "Any area" && p.area !== area) return false;
      if (category === "plot") {
        if (p.size < plotSize[0] || p.size > plotSize[1]) return false;
      }
      return true;
    });
  }, [intent, category, area, plotSize, submitted]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border bg-navy text-navy-foreground">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }} />
          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-32">
            <Badge className="mb-6 border-white/20 bg-white/10 text-white hover:bg-white/15">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green" />
              Karachi · 12,840 active listings
            </Badge>
            <h1 className="max-w-3xl text-5xl leading-[1.05] font-medium md:text-6xl">
              The right address,<br />
              <span className="italic text-green">found faster.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70">
              A curated marketplace connecting Karachi's buyers and tenants directly with verified realtors. No middlemen, no inflated calls.
            </p>
          </div>
        </section>

        {/* Search panel overlapping hero */}
        <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] md:p-8">
            <div className="mb-6 inline-flex rounded-full border border-border bg-secondary p-1">
              {(["buy", "rent"] as Intent[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setIntent(opt); setSubmitted(false); }}
                  className={`rounded-full px-5 py-1.5 text-sm font-medium capitalize transition ${
                    intent === opt
                      ? "bg-navy text-navy-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt === "buy" ? "I want to buy" : "I want to rent"}
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Area
                </Label>
                <Select value={area} onValueChange={(v) => { setArea(v); setSubmitted(false); }}>
                  <SelectTrigger className="h-12">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KARACHI_AREAS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Property type
                </Label>
                <div className="grid grid-cols-4 gap-1 rounded-md border border-border bg-secondary p-1">
                  {([
                    { v: "flat" as Category, l: "Flat", Icon: Building2 },
                    { v: "house" as Category, l: "House", Icon: Home },
                    { v: "commercial" as Category, l: "Shop", Icon: Store },
                    { v: "plot" as Category, l: "Plot", Icon: TreePine },
                  ]).map(({ v, l, Icon }) => (
                    <button
                      key={v}
                      onClick={() => { setCategory(v); setSubmitted(false); }}
                      className={`flex h-10 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-medium transition ${
                        category === v
                          ? "bg-card text-navy shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Keyword
                </Label>
                <Input placeholder="e.g. furnished, sea view…" className="h-12" />
              </div>

              {category === "plot" && (
                <div className="md:col-span-12">
                  <div className="mb-2 flex items-end justify-between">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Plot size (sq yd)
                    </Label>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {plotSize[0]} – {plotSize[1]} sq yd
                    </span>
                  </div>
                  <Slider
                    value={plotSize}
                    onValueChange={(v) => { setPlotSize([v[0], v[1]] as [number, number]); setSubmitted(false); }}
                    min={80}
                    max={2000}
                    step={20}
                    className="mt-3"
                  />
                </div>
              )}

              <div className="md:col-span-12">
                <Button
                  onClick={() => setSubmitted(true)}
                  className="h-12 w-full bg-navy text-navy-foreground hover:bg-navy/90 md:w-auto md:px-10"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search properties
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured realtor ads */}
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-green">Featured realtors</p>
              <h2 className="mt-1 text-2xl font-medium">Sponsored listings</h2>
            </div>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">View all →</a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {ADS.map((ad) => (
              <article
                key={ad.realtor}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition hover:border-navy/20 hover:shadow-lg"
              >
                <div
                  className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20"
                  style={{ background: `oklch(0.55 0.15 ${ad.hue})` }}
                />
                <div className="relative">
                  <Badge
                    variant="outline"
                    className={
                      ad.tier === "Platinum"
                        ? "border-navy/30 bg-navy text-navy-foreground"
                        : ad.tier === "Gold"
                          ? "border-green/30 bg-green text-green-foreground"
                          : "border-border bg-secondary text-secondary-foreground"
                    }
                  >
                    {ad.tier} realtor
                  </Badge>
                  <h3 className="mt-4 text-lg font-medium">{ad.realtor}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{ad.line}</p>
                  <button className="mt-5 inline-flex items-center text-sm font-medium text-navy hover:text-green">
                    View portfolio →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto mt-20 max-w-6xl px-6 pb-24">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-green">
                {submitted ? "Search results" : "Latest listings"}
              </p>
              <h2 className="mt-1 text-2xl font-medium">
                {filtered.length} {filtered.length === 1 ? "property" : "properties"}
              </h2>
            </div>
            <Select defaultValue="newest">
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="low">Price: low to high</SelectItem>
                <SelectItem value="high">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">No properties match your filters.</p>
              <Button variant="link" onClick={() => setSubmitted(false)} className="mt-1 text-navy">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PropertyCard({ p }: { p: typeof PROPERTIES[number] }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {p.featured && (
          <Badge className="absolute left-3 top-3 border-0 bg-green text-green-foreground">
            <Star className="mr-1 h-3 w-3 fill-current" />
            Featured
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-navy backdrop-blur">
          {p.intent === "buy" ? "For Sale" : "For Rent"}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {p.area}
        </div>
        <h3 className="mt-1.5 font-display text-lg leading-snug">
          {p.title}
        </h3>
        <p className="mt-3 text-xl font-medium text-navy">{p.price}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          {p.beds > 0 && (
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds} bed</span>
          )}
          {p.baths > 0 && (
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths} bath</span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {p.size} {p.category === "plot" ? "sq yd" : "sq ft"}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">by <span className="text-foreground font-medium">{p.realtor}</span></p>
      </div>
    </article>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-navy-foreground">
            <span className="font-display text-base font-semibold">a</span>
          </div>
          <span className="font-display text-lg font-medium tracking-tight">
            abaad<span className="text-green">.</span>com
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <a href="#" className="text-foreground hover:text-navy">Buy</a>
          <a href="#" className="text-muted-foreground hover:text-navy">Rent</a>
          <a href="#" className="text-muted-foreground hover:text-navy">Realtors</a>
          <a href="#" className="text-muted-foreground hover:text-navy">Packages</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden text-sm md:inline-flex">Sign in</Button>
          <Button className="bg-navy text-navy-foreground hover:bg-navy/90">List property</Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
        <p className="font-display text-base tracking-tight">
          abaad<span className="text-green">.</span>com
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} abaad.com — A marketplace for verified realtors in Karachi.
        </p>
      </div>
    </footer>
  );
}
