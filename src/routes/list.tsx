import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Loader2, Building2, Home, Store, TreePine, Sparkles, LogIn, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import { AuthModal } from "@/components/auth-modal";
import {
  KARACHI_AREAS, formatPKR, type Intent, type Category,
} from "@/lib/properties";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { estimatePrice } from "@/lib/price-estimator.functions";
import { checkRateLimit, RATE_LIMIT_MAX } from "@/lib/rate-limit";
import { sanitizeInput, sanitizeNumber } from "@/lib/utils";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List your property — abaad.com" },
      { name: "description", content: "Sign in as an approved realtor to list your Karachi property on abaad.com." },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const { user, realtor, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-green">For realtors</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">List a property</h1>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !user ? (
            <Card>
              <LogIn className="h-10 w-10 text-navy" />
              <h2 className="mt-4 font-display text-xl">Sign in to list your property</h2>
              <p className="mt-2 text-sm text-muted-foreground">Listings on abaad.com are for approved realtors only. Sign in or create an account to continue.</p>
              <Button onClick={() => setAuthOpen(true)} className="mt-6 bg-navy text-navy-foreground hover:bg-navy/90">Sign in / Create account</Button>
            </Card>
          ) : !realtor ? (
            <Card><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Loading your profile…</p></Card>
          ) : realtor.status === "pending" ? (
            <Card>
              <Clock className="h-10 w-10 text-amber-500" />
              <h2 className="mt-4 font-display text-xl">Your account is under review</h2>
              <p className="mt-2 text-sm text-muted-foreground">Thanks, {realtor.full_name}. We'll contact you on WhatsApp ({realtor.phone}) once approved. Your selected package: <strong>{realtor.package_tier}</strong>.</p>
            </Card>
          ) : realtor.status === "rejected" ? (
            <Card><p className="text-sm text-destructive">Your account application was rejected. Please contact support.</p></Card>
          ) : (
            <ListingForm realtorId={realtor.id} tier={realtor.package_tier} />
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">{children}</div>;
}

function ListingForm({ realtorId, tier }: { realtorId: string; tier: "Silver" | "Gold" | "Platinum" }) {
  const estimate = useServerFn(estimatePrice);
  const [intent, setIntent] = useState<Intent>("buy");
  const [category, setCategory] = useState<Category>("house");
  const [area, setArea] = useState("DHA Phase 6");
  const [title, setTitle] = useState("");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(3);
  const [size, setSize] = useState(500);
  const [price, setPrice] = useState(50000000);
  const [whatsapp, setWhatsapp] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  // Past listings
  const [mine, setMine] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("listings").select("*").eq("realtor_id", realtorId).order("created_at", { ascending: false }).then(({ data }) => setMine(data ?? []));
  }, [realtorId, busy]);

  async function runEstimate() {
    const rl = checkRateLimit();
    if (!rl.allowed) {
      return toast.error(`You've used your ${RATE_LIMIT_MAX} free price estimates for this hour. Try again later.`);
    }
    setAiBusy(true);
    setAiText(null);
    try {
      const r = await estimate({ data: { area, category, intent, size, beds, baths } });
      setAiText(r.estimate);
    } catch (e: any) {
      toast.error(e?.message ?? "AI unavailable");
    } finally {
      setAiBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = sanitizeInput(title);
    if (!cleanTitle) return toast.error("Title required");
    setBusy(true);
    const cleanSize = sanitizeNumber(size);
    const cleanPrice = sanitizeNumber(price);
    const cleanBeds = sanitizeNumber(beds);
    const cleanBaths = sanitizeNumber(baths);
    const { error } = await supabase.from("listings").insert({
      realtor_id: realtorId, title: cleanTitle, area, intent, category,
      beds: category === "plot" ? 0 : cleanBeds,
      baths: category === "plot" ? 0 : cleanBaths,
      size_sqyd: cleanSize, price_num: cleanPrice, price_text: formatPKR(cleanPrice, intent),
      tier,
      whatsapp_number: whatsapp ? sanitizeInput(whatsapp) : null,
      image_url: imageUrl ? imageUrl.trim() : null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Listing published!");
    setTitle(""); setImageUrl("");
  }

  const cats: { v: Category; l: string; Icon: any }[] = [
    { v: "flat", l: "Flat", Icon: Building2 },
    { v: "house", l: "House", Icon: Home },
    { v: "commercial", l: "Shop", Icon: Store },
    { v: "plot", l: "Plot", Icon: TreePine },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl">New listing</h2>
          <Badge className="bg-navy text-navy-foreground">{tier} tier</Badge>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Modern 3-bed apartment with sea view" required /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Intent</Label>
              <div className="mt-1 inline-flex rounded-md border border-border bg-secondary p-1">
                {(["buy","rent"] as Intent[]).map((o) => (
                  <button type="button" key={o} onClick={() => setIntent(o)} className={`rounded px-4 py-1.5 text-sm font-medium capitalize ${intent === o ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}>{o === "buy" ? "Sell" : "Rent"}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Area</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{KARACHI_AREAS.filter((a) => a !== "Any area").map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1 grid grid-cols-4 gap-1 rounded-md border border-border bg-secondary p-1">
              {cats.map(({ v, l, Icon }) => (
                <button type="button" key={v} onClick={() => setCategory(v)} className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-medium ${category === v ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />{l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><Label>Beds</Label><Input type="number" min={0} value={beds} onChange={(e) => setBeds(Number(e.target.value))} disabled={category === "plot"} /></div>
            <div><Label>Baths</Label><Input type="number" min={0} value={baths} onChange={(e) => setBaths(Number(e.target.value))} disabled={category === "plot"} /></div>
            <div><Label>Size (sq yd)</Label><Input type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value))} /></div>
          </div>

          <div>
            <Label>Price (PKR{intent === "rent" ? " / month" : ""})</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <Button type="button" variant="outline" onClick={runEstimate} disabled={aiBusy} className="mt-2 text-xs">
              {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Estimate fair price with AI
            </Button>
            {aiText && (
              <div className="mt-3 rounded-md border-l-4 border-green bg-green/5 p-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-green">AI estimate</p>
                <p className="mt-1 text-foreground/90">{aiText}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>WhatsApp number</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="923001234567" /></div>
            <div><Label>Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></div>
          </div>

          <Button type="submit" disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Publish listing
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-display text-xl">My listings ({mine.length})</h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You haven't listed anything yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {mine.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.area} · {m.price_text}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.verified && <Badge className="bg-green text-green-foreground"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>}
                  {!m.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
