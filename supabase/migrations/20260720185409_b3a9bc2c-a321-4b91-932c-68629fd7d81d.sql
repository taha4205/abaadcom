
-- 1. Extend listings with photos + map coords
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 2. Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  realtor_id UUID NOT NULL REFERENCES public.realtors(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_name TEXT,
  buyer_phone TEXT,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_realtor_id_idx ON public.leads(realtor_id);
CREATE INDEX IF NOT EXISTS leads_listing_id_idx ON public.leads(listing_id);
CREATE INDEX IF NOT EXISTS leads_buyer_user_id_idx ON public.leads(buyer_user_id);

GRANT SELECT, INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can create a lead (WhatsApp click). If signed in the client sets buyer_user_id = auth.uid().
CREATE POLICY "Anyone can create a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    buyer_user_id IS NULL OR buyer_user_id = auth.uid()
  );

-- Realtors can see leads for listings they own.
CREATE POLICY "Realtors see their own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    realtor_id IN (SELECT id FROM public.realtors WHERE user_id = auth.uid())
  );

-- Buyers can see their own leads (needed to make a review).
CREATE POLICY "Buyers see their own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (buyer_user_id = auth.uid());

-- 3. Realtor reviews
CREATE TABLE IF NOT EXISTS public.realtor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id UUID NOT NULL REFERENCES public.realtors(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT one_review_per_realtor UNIQUE (realtor_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS realtor_reviews_realtor_id_idx ON public.realtor_reviews(realtor_id);

GRANT SELECT ON public.realtor_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.realtor_reviews TO authenticated;
GRANT ALL ON public.realtor_reviews TO service_role;

ALTER TABLE public.realtor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
  ON public.realtor_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trigger enforces: reviewer = auth.uid, lead belongs to reviewer, lead>=30min old, lead is for this realtor.
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ld RECORD;
BEGIN
  IF NEW.reviewer_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Reviewer must be the current user';
  END IF;
  SELECT * INTO ld FROM public.leads WHERE id = NEW.lead_id;
  IF ld IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  IF ld.buyer_user_id IS DISTINCT FROM NEW.reviewer_user_id THEN
    RAISE EXCEPTION 'Lead does not belong to reviewer';
  END IF;
  IF ld.realtor_id <> NEW.realtor_id THEN
    RAISE EXCEPTION 'Lead does not match realtor';
  END IF;
  IF ld.created_at > now() - interval '30 minutes' THEN
    RAISE EXCEPTION 'You can review this realtor 30 minutes after contacting them';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_insert
  BEFORE INSERT ON public.realtor_reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review();

CREATE POLICY "Users insert own review"
  ON public.realtor_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "Users update own review"
  ON public.realtor_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_user_id = auth.uid())
  WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "Users delete own review"
  ON public.realtor_reviews FOR DELETE
  TO authenticated
  USING (reviewer_user_id = auth.uid());
