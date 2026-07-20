import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  realtor_id: string;
  reviewer_user_id: string;
  lead_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function fetchRealtorReviews(realtorId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("realtor_reviews")
    .select("*")
    .eq("realtor_id", realtorId)
    .order("created_at", { ascending: false });
  return (data as Review[] | null) ?? [];
}

export async function realtorReviewStats(realtorId: string): Promise<{ avg: number; count: number }> {
  const rs = await fetchRealtorReviews(realtorId);
  if (rs.length === 0) return { avg: 0, count: 0 };
  const sum = rs.reduce((a, r) => a + r.rating, 0);
  return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
}

// Returns a lead id that the current user can use to review this realtor,
// or null if they don't have one yet (or the wait period isn't over).
export async function findReviewableLead(realtorId: string): Promise<{ leadId: string; ready: boolean; readyAt: Date } | null> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user?.id;
  if (!uid) return null;
  const { data } = await supabase
    .from("leads")
    .select("id, created_at")
    .eq("realtor_id", realtorId)
    .eq("buyer_user_id", uid)
    .order("created_at", { ascending: true })
    .limit(1);
  const lead = data?.[0];
  if (!lead) return null;
  const readyAt = new Date(new Date(lead.created_at).getTime() + 30 * 60 * 1000);
  return { leadId: lead.id, ready: readyAt < new Date(), readyAt };
}

export async function submitReview(params: {
  realtorId: string;
  leadId: string;
  rating: number;
  comment: string;
}): Promise<{ error?: string }> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user?.id;
  if (!uid) return { error: "Sign in to leave a review" };
  const { error } = await supabase.from("realtor_reviews").insert({
    realtor_id: params.realtorId,
    reviewer_user_id: uid,
    lead_id: params.leadId,
    rating: params.rating,
    comment: params.comment.trim() || null,
  });
  return { error: error?.message };
}

export async function myReviewFor(realtorId: string): Promise<Review | null> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user?.id;
  if (!uid) return null;
  const { data } = await supabase
    .from("realtor_reviews")
    .select("*")
    .eq("realtor_id", realtorId)
    .eq("reviewer_user_id", uid)
    .maybeSingle();
  return (data as Review | null) ?? null;
}
