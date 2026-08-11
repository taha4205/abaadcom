import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AREA_UNITS, convertArea, fmtNum, type AreaUnit } from "@/lib/units";

export const Route = createFileRoute("/converter")({
  head: () => ({
    meta: [
      { title: "Area Unit Converter — Marla, Kanal, Sq Yd | abaad.com" },
      { name: "description", content: "Convert Karachi property area units instantly: Marla, Kanal, Square Feet, Square Yards, Square Meters and Acres." },
      { property: "og:title", content: "Area Unit Converter — abaad.com" },
      { property: "og:description", content: "Marla, Kanal, Sq Ft, Sq Yd, Sq M and Acre conversions for Pakistani property." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConverterPage,
});

const UNITS = Object.keys(AREA_UNITS) as AreaUnit[];

function ConverterPage() {
  const [value, setValue] = useState("5");
  const [unit, setUnit] = useState<AreaUnit>("marla");
  const n = Number(value) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-green">Tools</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-navy sm:text-4xl">Area unit converter</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Pakistani property is quoted in Marla, Kanal and Gaz — sometimes all three in one listing. Convert once and
          compare properly.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Value</Label>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as AreaUnit)}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{AREA_UNITS[u].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {UNITS.filter((u) => u !== unit).map((u) => (
            <div key={u} className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{AREA_UNITS[u].label}</p>
              <p className="mt-1 text-xl font-medium tabular-nums text-navy">
                {fmtNum(convertArea(n, unit, u), u === "acre" ? 4 : 2)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{AREA_UNITS[u].short}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Quick reference</p>
          <ul className="mt-2 space-y-1">
            <li>1 Marla = 225 sq ft = 25 sq yd (Gaz)</li>
            <li>1 Kanal = 20 Marla = 4,500 sq ft = 500 sq yd</li>
            <li>1 Acre = 8 Kanal = 43,560 sq ft = 4,840 sq yd</li>
            <li>1 sq yd = 9 sq ft ≈ 0.836 sq m</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
