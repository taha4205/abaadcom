import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowLeft, ShieldCheck, Sparkles, CreditCard, Lock } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PACKAGES } from "@/lib/properties";

type Tier = "Silver" | "Gold" | "Platinum";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Realtor packages — Silver, Gold & Platinum | abaad.com" },
      { name: "description", content: "Pick a realtor package on abaad.com — Silver (PKR 50,000), Gold (PKR 75,000), or Platinum (PKR 125,000). Unlock listings, featured placement, and AI tools." },
      { property: "og:title", content: "Realtor packages — abaad.com" },
      { property: "og:description", content: "Silver, Gold, and Platinum realtor packages for Karachi." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const [checkout, setCheckout] = useState<Tier | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {checkout ? (
          <Checkout tier={checkout} onBack={() => setCheckout(null)} />
        ) : (
          <Pricing onPick={setCheckout} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Pricing({ onPick }: { onPick: (t: Tier) => void }) {
  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-green">Realtor packages</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-5xl">
          Three packages.<br />
          <span className="italic text-navy">One clear pipeline.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Listings on abaad.com are realtor-only. Pick a package, publish verified inventory, and connect directly with serious buyers and tenants in Karachi.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
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
              <p className="mt-1 text-xs text-muted-foreground">one-time · 30–90 day visibility</p>

              <ul className="mt-6 space-y-2.5 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onPick(p.tier)}
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

      {/* Comparison */}
      <div className="mt-20">
        <h2 className="font-display text-2xl font-medium tracking-tight">What's included</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 text-center font-medium">Silver</th>
                <th className="px-5 py-3 text-center font-medium">Gold</th>
                <th className="px-5 py-3 text-center font-medium">Platinum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { f: "Active listings", v: ["1", "3", "10"] },
                { f: "Visibility window", v: ["30 days", "60 days", "90 days"] },
                { f: "Featured badge", v: ["—", "✓", "✓"] },
                { f: "AI listing assistant", v: ["—", "✓", "✓"] },
                { f: "Top of search results", v: ["—", "—", "✓"] },
                { f: "Priority support", v: ["—", "—", "✓"] },
              ].map((row) => (
                <tr key={row.f}>
                  <td className="px-5 py-3 text-foreground">{row.f}</td>
                  {row.v.map((c, i) => (
                    <td key={i} className="px-5 py-3 text-center text-muted-foreground">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {[
          { q: "Do you charge commission on a sale?", a: "No. Packages are flat one-time fees. Whatever you close with a buyer is yours." },
          { q: "Can I upgrade later?", a: "Yes — upgrade any time and we credit the unused portion of your current package." },
          { q: "Is this a real payment?", a: "Not yet. Checkout is currently a demo capturing your details. Live Stripe / bank payments can be wired in next." },
          { q: "Who verifies the listings?", a: "Every realtor account is reviewed manually. Listings can be flagged by users and removed within 24 hours." },
        ].map((f) => (
          <div key={f.q} className="rounded-xl border border-border bg-card p-5">
            <p className="font-medium">{f.q}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Secured by abaad.com · Karachi-based team · 1-business-day response
      </div>
    </>
  );
}

function Checkout({ tier, onBack }: { tier: Tier; onBack: () => void }) {
  const navigate = useNavigate();
  const pack = PACKAGES.find((p) => p.tier === tier)!;
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    agency: "",
    email: "",
    phone: "",
    cnic: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) {
      toast.error("Add your name, email and phone.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success(`${tier} package activated · PKR ${pack.price.toLocaleString("en-PK")}`, {
        description: "Demo checkout. Redirecting you to your listing form.",
      });
      navigate({ to: "/list" });
    }, 800);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to packages
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-medium tracking-tight">Checkout</h1>
        <Badge className={
          tier === "Platinum" ? "bg-navy text-navy-foreground"
            : tier === "Gold" ? "bg-green text-green-foreground"
            : "bg-secondary text-secondary-foreground"
        }>{tier} package</Badge>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Realtor details</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" v={form.fullName} on={(v) => update("fullName", v)} required />
            <Field label="Agency name (optional)" v={form.agency} on={(v) => update("agency", v)} />
            <Field label="Email" type="email" v={form.email} on={(v) => update("email", v)} required />
            <Field label="Phone" v={form.phone} on={(v) => update("phone", v)} placeholder="+92 3XX XXXXXXX" required />
            <div className="sm:col-span-2">
              <Field label="CNIC (for verification)" v={form.cnic} on={(v) => update("cnic", v)} placeholder="42101-XXXXXXX-X" />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-navy" /> Payment
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Checkout is currently a demo — no payment is collected. Live Stripe / bank transfer is wired in once you're ready to go live.
            </p>
          </div>

          <Button type="submit" disabled={busy} className="h-12 w-full bg-navy text-navy-foreground hover:bg-navy/90">
            {busy ? "Processing…" : `Activate ${tier} · PKR ${pack.price.toLocaleString("en-PK")}`}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Demo checkout · no card details required
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order summary</p>
          <p className="mt-2 font-display text-xl font-medium">{tier} package</p>
          <ul className="mt-4 space-y-2 text-sm">
            {pack.perks.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-medium text-navy">PKR {pack.price.toLocaleString("en-PK")}</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-green" /> Activation is instant once payment is confirmed.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label, v, on, type = "text", placeholder, required,
}: { label: string; v: string; on: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} type={type} placeholder={placeholder} required={required} className="h-11" />
    </div>
  );
}
