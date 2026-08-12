import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, List as ListIcon, Inbox, LogOut, Loader2, Check, X, Activity, Droplets, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PACKAGES } from "@/lib/properties";
import { viewerLabel, type ListingViewRow } from "@/lib/views";
import {
  adminLogin, adminFetchAll, adminUpdateRealtor, adminUpdateListing, adminSeedSahil, adminFetchViews,
  adminFetchAreaReports, adminSetAreaReport,
} from "@/lib/admin.functions";


export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — abaad.com" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const STORAGE_KEY = "abaad_admin";
const SESSION_MS = 2 * 60 * 60 * 1000; // 2 hours

type Creds = { email: string; password: string };
type Session = { token: string; expires: number; email: string; password: string };
type Section = "overview" | "realtors" | "listings" | "requests" | "activity" | "reports";


function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.token || !s?.expires || s.expires <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  // Auto-expiry watcher
  useEffect(() => {
    if (!session) return;
    const remaining = session.expires - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      toast.error("Session expired. Please log in again.");
      return;
    }
    const t = setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      toast.error("Session expired. Please log in again.");
    }, remaining);
    return () => clearTimeout(t);
  }, [session]);

  if (!ready) return null;
  if (!session) {
    return <LoginScreen onSuccess={(c) => {
      const s: Session = {
        token: crypto.randomUUID(),
        expires: Date.now() + SESSION_MS,
        email: c.email,
        password: c.password,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      setSession(s);
    }} />;
  }
  const creds: Creds = { email: session.email, password: session.password };
  return <Dashboard creds={creds} onLogout={() => { localStorage.removeItem(STORAGE_KEY); setSession(null); }} />;
}

function LoginScreen({ onSuccess }: { onSuccess: (c: Creds) => void }) {
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login({ data: { email, password } });
      onSuccess({ email, password });
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8">
        <div>
          <h1 className="font-display text-2xl font-medium">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">abaad.com administration</p>
        </div>
        <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </Button>
      </form>
    </div>
  );
}

function Dashboard({ creds, onLogout }: { creds: Creds; onLogout: () => void }) {
  const navigate = useNavigate();
  const fetchAll = useServerFn(adminFetchAll);
  const updateRealtor = useServerFn(adminUpdateRealtor);
  const updateListing = useServerFn(adminUpdateListing);
  const [section, setSection] = useState<Section>("overview");
  const [realtors, setRealtors] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetchAll({ data: creds });
      setRealtors(res.realtors);
      setListings(res.listings);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
      onLogout();
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { reload(); }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    await updateRealtor({ data: { ...creds, id, status } });
    toast.success(`Realtor ${status}`);
    reload();
  }
  async function setResponseTime(id: string, response_time: "under_1h" | "same_day" | "within_24h") {
    await updateRealtor({ data: { ...creds, id, response_time } });
    setRealtors((rs) => rs.map((r) => r.id === id ? { ...r, response_time } : r));
    toast.success("Response time updated");
  }
  async function toggleListing(id: string, field: "verified" | "is_active", value: boolean) {
    await updateListing({ data: { ...creds, id, [field]: value } });
    setListings((ls) => ls.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  const pending = realtors.filter((r) => r.status === "pending");
  const approved = realtors.filter((r) => r.status === "approved");
  const revenue = approved.reduce((sum, r) => {
    const pkg = PACKAGES.find((p) => p.tier === r.package_tier);
    return sum + (pkg?.price ?? 0);
  }, 0);

  const navItems: { v: Section; label: string; Icon: any; badge?: number }[] = [
    { v: "overview", label: "Overview", Icon: LayoutDashboard },
    { v: "realtors", label: "Realtors", Icon: Users },
    { v: "listings", label: "Listings", Icon: ListIcon },
    { v: "activity", label: "Activity", Icon: Activity },
    { v: "reports", label: "Area Reports", Icon: Droplets },
    { v: "requests", label: "Requests", Icon: Inbox, badge: pending.length },
  ];


  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy text-navy-foreground md:flex">
        <div className="px-6 py-6">
          <p className="font-display text-lg">abaad<span className="text-green">.</span>admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ v, label, Icon, badge }) => (
            <button
              key={v}
              onClick={() => setSection(v)}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition ${
                section === v ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
              {badge ? <Badge className="bg-green text-green-foreground">{badge}</Badge> : null}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => { onLogout(); navigate({ to: "/" }); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto">
        <div className="border-b border-border bg-card px-4 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-2 md:hidden">
            <select value={section} onChange={(e) => setSection(e.target.value as Section)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              {navItems.map((n) => <option key={n.v} value={n.v}>{n.label}{n.badge ? ` (${n.badge})` : ""}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => { onLogout(); navigate({ to: "/" }); }}>Logout</Button>
          </div>
          <h1 className="hidden text-xl font-medium capitalize md:block">{section}</h1>
        </div>

        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : section === "overview" ? (
            <Overview
              totalRealtors={realtors.length}
              activeListings={listings.filter((l) => l.is_active).length}
              pending={pending.length}
              revenue={revenue}
              sahil={realtors.find((r) => r.id === "11111111-1111-1111-1111-111111111111")}
              creds={creds}
              onSeeded={reload}
            />
          ) : section === "realtors" ? (
            <RealtorsTable rows={realtors} onSetStatus={setStatus} onSetResponseTime={setResponseTime} />
          ) : section === "listings" ? (
            <ListingsTable rows={listings} onToggle={toggleListing} />
          ) : section === "activity" ? (
            <ActivityLog creds={creds} realtors={realtors} listings={listings} />
          ) : section === "reports" ? (
            <AreaReportsPanel creds={creds} />

          ) : (
            <RealtorsTable rows={pending} onSetStatus={setStatus} onSetResponseTime={setResponseTime} prominent />
          )}
        </div>
      </main>
    </div>
  );
}

function Overview({ totalRealtors, activeListings, pending, revenue, sahil, creds, onSeeded }: { totalRealtors: number; activeListings: number; pending: number; revenue: number; sahil?: any; creds: Creds; onSeeded: () => void }) {
  const seedSahil = useServerFn(adminSeedSahil);
  const [seeding, setSeeding] = useState(false);
  const showSeed = sahil && !sahil.user_id;

  async function runSeed() {
    setSeeding(true);
    try {
      const r = await seedSahil({ data: creds });
      toast.success("Sahil account ready", { description: `Login: ${r.email} / sahil1234` });
      onSeeded();
    } catch (e: any) {
      toast.error(e?.message ?? "Seed failed");
    } finally {
      setSeeding(false);
    }
  }

  const cards = [
    { label: "Total Realtors", value: totalRealtors },
    { label: "Active Listings", value: activeListings },
    { label: "Pending Requests", value: pending },
    { label: "Total Revenue (PKR)", value: revenue.toLocaleString("en-PK") },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-3 font-display text-3xl font-medium text-navy">{c.value}</p>
          </div>
        ))}
      </div>
      {showSeed && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Seed Sahil Real Estate Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Creates the auth login for the Sahil Real Estate realtor (sahil@sahilrealestate.com / sahil1234) and links it to the existing realtor record.</p>
          <Button onClick={runSeed} disabled={seeding} className="mt-4 bg-green text-green-foreground hover:bg-green/90">
            {seeding && <Loader2 className="h-4 w-4 animate-spin" />} Seed Sahil Real Estate Account
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green text-green-foreground",
    pending: "bg-amber-500 text-white",
    rejected: "bg-destructive text-destructive-foreground",
  };
  return <Badge className={`${map[status] ?? ""} capitalize`}>{status}</Badge>;
}

function RealtorsTable({ rows, onSetStatus, onSetResponseTime, prominent }: { rows: any[]; onSetStatus: (id: string, s: "approved" | "rejected") => void; onSetResponseTime: (id: string, rt: "under_1h" | "same_day" | "within_24h") => void; prominent?: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No realtors.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Agency</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Response time</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium">{r.full_name}</td>
              <td className="px-4 py-3">{r.agency_name}</td>
              <td className="px-4 py-3"><Badge variant="outline">{r.package_tier}</Badge></td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <select
                  value={r.response_time ?? "within_24h"}
                  onChange={(e) => onSetResponseTime(r.id, e.target.value as any)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="under_1h">Under 1h</option>
                  <option value="same_day">Same day</option>
                  <option value="within_24h">Within 24h</option>
                </select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {r.status !== "approved" && (
                    <Button size="sm" onClick={() => onSetStatus(r.id, "approved")} className={prominent ? "bg-green text-green-foreground hover:bg-green/90" : "bg-green text-green-foreground hover:bg-green/90"}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => onSetStatus(r.id, "rejected")}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListingsTable({ rows, onToggle }: { rows: any[]; onToggle: (id: string, field: "verified" | "is_active", v: boolean) => void }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No listings.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Area</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Realtor</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3 text-center">Verified</th>
            <th className="px-4 py-3 text-center">Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 font-medium">{l.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.area}</td>
              <td className="px-4 py-3 capitalize">{l.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.realtors?.agency_name ?? "—"}</td>
              <td className="px-4 py-3"><Badge variant="outline">{l.tier}</Badge></td>
              <td className="px-4 py-3 text-center"><Switch checked={l.verified} onCheckedChange={(v) => onToggle(l.id, "verified", v)} /></td>
              <td className="px-4 py-3 text-center"><Switch checked={l.is_active} onCheckedChange={(v) => onToggle(l.id, "is_active", v)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityLog({ creds, realtors, listings }: { creds: Creds; realtors: any[]; listings: any[] }) {
  const fetchViews = useServerFn(adminFetchViews);
  const [rows, setRows] = useState<ListingViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtorId, setRealtorId] = useState("all");
  const [listingId, setListingId] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetchViews({ data: creds });
      setRows(res.views as unknown as ListingViewRow[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (realtorId !== "all" && r.realtor_id !== realtorId) return false;
    if (listingId !== "all" && r.listing_id !== listingId) return false;
    const t = new Date(r.created_at).getTime();
    if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
    if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
    return true;
  }), [rows, realtorId, listingId, from, to]);

  const listingOptions = realtorId === "all" ? listings : listings.filter((l) => l.realtor_id === realtorId);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total events", value: filtered.length },
          { label: "Identified viewers", value: filtered.filter((r) => r.viewer_user_id).length },
          { label: "Anonymous", value: filtered.filter((r) => !r.viewer_user_id).length },
          { label: "WhatsApp clicks", value: filtered.filter((r) => r.event_type === "click").length },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-medium text-navy">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <Label className="text-xs">Realtor</Label>
          <select
            value={realtorId}
            onChange={(e) => { setRealtorId(e.target.value); setListingId("all"); }}
            className="mt-1 block rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">All realtors</option>
            {realtors.map((r) => <option key={r.id} value={r.id}>{r.agency_name || r.full_name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Listing</Label>
          <select
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            className="mt-1 block max-w-[240px] rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">All listings</option>
            {listingOptions.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-[150px]" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-[150px]" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setRealtorId("all"); setListingId("all"); setFrom(""); setTo(""); }}>Reset</Button>
          <Button size="sm" onClick={load} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity for these filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Realtor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <span className={r.viewer_user_id ? "font-medium" : "text-muted-foreground"}>
                      {viewerLabel(r)}
                    </span>{" "}
                    {r.event_type === "click" ? "contacted about" : "viewed"}{" "}
                    <span className="font-medium">{r.listings?.title ?? "listing"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.listings?.area ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.realtors?.agency_name ?? r.realtors?.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">{r.event_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-PK")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AreaReportsPanel({ creds }: { creds: Creds }) {
  const fetchReports = useServerFn(adminFetchAreaReports);
  const setReport = useServerFn(adminSetAreaReport);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");

  async function load() {
    setLoading(true);
    try {
      const res = await fetchReports({ data: creds });
      setRows(res.reports as any[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load area reports");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function act(id: string, action: "approve" | "unapprove" | "delete") {
    try {
      await setReport({ data: { ...creds, id, action } });
      setRows((rs) =>
        action === "delete"
          ? rs.filter((r) => r.id !== id)
          : rs.map((r) => (r.id === id ? { ...r, is_approved: action === "approve" } : r)),
      );
      toast.success(action === "delete" ? "Report deleted" : action === "approve" ? "Report approved" : "Report unpublished");
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    }
  }

  const filtered = rows.filter((r) =>
    tab === "all" ? true : tab === "pending" ? !r.is_approved : r.is_approved,
  );
  const pendingCount = rows.filter((r) => !r.is_approved).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-border bg-secondary p-1">
          {(["pending", "approved", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition ${
                tab === t ? "bg-card text-navy shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}{t === "pending" && pendingCount ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={load} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {tab === "all" ? "" : tab} area reports.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Water</th>
                <th className="px-4 py-3">Gas</th>
                <th className="px-4 py-3 text-center">Security</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">
                    {r.area}
                    {r.sub_area ? <span className="block text-xs text-muted-foreground">{r.sub_area}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.water_timing ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.gas_loadshedding ?? "—"}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{r.security_rating}/5</td>
                  <td className="px-4 py-3 max-w-[260px] text-muted-foreground">{r.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-PK")}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={r.is_approved ? "bg-green text-green-foreground" : "bg-amber-500 text-white"}>
                      {r.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!r.is_approved ? (
                        <Button size="sm" className="bg-green text-green-foreground hover:bg-green/90" onClick={() => act(r.id, "approve")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => act(r.id, "unapprove")}>
                          <X className="h-3.5 w-3.5" /> Unpublish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => act(r.id, "delete")} aria-label="Delete report">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
