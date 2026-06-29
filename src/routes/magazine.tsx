import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { ARTICLES, ARTICLE_CATEGORIES, categoryColor } from "@/lib/magazine";

export const Route = createFileRoute("/magazine")({
  head: () => ({
    meta: [
      { title: "abaad Magazine — Karachi property news, guides & realtor stories" },
      { name: "description", content: "Market watch, area spotlights, investment picks and buyer stories from across Karachi's property scene. Published by abaad.com." },
      { property: "og:title", content: "abaad Magazine" },
      { property: "og:description", content: "Karachi property news and lifestyle stories." },
    ],
    links: [{ rel: "canonical", href: "/magazine" }],
  }),
  component: MagazinePage,
});

function MagazinePage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? ARTICLES : ARTICLES.filter((a) => a.category === cat);
  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-green">abaad Magazine</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-navy sm:text-5xl">
            Karachi, in print.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Honest reporting on Karachi's property market, neighbourhood guides, and stories from the realtors and families behind the deals.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                cat === c
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {hero && (
          <Link
            to="/magazine/$slug"
            params={{ slug: hero.slug }}
            className="mt-10 block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto">
                <img src={hero.cover} alt={hero.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <span className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor(hero.category)}`}>
                  {hero.category}
                </span>
                <h2 className="mt-4 font-display text-2xl font-medium leading-tight text-navy sm:text-3xl">{hero.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">{hero.excerpt}</p>
                <p className="mt-5 text-xs text-muted-foreground">{hero.author} · {hero.date} · {hero.read_time}</p>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {rest.map((a) => (
            <Link
              key={a.slug}
              to="/magazine/$slug"
              params={{ slug: a.slug }}
              className="group block overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img src={a.cover} alt={a.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor(a.category)}`}>
                  {a.category}
                </span>
                <h3 className="mt-3 font-display text-lg font-medium leading-snug text-navy">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">{a.author} · {a.date} · {a.read_time}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
