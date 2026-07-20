import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bed, Bath, Maximize, MapPin, ArrowLeft, ShieldCheck, MessageCircle, Heart, Share2, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/site-chrome";
import { PropertyCard } from "@/components/property-card";
import { toast } from "sonner";
import {
  findPropertyBySlug, propertySlug, getAllProperties, fetchLiveListings,
} from "@/lib/properties";
import { useWishlist } from "@/lib/wishlist";
import { responseTimeLabel } from "@/lib/realtors";
import { logLead } from "@/lib/leads";
import { ReviewSection } from "@/components/review-section";

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
    const desc = `${p.intent === "buy" ? "For sale" : "For rent"} in ${p.area}: ${p.title}. ${p.beds ? p.beds + " bed, " : ""}${p.baths ? p.baths + " bath, " : ""}${p.size} ${p.category === "plot" ? "sq yd" : "sq ft"}. ${p.price}. Listed by ${p.realtor}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:type", content: "article" },
        { property: "og:image", content: p.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: p.image },
        ...(params.slug !== canonicalSlug ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: PropertyPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-medium">Property not found</h1>
        <Link to="/" className="mt-4 inline-block text-navy underline">Back to listings</Link>
      </div>
      <Footer />
    </div>
  ),
});

function PropertyPage() {
  const { property: p } = Route.useLoaderData();
  const { has, toggle } = useWishlist();
  const saved = has(p.id);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => { fetchLiveListings().then(() => setAllLoaded(true)); }, []);

  const wa = (p.whatsapp ?? p.realtorPhone ?? "923001234567").replace(/\D/g, "");
  const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${p.title} on abaad.com`)}`;
  const rt = responseTimeLabel(p.responseTime);
  const marla = Math.round((p.size / 25) * 10) / 10;
  const showBedsBath = p.category !== "plot" && p.category !== "commercial";

  const similar = getAllProperties()
    .filter((x) => x.id !== p.id && x.category === p.category && x.area === p.area)
    .slice(0, 3);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Link copied!"),
        () => toast.error("Could not copy link"),
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to search
        </Link>

        {/* Hero image */}
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-secondary">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
          {p.verified && (
            <Badge className="absolute left-4 top-4 border-0 bg-green text-green-foreground">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified
            </Badge>
          )}
          {p.tier && (
            <Badge className="absolute left-4 bottom-4 border-0 bg-navy text-navy-foreground">{p.tier}</Badge>
          )}
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={share}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-white"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggle(p.id)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-white"
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-green text-green" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {p.area}, Karachi
            </div>
            <h1 className="mt-2 font-display text-3xl font-medium text-navy sm:text-4xl">{p.title}</h1>
            <p className="mt-3 text-3xl font-semibold text-green">{p.price}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">{p.area}</Badge>
              <Badge variant="outline" className="capitalize">{p.category}</Badge>
              <Badge variant="outline">{p.intent === "buy" ? "For Sale" : "For Rent"}</Badge>
            </div>

            {/* Specs row */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
              {showBedsBath && (
                <>
                  <Spec icon={<Bed className="h-4 w-4" />} label="Beds" value={String(p.beds || "—")} />
                  <Spec icon={<Bath className="h-4 w-4" />} label="Baths" value={String(p.baths || "—")} />
                </>
              )}
              <Spec icon={<Maximize className="h-4 w-4" />} label="Size" value={`${p.size} sq yd`} />
              <Spec icon={<Maximize className="h-4 w-4" />} label="In Marla" value={`${marla} marla`} />
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-navy">About this property</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This {p.category} is located in {p.area}, Karachi. {p.intent === "buy" ? `Offered for sale at ${p.price} by ${p.realtor}.` : `Available for rent at ${p.price} through ${p.realtor}.`} Contact the realtor directly on WhatsApp for more details, viewing schedules, and negotiation.
              </p>
            </div>
          </div>

          {/* Realtor card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Listed by</p>
              <p className="mt-1 font-display text-lg font-medium">{p.realtor}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tier && <Badge className="border-0 bg-navy text-navy-foreground">{p.tier}</Badge>}
                <Badge variant="outline" className="gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${rt.dot}`} /> {rt.label}
                </Badge>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logLead({ listingId: p.id, realtorId: p.realtorId })}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green px-3 py-2.5 text-sm font-medium text-green-foreground hover:bg-green/90"
              >
                <MessageCircle className="h-4 w-4" /> Contact on WhatsApp
              </a>
              <p className="mt-4 text-xs text-muted-foreground">
                Contact details verified by abaad.com. No middlemen, no inflated calls.
              </p>
            </div>
          </aside>
        </div>

        {p.realtorId && (
          <div className="mt-12">
            <ReviewSection realtorId={p.realtorId} />
          </div>
        )}

        {/* Similar properties */}
        {(similar.length > 0 || allLoaded) && similar.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-2xl font-medium text-navy">Similar properties</h2>
              <Link to="/" className="text-sm text-muted-foreground hover:text-navy">View all →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((sp) => <PropertyCard key={sp.id} p={sp} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-navy">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
