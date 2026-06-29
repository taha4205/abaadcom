import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { responseTimeLabel } from "@/lib/realtors";

type Row = {
  id: string;
  full_name: string;
  agency_name: string;
  package_tier: string;
  response_time: string | null;
  phone: string | null;
  count: number;
};

export function TopRealtors() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("realtors")
        .select("id, full_name, agency_name, package_tier, response_time, phone, listings!inner(id, is_active)")
        .eq("status", "approved");
      if (!data) return;
      const mapped: Row[] = data
        .map((r: any) => ({
          id: r.id,
          full_name: r.full_name,
          agency_name: r.agency_name,
          package_tier: r.package_tier,
          response_time: r.response_time,
          phone: r.phone,
          count: (r.listings ?? []).filter((l: any) => l.is_active).length,
        }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      setRows(mapped);
    })();
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-green">Top performers</p>
          <h2 className="mt-1 text-xl font-medium sm:text-2xl">Our Top Realtors</h2>
        </div>
        <Link to="/" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">View all →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => {
          const rt = responseTimeLabel(r.response_time);
          const initial = r.agency_name.charAt(0).toUpperCase();
          const wa = (r.phone ?? "923001234567").replace(/\D/g, "");
          return (
            <article key={r.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-navy-foreground font-display text-lg">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-medium">{r.agency_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.full_name}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="border-0 bg-navy text-navy-foreground">{r.package_tier}</Badge>
                <Badge variant="outline" className="gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${rt.dot}`} /> {rt.label}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{r.count}</span> active {r.count === 1 ? "listing" : "listings"}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link to="/" className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/70">
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${r.full_name}, I saw your listings on abaad.com`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-green px-3 py-2 text-sm font-medium text-green-foreground hover:bg-green/90"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
