import { useState } from "react";
import { CalendarClock, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { logLead } from "@/lib/leads";
import { useAuth } from "@/lib/use-auth";
import type { Property } from "@/lib/properties";

const SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function SiteVisitForm({ p, waNumber }: { p: Property; waNumber: string }) {
  const { user } = useAuth();
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(SLOTS[0]);
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  function book() {
    if (!date) {
      toast.error("Pick a date for the visit");
      return;
    }
    const pretty = new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
    const who = name.trim().slice(0, 60);
    const msg =
      `Assalam o Alaikum, I'd like to book a site visit through abaad.com.\n\n` +
      `Property: ${p.title}\nArea: ${p.area}${p.subArea ? `, ${p.subArea}` : ""}\nPrice: ${p.price}\n` +
      `Preferred date: ${pretty}\nPreferred time: ${time}` +
      (who ? `\nName: ${who}` : "");

    logLead({
      listingId: p.id,
      realtorId: p.realtorId,
      leadType: "site_visit",
      details: { visit_date: date, visit_time: time, visitor_name: who || null },
    });

    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
    if (!user) toast.success("Opening WhatsApp — send the message to confirm your visit.");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-green" />
        <h2 className="font-display text-lg font-medium text-navy">Book a site visit</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pick a date and time — we'll open WhatsApp with the request pre-filled for the realtor.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
          <Input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className="h-10" />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Your name (optional)</Label>
          <Input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali" className="h-10" />
        </div>
      </div>

      <Button onClick={book} className="mt-5 w-full bg-green text-green-foreground hover:bg-green/90 sm:w-auto">
        <MessageCircle className="mr-2 h-4 w-4" /> Request visit on WhatsApp
      </Button>

      {sent && user && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-green/30 bg-green/5 p-3 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
          <span>
            Visit request logged for <strong>{new Date(`${date}T00:00:00`).toLocaleDateString("en-PK")}</strong> at{" "}
            <strong>{time}</strong>. The realtor will confirm on WhatsApp.
          </span>
        </div>
      )}
    </div>
  );
}
