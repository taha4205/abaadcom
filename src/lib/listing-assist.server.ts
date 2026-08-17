import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { AREA_GUIDES } from "@/lib/area-guides";
import { benchmarkFor } from "@/lib/area-benchmarks";

export type AssistInput = {
  area: string;
  subArea: string;
  category: "flat" | "house" | "commercial" | "plot";
  intent: "buy" | "rent";
  size: number;
  price: number;
  beds: number;
  baths: number;
};

export type Comparables = {
  areaCount: number;
  subAreaCount: number;
  avgPerSqydArea: number | null;
  avgPerSqydSubArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
};

export type AssistResult = {
  title: string;
  description: string;
  verdict: "good deal" | "reasonable" | "overpriced" | "not enough data";
  assessment: string;
  comparables: Comparables;
};

function serverSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export async function loadComparables(input: AssistInput): Promise<Comparables> {
  const supabase = serverSupabase();
  const { data } = await supabase
    .from("listings")
    .select("price_num, size_sqyd, sub_area")
    .eq("is_active", true)
    .eq("area", input.area)
    .eq("category", input.category)
    .eq("intent", input.intent);

  const rows = (data ?? []).filter(
    (r: any) => Number(r.price_num) > 0 && Number(r.size_sqyd) > 0,
  );
  const sub = input.subArea.trim().toLowerCase();
  const subRows = sub
    ? rows.filter((r: any) => (r.sub_area ?? "").trim().toLowerCase() === sub)
    : [];
  const perSqyd = (list: any[]) => list.map((r) => Number(r.price_num) / Number(r.size_sqyd));
  const prices = rows.map((r: any) => Number(r.price_num));

  return {
    areaCount: rows.length,
    subAreaCount: subRows.length,
    avgPerSqydArea: avg(perSqyd(rows)),
    avgPerSqydSubArea: avg(perSqyd(subRows)),
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
  };
}

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI returned an unexpected response");
  return JSON.parse(candidate.slice(start, end + 1));
}

const pkr = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

export async function generateAssist(input: AssistInput): Promise<AssistResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured");

  const comps = await loadComparables(input);
  const guide = AREA_GUIDES.find((g) => g.area.toLowerCase() === input.area.trim().toLowerCase());
  const bench = benchmarkFor(input.area);
  const askPerSqyd = input.size > 0 ? input.price / input.size : 0;
  const label = input.subArea.trim() ? `${input.area} ${input.subArea.trim()}` : input.area;

  const facts = [
    `Location: ${label}, Karachi`,
    `Type: ${input.category} ${input.intent === "rent" ? "for monthly rent" : "for sale"}`,
    `Size: ${input.size} sq yd`,
    input.category === "plot" ? "" : `Beds: ${input.beds}, Baths: ${input.baths}`,
    `Asking: ${pkr(input.price)}${input.intent === "rent" ? " / month" : ""} (${pkr(askPerSqyd)} per sq yd)`,
    comps.avgPerSqydSubArea !== null && comps.subAreaCount >= 3
      ? `Our own comparable data: ${comps.subAreaCount} active ${input.category} listings in ${label} averaging ${pkr(comps.avgPerSqydSubArea)} per sq yd.`
      : comps.avgPerSqydArea !== null && comps.areaCount >= 3
        ? `Our own comparable data: only ${comps.subAreaCount} comparable listings in ${label} itself, but ${comps.areaCount} active ${input.category} listings across ${input.area} averaging ${pkr(comps.avgPerSqydArea)} per sq yd.`
        : `Our own comparable data: only ${comps.areaCount} active comparable listings in ${input.area} — NOT enough to make a confident comparison.`,
    bench
      ? `Portal benchmark band for ${input.area}: ${pkr(bench.low)}–${pkr(bench.high)} per sq yd (indicative survey data).`
      : `No portal benchmark band stored for ${input.area}.`,
    guide
      ? `Verified area notes — character: ${guide.vibe}. ${guide.blurb} Amenities we have on record: ${guide.amenities.join("; ")}.`
      : `We have no editorial area notes for ${input.area}, so do not describe the neighbourhood beyond its name.`,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a Karachi property listing copywriter and valuation analyst for abaad.com.

Use ONLY the facts below. Never invent amenities, landmarks, schools, developers or features that are not listed. If a fact is missing, leave it out.

FACTS
${facts}

Produce:
1. "title": a 6-12 word listing title.
2. "description": 2-4 sentences, no emojis, no hype adjectives without support. Combine the area's real character/amenities from the verified area notes (only those listed) with this property's size, configuration and price.
3. "verdict": exactly one of "good deal", "reasonable", "overpriced", or "not enough data" — use "not enough data" if the comparable count is too low to judge.
4. "assessment": 1-3 sentences citing the actual numbers, e.g. "12% below the ${label} average of X per sq yd based on N comparable listings". If comparables are insufficient, say so plainly and mention the benchmark band only as a rough reference.

Respond with ONLY valid JSON: {"title": string, "description": string, "verdict": string, "assessment": string}`;

  const gateway = createLovableAiGatewayProvider(key);
  const { text } = await generateText({ model: gateway("google/gemini-3-flash-preview"), prompt });
  const parsed = extractJson(text);

  const allowed = ["good deal", "reasonable", "overpriced", "not enough data"] as const;
  const verdict = allowed.includes(String(parsed.verdict).toLowerCase() as any)
    ? (String(parsed.verdict).toLowerCase() as AssistResult["verdict"])
    : "not enough data";

  return {
    title: String(parsed.title ?? "").trim(),
    description: String(parsed.description ?? "").trim(),
    verdict,
    assessment: String(parsed.assessment ?? "").trim(),
    comparables: comps,
  };
}
