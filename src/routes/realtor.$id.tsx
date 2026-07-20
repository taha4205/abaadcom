import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property-card";
import { ReviewSection, renderStars } from "@/components/review-section";
import { responseTimeLabel } from "@/lib/realtors";
import { fetchLiveListings, getLiveListings, type Property } from "@/lib/properties";
import { realtorReviewStats } from "@/lib/reviews";
import { logLead } from "@/lib/leads";

type RealtorRow = {
  id: string;
  full_name: string;
  agency_name: string;
  package_tier: string;
  response_time: string | null;
  phone: string | null;
  account_type: string | null;
  status: string;
};

export const Route = createFileRoute("/realtor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Realtor — abaad.com` },
      { name: "description", content: "Verified realtor profile with active listings and buyer reviews." },
    ],
    links: [{ rel: "canonical", href: `/realtor/${params.id}` }],
  }),
  component: RealtorPage,
});

function RealtorPage() {
  const { id } = Route.useParams();
  const [realtor, setRealtor] = useState<RealtorRow | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: r }, s] = await Promise.all([
        supabase.from("realtors").select("*").eq("id", id).eq("status", "approved").maybeSingle(),
        realtorReviewStats(id),
      ]);
      if (!r) {
        setLoading(false);
        throw notFound();
      }
      setRealtor(r as RealtorRow);
      setStats(s);
      await fetchLiveListings();
      const mine = getLiveListings().filter((p) => p.realtorId === id);
      setListings(mine);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!realtor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-medium">Realtor not found</h1>
          <Link to="/realtors" className="mt-4 inline-block text-navy underline">Browse realtors</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rt = responseTimeLabel(realtor.response_time);
  const wa = (realtor.phone ?? "923001234567").replace(/\D/g, "");
  const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${realtor.full_name}, I saw your profile on abaad.com`)}`;
  const initial = realtor.agency_name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/realtors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> All realtors
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-navy text-navy-foreground font-display text-3xl">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-medium text-navy sm:text-3xl">{realtor.agency_name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{realtor.full_name}{realtor.account_type === "agency" ? " · Agency" : " · Individual realtor"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="border-0 bg-navy text-navy-foreground">{realtor.package_tier}</Badge>
                <Badge variant="outline" className="gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${rt.dot}`} /> {rt.label}
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-green/40 text-green">
                  <ShieldCheck className="h-3 w-3" /> Verified realtor
                </Badge>
                {stats.count > 0 && (
                  <Badge variant="outline" className="gap-1.5">
                    {renderStars(Math.round(stats.avg))} <span className="text-xs">{stats.avg.toFixed(1)} · {stats.count}</span>
                  </Badge>
                )}
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => listings[0] && logLead({ listingId: listings[0].id, realtorId: id })}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-green px-5 py-2.5 text-sm font-medium text-green-foreground hover:bg-green/90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-medium text-navy">
              Active listings ({listings.length})
            </h2>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">This realtor has no active listings right now.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </section>

        <div className="mt-10 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> Karachi, Pakistan
        </div>

        <div className="mt-10">
          <ReviewSection realtorId={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
