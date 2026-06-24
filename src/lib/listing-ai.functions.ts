import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  area: z.string().min(1),
  category: z.enum(["flat", "house", "commercial", "plot"]),
  intent: z.enum(["buy", "rent"]),
  beds: z.number().int().min(0).max(20),
  baths: z.number().int().min(0).max(20),
  size: z.number().int().min(1).max(100000),
  price: z.number().int().min(1),
  rawTitle: z.string().max(200).optional().default(""),
  rawDescription: z.string().max(2000).optional().default(""),
});

const OutputSchema = z.object({
  polishedTitle: z.string(),
  polishedDescription: z.string(),
  fairMin: z.number(),
  fairMax: z.number(),
  verdict: z.enum(["under", "fair", "over"]),
  reasoning: z.string(),
});

export type ListingAiResult = z.infer<typeof OutputSchema>;

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in AI response");
  return JSON.parse(candidate.slice(start, end + 1));
}

export const assistListing = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<ListingAiResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const unit = data.category === "plot" ? "sq yd" : "sq ft";
    const intentLine = data.intent === "rent" ? "for monthly rent" : "for sale";
    const prompt = `You are a Karachi real estate expert helping a realtor list a property on abaad.com (2026).

Property:
- Location: ${data.area}, Karachi
- Type: ${data.category} (${intentLine})
- Size: ${data.size} ${unit}
- Beds: ${data.beds}, Baths: ${data.baths}
- Asking price: PKR ${data.price.toLocaleString("en-PK")}${data.intent === "rent" ? " / month" : ""}
- Realtor draft title: ${data.rawTitle || "(none)"}
- Realtor draft description: ${data.rawDescription || "(none)"}

Tasks:
1. Write a sharp 6-12 word listing title.
2. Write a 2-3 sentence buyer-friendly description (no emojis).
3. Estimate a realistic fair market price range in PKR for this property in Karachi based on typical per-${unit} rates for the area and type.
4. Verdict: "under" / "fair" / "over" comparing asking to your range, with one short paragraph of reasoning.

Respond ONLY with valid JSON matching this exact shape (no prose, no code fences):
{
  "polishedTitle": string,
  "polishedDescription": string,
  "fairMin": number (PKR),
  "fairMax": number (PKR),
  "verdict": "under" | "fair" | "over",
  "reasoning": string
}`;

    const { text } = await generateText({ model, prompt });
    const parsed = OutputSchema.parse(extractJson(text));
    return parsed;
  });
