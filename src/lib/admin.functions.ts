import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_EMAIL = "admin@admin.com";

function checkAuth(email: string, password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  const a = createHash("sha256").update(String(password ?? ""), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  const emailOk = String(email ?? "").toLowerCase() === ADMIN_EMAIL;
  const passOk = a.length === b.length && timingSafeEqual(a, b);
  if (!emailOk || !passOk) {
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
    Creds.extend({
      id: z.string(),
      status: z.enum(["approved", "rejected", "pending"]).optional(),
      response_time: z.enum(["under_1h", "same_day", "within_24h"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    const patch: { status?: string; response_time?: string } = {};
    if (data.status) patch.status = data.status;
    if (data.response_time) patch.response_time = data.response_time;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("realtors").update(patch).eq("id", data.id);
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
    const patch: { verified?: boolean; is_active?: boolean } = {};
    if (data.verified !== undefined) patch.verified = data.verified;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("listings").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSeedSahil = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Creds.parse(d))
  .handler(async ({ data }) => {
    checkAuth(data.email, data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const REALTOR_ID = "11111111-1111-1111-1111-111111111111";
    const EMAIL = "sahil@sahilrealestate.com";
    const PASSWORD = "sahil1234";

    // Find or create the auth user.
    let userId: string | null = null;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email?.toLowerCase() === EMAIL);
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: EMAIL, password: PASSWORD, email_confirm: true,
      });
      if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");
      userId = created.user.id;
    }

    const { error: linkErr } = await supabaseAdmin
      .from("realtors")
      .update({ user_id: userId })
      .eq("id", REALTOR_ID);
    if (linkErr) throw new Error(linkErr.message);
    return { ok: true, email: EMAIL };
  });
