import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Hammer } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AREA_UNITS, convertArea, constructionEstimate, coveredAreaSqft, CONSTRUCTION_RATES,
  fmtNum, fmtPKRShort, type AreaUnit, type FinishTier,
} from "@/lib/units";

export const Route = createFileRoute("/construction")({
  head: () => ({
    meta: [
      { title: "Construction Cost Calculator — Karachi rates | abaad.com" },
      { name: "description", content: "Estimate the cost of building a house in Karachi. Enter plot size, floors and finish tier to get grey-structure and finishing cost ranges at current market rates." },
      { property: "og:title", content: "Construction Cost Calculator — abaad.com" },
      { property: "og:description", content: "Grey structure + finishing cost estimates for Karachi construction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConstructionPage,
});

const UNITS = Object.keys(AREA_UNITS) as AreaUnit[];
const TIERS = Object.keys(CONSTRUCTION_RATES) as FinishTier[];

function ConstructionPage() {
  const [plot, setPlot] = useState("120");
  const [unit, setUnit] = useState<AreaUnit>("sqyd");
  const [floors, setFloors] = useState("2");
  const [coverage, setCoverage] = useState("70");
  const [tier, setTier] = useState<FinishTier>("standard");

  const result = useMemo(() => {
    const plotSqft = convertArea(Number(plot) || 0, unit, "sqft");
    const covered = coveredAreaSqft(plotSqft, Math.max(1, Number(floors) || 1), (Number(coverage) || 70) / 100);
    return { plotSqft, covered, est: constructionEstimate(covered, tier) };
  }, [plot, unit, floors, coverage, tier]);

  const rate = CONSTRUCTION_RATES[tier];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-green">Tools</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-navy sm:text-4xl">Construction cost calculator</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Indicative Karachi build costs. Grey structure covers the shell — foundation, columns, slabs, blockwork.
          Finishing covers tiles, wood, sanitary, wiring and paint.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Plot size</Label>
            <Input type="number" min={0} value={plot} onChange={(e) => setPlot(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as AreaUnit)}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{AREA_UNITS[u].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Floors</Label>
            <Select value={floors} onValueChange={setFloors}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4"].map((f) => (
                  <SelectItem key={f} value={f}>{f === "1" ? "Ground only" : `Ground + ${Number(f) - 1}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Covered ratio (%)</Label>
            <Input type="number" min={30} max={100} value={coverage} onChange={(e) => setCoverage(e.target.value)} className="h-12" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Finish tier</Label>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary p-1">
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`h-10 rounded text-xs font-medium transition ${
                    tier === t ? "bg-card text-navy shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {CONSTRUCTION_RATES[t].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{rate.note}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-navy p-6 text-navy-foreground">
          <div className="flex items-center gap-2 text-white/70">
            <Hammer className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Estimated total build cost</p>
          </div>
          <p className="mt-2 font-display text-3xl font-medium">
            {fmtPKRShort(result.est.totalLow)} – {fmtPKRShort(result.est.totalHigh)}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Covered area {fmtNum(result.covered, 0)} sq ft across {floors} floor{Number(floors) === 1 ? "" : "s"} on a{" "}
            {fmtNum(convertArea(result.plotSqft, "sqft", "sqyd"), 0)} sq yd plot.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Grey structure</p>
            <p className="mt-1 text-xl font-medium text-navy">
              {fmtPKRShort(result.est.greyLow)} – {fmtPKRShort(result.est.greyHigh)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PKR {rate.grey[0]}–{rate.grey[1]} / sq ft</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Finishing</p>
            <p className="mt-1 text-xl font-medium text-navy">
              {fmtPKRShort(result.est.finishLow)} – {fmtPKRShort(result.est.finishHigh)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PKR {rate.finish[0]}–{rate.finish[1]} / sq ft</p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What this excludes</p>
          <ul className="mt-2 space-y-1">
            <li>· Land cost, transfer and registration charges</li>
            <li>· Architect, structural design and approval fees</li>
            <li>· Boundary wall, landscaping and external works</li>
            <li>· Solar, lift and generator installations</li>
          </ul>
          <p className="mt-3 text-xs">Rates are indicative Karachi market ranges and move with steel and cement prices.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
