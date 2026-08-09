import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, LogIn, Loader2 } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/use-auth";
import { SEED_PROPERTIES, fetchLiveListings, getLiveListings, type Property } from "@/lib/properties";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "My Wishlist — abaad.com" }, { name: "robots", content: "noindex" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
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

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !user ? (
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">
            <LogIn className="h-9 w-9 text-navy" />
            <h2 className="mt-4 font-display text-xl">Sign in to see your saved properties</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Wishlists are tied to your buyer account so they follow you across devices. Creating one is free.
            </p>
            <Button onClick={() => setAuthOpen(true)} className="mt-6 bg-navy text-navy-foreground hover:bg-navy/90">
              Sign in / Sign up as a buyer
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              {saved.length} saved {saved.length === 1 ? "property" : "properties"}.
            </p>
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
          </>
        )}
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="signup"
        defaultRole="buyer"
        title="Create a free buyer account"
        description="Save listings, keep your shortlist in one place, and review realtors you've contacted."
      />
    </div>
  );
}
