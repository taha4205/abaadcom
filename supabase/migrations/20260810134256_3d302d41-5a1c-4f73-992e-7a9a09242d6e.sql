CREATE OR REPLACE FUNCTION public.area_trends()
RETURNS TABLE (
  area text,
  active_listings bigint,
  avg_price numeric,
  recent_avg_price numeric,
  older_avg_price numeric,
  recent_listings bigint,
  older_listings bigint,
  views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH l AS (
    SELECT id, area, price_num, created_at
    FROM public.listings
    WHERE is_active = true AND intent = 'buy' AND price_num > 0
  ),
  v AS (
    SELECT listing_id, count(*)::bigint AS c
    FROM public.listing_views
    GROUP BY listing_id
  )
  SELECT
    l.area,
    count(*)::bigint AS active_listings,
    round(avg(l.price_num))::numeric AS avg_price,
    round(avg(l.price_num) FILTER (WHERE l.created_at >= now() - interval '90 days'))::numeric AS recent_avg_price,
    round(avg(l.price_num) FILTER (WHERE l.created_at < now() - interval '90 days'))::numeric AS older_avg_price,
    count(*) FILTER (WHERE l.created_at >= now() - interval '90 days')::bigint AS recent_listings,
    count(*) FILTER (WHERE l.created_at < now() - interval '90 days')::bigint AS older_listings,
    coalesce(sum(v.c), 0)::bigint AS views
  FROM l
  LEFT JOIN v ON v.listing_id = l.id
  GROUP BY l.area
  ORDER BY count(*) DESC;
$$;

REVOKE ALL ON FUNCTION public.area_trends() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.area_trends() TO anon, authenticated, service_role;