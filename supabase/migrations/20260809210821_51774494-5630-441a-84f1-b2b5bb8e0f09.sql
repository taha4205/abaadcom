CREATE TABLE public.listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  realtor_id uuid NOT NULL REFERENCES public.realtors(id) ON DELETE CASCADE,
  viewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_name text,
  viewer_phone text,
  event_type text NOT NULL DEFAULT 'view',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX listing_views_listing_idx ON public.listing_views (listing_id, created_at DESC);
CREATE INDEX listing_views_realtor_idx ON public.listing_views (realtor_id, created_at DESC);

GRANT INSERT, SELECT ON public.listing_views TO authenticated;
GRANT INSERT ON public.listing_views TO anon;
GRANT ALL ON public.listing_views TO service_role;

ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Anyone can log a view; identity fields may only describe the logged-in viewer.
CREATE POLICY "Anyone can log a listing view" ON public.listing_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (viewer_user_id IS NULL OR viewer_user_id = auth.uid())
    AND event_type IN ('view', 'click')
    AND (viewer_name IS NULL OR length(viewer_name) <= 120)
    AND (viewer_phone IS NULL OR length(viewer_phone) <= 40)
  );

-- Realtors can read views on their own listings.
CREATE POLICY "Realtors read own listing views" ON public.listing_views
  FOR SELECT TO authenticated
  USING (realtor_id IN (SELECT realtors.id FROM public.realtors WHERE realtors.user_id = auth.uid()));