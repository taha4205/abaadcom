import { Bed, Bath, Maximize, MapPin, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { propertySlug, type Property } from "@/lib/properties";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      to="/property/$slug"
      params={{ slug: propertySlug(p) }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {p.featured && (
          <Badge className="absolute left-3 top-3 border-0 bg-green text-green-foreground">
            <Star className="mr-1 h-3 w-3 fill-current" />
            Featured
          </Badge>
        )}
        {p.tier && (
          <Badge className="absolute left-3 bottom-3 border-0 bg-navy text-navy-foreground">
            {p.tier}
          </Badge>
        )}
        <div className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-navy backdrop-blur">
          {p.intent === "buy" ? "For Sale" : "For Rent"}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {p.area}
        </div>
        <h3 className="mt-1.5 font-display text-base leading-snug line-clamp-2 min-h-[2.6em]">
          {p.title}
        </h3>
        <p className="mt-3 text-xl font-medium text-navy">{p.price}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          {p.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds} bed</span>}
          {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths} bath</span>}
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {p.size} {p.category === "plot" ? "sq yd" : "sq ft"}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">by <span className="text-foreground font-medium">{p.realtor}</span></p>
      </div>
    </Link>
  );
}
