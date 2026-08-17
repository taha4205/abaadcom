import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { MapPin, Check, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property-card";
import { AreaLocalData } from "@/components/area-local-data";
import { findAreaGuide, areaGuideSlug } from "@/lib/area-guides";
import { benchmarkFor } from "@/lib/area-benchmarks";
import {
  SEED_PROPERTIES, getLiveListings, subscribeListings, fetchLiveListings, sortProperties,
} from "@/lib/properties";
import { fmtPKRShort } from "@/lib/units";

export const Route = createFileRoute("/area/$slug")({
  loader: ({ params }) => {
    const guide = findAreaGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const area = loaderData?.guide.area ?? "Karachi";
    const title = `${area} area guide — property prices & amenities | abaad.com`;
    const description = `${area}, Karachi: neighbourhood character, local amenities and current asking prices from live abaad.com listings.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${area} area guide — abaad.com` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AreaGuidePage,
  errorComponent: () => <Fallback title="Something went wrong" />,
  notFoundComponent: () => <Fallback title="Area guide not found" />,
});

function Fallback({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl">{title}</h1>
        <Link to="/areas" className="mt-4 inline-flex items-center text-sm text-navy underline">
          <ArrowLeft className="mr-1 h-4 w-4" /> All area guides
        </Link>
      </main>
      <Footer />
    </div>
  );
}

function AreaGuidePage() {
  const { guide } = Route.useLoaderData();
  useEffect(() => { fetchLiveListings(); }, []);
  const live = useSyncExternalStore(
    (cb) => subscribeListings(cb),
    () => getLiveListings(),
    () => getLiveListings(),
  );

  const listings = useMemo(
    () => sortProperties([...live, ...SEED_PROPERTIES].filter((p) => p.area === guide.area), "newest"),
    [live, guide.area],
  );
  const prices = listings.map((p) => p.priceNum).filter((n) => n > 0);
  const bench = benchmarkFor(guide.area);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/areas" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Area guides
        </Link>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">{guide.area}</h1>
        <Badge variant="outline" className="mt-3 text-[11px]"><MapPin className="mr-1 h-3 w-3" />{guide.vibe}</Badge>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{guide.blurb}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Live listings" value={String(listings.length)} />
          <Stat label="Asking range" value={prices.length ? `${fmtPKRShort(Math.min(...prices))} – ${fmtPKRShort(Math.max(...prices))}` : "—"} />
          <Stat
            label="Benchmark rate"
            value={bench ? `${fmtPKRShort(bench.low)} – ${fmtPKRShort(bench.high)} / sq yd` : "Not available"}
          />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl">What's nearby</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {guide.amenities.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" /> {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <AreaLocalData area={guide.area} />
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl">Properties in {guide.area}</h2>
          {listings.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No live listings in this area right now.</p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 9).map((p) => <PropertyCard key={String(p.id)} p={p} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}

export { areaGuideSlug };
