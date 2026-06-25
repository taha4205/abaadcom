import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, Users, MapPin, Building2, KeyRound, Wand2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About abaad.com — Karachi's curated real estate marketplace" },
      { name: "description", content: "abaad.com is a Karachi-first real estate marketplace connecting buyers and tenants directly with verified realtors. Learn our mission, team, and how it works." },
      { property: "og:title", content: "About abaad.com" },
      { property: "og:description", content: "How Karachi's curated real estate marketplace works." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-navy text-navy-foreground">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-xs font-medium uppercase tracking-wider text-green">About abaad.com</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl md:text-6xl">
              A cleaner way to buy, rent,<br />
              and list property in <span className="italic text-green">Karachi.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/75">
              abaad.com is a curated marketplace connecting Karachi's buyers and tenants
              directly with verified realtors. Real listings, fair pricing, direct contact —
              no middlemen, no inflated calls, no recycled ads.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-green">Our mission</p>
              <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
                Make Karachi's property market actually searchable.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Karachi has tens of thousands of properties on the market on any given day — and
              finding the right one usually means scrolling through duplicate listings, ghost
              ads, and agents passing leads sideways. We built abaad.com to fix that: a curated
              feed of real inventory from realtors who pay to be here, with the area, size, and
              price filters that actually matter to buyers and tenants.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-wider text-green">How it works</p>
            <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">Three sides, one pipeline.</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { Icon: Building2, t: "Buyers", d: "Search by area, type, and plot size. Contact the listing realtor directly — no agent chain." },
                { Icon: KeyRound, t: "Tenants", d: "Filter rentals by monthly budget. Photos, rent, and lease length stated upfront." },
                { Icon: Wand2, t: "Realtors", d: "Pick a package, list your inventory, and let our AI assistant polish copy and price." },
              ].map(({ Icon, t, d }) => (
                <div key={t} className="rounded-xl border border-border bg-card p-6">
                  <Icon className="h-5 w-5 text-navy" />
                  <h3 className="mt-4 font-display text-lg font-medium">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What makes us different */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-wider text-green">What makes us different</p>
          <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">No noise. Real inventory.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { Icon: ShieldCheck, t: "Verified realtors", d: "Every listing ties to a paid realtor account — what you see is what's on the market." },
              { Icon: Sparkles, t: "AI-assisted listings", d: "Our assistant fact-checks asking prices against Karachi market data and polishes the copy." },
              { Icon: Users, t: "Direct connection", d: "Buyers and tenants reach the listing realtor directly. No relay chains." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-6">
                <Icon className="h-5 w-5 text-navy" />
                <h3 className="mt-4 font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Karachi focus */}
        <section className="border-t border-border bg-navy text-navy-foreground">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
              <div>
                <MapPin className="h-6 w-6 text-green" />
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-green">Karachi-first</p>
                <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
                  Built for Karachi, not licensed from somewhere else.
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-white/75">
                Our team lives and works here. We know DHA Phase 6 isn't Phase 8, that a 240
                sq yd plot in Bahria Town doesn't compare to one in PECHS, and that "furnished"
                in Clifton means something specific. Every filter, area name, and pricing
                benchmark on abaad.com is tuned for Karachi — because that's the only market
                we're solving for.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
            <h2 className="font-display text-2xl font-medium sm:text-3xl">Ready to list — or find?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Buyers, tenants, and realtors all start in the same place. Pick your side.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/"><Button className="bg-navy text-navy-foreground hover:bg-navy/90">Browse properties</Button></Link>
              <Link to="/packages"><Button variant="outline">See realtor packages</Button></Link>
              <Link to="/contact"><Button variant="ghost">Contact us</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
