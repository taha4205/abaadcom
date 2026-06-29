import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Home Loan Calculator — Karachi mortgages | abaad.com" },
      { name: "description", content: "Estimate your monthly mortgage payment in Pakistan. Enter property price, down payment, tenure and interest rate to see your installment and total interest." },
      { property: "og:title", content: "Home Loan Calculator — abaad.com" },
      { property: "og:description", content: "Calculate your Karachi home loan installment in seconds." },
    ],
    links: [{ rel: "canonical", href: "/calculator" }],
  }),
  component: CalculatorPage,
});

function fmt(n: number) {
  if (!isFinite(n) || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-PK");
}

function CalculatorPage() {
  const [price, setPrice] = useState(10000000);
  const [down, setDown] = useState(2500000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(18);

  const { loan, monthly, totalPaid, totalInterest } = useMemo(() => {
    const loan = Math.max(0, price - down);
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    return { loan, monthly, totalPaid, totalInterest: totalPaid - loan };
  }, [price, down, years, rate]);

  const principalPct = totalPaid > 0 ? (loan / totalPaid) * 100 : 0;
  const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-navy" />
          <h1 className="font-display text-3xl font-medium tracking-tight">Home Loan Calculator</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Estimate your monthly mortgage installment based on Karachi bank rates. All values in PKR.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-medium text-navy">Loan details</h2>
            <div className="mt-6 space-y-5">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Property price (PKR)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className="h-11" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Down payment (PKR)</Label>
                <Input type="number" value={down} onChange={(e) => setDown(Number(e.target.value) || 0)} className="h-11" />
                <p className="mt-1 text-xs text-muted-foreground">Loan amount: PKR {fmt(loan)}</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Loan tenure (years)</Label>
                <Select value={String(years)} onValueChange={(v) => setYears(Number(v))}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25].map((y) => <SelectItem key={y} value={String(y)}>{y} years</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Annual interest rate (%)</Label>
                <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} className="h-11" />
                <p className="mt-1 text-xs text-muted-foreground">Default 18% (current Pakistan bank rate)</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-medium text-navy">Your estimate</h2>
            <div className="mt-6 space-y-5">
              <Stat label="Monthly installment" value={`PKR ${fmt(monthly)}`} big />
              <Stat label="Total payment over tenure" value={`PKR ${fmt(totalPaid)}`} />
              <Stat label="Total interest paid" value={`PKR ${fmt(totalInterest)}`} />
            </div>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Principal vs Interest</p>
              <div className="mt-3 flex h-6 w-full overflow-hidden rounded-md border border-border">
                <div className="bg-navy" style={{ width: `${principalPct}%` }} />
                <div className="bg-green" style={{ width: `${interestPct}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-navy" /> Principal {principalPct.toFixed(0)}%</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-green" /> Interest {interestPct.toFixed(0)}%</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              This is an indicative calculation. Actual rates and approval depend on your bank and credit profile.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display font-medium text-green ${big ? "text-3xl" : "text-xl"}`}>{value}</p>
    </div>
  );
}
