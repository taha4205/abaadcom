import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ArrowRight, Search } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { responseTimeLabel } from "@/lib/realtors";
import { KARACHI_AREAS } from "@/lib/properties";

export const Route = createFileRoute("/realtors")({
  head: () => ({
    meta: [
      { title: "Verified Realtors in Karachi — abaad.com" },
      { name: "description", content: "Browse verified real estate agents and agencies across Karachi. Filter by area and tier, then connect on WhatsApp." },
      { property: "og:title", content: "Verified Realtors — abaad.com" },
      { property: "og:description", content: "Karachi's verified property realtors and agencies." },
    ],
    links: [{ rel: "canonical", href: "/realtors" }],
  }),
  component: RealtorsPage,
});

type Realtor = {
  id: string;
  full_name: string;
  agency_name: string;
  package_tier: string;
  response_time: string | null;
  phone: string | null;
  areas: string[];
  count: number;
};

const TIERS = ["All", "Platinum", "Gold", "Silver"] as const;
const WA_ABAAD = "923001234567";

function RealtorsPage() {
  const [rows, setRows] = useState<Realtor[]>([]);
  const [areaQuery, setAreaQuery] = useState("");
  const [area, setArea] = useState<string>("Any area");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("All");
  const [openArea, setOpenArea] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("realtors")
        .select("id, full_name, agency_name, package_tier, response_time, phone, listings(id, area, is_active)")
        .eq("status", "approved");
      if (!data) return;
      const mapped: Realtor[] = data.map((r: any) => {
        const active = (r.listings ?? []).filter((l: any) => l.is_active);
        const areaCounts = new Map<string, number>();
        for (const l of active) areaCounts.set(l.area, (areaCounts.get(l.area) ?? 0) + 1);
        const areas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
        return {
          id: r.id,
          full_name: r.full_name,
          agency_name: r.agency_name,
          package_tier: r.package_tier,
          response_time: r.response_time,
          phone: r.phone,
          areas,
          count: active.length,
        };
      });
      setRows(mapped);
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (tier === "All" ? true : r.package_tier === tier))
      .filter((r) => (area === "Any area" ? true : r.areas.includes(area)))
      .sort((a, b) => b.count - a.count);
  }, [rows, tier, area]);

  const areaOptions = useMemo(
    () => KARACHI_AREAS.filter((a) => a.toLowerCase().includes(areaQuery.toLowerCase())),
    [areaQuery]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-green">Realtors</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-navy sm:text-5xl">
            Karachi's verified realtors.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Connect directly with approved agents and agencies. Filter by area or tier and reach out on WhatsApp.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={area === "Any area" ? "Filter by area…" : area}
              value={openArea ? areaQuery : area === "Any area" ? "" : area}
              onFocus={() => { setOpenArea(true); setAreaQuery(""); }}
              onChange={(e) => { setOpenArea(true); setAreaQuery(e.target.value); }}
              className="pl-9"
            />
            {openArea && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-md border border-border bg-card shadow-md">
                {areaOptions.map((a) => (
                  <button
                    key={a}
                    onMouseDown={(e) => { e.preventDefault(); setArea(a); setOpenArea(false); }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-secondary ${a === area ? "font-medium text-navy" : ""}`}
                  >
                    {a}
                  </button>
                ))}
                {areaOptions.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p>}
              </div>
            )}
          </div>
          <div className="inline-flex rounded-md border border-border bg-secondary p-1">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  tier === t ? "bg-navy text-navy-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-lg text-navy">No realtors match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Reach out to abaad and we'll connect you with the right realtor.</p>
            <a
              href={`https://wa.me/${WA_ABAAD}?text=${encodeURIComponent("Hi abaad, I'm looking for a realtor in Karachi.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-green px-5 py-2.5 text-sm font-medium text-green-foreground hover:bg-green/90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp abaad
            </a>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const rt = responseTimeLabel(r.response_time);
              const initial = r.agency_name.charAt(0).toUpperCase();
              const wa = (r.phone ?? WA_ABAAD).replace(/\D/g, "");
              return (
                <article key={r.id} className="flex flex-col rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy font-display text-lg text-navy-foreground">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-medium">{r.agency_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.full_name}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="border-0 bg-navy text-navy-foreground">{r.package_tier}</Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${rt.dot}`} /> {rt.label}
                    </Badge>
                  </div>
                  {r.areas.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Active in <span className="text-foreground">{r.areas.slice(0, 3).join(", ")}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{r.count}</span> active {r.count === 1 ? "listing" : "listings"}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${r.full_name}, I saw your profile on abaad.com — can you share your rates?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-md bg-green px-3 py-2 text-sm font-medium text-green-foreground hover:bg-green/90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/70"
                    >
                      Listings <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
