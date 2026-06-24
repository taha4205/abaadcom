import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Check, Sparkles, Loader2, ArrowLeft, Building2, Home, Store, TreePine,
  CheckCircle2, AlertTriangle, TrendingDown, MapPin, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import {
  KARACHI_AREAS, PACKAGES, addListing, formatPKR,
  type Intent, type Category,
} from "@/lib/properties";
import { assistListing, type ListingAiResult } from "@/lib/listing-ai.functions";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List your property — abaad.com" },
      { name: "description", content: "Pick a realtor package and list your Karachi property on abaad.com. Get AI help writing the listing and pricing it fairly." },
      { property: "og:title", content: "List on abaad.com" },
      { property: "og:description", content: "Realtor packages and AI-assisted listing for Karachi properties." },
    ],
  }),
  component: ListPage,
});

const UNSPLASH = [
  "photo-1568605114967-8130f3a36994",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1613490493576-7fde63acd811",
  "photo-1564013799919-ab600027ffc6",
  "photo-1570129477492-45c003edd2be",
  "photo-1600585154340-be6161a56a0c",
];

type Tier = "Silver" | "Gold" | "Platinum";

function ListPage() {
  const [tier, setTier] = useState<Tier | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {tier ? (
          <ListingForm tier={tier} onBack={() => setTier(null)} />
        ) : (
          <Packages onPick={setTier} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Packages({ onPick }: { onPick: (t: Tier) => void }) {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-green">For realtors</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          Pick a package to start listing
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Listings on abaad.com are realtor-only. Pick a package, get connected directly with buyers and tenants — no middlemen.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => {
          const featured = p.tier === "Gold";
          return (
            <article
              key={p.tier}
              className={`relative flex flex-col rounded-2xl border p-6 transition hover:shadow-lg sm:p-8 ${
                featured
                  ? "border-navy/30 bg-card shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] md:scale-[1.02]"
                  : "border-border bg-card"
              }`}
            >
              {featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-green text-green-foreground">
                  Most popular
                </Badge>
              )}
              <p className="font-display text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {p.tier}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-medium tracking-tight text-navy">
                  {p.price.toLocaleString("en-PK")}
                </span>
                <span className="text-sm text-muted-foreground">PKR</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">one-time</p>

              <ul className="mt-6 space-y-2.5 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  toast.success(`${p.tier} package selected · PKR ${p.price.toLocaleString("en-PK")}`, {
                    description: "Payment is simulated for this demo.",
                  });
                  onPick(p.tier);
                }}
                className={`mt-8 h-11 w-full ${
                  featured
                    ? "bg-navy text-navy-foreground hover:bg-navy/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                Choose {p.tier}
              </Button>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
        This is a demo paywall. No payment is collected. Real Stripe / bank checkout can be wired in once you're ready to go live.
      </p>
    </div>
  );
}

function ListingForm({ tier, onBack }: { tier: Tier; onBack: () => void }) {
  const navigate = useNavigate();
  const assist = useServerFn(assistListing);

  const [intent, setIntent] = useState<Intent>("buy");
  const [category, setCategory] = useState<Category>("house");
  const [area, setArea] = useState("DHA Phase 6");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(3);
  const [size, setSize] = useState(2500);
  const [price, setPrice] = useState(50000000);
  const [realtor, setRealtor] = useState("");
  const [plotSize, setPlotSize] = useState<[number, number]>([200, 800]);

  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<ListingAiResult | null>(null);

  const filteredAreas = KARACHI_AREAS.filter((a) => a !== "Any area");
  const unit = category === "plot" ? "sq yd" : "sq ft";

  async function runAi() {
    if (!area || !size || !price) {
      toast.error("Add area, size and price first.");
      return;
    }
    setAiBusy(true);
    try {
      const result = await assist({
        data: {
          area, category, intent,
          beds: category === "plot" || category === "commercial" ? 0 : beds,
          baths: category === "plot" ? 0 : baths,
          size: category === "plot" ? plotSize[1] : size,
          price,
          rawTitle: title,
          rawDescription: description,
        },
      });
      setAi(result);
      toast.success("AI assistant ready");
    } catch (err) {
      console.error(err);
      toast.error("AI assistant failed", { description: err instanceof Error ? err.message : "Try again." });
    } finally {
      setAiBusy(false);
    }
  }

  function applyAiCopy() {
    if (!ai) return;
    setTitle(ai.polishedTitle);
    setDescription(ai.polishedDescription);
    toast.success("Applied AI copy");
  }

  function submitListing() {
    if (!title.trim() || !realtor.trim() || !price || !size) {
      toast.error("Fill title, realtor name, size and price.");
      return;
    }
    const finalSize = category === "plot" ? plotSize[1] : size;
    const image = `https://images.unsplash.com/${UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]}?w=900&q=80&auto=format&fit=crop`;
    addListing({
      title: title.trim(),
      area,
      price: formatPKR(price, intent),
      priceNum: price,
      intent,
      category,
      beds: category === "plot" || category === "commercial" ? 0 : beds,
      baths: category === "plot" ? 0 : baths,
      size: finalSize,
      featured: tier !== "Silver",
      realtor: realtor.trim(),
      image,
      tier,
    });
    toast.success("Listing published", { description: "It's live on the homepage." });
    navigate({ to: "/" });
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Change package
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          List your property
        </h1>
        <Badge className={
          tier === "Platinum" ? "bg-navy text-navy-foreground"
            : tier === "Gold" ? "bg-green text-green-foreground"
            : "bg-secondary text-secondary-foreground"
        }>{tier} package</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill the same details a buyer searches by. Use the AI assistant on the right to fact-check your price and polish the copy.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* FORM */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <Section label="Looking to">
            <div className="inline-flex rounded-full border border-border bg-secondary p-1">
              {(["buy", "rent"] as Intent[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntent(opt)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    intent === opt ? "bg-navy text-navy-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt === "buy" ? "Sell" : "Rent out"}
                </button>
              ))}
            </div>
          </Section>

          <Section label="Property type">
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
                  className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-medium transition ${
                    category === v ? "bg-card text-navy shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l}
                </button>
              ))}
            </div>
          </Section>

          <div className="grid gap-5 sm:grid-cols-2">
            <Section label="Area">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="h-11 w-full"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
                <SelectContent>{filteredAreas.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
              </Select>
            </Section>
            <Section label="Realtor / Agency name">
              <Input value={realtor} onChange={(e) => setRealtor(e.target.value)} placeholder="e.g. Skyline Realty" className="h-11" />
            </Section>
          </div>

          {category === "plot" ? (
            <Section label={`Plot size range (${unit})`}>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-xs text-muted-foreground">Range buyers should match</span>
                <span className="text-sm font-medium tabular-nums">{plotSize[0]} – {plotSize[1]} {unit}</span>
              </div>
              <Slider value={plotSize} onValueChange={(v) => setPlotSize([v[0], v[1]] as [number, number])} min={80} max={2000} step={20} />
            </Section>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {category !== "commercial" && (
                <Section label="Bedrooms">
                  <Input type="number" min={0} max={20} value={beds} onChange={(e) => setBeds(Number(e.target.value))} className="h-11" />
                </Section>
              )}
              <Section label="Bathrooms">
                <Input type="number" min={0} max={20} value={baths} onChange={(e) => setBaths(Number(e.target.value))} className="h-11" />
              </Section>
              <Section label={`Covered area (${unit})`}>
                <Input type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-11" />
              </Section>
            </div>
          )}

          <Section label={intent === "rent" ? "Monthly rent (PKR)" : "Asking price (PKR)"}>
            <Input type="number" min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-11" />
            <p className="mt-1 text-xs text-muted-foreground">{formatPKR(price || 0, intent)}</p>
          </Section>

          <Section label="Listing title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 5-Bed Bungalow with Lawn in DHA Phase 6" className="h-11" />
          </Section>

          <Section label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Highlight features buyers care about — view, location, condition, parking, etc." rows={4} />
          </Section>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={runAi} disabled={aiBusy} className="h-11">
              {aiBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {ai ? "Re-run AI assistant" : "Get AI help"}
            </Button>
            <Button onClick={submitListing} className="h-11 bg-navy text-navy-foreground hover:bg-navy/90">
              Publish listing
            </Button>
          </div>
        </div>

        {/* AI PANEL */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AiPanel ai={ai} busy={aiBusy} onRun={runAi} onApply={applyAiCopy} askingPrice={price} intent={intent} />
        </aside>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AiPanel({
  ai, busy, onRun, onApply, askingPrice, intent,
}: {
  ai: ListingAiResult | null;
  busy: boolean;
  onRun: () => void;
  onApply: () => void;
  askingPrice: number;
  intent: Intent;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-br from-navy to-navy/90 text-navy-foreground">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green text-green-foreground">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Listing assistant</p>
            <p className="text-[11px] text-white/60">AI-powered · Karachi market</p>
          </div>
        </div>

        {!ai && !busy && (
          <p className="mt-4 text-sm text-white/75">
            I'll polish your title and description, and fact-check your asking price against the Karachi market. Fill the basics on the left, then run me.
          </p>
        )}

        {busy && (
          <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking market data…
          </div>
        )}

        {ai && !busy && (
          <div className="mt-5 space-y-5 text-sm">
            <Verdict ai={ai} askingPrice={askingPrice} intent={intent} />

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">Suggested title</p>
              <p className="mt-1 font-display text-base leading-snug">{ai.polishedTitle}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">Suggested description</p>
              <p className="mt-1 text-sm leading-relaxed text-white/85">{ai.polishedDescription}</p>
            </div>

            <Button onClick={onApply} className="w-full bg-green text-green-foreground hover:bg-green/90">
              Apply AI copy to form
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-white/5 px-5 py-3 sm:px-6">
        <button
          onClick={onRun}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" /> {ai ? "Re-analyze" : "Run analysis"}
        </button>
      </div>
    </div>
  );
}

function Verdict({ ai, askingPrice, intent }: { ai: ListingAiResult; askingPrice: number; intent: Intent }) {
  const tone =
    ai.verdict === "fair" ? { Icon: CheckCircle2, bg: "bg-green/15 border-green/30 text-green", label: "Fairly priced" }
      : ai.verdict === "over" ? { Icon: AlertTriangle, bg: "bg-orange-400/15 border-orange-400/30 text-orange-300", label: "Priced above market" }
      : { Icon: TrendingDown, bg: "bg-sky-400/15 border-sky-400/30 text-sky-300", label: "Priced below market" };
  return (
    <div className={`rounded-lg border p-3 ${tone.bg}`}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
        <tone.Icon className="h-3.5 w-3.5" /> {tone.label}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-white/85">{ai.reasoning}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Stat label="Your ask" value={formatPKR(askingPrice, intent)} />
        <Stat label="Fair min" value={formatPKR(ai.fairMin, intent)} />
        <Stat label="Fair max" value={formatPKR(ai.fairMax, intent)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-white/55">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-white">{value}</p>
    </div>
  );
}
