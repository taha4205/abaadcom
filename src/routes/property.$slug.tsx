import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Phone, Mail, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/site-chrome";
import { findPropertyBySlug, propertySlug } from "@/lib/properties";

export const Route = createFileRoute("/property/$slug")({
  loader: ({ params }) => {
    const property = findPropertyBySlug(params.slug);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Property — abaad.com" }] };
    const p = loaderData.property;
    const canonicalSlug = propertySlug(p);
    const path = `/property/${canonicalSlug}`;
    const title = `${p.title} — ${p.area}, Karachi | abaad.com`;
    const desc = `${p.intent === "buy" ? "For sale" : "For rent"} in ${p.area}: ${p.title}. ${p.beds ? p.beds + " bed, " : ""}${p.baths ? p.baths + " bath, " : ""}${p.size} ${p.category === "plot" ? "sq yd" : "sq ft"}. ${p.price}. Listed by ${p.realtor} on abaad.com.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: path },
        { property: "og:image", content: p.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: p.image },
        ...(params.slug !== canonicalSlug ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": p.intent === "rent" ? "RentAction" : "Product",
            name: p.title,
            description: desc,
            image: p.image,
            brand: { "@type": "RealEstateAgent", name: p.realtor },
            offers: {
              "@type": "Offer",
              priceCurrency: "PKR",
              price: p.priceNum,
              availability: "https://schema.org/InStock",
            },
            areaServed: { "@type": "Place", name: `${p.area}, Karachi, Pakistan` },
          }),
        },
      ],
    };
  },
  component: PropertyPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-medium">Property not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The listing you are looking for is no longer available.</p>
        <Link to="/" className="mt-6 inline-block text-navy underline">Back to listings</Link>
      </div>
      <Footer />
    </div>
  ),
});

function PropertyPage() {
  const { property: p } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to search
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-secondary">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              {p.featured && (
                <Badge className="absolute left-4 top-4 border-0 bg-green text-green-foreground">
                  <Star className="mr-1 h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
              <div className="absolute right-4 top-4 rounded-md bg-white/95 px-3 py-1 text-xs font-medium text-navy">
                {p.intent === "buy" ? "For Sale" : "For Rent"}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {p.area}, Karachi
              </div>
              <h1 className="mt-2 font-display text-2xl font-medium sm:text-3xl">{p.title}</h1>
              <p className="mt-3 text-2xl font-medium text-navy sm:text-3xl">{p.price}</p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-border py-4 text-sm text-foreground">
                {p.beds > 0 && <span className="flex items-center gap-2"><Bed className="h-4 w-4 text-muted-foreground" /> {p.beds} bedrooms</span>}
                {p.baths > 0 && <span className="flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground" /> {p.baths} bathrooms</span>}
                <span className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-muted-foreground" /> {p.size} {p.category === "plot" ? "sq yd" : "sq ft"}
                </span>
                <span className="capitalize text-muted-foreground">· {p.category}</span>
              </div>

              <div className="mt-6">
                <h2 className="text-base font-medium">About this property</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.title} is a {p.category} located in {p.area}, one of Karachi's well-connected neighborhoods.
                  {p.intent === "buy"
                    ? ` This property is offered for sale at ${p.price} by ${p.realtor}.`
                    : ` Available for rent at ${p.price} through ${p.realtor}.`}
                  {p.beds > 0 ? ` It includes ${p.beds} bedrooms and ${p.baths} bathrooms across ${p.size} ${p.category === "plot" ? "sq yd" : "sq ft"}.` : ` Total area is ${p.size} ${p.category === "plot" ? "sq yd" : "sq ft"}.`}
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Listed by</p>
              <p className="mt-1 font-display text-lg font-medium">{p.realtor}</p>
              {p.tier && (
                <Badge className="mt-2 border-0 bg-navy text-navy-foreground">{p.tier} realtor</Badge>
              )}
              <div className="mt-5 space-y-2">
                <Button className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
                  <Phone className="mr-2 h-4 w-4" /> Call realtor
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" /> Email enquiry
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Contact details are verified by abaad.com. No middlemen, no inflated calls.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
