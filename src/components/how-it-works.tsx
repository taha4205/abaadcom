import { useState } from "react";
import { Building2, ShieldCheck, MessageCircle, Search, ListChecks, Phone } from "lucide-react";

type Step = { icon: React.ReactNode; title: string; desc: string };

const REALTOR_STEPS: Step[] = [
  { icon: <Building2 className="h-5 w-5" />, title: "Sign Up & Choose a Package", desc: "Pick Silver, Gold, or Platinum based on how many listings you need." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Get Verified", desc: "Our team reviews your profile and approves you within 24 hours." },
  { icon: <MessageCircle className="h-5 w-5" />, title: "Start Getting Leads", desc: "Buyers contact you directly on WhatsApp. No middlemen, no commission." },
];

const BUYER_STEPS: Step[] = [
  { icon: <Search className="h-5 w-5" />, title: "Search Your Area", desc: "Filter by area, property type, size and budget across hundreds of listings." },
  { icon: <ListChecks className="h-5 w-5" />, title: "Browse Verified Listings", desc: "Every listing shows real photos, accurate prices, and verified badges." },
  { icon: <Phone className="h-5 w-5" />, title: "Contact Directly on WhatsApp", desc: "Reach the realtor instantly. No agents, no delays." },
];

export function HowItWorks() {
  const [mode, setMode] = useState<"realtors" | "buyers">("realtors");
  const steps = mode === "realtors" ? REALTOR_STEPS : BUYER_STEPS;

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-green">Get started</p>
          <h2 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">How It Works</h2>
        </div>
        <div className="inline-flex rounded-full border border-border bg-secondary p-1">
          {(["realtors", "buyers"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                mode === m
                  ? "bg-green text-green-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For {m === "realtors" ? "Realtors" : "Buyers"}
            </button>
          ))}
        </div>
      </div>

      <div key={mode} className="mt-6 grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <article
            key={s.title}
            className="relative rounded-xl border border-border bg-card p-6 transition hover:border-navy/20 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-navy-foreground">
                {s.icon}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-navy">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
