import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact abaad.com — Karachi real estate enquiries" },
      { name: "description", content: "Reach abaad.com for realtor partnerships, listing support, or buyer enquiries in Karachi. We respond within one business day." },
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
          address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
        }),
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-green">Contact</p>
            <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Let's talk.</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Realtor onboarding, listing support, or a buyer enquiry — we read every message and
              reply within one business day.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-navy" />
                <div><p className="font-medium">hello@abaad.com</p><p className="text-muted-foreground">General enquiries</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-navy" />
                <div><p className="font-medium">+92 21 1234 5678</p><p className="text-muted-foreground">Mon–Sat, 10am–7pm PKT</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-navy" />
                <div><p className="font-medium">Clifton, Karachi</p><p className="text-muted-foreground">Pakistan</p></div>
              </div>
            </div>
          </div>

          <form
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => { setSending(false); toast.success("Message sent. We'll be in touch."); (e.target as HTMLFormElement).reset(); }, 600);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Name</Label>
                <Input id="name" required />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                <Input id="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="msg" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Message</Label>
                <Textarea id="msg" rows={5} required />
              </div>
              <Button disabled={sending} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
                {sending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
