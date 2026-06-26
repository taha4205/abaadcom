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
    package_tier: "Silver" as "Silver" | "Gold" | "Platinum",
  });
  const [busy, setBusy] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error || !data.user) {
      setBusy(false);
      return toast.error(error?.message ?? "Sign up failed");
    }
    const { error: rErr } = await supabase.from("realtors").insert({
      user_id: data.user.id,
      full_name: form.full_name,
      phone: form.phone,
      agency_name: form.agency_name,
      package_tier: form.package_tier,
    });
    setBusy(false);
    if (rErr) return toast.error(rErr.message);
    toast.success("Account created", {
      description: "Your account is under review. We'll contact you on WhatsApp once approved.",
      duration: 8000,
    });
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
        <Label>Package tier</Label>
        <Select value={form.package_tier} onValueChange={(v) => up("package_tier", v as typeof form.package_tier)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Silver">Silver — PKR 50,000</SelectItem>
            <SelectItem value="Gold">Gold — PKR 75,000</SelectItem>
            <SelectItem value="Platinum">Platinum — PKR 125,000</SelectItem>
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
