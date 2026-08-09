ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS boost_tier text,
  ADD COLUMN IF NOT EXISTS boost_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS boost_purchased_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS listings_boost_idx ON public.listings (boost_tier, boost_expires_at);

CREATE OR REPLACE FUNCTION public.validate_boost()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.boost_tier IS NOT NULL AND NEW.boost_tier NOT IN ('hot', 'super_hot') THEN
    RAISE EXCEPTION 'Invalid boost tier: %', NEW.boost_tier;
  END IF;
  IF NEW.boost_tier IS NULL THEN
    NEW.boost_expires_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_boost_trigger ON public.listings;
CREATE TRIGGER validate_boost_trigger
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.validate_boost();