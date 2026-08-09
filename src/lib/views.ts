import { supabase } from "@/integrations/supabase/client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEDUPE_MS = 30 * 60 * 1000;

function recentlyLogged(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw && Date.now() - Number(raw) < DEDUPE_MS) return true;
    sessionStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget view/click logging.
 * Logged-in buyers are recorded with their name + phone; everyone else is anonymous.
 */
export async function logListingView(params: {
  listingId: string | number;
  realtorId?: string | null;
  eventType?: "view" | "click";
}) {
  const listingId = String(params.listingId);
  const realtorId = params.realtorId;
  // Demo/seed listings use numeric ids and aren't in the database.
  if (!UUID_RE.test(listingId) || !realtorId) return;

  const eventType = params.eventType ?? "view";
  if (recentlyLogged(`abaad_view_${eventType}_${listingId}`)) return;

  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user ?? null;
    let name: string | null = null;
    let phone: string | null = null;

    if (user) {
      const meta = user.user_metadata ?? {};
      name = (meta.full_name as string) ?? null;
      phone = (meta.phone as string) ?? null;
      if (!name || !phone) {
        const { data: profile } = await supabase
          .from("buyer_profiles")
          .select("full_name, phone")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile) {
          name = name ?? profile.full_name;
          phone = phone ?? profile.phone;
        }
      }
    }

    await supabase.from("listing_views").insert({
      listing_id: listingId,
      realtor_id: realtorId,
      viewer_user_id: user?.id ?? null,
      viewer_name: name,
      viewer_phone: phone,
      event_type: eventType,
    } as never);
  } catch {
    /* best-effort */
  }
}

export type ListingViewRow = {
  id: string;
  listing_id: string;
  realtor_id: string;
  viewer_user_id: string | null;
  viewer_name: string | null;
  viewer_phone: string | null;
  event_type: string;
  created_at: string;
  listings?: { title: string; area: string } | null;
  realtors?: { agency_name: string; full_name: string } | null;
};

export function viewerLabel(v: Pick<ListingViewRow, "viewer_user_id" | "viewer_name" | "viewer_phone">): string {
  if (!v.viewer_user_id) return "Anonymous user";
  const name = v.viewer_name?.trim() || "Signed-in buyer";
  return v.viewer_phone ? `${name} (${v.viewer_phone})` : name;
}
