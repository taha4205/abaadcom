import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageCircle, Crown, Award, Star, Flame, Zap } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { AGENCY_LISTING_CAP, FREE_SLOTS } from "@/lib/packages";
import { BOOST_PLANS } from "@/lib/boosts";


export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages — Realtor & Agency plans | abaad.com" },
      { name: "description", content: "Realtor and agency packages on abaad.com. Pick the right plan to list and feature your properties to Karachi's most active buyers and tenants." },
      { property: "og:title", content: "Packages — abaad.com" },
      { property: "og:description", content: "Realtor and agency plans for Karachi's property marketplace." },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesPage,
});

type Plan = {
  name: string;
  price: number;
  listings: number;
  rank: string;
  features: string[];
  Icon: any;
  highlight?: boolean;
};

const REALTOR_PLANS: Plan[] = [
  { name: "Starter", price: 10000, listings: 3, rank: "Standard", Icon: Star,
    features: ["3 active listings", "+ 2 free listing slots", "Standard placement", "WhatsApp leads", "Verified badge on approval"] },
  { name: "Growth", price: 25000, listings: 5, rank: "Featured", Icon: Award, highlight: true,
    features: ["5 active listings", "+ 2 free listing slots", "Featured placement", "AI listing assistant", "Response time badge"] },
  { name: "Pro", price: 50000, listings: 7, rank: "Priority", Icon: Crown,
    features: ["7 active listings", "+ 2 free listing slots", "Priority placement on search", "AI listing assistant + price estimator", "Performance dashboard"] },
];

const AGENCY_PLANS: Plan[] = [
  { name: "Silver", price: 200000, listings: AGENCY_LISTING_CAP, rank: "Featured", Icon: Star,
    features: [`${AGENCY_LISTING_CAP} active listings`, "+ 2 free listing slots", "Featured placement", "Up to 3 agents", "Agency profile page"] },
  { name: "Gold", price: 500000, listings: AGENCY_LISTING_CAP, rank: "Priority", Icon: Award, highlight: true,
    features: [`${AGENCY_LISTING_CAP} active listings`, "+ 2 free listing slots", "Priority placement", "Up to 7 agents", "Verified agency badge"] },
  { name: "Platinum", price: 1000000, listings: AGENCY_LISTING_CAP, rank: "Top Placement + Homepage Featured", Icon: Crown,
    features: [`${AGENCY_LISTING_CAP} active listings`, "+ 2 free listing slots", "Top placement + homepage featured", "Unlimited agents", "Dedicated account manager"] },
];

const WA = "923001234567";


function waLink(name: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I'm interested in the ${name} package on abaad.com`)}`;
}

function PackagesPage() {
  const [tab, setTab] = useState<"realtors" | "agencies">("realtors");
  const plans = tab === "realtors" ? REALTOR_PLANS : AGENCY_PLANS;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-green">Packages</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Plans built for <span className="italic text-navy">how you sell.</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Whether you're an independent realtor or a full agency, abaad gives you the placement and tools to close faster.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/5 px-4 py-1.5 text-xs font-medium text-green">
            Every account includes {FREE_SLOTS} free listing slots — no package required.
          </p>
        </div>


        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-secondary p-1">
            {([
              { v: "realtors", l: "For Realtors" },
              { v: "agencies", l: "For Agencies" },
            ] as const).map((t) => (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
                  tab === t.v ? "bg-navy text-navy-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const Icon = p.Icon;
            return (
              <article
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition hover:shadow-lg sm:p-8 ${
                  p.highlight
                    ? "border-navy/30 bg-card shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] md:scale-[1.02]"
                    : "border-border bg-card"
                }`}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-green text-green-foreground">
                    Most popular
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-navy" />
                  <p className="font-display text-lg font-medium">{p.name}</p>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-medium text-green">
                    PKR {p.price.toLocaleString("en-PK")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">one-time activation</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{p.listings} listings</Badge>
                  <Badge className="border-0 bg-navy/90 text-navy-foreground">{p.rank}</Badge>
                </div>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={waLink(p.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium ${
                    p.highlight
                      ? "bg-navy text-navy-foreground hover:bg-navy/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  Get Started
                </a>
              </article>
            );
          })}
        </div>

        {/* Per-listing boosts */}
        <section className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-green">Boosts</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Push a single listing <span className="italic text-navy">to the front.</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Boosts are bought per listing from your dashboard and run for 30 days, then revert automatically.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
            {BOOST_PLANS.map((b) => (
              <article key={b.tier} className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  {b.tier === "super_hot" ? <Zap className="h-5 w-5 text-navy" /> : <Flame className="h-5 w-5 text-orange-600" />}
                  <p className="font-display text-lg font-medium">{b.label}</p>
                </div>
                <p className="mt-4 font-display text-3xl font-medium text-green">PKR {b.price.toLocaleString("en-PK")}</p>
                <p className="mt-1 text-xs text-muted-foreground">per listing · {b.days} days</p>
                <p className="mt-4 text-sm text-muted-foreground">{b.blurb}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl border border-border bg-navy p-8 text-center text-navy-foreground sm:p-12">

          <h2 className="font-display text-2xl font-medium sm:text-3xl">Need a custom solution?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/75 sm:text-base">
            Have specific requirements? We'll build a package around your needs.
          </p>
          <a
            href={waLink("Custom")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-green px-6 py-3 text-sm font-medium text-green-foreground hover:bg-green/90"
          >
            <MessageCircle className="h-4 w-4" /> Contact Us on WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
