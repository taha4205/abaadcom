DROP POLICY IF EXISTS "Users create own realtor profile" ON public.realtors;
DROP POLICY IF EXISTS "Users can insert own realtor profile" ON public.realtors;

CREATE POLICY "Users can insert own realtor profile"
ON public.realtors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);