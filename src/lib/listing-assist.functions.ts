import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AssistResult } from "@/lib/listing-assist.server";

const Input = z.object({
  area: z.string().min(2).max(120),
  subArea: z.string().max(120).default(""),
  category: z.enum(["flat", "house", "commercial", "plot"]),
  intent: z.enum(["buy", "rent"]),
  size: z.number().int().min(1).max(200000),
  price: z.number().int().min(1),
  beds: z.number().int().min(0).max(30).default(0),
  baths: z.number().int().min(0).max(30).default(0),
});

export const assistListingDraft = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AssistResult> => {
    const { generateAssist } = await import("@/lib/listing-assist.server");
    return generateAssist(data);
  });
