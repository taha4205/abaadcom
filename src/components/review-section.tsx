import { useEffect, useState } from "react";
import { Star, Loader2, MessageCircleWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  fetchRealtorReviews, findReviewableLead, myReviewFor, submitReview, type Review,
} from "@/lib/reviews";
import { useAuth } from "@/lib/use-auth";
import { AuthModal } from "@/components/auth-modal";

export function ReviewSection({ realtorId }: { realtorId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mine, setMine] = useState<Review | null>(null);
  const [reviewable, setReviewable] = useState<{ leadId: string; ready: boolean; readyAt: Date } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  async function reload() {
    setLoading(true);
    const [r, m, rev] = await Promise.all([
      fetchRealtorReviews(realtorId),
      myReviewFor(realtorId),
      findReviewableLead(realtorId),
    ]);
    setReviews(r);
    setMine(m);
    setReviewable(rev);
    setLoading(false);
  }

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [realtorId, user?.id]);

  const avg = reviews.length ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-green">Reviews</p>
          <h2 className="mt-1 font-display text-xl">What buyers say</h2>
        </div>
        {reviews.length > 0 && (
          <div className="text-right">
            <p className="font-display text-2xl font-medium text-navy">{avg.toFixed(1)}</p>
            <div className="flex justify-end">{renderStars(Math.round(avg))}</div>
            <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          </div>
        )}
      </div>

      {!user ? (
        <AuthGate onSignIn={() => setShowAuth(true)} />
      ) : mine ? (
        <div className="rounded-lg border border-green/30 bg-green/5 p-4">
          <p className="text-xs text-green">Your review</p>
          <div className="mt-1 flex items-center gap-1">{renderStars(mine.rating)}</div>
          {mine.comment && <p className="mt-2 text-sm text-foreground/90">{mine.comment}</p>}
        </div>
      ) : !reviewable ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          You can leave a review after you contact this realtor on WhatsApp (while signed in).
        </div>
      ) : !reviewable.ready ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          You can leave a review after your conversation. Come back after {reviewable.readyAt.toLocaleTimeString()}.
        </div>
      ) : (
        <ReviewForm realtorId={realtorId} leadId={reviewable.leadId} onSaved={reload} />
      )}

      <div className="mt-8 space-y-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-t border-border pt-4">
              <div className="flex items-center gap-2">
                {renderStars(r.rating)}
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>}
            </div>
          ))
        )}
      </div>

      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </section>
  );
}

function AuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-4 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircleWarning className="h-4 w-4" /> Sign in to leave a review after contacting this realtor.
      </div>
      <Button size="sm" onClick={onSignIn} className="bg-navy text-navy-foreground hover:bg-navy/90">Sign in</Button>
    </div>
  );
}

function ReviewForm({ realtorId, leadId, onSaved }: { realtorId: string; leadId: string; onSaved: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = await submitReview({ realtorId, leadId, rating, comment });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success("Thanks for your review");
    setComment("");
    onSaved();
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your rating</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
            className="p-0.5"
          >
            <Star className={`h-6 w-6 ${n <= rating ? "fill-green text-green" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional — how was your experience?"
        maxLength={500}
        className="mt-3"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{comment.length}/500</span>
        <Button size="sm" onClick={submit} disabled={busy} className="bg-navy text-navy-foreground hover:bg-navy/90">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Submit review
        </Button>
      </div>
    </div>
  );
}

export function renderStars(n: number) {
  return [1, 2, 3, 4, 5].map((i) => (
    <Star key={i} className={`h-4 w-4 ${i <= n ? "fill-green text-green" : "text-muted-foreground/40"}`} />
  ));
}
