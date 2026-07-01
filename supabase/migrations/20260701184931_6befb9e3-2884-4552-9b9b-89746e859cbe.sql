
-- LISTINGS
drop policy if exists "Anyone can read listings" on public.listings;
drop policy if exists "Anyone can update listings" on public.listings;
drop policy if exists "Approved realtors insert listings" on public.listings;
drop policy if exists "Public read active listings" on public.listings;
drop policy if exists "Realtors can update own listings" on public.listings;
drop policy if exists "Realtors can delete own listings" on public.listings;

create policy "Public read active listings" on public.listings
  for select using (is_active = true);

create policy "Approved realtors insert listings" on public.listings
  for insert to authenticated
  with check (
    exists (
      select 1 from public.realtors r
      where r.id = listings.realtor_id
        and r.user_id = auth.uid()
        and r.status = 'approved'
    )
  );

create policy "Realtors update own listings" on public.listings
  for update to authenticated
  using (
    realtor_id in (select id from public.realtors where user_id = auth.uid())
  )
  with check (
    realtor_id in (select id from public.realtors where user_id = auth.uid())
  );

create policy "Realtors delete own listings" on public.listings
  for delete to authenticated
  using (
    realtor_id in (select id from public.realtors where user_id = auth.uid())
  );

-- REALTORS
drop policy if exists "Anyone can read realtors" on public.realtors;
drop policy if exists "Anyone can update realtors" on public.realtors;
drop policy if exists "Users create their realtor profile" on public.realtors;
drop policy if exists "Public read approved realtors" on public.realtors;
drop policy if exists "Users read own realtor profile" on public.realtors;
drop policy if exists "Users update own realtor profile" on public.realtors;

create policy "Public read approved realtors" on public.realtors
  for select using (status = 'approved');

create policy "Users read own realtor profile" on public.realtors
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users create own realtor profile" on public.realtors
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own realtor profile" on public.realtors
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
