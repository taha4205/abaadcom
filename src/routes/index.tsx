import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Search, MapPin, Building2, Home, Store, TreePine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/site-chrome";
import { PropertyCard } from "@/components/property-card";
import { HowItWorks } from "@/components/how-it-works";
import { TopRealtors } from "@/components/top-realtors";
import { MoreFilters, DEFAULT_EXTRA, applyExtraFilters, hasExtraFilters, type ExtraFilters } from "@/components/more-filters";
import {
  KARACHI_AREAS, SEED_PROPERTIES, getLiveListings, subscribeListings, fetchLiveListings,
  type Intent, type Category,
} from "@/lib/properties";

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

const ADS = [
  { tier: "Platinum", realtor: "Coastline Estates", line: "Curated luxury portfolio across DHA & Clifton." },
  { tier: "Gold", realtor: "Skyline Realty", line: "High-rise apartments with sea views, 0% commission." },
  { tier: "Silver", realtor: "Metro Homes", line: "Rentals from PKR 50k. Move-in ready listings." },
];

function useListings() {
  useEffect(() => { fetchLiveListings(); }, []);
  return useSyncExternalStore(
    (cb) => subscribeListings(cb),
    () => getLiveListings(),
    () => getLiveListings(),
  );
}

const DEFAULT_INTENT: Intent = "buy";
const DEFAULT_CATEGORY: Category = "flat";
const DEFAULT_AREA = "Any area";
const DEFAULT_KEYWORD = "";
const DEFAULT_PLOT_SIZE: [number, number] = [120, 1000];

function Index() {
  const [intent, setIntent] = useState<Intent>(DEFAULT_INTENT);
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [area, setArea] = useState(DEFAULT_AREA);
  const [keyword, setKeyword] = useState(DEFAULT_KEYWORD);
  const [plotSize, setPlotSize] = useState<[number, number]>(DEFAULT_PLOT_SIZE);
  const [extra, setExtra] = useState<ExtraFilters>(DEFAULT_EXTRA);
  const [hasSearched, setHasSearched] = useState(false);
  const userListings = useListings();

  const allProperties = useMemo(() => [...userListings, ...SEED_PROPERTIES], [userListings]);

  const isDefaultFilters = useMemo(() => {
    return (
      intent === DEFAULT_INTENT &&
      category === DEFAULT_CATEGORY &&
      area === DEFAULT_AREA &&
      keyword === DEFAULT_KEYWORD &&
      plotSize[0] === DEFAULT_PLOT_SIZE[0] &&
      plotSize[1] === DEFAULT_PLOT_SIZE[1] &&
      !hasExtraFilters(extra)
    );
  }, [intent, category, area, keyword, plotSize, extra]);

  useEffect(() => {
    if (!isDefaultFilters) setHasSearched(true);
  }, [isDefaultFilters]);

  const resetSearch = () => {
    setIntent(DEFAULT_INTENT);
    setCategory(DEFAULT_CATEGORY);
    setArea(DEFAULT_AREA);
    setKeyword(DEFAULT_KEYWORD);
    setPlotSize(DEFAULT_PLOT_SIZE);
    setExtra(DEFAULT_EXTRA);
    setHasSearched(false);
  };

  const filtered = useMemo(() => {
    if (!hasSearched) return allProperties;
    const base = allProperties.filter((p) => {
      if (p.intent !== intent) return false;
      if (p.category !== category) return false;
      if (area !== DEFAULT_AREA && p.area !== area) return false;
      if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (category === "plot" && (p.size < plotSize[0] || p.size > plotSize[1])) return false;
      return true;
    });
    return applyExtraFilters(base, extra);
  }, [allProperties, hasSearched, intent, category, area, keyword, plotSize, extra]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-navy text-navy-foreground">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }} />
          <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-28 sm:px-6 sm:pt-20 sm:pb-32">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green" />
              Karachi · {allProperties.length.toLocaleString()} active listings
            </Badge>
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-medium sm:text-5xl md:text-6xl">
              The right address,<br />
              <span className="italic text-green">found faster.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-white/70 sm:text-base">
              A curated marketplace connecting Karachi's buyers and tenants directly with verified realtors. No middlemen, no inflated calls.
            </p>
          </div>
        </section>

        {/* Search panel */}
        <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:p-6 md:p-8">
            <div className="mb-5 inline-flex rounded-full border border-border bg-secondary p-1">
              {(["buy", "rent"] as Intent[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntent(opt)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition sm:px-5 ${
                    intent === opt
                      ? "bg-navy text-navy-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt === "buy" ? "I want to buy" : "I want to rent"}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-12 w-full"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
                  <SelectContent>{KARACHI_AREAS.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Property type</Label>
                <div className="grid grid-cols-4 gap-1 rounded-md border border-border bg-secondary p-1">
                  {([
                    { v: "flat" as Category, l: "Flat", Icon: Building2 },
                    { v: "house" as Category, l: "House", Icon: Home },
                    { v: "commercial" as Category, l: "Shop", Icon: Store },
                    { v: "plot" as Category, l: "Plot", Icon: TreePine },
                  ]).map(({ v, l, Icon }) => (
                    <button
                      key={v}
                      onClick={() => setCategory(v)}
                      className={`flex h-10 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-medium transition ${
                        category === v ? "bg-card text-navy shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Keyword</Label>
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. furnished, sea view…" className="h-12" />
              </div>

              {category === "plot" && (
                <div className="md:col-span-12">
                  <div className="mb-2 flex items-end justify-between">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plot size (sq yd)</Label>
                    <span className="text-sm font-medium tabular-nums text-foreground">{plotSize[0]} – {plotSize[1]} sq yd</span>
                  </div>
                  <Slider value={plotSize} onValueChange={(v) => setPlotSize([v[0], v[1]] as [number, number])} min={80} max={2000} step={20} className="mt-3" />
                </div>
              )}

              <MoreFilters value={extra} onChange={setExtra} />

              <div className="flex flex-col gap-3 md:col-span-12 md:flex-row md:items-center">
                <Button onClick={() => setHasSearched(true)} className="h-12 w-full bg-navy text-navy-foreground hover:bg-navy/90 md:w-auto md:px-10">
                  <Search className="mr-2 h-4 w-4" /> Search properties
                </Button>
                {hasSearched && (
                  <Button variant="ghost" onClick={resetSearch} className="h-12 w-full text-muted-foreground hover:text-foreground md:w-auto">
                    <X className="mr-2 h-4 w-4" /> Reset search
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {!hasSearched && (
          <>
            <HowItWorks />
            <TopRealtors />
          </>
        )}

        {/* Featured realtor ads */}
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-green">Featured realtors</p>
              <h2 className="mt-1 text-xl font-medium sm:text-2xl">Sponsored listings</h2>
            </div>
            <a href="#" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">View all →</a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ADS.map((ad) => (
              <article key={ad.realtor} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition hover:border-navy/20 hover:shadow-lg">
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
                <button className="mt-5 inline-flex items-center text-sm font-medium text-navy hover:text-green">View portfolio →</button>
              </article>
            ))}
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto mt-16 max-w-6xl px-4 pb-20 sm:mt-20 sm:px-6 sm:pb-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-green">
                {hasSearched ? "Search results" : "Latest listings"}
              </p>
              <h2 className="mt-1 text-xl font-medium sm:text-2xl">
                {filtered.length} {filtered.length === 1 ? "property" : "properties"}
              </h2>
            </div>
            <Select defaultValue="newest">
              <SelectTrigger className="w-36 shrink-0 sm:w-44"><SelectValue /></SelectTrigger>
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
              <Button variant="link" onClick={resetSearch} className="mt-1 text-navy">Clear filters</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
