-- 1. Sub-area (phase / block / sector) on listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS sub_area text;
CREATE INDEX IF NOT EXISTS listings_sub_area_idx ON public.listings (sub_area);

-- 2. Lead typing + structured details (site visit dates, financing inputs, etc.)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_type text NOT NULL DEFAULT 'contact';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS details jsonb;

-- 3. Crowdsourced local area reports (admin-approved before public display)
CREATE TABLE IF NOT EXISTS public.area_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area text NOT NULL,
  sub_area text,
  water_timing text,
  gas_loadshedding text,
  security_rating integer NOT NULL DEFAULT 3,
  notes text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.area_reports TO authenticated;
GRANT SELECT ON public.area_reports TO anon;
GRANT ALL ON public.area_reports TO service_role;

ALTER TABLE public.area_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved area reports are public"
  ON public.area_reports FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Users read own area reports"
  ON public.area_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users submit own area reports"
  ON public.area_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND security_rating BETWEEN 1 AND 5
    AND length(area) BETWEEN 2 AND 120
    AND (sub_area IS NULL OR length(sub_area) <= 120)
    AND (water_timing IS NULL OR length(water_timing) <= 200)
    AND (gas_loadshedding IS NULL OR length(gas_loadshedding) <= 200)
    AND (notes IS NULL OR length(notes) <= 1000)
  );

CREATE TRIGGER area_reports_touch BEFORE UPDATE ON public.area_reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. Public aggregate of approved local data, safe for anon (no user ids)
CREATE OR REPLACE FUNCTION public.area_local_data()
RETURNS TABLE(area text, reports bigint, avg_security numeric, water_timings text[], gas_notes text[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    r.area,
    count(*)::bigint,
    round(avg(r.security_rating), 1)::numeric,
    array_remove(array_agg(DISTINCT r.water_timing), NULL),
    array_remove(array_agg(DISTINCT r.gas_loadshedding), NULL)
  FROM public.area_reports r
  WHERE r.is_approved = true
  GROUP BY r.area;
$$;