import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import {
  Loader2, LogIn, Clock, Pencil, Eye, EyeOff, RefreshCw, Plus, ShieldCheck,
  Building2, Home as HomeIcon, Store, TreePine, Sparkles, Bed, Bath, Maximize, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import { AuthModal } from "@/components/auth-modal";
import { KARACHI_AREAS, formatPKR, type Intent, type Category } from "@/lib/properties";
import { useAuth, type RealtorProfile } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { estimatePrice } from "@/lib/price-estimator.functions";

export const Route = createFileRoute("/my-listings")({
  head: () => ({ meta: [{ title: "My Listings — abaad.com" }, { name: "robots", content: "noindex" }] }),
  component: MyListingsPage,
});

type Listing = {
  id: string;
  realtor_id: string;
  title: string;
  area: string;
  intent: Intent;
  category: Category;
  beds: number;
  baths: number;
  size_sqyd: number;
  price_num: number;
  price_text: string;
  tier: "Silver" | "Gold" | "Platinum";
  whatsapp_number: string | null;
  image_url: string | null;
  verified: boolean;
  is_active: boolean;
};

function MyListingsPage() {
  const { user, realtor, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {loading ? (
          <Center><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Center>
        ) : !user ? (
          <EmptyCard
            Icon={LogIn}
            title="Sign in to view your listings"
            body="My Listings is for approved realtors. Sign in or create an account to continue."
            cta={<Button onClick={() => setAuthOpen(true)} className="mt-6 bg-navy text-navy-foreground hover:bg-navy/90">Sign in</Button>}
          />
        ) : !realtor ? (
          <Center><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Center>
        ) : realtor.status === "pending" ? (
          <EmptyCard
            Icon={Clock}
            title="Your account is under review"
            body={`Thanks, ${realtor.full_name}. We'll contact you on WhatsApp (${realtor.phone}) once approved.`}
          />
        ) : realtor.status === "rejected" ? (
          <EmptyCard Icon={Clock} title="Application rejected" body="Please contact support." />
        ) : (
          <Dashboard realtor={realtor} />
        )}
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center py-20">{children}</div>;
}

function EmptyCard({ Icon, title, body, cta }: { Icon: any; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">
      <Icon className="h-10 w-10 text-navy" />
      <h2 className="mt-4 font-display text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {cta}
    </div>
  );
}

function Dashboard({ realtor }: { realtor: RealtorProfile }) {
  const [tab, setTab] = useState<"my" | "add">("my");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Listing | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("realtor_id", realtor.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setListings((data ?? []) as Listing[]);
  }, [realtor.id]);

  useEffect(() => { reload(); }, [reload]);

  async function toggleActive(l: Listing) {
    const next = !l.is_active;
    setListings((ls) => ls.map((x) => x.id === l.id ? { ...x, is_active: next } : x));
    const { error } = await supabase.from("listings").update({ is_active: next }).eq("id", l.id);
    if (error) {
      toast.error(error.message);
      reload();
    } else {
      toast.success(next ? "Listing activated" : "Listing deactivated");
    }
  }

  const tierColor =
    realtor.package_tier === "Platinum" ? "bg-navy text-navy-foreground" :
    realtor.package_tier === "Gold" ? "bg-amber-500 text-white" : "bg-secondary text-foreground";

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-green">Realtor dashboard</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">Welcome back, {realtor.full_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{realtor.agency_name}</p>
          </div>
          <Badge className={tierColor}>{realtor.package_tier} tier</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="my">My Listings</TabsTrigger>
          <TabsTrigger value="add"><Plus className="h-3.5 w-3.5" /> Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{listings.length} listing{listings.length === 1 ? "" : "s"}</p>
            <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {loading ? (
            <Center><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></Center>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">You have no listings yet.</p>
              <Button onClick={() => setTab("add")} className="mt-4 bg-navy text-navy-foreground hover:bg-navy/90">Add your first one →</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} l={l} onEdit={() => setEditing(l)} onToggle={() => toggleActive(l)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <AddListingForm
            realtor={realtor}
            onCreated={() => { setTab("my"); reload(); }}
          />
        </TabsContent>
      </Tabs>

      {editing && (
        <EditDialog
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}

function ListingCard({ l, onEdit, onToggle }: { l: Listing; onEdit: () => void; onToggle: () => void }) {
  const img = l.image_url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop";
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img src={img} alt={l.title} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex gap-2">
          {l.verified && (
            <Badge className="border-0 bg-green text-green-foreground"><ShieldCheck className="mr-1 h-3 w-3" /> Verified</Badge>
          )}
          <Badge className={l.is_active ? "border-0 bg-green text-green-foreground" : "border-0 bg-muted text-foreground"}>
            {l.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-navy">
          {l.intent === "buy" ? "For Sale" : "For Rent"}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />{l.area}
        </div>
        <h3 className="mt-1.5 font-display text-base leading-snug line-clamp-2 min-h-[2.6em]">{l.title}</h3>
        <p className="mt-2 text-xl font-medium text-navy">{l.price_text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {l.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {l.beds}</span>}
          {l.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {l.baths}</span>}
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {l.size_sqyd} {l.category === "plot" ? "sq yd" : "sq ft"}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          <Button variant="outline" size="sm" onClick={onToggle}>
            {l.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Deactivate</> : <><Eye className="h-3.5 w-3.5" /> Activate</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

const CATS: { v: Category; l: string; Icon: any }[] = [
  { v: "flat", l: "Flat", Icon: Building2 },
  { v: "house", l: "House", Icon: HomeIcon },
  { v: "commercial", l: "Shop", Icon: Store },
  { v: "plot", l: "Plot", Icon: TreePine },
];

type FormState = {
  title: string; area: string; intent: Intent; category: Category;
  beds: number; baths: number; size: number; price: number;
  whatsapp: string; imageUrl: string;
};

function ListingFields({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const estimate = useServerFn(estimatePrice);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  async function runEstimate() {
    setAiBusy(true); setAiText(null);
    try {
      const r = await estimate({ data: { area: s.area, category: s.category, intent: s.intent, size: s.size, beds: s.beds, baths: s.baths } });
      setAiText(r.estimate);
    } catch (e: any) { toast.error(e?.message ?? "AI unavailable"); }
    finally { setAiBusy(false); }
  }

  return (
    <div className="space-y-5">
      <div><Label>Title</Label><Input value={s.title} onChange={(e) => set({ title: e.target.value })} required /></div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Intent</Label>
          <div className="mt-1 inline-flex rounded-md border border-border bg-secondary p-1">
            {(["buy","rent"] as Intent[]).map((o) => (
              <button type="button" key={o} onClick={() => set({ intent: o })} className={`rounded px-4 py-1.5 text-sm font-medium capitalize ${s.intent === o ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}>{o === "buy" ? "Sell" : "Rent"}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Area</Label>
          <Select value={s.area} onValueChange={(v) => set({ area: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{KARACHI_AREAS.filter((a) => a !== "Any area").map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <div className="mt-1 grid grid-cols-4 gap-1 rounded-md border border-border bg-secondary p-1">
          {CATS.map(({ v, l, Icon }) => (
            <button type="button" key={v} onClick={() => set({ category: v })} className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded text-[11px] font-medium ${s.category === v ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}>
              <Icon className="h-4 w-4" />{l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div><Label>Beds</Label><Input type="number" min={0} value={s.beds} onChange={(e) => set({ beds: Number(e.target.value) })} disabled={s.category === "plot"} /></div>
        <div><Label>Baths</Label><Input type="number" min={0} value={s.baths} onChange={(e) => set({ baths: Number(e.target.value) })} disabled={s.category === "plot"} /></div>
        <div><Label>Size (sq yd)</Label><Input type="number" min={1} value={s.size} onChange={(e) => set({ size: Number(e.target.value) })} /></div>
      </div>

      <div>
        <Label>Price (PKR{s.intent === "rent" ? " / month" : ""})</Label>
        <Input type="number" min={0} value={s.price} onChange={(e) => set({ price: Number(e.target.value) })} />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><Label>WhatsApp number</Label><Input value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="923001234567" /></div>
        <div><Label>Image URL</Label><Input value={s.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" /></div>
      </div>
    </div>
  );
}

function AddListingForm({ realtor, onCreated }: { realtor: RealtorProfile; onCreated: () => void }) {
  const [s, setS] = useState<FormState>({
    title: "", area: "DHA Phase 6", intent: "buy", category: "house",
    beds: 3, baths: 3, size: 500, price: 50000000, whatsapp: realtor.phone || "", imageUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!s.title.trim()) return toast.error("Title required");
    setBusy(true);
    const { error } = await supabase.from("listings").insert({
      realtor_id: realtor.id, title: s.title, area: s.area, intent: s.intent, category: s.category,
      beds: s.category === "plot" ? 0 : s.beds,
      baths: s.category === "plot" ? 0 : s.baths,
      size_sqyd: s.size, price_num: s.price, price_text: formatPKR(s.price, s.intent),
      tier: realtor.package_tier,
      whatsapp_number: s.whatsapp || null,
      image_url: s.imageUrl || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Listing published!");
    onCreated();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <ListingFields s={s} set={set} />
      <Button type="submit" disabled={busy} className="mt-6 w-full bg-navy text-navy-foreground hover:bg-navy/90">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Publish listing
      </Button>
    </form>
  );
}

function EditDialog({ listing, onClose, onSaved }: { listing: Listing; onClose: () => void; onSaved: () => void }) {
  const [s, setS] = useState<FormState>({
    title: listing.title, area: listing.area, intent: listing.intent, category: listing.category,
    beds: listing.beds, baths: listing.baths, size: listing.size_sqyd, price: listing.price_num,
    whatsapp: listing.whatsapp_number ?? "", imageUrl: listing.image_url ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  async function save() {
    if (!s.title.trim()) return toast.error("Title required");
    setBusy(true);
    const { error } = await supabase.from("listings").update({
      title: s.title, area: s.area, intent: s.intent, category: s.category,
      beds: s.category === "plot" ? 0 : s.beds,
      baths: s.category === "plot" ? 0 : s.baths,
      size_sqyd: s.size, price_num: s.price, price_text: formatPKR(s.price, s.intent),
      whatsapp_number: s.whatsapp || null,
      image_url: s.imageUrl || null,
    }).eq("id", listing.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Listing updated");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit listing</DialogTitle>
        </DialogHeader>
        <div className="mt-2"><ListingFields s={s} set={set} /></div>
        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy} className="bg-navy text-navy-foreground hover:bg-navy/90">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
