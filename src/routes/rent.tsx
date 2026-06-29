import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Search, MapPin, Building2, Home, Store, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
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
import { MoreFilters, DEFAULT_EXTRA, applyExtraFilters, type ExtraFilters } from "@/components/more-filters";
import {
  KARACHI_AREAS, SEED_PROPERTIES, getLiveListings, subscribeListings, fetchLiveListings,
  type Category,
} from "@/lib/properties";

export const Route = createFileRoute("/rent")({
  head: () => ({
    meta: [
      { title: "Rent in Karachi — flats, houses & shops | abaad.com" },
      { name: "description", content: "Find rental flats, houses, and commercial spaces across Karachi on abaad.com. Filter by area, budget, and property type. Direct contact with verified realtors." },
      { property: "og:title", content: "Rent in Karachi — abaad.com" },
      { property: "og:description", content: "Tenant-first rental marketplace for Karachi." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/rent" },
    ],
    links: [{ rel: "canonical", href: "/rent" }],
  }),
  component: RentPage,
});

type RentCategory = Exclude<Category, "plot">;

function useListings() {
  useEffect(() => { fetchLiveListings(); }, []);
  return useSyncExternalStore(
    (cb) => subscribeListings(cb),
    () => getLiveListings(),
    () => getLiveListings(),
  );
}

function RentPage() {
  const [category, setCategory] = useState<RentCategory>("flat");
  const [area, setArea] = useState("Any area");
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState<[number, number]>([30000, 300000]);
  const [extra, setExtra] = useState<ExtraFilters>(DEFAULT_EXTRA);
  const [submitted, setSubmitted] = useState(false);
  const userListings = useListings();

  const rentals = useMemo(
    () => [...userListings, ...SEED_PROPERTIES].filter((p) => p.intent === "rent"),
    [userListings],
  );

  const filtered = useMemo(() => {
    if (!submitted) return rentals;
    const base = rentals.filter((p) => {
      if (p.category !== category) return false;
      if (area !== "Any area" && p.area !== area) return false;
      if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (p.priceNum < budget[0] || p.priceNum > budget[1]) return false;
      return true;
    });
    return applyExtraFilters(base, extra);
  }, [rentals, category, area, keyword, budget, extra, submitted]);

  useEffect(() => { setSubmitted(false); }, [category, area, keyword, budget, extra]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-navy text-navy-foreground">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />
          <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-28 sm:px-6 sm:pt-20 sm:pb-32">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15">
              <KeyRound className="mr-1.5 h-3 w-3" />
              Tenant hub · {rentals.length} active rentals
            </Badge>
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-medium sm:text-5xl md:text-6xl">
              Move in,<br />
              <span className="italic text-green">stress-free.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-white/70 sm:text-base">
              Furnished flats, family bungalows, and ready-to-trade shops across Karachi — listed only by verified realtors. No bait-and-switch, no agent chains.
            </p>
          </div>
        </section>

        {/* Tenant pitch */}
        <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { Icon: ShieldCheck, t: "Verified realtors", d: "Every rental tied to a paid realtor account." },
              { Icon: KeyRound, t: "Move-in ready", d: "Photos, rent and lease length stated upfront." },
              { Icon: Sparkles, t: "Direct contact", d: "Reach the listing realtor — no middlemen." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-navy" />
                <p className="mt-3 text-sm font-medium">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Search panel */}
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:p-6 md:p-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-green">Find a rental</p>

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
                <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary p-1">
                  {([
                    { v: "flat" as RentCategory, l: "Flat", Icon: Building2 },
                    { v: "house" as RentCategory, l: "House", Icon: Home },
                    { v: "commercial" as RentCategory, l: "Shop", Icon: Store },
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
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. furnished, parking…" className="h-12" />
              </div>

              <div className="md:col-span-12">
                <div className="mb-2 flex items-end justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly budget (PKR)</Label>
                  <span className="text-sm font-medium tabular-nums">
                    {budget[0].toLocaleString("en-PK")} – {budget[1].toLocaleString("en-PK")}
                  </span>
              </div>

              <MoreFilters value={extra} onChange={setExtra} />

                <Slider value={budget} onValueChange={(v) => setBudget([v[0], v[1]] as [number, number])} min={10000} max={1000000} step={5000} className="mt-3" />
              </div>

              <div className="md:col-span-12">
                <Button onClick={() => setSubmitted(true)} className="h-12 w-full bg-navy text-navy-foreground hover:bg-navy/90 md:w-auto md:px-10">
                  <Search className="mr-2 h-4 w-4" /> Search rentals
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto mt-16 max-w-6xl px-4 pb-20 sm:mt-20 sm:px-6 sm:pb-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-green">
                {submitted ? "Matching rentals" : "All rentals"}
              </p>
              <h2 className="mt-1 text-xl font-medium sm:text-2xl">
                {filtered.length} {filtered.length === 1 ? "rental" : "rentals"}
              </h2>
            </div>
            <Link to="/" className="shrink-0 text-sm text-muted-foreground hover:text-navy">Looking to buy? →</Link>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">No rentals match your filters.</p>
              <Button variant="link" onClick={() => setSubmitted(false)} className="mt-1 text-navy">Clear filters</Button>
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
