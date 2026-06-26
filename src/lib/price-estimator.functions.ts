import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const Input = z.object({
  area: z.string(),
  category: z.string(),
  intent: z.string(),
  size: z.number(),
  beds: z.number(),
  baths: z.number(),
});

export const estimatePrice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI not configured");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `You are a Karachi real estate expert. Based on:
Area: ${data.area}
Category: ${data.category} (${data.intent === "rent" ? "monthly rent" : "sale price"})
Size: ${data.size} ${data.category === "plot" ? "sq yd" : "sq ft"}
Beds: ${data.beds}, Baths: ${data.baths}
Give a fair market price estimate in PKR. Reply in 2-3 sentences max with a range and a brief reason. Keep it concise.`;
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });
    return { estimate: text.trim() };
  });
