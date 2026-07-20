import { supabase } from "@/integrations/supabase/client";

// Fire-and-forget: log a WhatsApp contact click as a lead.
// Anonymous is fine — buyer_user_id is set only if signed in.
export async function logLead(params: {
  listingId: string | number;
  realtorId?: string;
}) {
  const listingId = String(params.listingId);
  // Seed listings use numeric ids — skip DB write for those.
  if (!/^[0-9a-f]{8}-/i.test(listingId)) return;
  if (!params.realtorId) return;

  try {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id ?? null;
    const meta = session.session?.user?.user_metadata ?? {};
    await supabase.from("leads").insert({
      listing_id: listingId,
      realtor_id: params.realtorId,
      buyer_user_id: uid,
      buyer_name: (meta.full_name as string) ?? null,
      buyer_phone: (meta.phone as string) ?? null,
      channel: "whatsapp",
    });
  } catch {
    /* silent — lead logging is best-effort */
  }
}
