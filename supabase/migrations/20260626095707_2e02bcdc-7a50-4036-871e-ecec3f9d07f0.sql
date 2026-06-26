
-- Realtors table
CREATE TABLE public.realtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  package_tier TEXT NOT NULL CHECK (package_tier IN ('Silver','Gold','Platinum')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.realtors TO authenticated;
GRANT SELECT ON public.realtors TO anon;
GRANT ALL ON public.realtors TO service_role;
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtors view own profile" ON public.realtors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view approved realtors" ON public.realtors
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Users create their realtor profile" ON public.realtors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realtor_id UUID NOT NULL REFERENCES public.realtors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  price_text TEXT NOT NULL,
  price_num BIGINT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN ('buy','rent')),
  category TEXT NOT NULL CHECK (category IN ('flat','house','commercial','plot')),
  beds INT NOT NULL DEFAULT 0,
  baths INT NOT NULL DEFAULT 0,
  size_sqyd INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL CHECK (tier IN ('Silver','Gold','Platinum')),
  verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active approved listings" ON public.listings
  FOR SELECT TO anon, authenticated USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.realtors r
      WHERE r.id = listings.realtor_id AND r.status = 'approved'
    )
  );
CREATE POLICY "Realtors view own listings" ON public.listings
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.realtors r WHERE r.id = listings.realtor_id AND r.user_id = auth.uid())
  );
CREATE POLICY "Approved realtors insert listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.realtors r WHERE r.id = listings.realtor_id AND r.user_id = auth.uid() AND r.status = 'approved')
  );
CREATE POLICY "Realtors update own listings" ON public.listings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.realtors r WHERE r.id = listings.realtor_id AND r.user_id = auth.uid())
  );

CREATE INDEX idx_listings_realtor ON public.listings(realtor_id);
CREATE INDEX idx_listings_active ON public.listings(is_active, created_at DESC);
