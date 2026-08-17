import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { AREA_GUIDES, areaGuideSlug } from "@/lib/area-guides";
import {
  SEED_PROPERTIES, getLiveListings, subscribeListings, fetchLiveListings,
} from "@/lib/properties";
import { fmtPKRShort } from "@/lib/units";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Karachi area guides — neighbourhoods, prices & amenities | abaad.com" },
      { name: "description", content: "Guides to Karachi's residential areas: what each neighbourhood is like, local amenities, and current asking prices from live abaad.com listings." },
      { property: "og:title", content: "Karachi area guides — abaad.com" },
      { property: "og:description", content: "Neighbourhood character, amenities and live asking prices across Karachi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AreasPage,
});

function AreasPage() {
  useEffect(() => { fetchLiveListings(); }, []);
  const live = useSyncExternalStore(
    (cb) => subscribeListings(cb),
    () => getLiveListings(),
    () => getLiveListings(),
  );
  const all = useMemo(() => [...live, ...SEED_PROPERTIES], [live]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-wider text-green">Area guides</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Karachi, neighbourhood by neighbourhood</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">What each area is actually like to live in, the amenities nearby, and what properties are asking on abaad.com right now.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREA_GUIDES.map((g) => {
            const listings = all.filter((p) => p.area === g.area);
            const prices = listings.filter((p) => p.price > 0).map((p) => p.price);
            return (
              <Link
                key={g.area}
                to="/area/$slug"
                params={{ slug: areaGuideSlug(g.area) }}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-navy/40"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg">{g.area}</h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <Badge variant="outline" className="mt-2 text-[11px]"><MapPin className="mr-1 h-3 w-3" />{g.vibe}</Badge>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{g.blurb}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {listings.length > 0
                    ? `${listings.length} listing${listings.length === 1 ? "" : "s"} · from ${fmtPKRShort(Math.min(...prices))}`
                    : "No live listings yet"}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
