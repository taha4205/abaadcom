import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { findArticle, getArticleBody, categoryColor } from "@/lib/magazine";

export const Route = createFileRoute("/magazine/$slug")({
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Article — abaad Magazine" }] };
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title} — abaad Magazine` },
        { name: "description", content: a.excerpt.slice(0, 160) },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt.slice(0, 200) },
        { property: "og:type", content: "article" },
        { property: "og:image", content: a.cover },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: a.cover },
      ],
      links: [{ rel: "canonical", href: `/magazine/${a.slug}` }],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-medium">Article not found</h1>
        <Link to="/magazine" className="mt-4 inline-block text-navy underline">Back to magazine</Link>
      </div>
      <Footer />
    </div>
  ),
});

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const body = getArticleBody(a.slug);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/magazine" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to magazine
        </Link>

        <span className={`mt-6 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor(a.category)}`}>
          {a.category}
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-navy sm:text-4xl">{a.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{a.author} · {a.date} · {a.read_time}</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <img src={a.cover} alt={a.title} className="h-auto w-full object-cover" />
        </div>

        <article className="prose prose-neutral mt-10 max-w-none space-y-6 text-[15px] leading-relaxed text-foreground">
          <p className="text-lg font-medium text-navy">{a.excerpt}</p>
          {body.map((para, i) => (
            <p key={i} className="text-muted-foreground">{para}</p>
          ))}
        </article>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-display text-lg text-navy">Looking for property in Karachi?</p>
          <p className="mt-1 text-sm text-muted-foreground">Browse verified listings from realtors across the city.</p>
          <Link to="/" className="mt-4 inline-flex rounded-md bg-navy px-5 py-2 text-sm font-medium text-navy-foreground hover:bg-navy/90">
            Explore listings
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
