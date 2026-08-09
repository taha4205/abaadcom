import { useState } from "react";
import { Bed, Bath, Maximize, MapPin, Star, ShieldCheck, MessageCircle, Heart, Flame, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { propertySlug, type Property } from "@/lib/properties";
import { useWishlist } from "@/lib/wishlist";
import { logLead } from "@/lib/leads";
import { logListingView } from "@/lib/views";
import { boostStatus } from "@/lib/boosts";
import { AuthModal } from "@/components/auth-modal";

export function PropertyCard({ p }: { p: Property }) {
  const wa = p.whatsapp ?? "923001234567";
  const waUrl = `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${p.title} on abaad.com`)}`;
  const { has, toggle } = useWishlist();
  const saved = has(p.id);
  const [authOpen, setAuthOpen] = useState(false);
  const boost = boostStatus(p.boostTier, p.boostExpiresAt);

  async function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const r = await toggle(p.id);
    if (r === "unauthenticated") {
      setAuthOpen(true);
      return;
    }
    if (r === "error") toast.error("Couldn't update your wishlist. Try again.");
    else if (r === "added") toast.success("Saved to your wishlist");
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <Link
          to="/property/$slug"
          params={{ slug: propertySlug(p) }}
          className="block"
          onClick={() => logListingView({ listingId: p.id, realtorId: p.realtorId, eventType: "click" })}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {boost.active && (
                <Badge className={`border-0 ${boost.tier === "super_hot" ? "bg-navy text-navy-foreground" : "bg-orange-600 text-white"}`}>
                  {boost.tier === "super_hot" ? <Zap className="mr-1 h-3 w-3 fill-current" /> : <Flame className="mr-1 h-3 w-3" />}
                  {boost.label}
                </Badge>
              )}
              {p.verified && (
                <Badge className="border-0 bg-green text-green-foreground">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
              {p.featured && !p.verified && (
                <Badge className="border-0 bg-green text-green-foreground">
                  <Star className="mr-1 h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
            </div>
            {p.tier && (
              <Badge className="absolute left-3 bottom-3 border-0 bg-navy text-navy-foreground">{p.tier}</Badge>
            )}
            {p.images && p.images.length > 1 && (
              <div className="absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                +{p.images.length - 1} photos
              </div>
            )}
            <div className="absolute right-12 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-navy backdrop-blur">
              {p.intent === "buy" ? "For Sale" : "For Rent"}
            </div>
          </div>
        </Link>
        <button
          type="button"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={onHeart}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-green text-green" : ""}`} />
        </button>
      </div>
      <Link
        to="/property/$slug"
        params={{ slug: propertySlug(p) }}
        className="block"
        onClick={() => logListingView({ listingId: p.id, realtorId: p.realtorId, eventType: "click" })}
      >
        <div className="p-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {p.area}
          </div>
          <h3 className="mt-1.5 font-display text-base leading-snug line-clamp-2 min-h-[2.6em]">{p.title}</h3>
          <p className="mt-3 text-xl font-medium text-navy">{p.price}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            {p.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds} bed</span>}
            {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths} bath</span>}
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {p.size} {p.category === "plot" ? "sq yd" : "sq ft"}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            by{" "}
            {p.realtorId ? (
              <Link
                to="/realtor/$id"
                params={{ id: p.realtorId }}
                onClick={(e) => e.stopPropagation()}
                className="text-foreground font-medium hover:text-navy"
              >
                {p.realtor}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{p.realtor}</span>
            )}
          </p>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            logLead({ listingId: p.id, realtorId: p.realtorId });
            logListingView({ listingId: p.id, realtorId: p.realtorId, eventType: "click" });
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-green/40 bg-green/5 px-3 py-2 text-sm font-medium text-green transition hover:bg-green/10"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Realtor
        </a>
      </div>
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="signup"
        defaultRole="buyer"
        title="Save this property"
        description="Create a free buyer account (or sign in) to save listings to your wishlist."
      />
    </div>
  );
}
