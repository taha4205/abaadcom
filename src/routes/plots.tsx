import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MapPin, TreePine, Ruler } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  KARACHI_AREAS, SEED_PROPERTIES, getLiveListings, subscribeListings, fetchLiveListings,
  sortProperties, subAreasFor, type SortKey,
} from "@/lib/properties";
import { fmtPKRShort } from "@/lib/units";

export const Route = createFileRoute("/plots")({
  head: () => ({
    meta: [
      { title: "Plots for sale in Karachi — plot finder | abaad.com" },
      { name: "description", content: "Find residential and commercial plots for sale across Karachi. Filter by size in square yards, area, block and price range." },
      { property: "og:title", content: "Plot finder — abaad.com" },
      { property: "og:description", content: "Karachi plots filtered by size, area and price." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlotsPage,
});

const ANY = "Any area";
const ANY_SUB = "All blocks";
const SIZE: [number, number] = [80, 2000];
const PRICE: [number, number] = [2000000, 300000000];

function useListings() {
  useEffect(() => { fetchLiveListings(); }, []);
  return useSyncExternalStore(
    (cb) => subscribeListings(cb),
    () => getLiveListings(),
    () => getLiveListings(),
  );
}

function PlotsPage() {
  const live = useListings();
  const [area, setArea] = useState(ANY);
  const [subArea, setSubArea] = useState(ANY_SUB);
  const [size, setSize] = useState<[number, number]>(SIZE);
  const [price, setPrice] = useState<[number, number]>(PRICE);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const plots = useMemo(
    () => [...live, ...SEED_PROPERTIES].filter((p) => p.category === "plot"),
    [live],
  );
  const subs = useMemo(() => subAreasFor(plots, area), [plots, area]);
  useEffect(() => { setSubArea(ANY_SUB); }, [area]);

  const filtered = useMemo(() => {
    const base = plots.filter((p) => {
      if (area !== ANY && p.area !== area) return false;
      if (subArea !== ANY_SUB && (p.subArea ?? "") !== subArea) return false;
      if (p.size < size[0] || p.size > size[1]) return false;
      if (p.priceNum < price[0] || p.priceNum > price[1]) return false;
      return true;
    });
    return sortProperties(base, sortKey);
  }, [plots, area, subArea, size, price, sortKey]);

  const reset = () => { setArea(ANY); setSubArea(ANY_SUB); setSize(SIZE); setPrice(PRICE); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-navy text-navy-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15">
              <TreePine className="mr-1.5 h-3 w-3" /> Plot finder · {plots.length} plots listed
            </Badge>
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-medium sm:text-5xl">
              Land first,<br /><span className="italic text-green">build later.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-white/70 sm:text-base">
              Residential and commercial plots across Karachi — filter by size in square yards, area, block and budget.
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:p-6">
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-12 w-full"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
                  <SelectContent>{KARACHI_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Block / phase</Label>
                <Select value={subArea} onValueChange={setSubArea} disabled={subs.length === 0}>
                  <SelectTrigger className="h-12 w-full"><SelectValue placeholder={ANY_SUB} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_SUB}>{ANY_SUB}</SelectItem>
                    {subs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4">
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort</Label>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-12 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="low">Price: low to high</SelectItem>
                    <SelectItem value="high">Price: high to low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-6">
                <div className="mb-2 flex items-end justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Ruler className="mr-1 inline h-3.5 w-3.5" /> Plot size (sq yd)
                  </Label>
                  <span className="text-sm font-medium tabular-nums">{size[0]} – {size[1]}</span>
                </div>
                <Slider value={size} onValueChange={(v) => setSize([v[0], v[1]] as [number, number])} min={80} max={2000} step={20} className="mt-3" />
              </div>
              <div className="md:col-span-6">
                <div className="mb-2 flex items-end justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price (PKR)</Label>
                  <span className="text-sm font-medium tabular-nums">{fmtPKRShort(price[0])} – {fmtPKRShort(price[1])}</span>
                </div>
                <Slider value={price} onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} min={1000000} max={500000000} step={1000000} className="mt-3" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-green">Plot results</p>
              <h2 className="mt-1 text-xl font-medium sm:text-2xl">
                {filtered.length} {filtered.length === 1 ? "plot" : "plots"}
              </h2>
            </div>
            <Button variant="ghost" onClick={reset} className="text-muted-foreground">Reset filters</Button>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">No plots match these filters.</p>
              <Button variant="link" onClick={reset} className="mt-1 text-navy">Clear filters</Button>
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
