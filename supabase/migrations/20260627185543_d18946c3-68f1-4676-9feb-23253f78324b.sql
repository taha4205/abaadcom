
-- Allow seed/system realtors with no auth user
ALTER TABLE public.realtors ALTER COLUMN user_id DROP NOT NULL;

-- Open read access (admin dashboard uses anon client; access gated by admin password in app)
DROP POLICY IF EXISTS "Public can view approved realtors" ON public.realtors;
DROP POLICY IF EXISTS "Realtors view own profile" ON public.realtors;
CREATE POLICY "Anyone can read realtors" ON public.realtors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view active approved listings" ON public.listings;
DROP POLICY IF EXISTS "Realtors view own listings" ON public.listings;
CREATE POLICY "Anyone can read listings" ON public.listings FOR SELECT USING (true);

-- Allow admin dashboard (anon client) to update realtor status and listing flags.
-- App-side gating: only the /admin page (password-protected) calls these mutations.
DROP POLICY IF EXISTS "Anyone can update realtors" ON public.realtors;
CREATE POLICY "Anyone can update realtors" ON public.realtors FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Realtors update own listings" ON public.listings;
CREATE POLICY "Anyone can update listings" ON public.listings FOR UPDATE USING (true) WITH CHECK (true);

GRANT SELECT, UPDATE ON public.realtors TO anon;
GRANT SELECT, UPDATE ON public.listings TO anon;

-- Seed realtor + 8 listings (idempotent)
INSERT INTO public.realtors (id, user_id, full_name, phone, agency_name, package_tier, status)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'abaad Seed', '923001234567', 'abaad Marketplace', 'Platinum', 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.listings (realtor_id, title, area, price_text, price_num, intent, category, beds, baths, size_sqyd, tier, verified, whatsapp_number, image_url, is_active)
SELECT '00000000-0000-0000-0000-000000000001', t.title, t.area, t.price_text, t.price_num, t.intent, t.category, t.beds, t.baths, t.size_sqyd, t.tier, t.verified, t.whatsapp, t.image_url, true
FROM (VALUES
  ('Modern 3-Bed Apartment with Sea View','Clifton Block 4','PKR 3.2 Cr',32000000::bigint,'buy','flat',3,2,200,'Platinum',true,'923001234567','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop'),
  ('Luxury 4-Bed Villa in DHA','DHA Phase 6','PKR 8.5 Cr',85000000::bigint,'buy','house',4,4,500,'Platinum',true,'923001234567','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'),
  ('2-Bed Flat for Rent — Ready to Move','Gulistan-e-Johar Block 7','PKR 55,000/mo',55000::bigint,'rent','flat',2,2,120,'Silver',false,'923007654321','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop'),
  ('Studio Apartment Near University Road','University Road','PKR 28,000/mo',28000::bigint,'rent','flat',1,1,60,'Silver',false,'923007654321','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop'),
  ('Brand New 3-Bed in Emaar Crescent Bay','DHA Phase 8','PKR 4.5 Cr',45000000::bigint,'buy','flat',3,3,175,'Gold',true,'923331234567','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop'),
  ('Commercial Shop — Prime Location Tariq Road','Tariq Road','PKR 1.2 Lac/mo',120000::bigint,'rent','commercial',0,1,80,'Gold',false,'923331234567','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop'),
  ('240 Sq Yd Residential Plot — Bahria Town','Bahria Town Karachi','PKR 1.8 Cr',18000000::bigint,'buy','plot',0,0,240,'Silver',false,'923451234567','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop'),
  ('Spacious 5-Bed House — North Nazimabad','North Nazimabad Block F','PKR 3.8 Cr',38000000::bigint,'buy','house',5,4,400,'Gold',false,'923331234567','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop')
) AS t(title,area,price_text,price_num,intent,category,beds,baths,size_sqyd,tier,verified,whatsapp,image_url)
WHERE NOT EXISTS (SELECT 1 FROM public.listings WHERE realtor_id = '00000000-0000-0000-0000-000000000001');
