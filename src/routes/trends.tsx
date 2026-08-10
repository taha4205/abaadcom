import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Loader2, Eye, Building2 } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { getAreaTrends, type AreaTrend } from "@/lib/trends.functions";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Karachi Market Trends — Area Prices & Demand | abaad.com" },
      { name: "description", content: "Which Karachi neighbourhoods are heating up: area-level demand, listing volume and average asking price trends from live abaad.com listings." },
      { property: "og:title", content: "Karachi Market Trends — abaad.com" },
      { property: "og:description", content: "Area-level demand and average asking price trends for Karachi neighbourhoods." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrendsPage,
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Trends are unavailable right now</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
      </main>
      <Footer />
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function crore(n: number) {
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)} Lac`;
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3.5 w-3.5" /> New</span>;
  }
  const up = pct > 1;
  const down = pct < -1;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const cls = up ? "text-green" : down ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {pct > 0 ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function TrendsPage() {
  const fetchTrends = useServerFn(getAreaTrends);
  const { data, isLoading } = useQuery({
    queryKey: ["area-trends"],
    queryFn: () => fetchTrends(),
  });

  const trends = data?.trends ?? [];
  const byInterest = [...trends].sort((a, b) => (b.interestChangePct ?? -999) - (a.interestChangePct ?? -999));
  const rising = byInterest.filter((t) => (t.interestChangePct ?? 0) > 1).slice(0, 5);
  const cooling = [...byInterest].reverse().filter((t) => (t.interestChangePct ?? 0) < -1).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Karachi market trends</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Area-level demand and asking-price movement, computed from live abaad.com listings and buyer
          activity on the platform. Demand compares the last 90 days against everything before it.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Data source: abaad.com first-party listing &amp; view data (no third-party trends feed).
        </p>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : trends.length === 0 ? (
          <p className="mt-12 rounded-xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            Not enough listing data yet to show trends.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <TrendList title="Trending up" tone="up" rows={rising} />
              <TrendList title="Cooling down" tone="down" rows={cooling} />
            </div>

            <h2 className="mt-14 font-display text-2xl tracking-tight">Average asking price by area</h2>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Listings</th>
                    <th className="px-4 py-3">Avg asking price</th>
                    <th className="px-4 py-3">Price trend</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Demand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trends.map((t) => (
                    <tr key={t.area}>
                      <td className="px-4 py-3 font-medium">{t.area}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.activeListings}</td>
                      <td className="px-4 py-3">{crore(t.avgPrice)}</td>
                      <td className="px-4 py-3"><Delta pct={t.priceChangePct} /></td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {t.views}</span>
                      </td>
                      <td className="px-4 py-3"><Delta pct={t.interestChangePct} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Price trends use sale listings only; rental asking prices are excluded so the averages stay comparable.
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function TrendList({ title, tone, rows }: { title: string; tone: "up" | "down"; rows: AreaTrend[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        {tone === "up" ? <TrendingUp className="h-4 w-4 text-green" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No clear movement yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((t) => (
            <li key={t.area} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{t.area}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" /> {t.activeListings} listings · {crore(t.avgPrice)} avg
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                <Delta pct={t.interestChangePct} />
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
