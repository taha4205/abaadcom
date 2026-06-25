import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About abaad.com — Karachi's curated real estate marketplace" },
      { name: "description", content: "abaad.com connects Karachi buyers and tenants directly with verified realtors. Learn how our marketplace, packages, and AI listing tools work." },
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
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-wider text-green">About</p>
        <h1 className="mt-2 font-display text-3xl font-medium sm:text-5xl">
          A cleaner way to buy, rent, and list property in Karachi.
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground">
          abaad.com is a curated marketplace that connects Karachi's buyers and tenants directly
          with verified realtors. We focus on real listings, fair pricing, and direct contact —
          no middlemen, no inflated calls, no recycled ads.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { Icon: ShieldCheck, t: "Verified realtors", d: "Every listing is tied to a paid realtor account, so what you see is what's actually on the market." },
            { Icon: Sparkles, t: "AI-assisted listings", d: "Our AI assistant helps realtors write better titles, descriptions, and fact-check asking prices against Karachi market data." },
            { Icon: Users, t: "Direct connection", d: "Buyers and tenants reach the listing realtor directly — no chain of agents in between." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-navy" />
              <h2 className="mt-4 font-display text-lg font-medium">{t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-secondary/40 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-medium">Realtor packages</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Realtors join with one of three packages — Silver (PKR 50,000), Gold (PKR 75,000), or
            Platinum (PKR 125,000) — unlocking listings, featured placement, and AI tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/list"><Button className="bg-navy text-navy-foreground hover:bg-navy/90">See packages</Button></Link>
            <Link to="/contact"><Button variant="outline">Contact us</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
