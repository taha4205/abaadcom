ALTER TABLE public.realtors DROP CONSTRAINT IF EXISTS realtors_package_tier_check;
ALTER TABLE public.realtors ADD CONSTRAINT realtors_package_tier_check
  CHECK (package_tier = ANY (ARRAY['Starter','Growth','Pro','Silver','Gold','Platinum']));

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_tier_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_tier_check
  CHECK (tier = ANY (ARRAY['Starter','Growth','Pro','Silver','Gold','Platinum']));