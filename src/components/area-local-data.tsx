import { useEffect, useState } from "react";
import { Droplets, Flame, ShieldAlert, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth-modal";
import { fetchAreaLocalData, submitAreaReport, type AreaLocalData } from "@/lib/area-reports";

export function AreaLocalData({ area, subArea }: { area: string; subArea?: string | null }) {
  const [data, setData] = useState<AreaLocalData | null>(null);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [water, setWater] = useState("");
  const [gas, setGas] = useState("");
  const [security, setSecurity] = useState(4);
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchAreaLocalData(area).then(setData); }, [area]);

  async function submit() {
    if (!water.trim() && !gas.trim() && !notes.trim()) {
      toast.error("Add at least one detail before submitting");
      return;
    }
    setBusy(true);
    const r = await submitAreaReport({
      area, subArea: subArea ?? undefined, waterTiming: water, gasLoadshedding: gas,
      securityRating: security, notes,
    });
    setBusy(false);
    if (r === "unauthenticated") { setAuthOpen(true); return; }
    if (r === "error") { toast.error("Couldn't submit your report. Try again."); return; }
    toast.success("Thanks! Your report is pending review before it shows publicly.");
    setWater(""); setGas(""); setNotes(""); setOpen(false);
  }

  const has = data && data.reports > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-navy">Living in {area}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crowdsourced by residents and reviewed by abaad before it appears here.
          </p>
        </div>
        {has && <Badge variant="outline">{data!.reports} verified report{data!.reports === 1 ? "" : "s"}</Badge>}
      </div>

      {has ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Tile icon={<Droplets className="h-4 w-4" />} label="Water supply"
            value={data!.waterTimings[0] ?? "Not reported"} extra={data!.waterTimings.slice(1, 3)} />
          <Tile icon={<Flame className="h-4 w-4" />} label="Gas load-shedding"
            value={data!.gasNotes[0] ?? "Not reported"} extra={data!.gasNotes.slice(1, 3)} />
          <Tile icon={<ShieldAlert className="h-4 w-4" />} label="Security rating"
            value={data!.avgSecurity ? `${data!.avgSecurity} / 5` : "Not reported"} />
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          No approved resident reports for {area} yet. Be the first to share what living here is actually like.
        </p>
      )}

      {has && data!.latest.some((r) => r.notes) && (
        <ul className="mt-5 space-y-2">
          {data!.latest.filter((r) => r.notes).map((r) => (
            <li key={r.id} className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
              “{r.notes}”{r.sub_area ? <span className="ml-1 text-xs">— {r.sub_area}</span> : null}
            </li>
          ))}
        </ul>
      )}

      {!open ? (
        <Button variant="outline" className="mt-5" onClick={() => setOpen(true)}>
          <Send className="mr-2 h-4 w-4" /> Submit a local report
        </Button>
      ) : (
        <div className="mt-5 grid gap-4 rounded-xl border border-border bg-secondary/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Water timing</Label>
              <Input value={water} maxLength={200} onChange={(e) => setWater(e.target.value)} placeholder="e.g. Line water 6–8 AM daily" className="h-10" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Gas load-shedding</Label>
              <Input value={gas} maxLength={200} onChange={(e) => setGas(e.target.value)} placeholder="e.g. Low pressure 7–10 AM in winter" className="h-10" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Security rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setSecurity(n)} aria-label={`${n} star`}>
                  <Star className={`h-6 w-6 ${n <= security ? "fill-green text-green" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Anything else</Label>
            <Textarea value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} placeholder="Traffic, schools, parking, neighbours…" />
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={busy} className="bg-navy text-navy-foreground hover:bg-navy/90">
              {busy ? "Submitting…" : "Submit for review"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="signup"
        defaultRole="buyer"
        title="Sign in to share local data"
        description="Create a free account so we can review and credit your area report."
      />
    </div>
  );
}

function Tile({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-navy">{icon}
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
      {extra && extra.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {extra.map((e) => <li key={e}>· {e}</li>)}
        </ul>
      )}
    </div>
  );
}
