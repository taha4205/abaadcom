import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2, LogIn, Clock, Pencil, Eye, EyeOff, RefreshCw, Plus, ShieldCheck,
  Building2, Home as HomeIcon, Store, TreePine, Sparkles, Bed, Bath, Maximize, MapPin,
  Upload, X as XIcon, MessageCircle, Flame, Zap, Star, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Header, Footer } from "@/components/site-chrome";
import { AuthModal } from "@/components/auth-modal";
import { KARACHI_AREAS, formatPKR, uploadListingImage, type Intent, type Category } from "@/lib/properties";
import { useAuth, type RealtorProfile } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { estimatePrice } from "@/lib/price-estimator.functions";
import { BOOST_PLANS, boostStatus, purchaseBoost, cancelBoost, type BoostTier } from "@/lib/boosts";
import { FREE_SLOTS, paidCap, totalAllowance, freeSlotsUsed } from "@/lib/packages";
import { viewerLabel, type ListingViewRow } from "@/lib/views";
import { realtorReviewStats } from "@/lib/reviews";

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
  image_urls: string[] | null;
  verified: boolean;
  is_active: boolean;
  boost_tier: string | null;
  boost_expires_at: string | null;
};

type LeadRow = {
  id: string;
  listing_id: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  channel: string;
  created_at: string;
  listings?: { title: string; area: string } | null;
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
  const [tab, setTab] = useState<"my" | "add" | "leads" | "viewers">("my");
  const [listings, setListings] = useState<Listing[]>([]);
  const [views, setViews] = useState<ListingViewRow[]>([]);
  const [leads, setLeads] = useState<{ listing_id: string }[]>([]);
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [boosting, setBoosting] = useState<Listing | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [listingsRes, viewsRes, leadsRes, stats] = await Promise.all([
      supabase.from("listings").select("*").eq("realtor_id", realtor.id).order("created_at", { ascending: false }),
      supabase
        .from("listing_views")
        .select("*, listings(title, area)")
        .eq("realtor_id", realtor.id)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("leads").select("listing_id").eq("realtor_id", realtor.id),
      realtorReviewStats(realtor.id),
    ]);
    setLoading(false);
    if (listingsRes.error) return toast.error(listingsRes.error.message);
    setListings((listingsRes.data ?? []) as Listing[]);
    setViews((viewsRes.data as unknown as ListingViewRow[]) ?? []);
    setLeads((leadsRes.data as { listing_id: string }[]) ?? []);
    setRating(stats);
  }, [realtor.id]);

  useEffect(() => { reload(); }, [reload]);

  const viewsByListing = useMemo(() => {
    const m = new Map<string, number>();
    views.forEach((v) => m.set(v.listing_id, (m.get(v.listing_id) ?? 0) + 1));
    return m;
  }, [views]);

  const leadsByListing = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => m.set(l.listing_id, (m.get(l.listing_id) ?? 0) + 1));
    return m;
  }, [leads]);

  const identifiedViewers = useMemo(() => views.filter((v) => v.viewer_user_id).length, [views]);
  const allowance = totalAllowance(realtor.package_tier);
  const usedFree = freeSlotsUsed(listings.length);
  const activeBoosts = listings.filter((l) => boostStatus(l.boost_tier, l.boost_expires_at).active).length;

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

        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Listings" value={`${listings.length}/${allowance}`} sub={`${paidCap(realtor.package_tier)} paid + ${FREE_SLOTS} free`} />
          <Stat label="Free slots used" value={`${usedFree}/${FREE_SLOTS}`} />
          <Stat label="Total views" value={views.length} sub={`${identifiedViewers} identified`} />
          <Stat label="WhatsApp leads" value={leads.length} />
          <Stat label="Active boosts" value={activeBoosts} />
          <Stat
            label="Your rating"
            value={rating.count ? `${rating.avg.toFixed(1)} ★` : "—"}
            sub={rating.count ? `${rating.count} review${rating.count === 1 ? "" : "s"}` : "No reviews yet"}
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="my">My Listings</TabsTrigger>
          <TabsTrigger value="add"><Plus className="h-3.5 w-3.5" /> Add New</TabsTrigger>
          <TabsTrigger value="leads"><MessageCircle className="h-3.5 w-3.5" /> Leads</TabsTrigger>
          <TabsTrigger value="viewers"><Users className="h-3.5 w-3.5" /> Viewers</TabsTrigger>
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
              <p className="text-sm text-muted-foreground">You have no listings yet. Your first {FREE_SLOTS} are free.</p>
              <Button onClick={() => setTab("add")} className="mt-4 bg-navy text-navy-foreground hover:bg-navy/90">Add your first one →</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard
                  key={l.id}
                  l={l}
                  viewCount={viewsByListing.get(l.id) ?? 0}
                  leadCount={leadsByListing.get(l.id) ?? 0}
                  onEdit={() => setEditing(l)}
                  onToggle={() => toggleActive(l)}
                  onBoost={() => setBoosting(l)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          {listings.length >= allowance ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                You've used all {allowance} listing slots on the {realtor.package_tier} package
                ({paidCap(realtor.package_tier)} paid + {FREE_SLOTS} free). Upgrade your package to add more.
              </p>
            </div>
          ) : (
            <AddListingForm
              realtor={realtor}
              slotLabel={listings.length < FREE_SLOTS ? `This will use free slot ${listings.length + 1} of ${FREE_SLOTS}` : `Slot ${listings.length + 1} of ${allowance}`}
              onCreated={() => { setTab("my"); reload(); }}
            />
          )}
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <LeadsPanel realtorId={realtor.id} />
        </TabsContent>

        <TabsContent value="viewers" className="mt-6">
          <ViewersPanel views={views} listings={listings} loading={loading} onRefresh={reload} />
        </TabsContent>
      </Tabs>

      {editing && (
        <EditDialog
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      {boosting && (
        <BoostDialog
          listing={boosting}
          onClose={() => setBoosting(null)}
          onDone={() => { setBoosting(null); reload(); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-medium text-navy">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function BoostBadge({ l }: { l: Listing }) {
  const s = boostStatus(l.boost_tier, l.boost_expires_at);
  if (!s.active) return <Badge variant="outline" className="text-muted-foreground">No boost</Badge>;
  return (
    <Badge className={`border-0 ${s.tier === "super_hot" ? "bg-navy text-navy-foreground" : "bg-orange-600 text-white"}`}>
      {s.tier === "super_hot" ? <Zap className="mr-1 h-3 w-3 fill-current" /> : <Flame className="mr-1 h-3 w-3" />}
      {s.label} · {s.daysLeft}d left
    </Badge>
  );
}

function ListingCard({
  l, viewCount, leadCount, onEdit, onToggle, onBoost,
}: {
  l: Listing; viewCount: number; leadCount: number; onEdit: () => void; onToggle: () => void; onBoost: () => void;
}) {
  const img = l.image_url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop";
  const boost = boostStatus(l.boost_tier, l.boost_expires_at);
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img src={img} alt={l.title} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {viewCount} views</span>
          <span className="flex items-center gap-1 text-muted-foreground"><MessageCircle className="h-3.5 w-3.5" /> {leadCount} leads</span>
        </div>
        <div className="mt-3"><BoostBadge l={l} /></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          <Button variant="outline" size="sm" onClick={onToggle}>
            {l.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Deactivate</> : <><Eye className="h-3.5 w-3.5" /> Activate</>}
          </Button>
        </div>
        <Button
          size="sm"
          onClick={onBoost}
          className={`mt-2 w-full ${boost.active ? "bg-secondary text-foreground hover:bg-secondary/70" : "bg-orange-600 text-white hover:bg-orange-600/90"}`}
        >
          <Flame className="h-3.5 w-3.5" /> {boost.active ? "Manage boost" : "Boost this listing"}
        </Button>
      </div>
    </div>
  );
}

function BoostDialog({ listing, onClose, onDone }: { listing: Listing; onClose: () => void; onDone: () => void }) {
  const current = boostStatus(listing.boost_tier, listing.boost_expires_at);
  const [busy, setBusy] = useState<BoostTier | "cancel" | null>(null);

  async function buy(tier: BoostTier) {
    setBusy(tier);
    const r = await purchaseBoost(listing.id, tier);
    setBusy(null);
    if (r.error) return toast.error(r.error);
    toast.success("Boost activated", { description: "Mock checkout — no payment was charged. Runs for 30 days, then reverts automatically." });
    onDone();
  }

  async function stop() {
    setBusy("cancel");
    const r = await cancelBoost(listing.id);
    setBusy(null);
    if (r.error) return toast.error(r.error);
    toast.success("Boost removed");
    onDone();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Boost "{listing.title}"</DialogTitle>
          <DialogDescription>
            {current.active
              ? `Currently ${current.label} — ${current.daysLeft} day${current.daysLeft === 1 ? "" : "s"} remaining.`
              : "Boosts run for 30 days and revert to normal placement automatically."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          {BOOST_PLANS.map((b) => (
            <div key={b.tier} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="flex items-center gap-1.5 font-medium">
                  {b.tier === "super_hot" ? <Zap className="h-4 w-4 text-navy" /> : <Flame className="h-4 w-4 text-orange-600" />}
                  {b.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{b.blurb}</p>
                <p className="mt-1 text-sm font-medium text-green">PKR {b.price.toLocaleString("en-PK")} · {b.days} days</p>
              </div>
              <Button
                size="sm"
                disabled={busy !== null}
                onClick={() => buy(b.tier)}
                className="shrink-0 bg-navy text-navy-foreground hover:bg-navy/90"
              >
                {busy === b.tier && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {current.tier === b.tier ? "Extend" : "Buy"}
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Payment uses the same mock checkout as package purchases — nothing is charged yet.
          </p>
        </div>
        <DialogFooter className="mt-4 gap-2">
          {current.active && (
            <Button variant="outline" onClick={stop} disabled={busy !== null}>
              {busy === "cancel" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Remove boost
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewersPanel({
  views, listings, loading, onRefresh,
}: { views: ListingViewRow[]; listings: Listing[]; loading: boolean; onRefresh: () => void }) {
  const [listingFilter, setListingFilter] = useState<string>("all");
  const rows = listingFilter === "all" ? views : views.filter((v) => v.listing_id === listingFilter);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-green">Who's looking</p>
          <h3 className="mt-1 text-lg font-medium">{rows.length} view{rows.length === 1 ? "" : "s"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={listingFilter} onValueChange={setListingFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listings</SelectItem>
              {listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No views logged yet. Signed-in buyers show up by name and phone; guests appear as anonymous.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.slice(0, 200).map((v) => (
            <li key={v.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-sm">
                  <span className={v.viewer_user_id ? "font-medium text-foreground" : "text-muted-foreground"}>{viewerLabel(v)}</span>
                  {" "}<span className="text-muted-foreground">{v.event_type === "click" ? "clicked" : "viewed"}</span>{" "}
                  <span className="font-medium">{v.listings?.title ?? "a listing"}</span>
                </p>
                <p className="text-xs text-muted-foreground">{v.listings?.area ?? ""}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {v.viewer_phone && (
                  <a
                    href={`https://wa.me/${v.viewer_phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-green/40 bg-green/10 px-2.5 py-1 text-xs font-medium text-green"
                  >
                    <MessageCircle className="h-3 w-3" /> {v.viewer_phone}
                  </a>
                )}
                <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


type FormState = {
  title: string; area: string; intent: Intent; category: Category;
  beds: number; baths: number; size: number; price: number;
  whatsapp: string; imageUrl: string; imageUrls: string[];
};

function PhotoUploader({ urls, onChange }: { urls: string[]; onChange: (u: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const uploads = await Promise.all(Array.from(files).slice(0, 8).map((f) => uploadListingImage(f)));
    setBusy(false);
    const ok = uploads.filter((u): u is string => !!u);
    if (ok.length === 0) return toast.error("Upload failed — sign in as a realtor and try again.");
    onChange([...urls, ...ok].slice(0, 12));
    if (ok.length < uploads.length) toast.warning(`${uploads.length - ok.length} file(s) failed to upload`);
  }
  return (
    <div>
      <Label>Photos ({urls.length}/12)</Label>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((u, i) => (
          <div key={u + i} className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-navy shadow"
              aria-label="Remove photo"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        {urls.length < 12 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? "Uploading…" : "Add photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={busy} />
          </label>
        )}
      </div>
    </div>
  );
}

function ListingFields({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const estimate = useServerFn(estimatePrice);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  async function runEstimate() {
    const { checkRateLimit, RATE_LIMIT_MAX } = await import("@/lib/rate-limit");
    const rl = checkRateLimit();
    if (!rl.allowed) {
      return toast.error(`You've used your ${RATE_LIMIT_MAX} free price estimates for this hour. Try again later.`);
    }
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
        <div><Label>Cover image URL (optional)</Label><Input value={s.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" /></div>
      </div>

      <PhotoUploader urls={s.imageUrls} onChange={(u) => set({ imageUrls: u })} />
    </div>
  );
}

function AddListingForm({ realtor, onCreated }: { realtor: RealtorProfile; onCreated: () => void }) {
  const [s, setS] = useState<FormState>({
    title: "", area: "DHA Phase 6", intent: "buy", category: "house",
    beds: 3, baths: 3, size: 500, price: 50000000, whatsapp: realtor.phone || "", imageUrl: "", imageUrls: [],
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
      image_url: s.imageUrl || s.imageUrls[0] || null,
      image_urls: s.imageUrls,
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
    imageUrls: listing.image_urls ?? [],
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
      image_url: s.imageUrl || s.imageUrls[0] || null,
      image_urls: s.imageUrls,
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

function LeadsPanel({ realtorId }: { realtorId: string }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, listing_id, buyer_name, buyer_phone, channel, created_at, listings(title, area)")
      .eq("realtor_id", realtorId)
      .order("created_at", { ascending: false })
      .limit(200);
    setLeads((data as any as LeadRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [realtorId]);

  if (loading) {
    return <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">No leads yet. When buyers tap "Contact on WhatsApp" on your listings, they'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-green">Leads</p>
            <h3 className="mt-1 text-lg font-medium">{leads.length} total inquiries</h3>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {leads.map((l) => (
          <li key={l.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{l.listings?.title ?? "Listing"}</p>
              <p className="text-xs text-muted-foreground">{l.listings?.area ?? ""} · {new Date(l.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {l.buyer_name || l.buyer_phone ? (
                <>
                  {l.buyer_name && <span className="text-foreground">{l.buyer_name}</span>}
                  {l.buyer_phone && (
                    <a href={`https://wa.me/${l.buyer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-green/40 bg-green/10 px-2.5 py-1 text-xs font-medium text-green">
                      <MessageCircle className="h-3 w-3" /> {l.buyer_phone}
                    </a>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Anonymous · via {l.channel}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
