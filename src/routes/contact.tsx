import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { z } from "zod";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact abaad.com — Karachi real estate enquiries" },
      { name: "description", content: "Reach the abaad.com team in Karachi for realtor partnerships, listing support, or buyer enquiries. Email, phone, WhatsApp, and contact form — one business day response." },
      { property: "og:title", content: "Contact abaad.com" },
      { property: "og:description", content: "Get in touch with the abaad.com team in Karachi." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "abaad.com",
          areaServed: "Karachi, Pakistan",
          email: "hello@abaad.com",
          telephone: "+92-21-1234-5678",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Plot 12, Block 5, Clifton",
            addressLocality: "Karachi",
            postalCode: "75600",
            addressCountry: "PK",
          },
          openingHours: "Mo-Sa 10:00-19:00",
        }),
      },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  message: z.string().trim().min(5, "Message is too short").max(2000, "Message too long"),
});

function Contact() {
  const [sending, setSending] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    // Bot trap — silently accept and reset.
    if (honeypot.trim() !== "") {
      toast.success("Message sent", { description: "We'll be in touch within one business day." });
      form.reset();
      setHoneypot("");
      return;
    }
    const fd = new FormData(form);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setSending(true);
    const { sanitizeInput } = await import("@/lib/utils");
    const payload = {
      name: sanitizeInput(parsed.data.name),
      email: parsed.data.email.toLowerCase(),
      message: sanitizeInput(parsed.data.message),
    };
    const { error } = await supabase.from("contact_messages").insert(payload);
    setSending(false);
    if (error) {
      toast.error("Could not send message", { description: error.message });
      return;
    }
    toast.success("Message sent", { description: "We'll be in touch within one business day." });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-navy text-navy-foreground">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-wider text-green">Contact</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl">
              Let's talk <span className="italic text-green">property.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/75 sm:text-base">
              Realtor onboarding, listing support, or a buyer enquiry — we read every message
              and reply within one business day.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Info */}
            <div>
              <h2 className="font-display text-xl font-medium">Reach us directly</h2>
              <div className="mt-6 space-y-5 text-sm">
                <InfoRow Icon={Mail} title="hello@abaad.com" subtitle="General enquiries & partnerships" />
                <InfoRow Icon={Phone} title="+92 21 1234 5678" subtitle="Landline · Mon–Sat" />
                <InfoRow Icon={MessageCircle} title="+92 333 1234567" subtitle="WhatsApp · fastest response" />
                <InfoRow Icon={MapPin} title="Plot 12, Block 5, Clifton" subtitle="Karachi 75600, Pakistan" />
                <InfoRow Icon={Clock} title="Mon–Sat · 10am–7pm PKT" subtitle="Closed Sundays & public holidays" />
              </div>

              <div className="mt-8 overflow-hidden rounded-xl border border-border">
                <iframe
                  title="abaad.com office — Clifton, Karachi"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=67.020%2C24.800%2C67.040%2C24.820&layer=mapnik&marker=24.810%2C67.030"
                  className="h-56 w-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <h2 className="font-display text-xl font-medium">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll reply to the email you provide.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Name</Label>
                  <Input id="name" name="name" maxLength={100} required className="h-11" />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                  <Input id="email" name="email" type="email" maxLength={255} required className="h-11" />
                </div>
                <div>
                  <Label htmlFor="message" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Message</Label>
                  <Textarea id="message" name="message" rows={5} maxLength={2000} required />
                </div>
                <input
                  type="text"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                </div>
                <Button disabled={sending} className="h-11 w-full bg-navy text-navy-foreground hover:bg-navy/90">
                  {sending ? "Sending…" : "Send message"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ Icon, title, subtitle }: { Icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-navy">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
