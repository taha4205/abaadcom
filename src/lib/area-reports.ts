import { supabase } from "@/integrations/supabase/client";

export type AreaReport = {
  id: string;
  area: string;
  sub_area: string | null;
  water_timing: string | null;
  gas_loadshedding: string | null;
  security_rating: number;
  notes: string | null
  created_at: string;
};

export type AreaLocalData = {
  area: string;
  reports: number;
  avgSecurity: number | null;
  waterTimings: string[];
  gasNotes: string[];
  latest: AreaReport[];
};

/** Approved, public crowdsourced reports for one area. */
export async function fetchAreaLocalData(area: string): Promise<AreaLocalData> {
  const empty: AreaLocalData = { area, reports: 0, avgSecurity: null, waterTimings: [], gasNotes: [], latest: [] };
  try {
    const { data, error } = await supabase
      .from("area_reports")
      .select("id, area, sub_area, water_timing, gas_loadshedding, security_rating, notes, created_at")
      .eq("area", area)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data || data.length === 0) return empty;
    const rows = data as AreaReport[];
    const uniq = (xs: (string | null)[]) =>
      Array.from(new Set(xs.filter((x): x is string => !!x && x.trim().length > 0))).slice(0, 6);
    return {
      area,
      reports: rows.length,
      avgSecurity: Math.round((rows.reduce((s, r) => s + (r.security_rating ?? 0), 0) / rows.length) * 10) / 10,
      waterTimings: uniq(rows.map((r) => r.water_timing)),
      gasNotes: uniq(rows.map((r) => r.gas_loadshedding)),
      latest: rows.slice(0, 5),
    };
  } catch {
    return empty;
  }
}

export type AreaReportInput = {
  area: string;
  subArea?: string;
  waterTiming?: string;
  gasLoadshedding?: string;
  securityRating: number;
  notes?: string;
};

export async function submitAreaReport(
  input: AreaReportInput,
): Promise<"ok" | "unauthenticated" | "error"> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user?.id;
  if (!uid) return "unauthenticated";
  const clean = (s?: string, max = 200) => {
    const v = (s ?? "").trim().slice(0, max);
    return v.length > 0 ? v : null;
  };
  const { error } = await supabase.from("area_reports").insert({
    user_id: uid,
    area: input.area.trim().slice(0, 120),
    sub_area: clean(input.subArea, 120),
    water_timing: clean(input.waterTiming),
    gas_loadshedding: clean(input.gasLoadshedding),
    security_rating: Math.min(5, Math.max(1, Math.round(input.securityRating))),
    notes: clean(input.notes, 1000),
  });
  return error ? "error" : "ok";
}
