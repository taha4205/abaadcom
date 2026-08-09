import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AGENCY_LISTING_CAP, FREE_SLOTS } from "@/lib/packages";

type PackageTier = "Starter" | "Growth" | "Pro" | "Silver" | "Gold" | "Platinum";
type AccountType = "realtor" | "agency";
export type SignUpRole = "buyer" | "realtor";

const REALTOR_TIERS: { value: PackageTier; label: string }[] = [
  { value: "Starter", label: `Starter — PKR 10,000 (3 listings + ${FREE_SLOTS} free)` },
  { value: "Growth", label: `Growth — PKR 25,000 (5 listings + ${FREE_SLOTS} free)` },
  { value: "Pro", label: `Pro — PKR 50,000 (7 listings + ${FREE_SLOTS} free)` },
];
const AGENCY_TIERS: { value: PackageTier; label: string }[] = [
  { value: "Silver", label: `Silver — PKR 200,000 (${AGENCY_LISTING_CAP} listings)` },
  { value: "Gold", label: `Gold — PKR 500,000 (${AGENCY_LISTING_CAP} listings)` },
  { value: "Platinum", label: `Platinum — PKR 1,000,000 (${AGENCY_LISTING_CAP} listings)` },
];

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "signin",
  defaultRole = "buyer",
  title = "Welcome to abaad.com",
  description,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: "signin" | "signup";
  defaultRole?: SignUpRole;
  title?: string;
  description?: string;
}) {
  const [tab, setTab] = useState(defaultTab);
  useEffect(() => { if (open) setTab(defaultTab); }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin"><SignIn onDone={() => onOpenChange(false)} /></TabsContent>
          <TabsContent value="signup"><SignUp defaultRole={defaultRole} onDone={() => onOpenChange(false)} /></TabsContent>
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

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-4 py-2 text-sm font-medium transition " +
        (active ? "bg-navy text-navy-foreground border-navy" : "border-navy text-navy hover:bg-navy/5")
      }
    >
      {children}
    </button>
  );
}

function SignUp({ defaultRole, onDone }: { defaultRole: SignUpRole; onDone: () => void }) {
  const [role, setRole] = useState<SignUpRole>(defaultRole);
  useEffect(() => { setRole(defaultRole); }, [defaultRole]);

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
          phone: form.phone,
          agency_name: role === "realtor" ? form.agency_name : null,
          role,
        },
      },
    });

    if (error || !data.user) {
      setBusy(false);
      return toast.error(error?.message ?? "Sign up failed");
    }

    if (role === "buyer") {
      const { error: bErr } = await supabase.from("buyer_profiles").insert({
        user_id: data.user.id,
        full_name: form.full_name,
        phone: form.phone || null,
      } as never);
      setBusy(false);
      if (bErr && !data.session) {
        toast.success("Account created!", { description: "Check your email to confirm, then sign in to save listings.", duration: 9000 });
      } else if (bErr) {
        toast.warning("Account created, but we couldn't save your profile details. You can still browse and save listings.");
      } else {
        toast.success("Welcome to abaad!", { description: "You can now save listings to your wishlist." });
      }
      onDone();
      return;
    }

    // Realtor / agency: insert realtor row immediately using the user id.
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

    if (rErr || !data.session) {
      toast.success("Account created!", {
        description: "Please check your email to confirm your account. Once confirmed and approved, you can start listing.",
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
      <div>
        <Label>I'm signing up as</Label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Pill active={role === "buyer"} onClick={() => setRole("buyer")}>Buyer / Tenant</Pill>
          <Pill active={role === "realtor"} onClick={() => setRole("realtor")}>Realtor / Agency</Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Full name</Label><Input required value={form.full_name} onChange={(e) => up("full_name", e.target.value)} /></div>
        <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="03001234567" /></div>
      </div>

      {role === "realtor" && (
        <>
          <div><Label>Agency name</Label><Input required value={form.agency_name} onChange={(e) => up("agency_name", e.target.value)} /></div>
          <div>
            <Label>Account type</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Pill active={form.account_type === "realtor"} onClick={() => setAccountType("realtor")}>Individual Realtor</Pill>
              <Pill active={form.account_type === "agency"} onClick={() => setAccountType("agency")}>Agency</Pill>
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
            <p className="mt-1 text-xs text-muted-foreground">Every account also gets {FREE_SLOTS} free listing slots.</p>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => up("email", e.target.value)} /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => up("password", e.target.value)} /></div>
      </div>
      <Button disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
      </Button>
      <p className="text-xs text-muted-foreground">
        {role === "buyer"
          ? "Buyer accounts are free — save listings and keep track of realtors you've contacted."
          : "Realtor accounts require admin approval before you can list properties."}
      </p>
    </form>
  );
}
