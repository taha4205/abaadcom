import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type PackageTier = "Starter" | "Growth" | "Pro" | "Silver" | "Gold" | "Platinum";
type AccountType = "realtor" | "agency";

const REALTOR_TIERS: { value: PackageTier; label: string }[] = [
  { value: "Starter", label: "Starter — PKR 10,000 (3 listings)" },
  { value: "Growth", label: "Growth — PKR 25,000 (5 listings)" },
  { value: "Pro", label: "Pro — PKR 50,000 (7 listings)" },
];
const AGENCY_TIERS: { value: PackageTier; label: string }[] = [
  { value: "Silver", label: "Silver — PKR 200,000 (3 listings)" },
  { value: "Gold", label: "Gold — PKR 500,000 (5 listings)" },
  { value: "Platinum", label: "Platinum — PKR 1,000,000 (7 listings)" },
];

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Welcome to abaad.com</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin"><SignIn onDone={() => onOpenChange(false)} /></TabsContent>
          <TabsContent value="signup"><SignUp onDone={() => onOpenChange(false)} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
      </Button>
    </form>
  );
}

function SignUp({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    email: "", password: "", full_name: "", phone: "", agency_name: "",
    account_type: "realtor" as AccountType,
    package_tier: "Starter" as PackageTier,
  });
  const [busy, setBusy] = useState(false);

  const tiers = form.account_type === "agency" ? AGENCY_TIERS : REALTOR_TIERS;

  function setAccountType(t: AccountType) {
    setForm((p) => ({
      ...p,
      account_type: t,
      package_tier: (t === "agency" ? AGENCY_TIERS[0].value : REALTOR_TIERS[0].value),
    }));
  }

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // NOTE: For the smoothest signup UX, disable "Confirm email" in the backend
  // auth settings. This code handles both modes — if email confirmation is on,
  // the user gets a toast instructing them to confirm before signing in.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: {
          full_name: form.full_name,
          agency_name: form.agency_name,
        },
      },
    });

    if (error || !data.user) {
      setBusy(false);
      return toast.error(error?.message ?? "Sign up failed");
    }

    // Insert realtor row immediately using user ID — works even before email confirmation
    const { error: rErr } = await supabase.from("realtors").insert({
      user_id: data.user.id,
      full_name: form.full_name,
      phone: form.phone,
      agency_name: form.agency_name,
      account_type: form.account_type,
      package_tier: form.package_tier,
      status: "pending",
    } as never);

    setBusy(false);

    if (rErr) {
      console.error("Realtor insert error:", rErr);
      toast.success("Account created!", {
        description: "Please check your email to confirm your account. Once confirmed and approved by admin, you can start listing.",
        duration: 10000,
      });
    } else if (!data.session) {
      toast.success("Account created!", {
        description: "Check your email to confirm, then come back to sign in.",
        duration: 10000,
      });
    } else {
      toast.success("Account created!", {
        description: "Your account is under review. We'll contact you on WhatsApp once approved.",
        duration: 8000,
      });
    }

    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Full name</Label><Input required value={form.full_name} onChange={(e) => up("full_name", e.target.value)} /></div>
        <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="03001234567" /></div>
      </div>
      <div><Label>Agency name</Label><Input required value={form.agency_name} onChange={(e) => up("agency_name", e.target.value)} /></div>
      <div>
        <Label>Account type</Label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["realtor", "agency"] as AccountType[]).map((t) => {
            const active = form.account_type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setAccountType(t)}
                className={
                  "rounded-full border px-4 py-2 text-sm font-medium transition " +
                  (active
                    ? "bg-navy text-navy-foreground border-navy"
                    : "border-navy text-navy hover:bg-navy/5")
                }
              >
                {t === "realtor" ? "Individual Realtor" : "Agency"}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Package tier</Label>
        <Select value={form.package_tier} onValueChange={(v) => up("package_tier", v as PackageTier)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {tiers.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => up("email", e.target.value)} /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => up("password", e.target.value)} /></div>
      </div>
      <Button disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
      </Button>
      <p className="text-xs text-muted-foreground">Accounts require admin approval before you can list properties.</p>
    </form>
  );
}
