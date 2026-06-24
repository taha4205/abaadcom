import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
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
  polishedTitle: z.string().describe("A concise, compelling 6-12 word listing title."),
  polishedDescription: z.string().describe("A 2-3 sentence buyer-friendly description, no emojis."),
  fairMin: z.number().describe("Estimated fair market minimum in PKR for this property."),
  fairMax: z.number().describe("Estimated fair market maximum in PKR for this property."),
  verdict: z.enum(["under", "fair", "over"]).describe("Whether asking price is under, fairly, or over market."),
  reasoning: z.string().describe("One short paragraph explaining the price assessment for Karachi market in 2026."),
});

export type ListingAiResult = z.infer<typeof OutputSchema>;

export const assistListing = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const unit = data.category === "plot" ? "sq yd" : "sq ft";
    const intentLine = data.intent === "rent" ? "for monthly rent" : "for sale";
    const prompt = `You are a Karachi real estate expert helping a realtor list a property on abaad.com.
Property:
- Location: ${data.area}, Karachi
- Type: ${data.category} (${intentLine})
- Size: ${data.size} ${unit}
- Beds: ${data.beds}, Baths: ${data.baths}
- Asking price: PKR ${data.price.toLocaleString("en-PK")}${data.intent === "rent" ? " / month" : ""}
- Realtor draft title: ${data.rawTitle || "(none)"}
- Realtor draft description: ${data.rawDescription || "(none)"}

Tasks:
1. Write a sharp listing title and description that a buyer would click.
2. Estimate a fair market price range in PKR for this exact property in Karachi (2026), based on typical per-sq-ft/sq-yd rates for the area and type. Be realistic and specific.
3. Compare the asking price to your range and give a verdict (under / fair / over) with reasoning.

Return ONLY the structured object.`;

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: OutputSchema }),
      prompt,
    });

    return experimental_output;
  });
