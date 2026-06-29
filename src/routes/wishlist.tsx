import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { PropertyCard } from "@/components/property-card";
import { useWishlist } from "@/lib/wishlist";
import { SEED_PROPERTIES, fetchLiveListings, getLiveListings, type Property } from "@/lib/properties";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "My Wishlist — abaad.com" }, { name: "robots", content: "noindex" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const [all, setAll] = useState<Property[]>([...getLiveListings(), ...SEED_PROPERTIES]);
  useEffect(() => {
    fetchLiveListings().then(() => setAll([...getLiveListings(), ...SEED_PROPERTIES]));
  }, []);
  const saved = all.filter((p) => ids.includes(String(p.id)));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-green" />
          <h1 className="font-display text-3xl font-medium tracking-tight">My Wishlist</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{saved.length} saved {saved.length === 1 ? "property" : "properties"}.</p>

        {saved.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">No saved properties yet. Browse listings and tap the heart to save them.</p>
            <Link to="/" className="mt-3 inline-block text-sm text-navy underline">Browse listings →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
