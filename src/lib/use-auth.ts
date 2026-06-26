import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type RealtorProfile = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  agency_name: string;
  package_tier: "Silver" | "Gold" | "Platinum";
  status: "pending" | "approved" | "rejected";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [realtor, setRealtor] = useState<RealtorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setRealtor(null);
      return;
    }
    supabase
      .from("realtors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setRealtor((data as RealtorProfile | null) ?? null));
  }, [user]);

  return { user, realtor, loading, signOut: () => supabase.auth.signOut() };
}
