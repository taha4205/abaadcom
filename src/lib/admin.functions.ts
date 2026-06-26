import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_PASSWORD = "admin123";
const ADMIN_EMAIL = "admin@admin.com";

function checkAuth(email: string, password: string) {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error("Invalid admin credentials");
  }
}

const Creds = z.object({ email: z.string(), password: z.string() });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Creds.parse(d))
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    return { ok: true };
  });

export const adminFetchAll = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Creds.parse(d))
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [realtorsRes, listingsRes] = await Promise.all([
      supabaseAdmin.from("realtors").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("listings").select("*, realtors(full_name, agency_name)").order("created_at", { ascending: false }),
    ]);
    return {
      realtors: realtorsRes.data ?? [],
      listings: listingsRes.data ?? [],
    };
  });

export const adminUpdateRealtor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Creds.extend({ id: z.string(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("realtors").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateListing = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Creds.extend({
      id: z.string(),
      verified: z.boolean().optional(),
      is_active: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    const patch: Record<string, unknown> = {};
    if (data.verified !== undefined) patch.verified = data.verified;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("listings").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
