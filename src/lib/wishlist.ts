import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Wishlist is buyer-account bound: saved listings live in the database,
// so they follow the buyer across devices. Guests cannot save.

let ids: string[] = [];
let loaded = false;
let inflight: Promise<string[]> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export async function loadWishlist(): Promise<string[]> {
  if (inflight) return inflight;
  inflight = (async () => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) {
      ids = [];
    } else {
      const { data } = await supabase.from("wishlists").select("listing_id").eq("user_id", uid);
      ids = (data ?? []).map((r: { listing_id: string }) => r.listing_id);
    }
    loaded = true;
    emit();
    return ids;
  })().finally(() => { inflight = null; });
  return inflight;
}

export function getWishlist(): string[] {
  return ids;
}

export type ToggleResult = "unauthenticated" | "added" | "removed" | "error";

export function useWishlist() {
  const [list, setList] = useState<string[]>(ids);

  useEffect(() => {
    const l = () => setList([...ids]);
    listeners.add(l);
    if (!loaded) loadWishlist();
    else l();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") loadWishlist();
    });
    return () => {
      listeners.delete(l);
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggle = useCallback(async (id: string | number): Promise<ToggleResult> => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return "unauthenticated";
    const sid = String(id);
    if (ids.includes(sid)) {
      const { error } = await supabase.from("wishlists").delete().eq("user_id", uid).eq("listing_id", sid);
      if (error) return "error";
      ids = ids.filter((x) => x !== sid);
      emit();
      return "removed";
    }
    const { error } = await supabase.from("wishlists").insert({ user_id: uid, listing_id: sid } as never);
    if (error) return "error";
    ids = [...ids, sid];
    emit();
    return "added";
  }, []);

  const has = useCallback((id: string | number) => list.includes(String(id)), [list]);

  return { ids: list, has, toggle, count: list.length, reload: loadWishlist };
}
