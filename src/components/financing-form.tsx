import { useMemo, useState } from "react";
import { Landmark, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { prequalify } from "@/lib/financing";
import { fmtPKRShort } from "@/lib/units";
import { logLead } from "@/lib/leads";
import type { Property } from "@/lib/properties";

export function FinancingForm({ p }: { p: Property }) {
  const suggestedLoan = Math.round(p.intent === "buy" ? p.priceNum * 0.7 : 0);
  const [income, setIncome] = useState("250000");
  const [obligations, setObligations] = useState("0");
  const [loan, setLoan] = useState(String(suggestedLoan || 5000000));
  const [tenure, setTenure] = useState("20");
  const [shown, setShown] = useState(false);

  const results = useMemo(
    () =>
      prequalify({
        monthlyIncome: Number(income) || 0,
        monthlyObligations: Number(obligations) || 0,
        loanAmount: Number(loan) || 0,
        tenureYears: Math.min(25, Math.max(1, Number(tenure) || 20)),
      }),
    [income, obligations, loan, tenure],
  );

  function check() {
    if (!Number(income)) {
      toast.error("Enter your monthly income");
      return;
    }
    setShown(true);
    logLead({
      listingId: p.id,
      realtorId: p.realtorId,
      leadType: "financing",
      details: {
        monthly_income: Number(income),
        monthly_obligations: Number(obligations),
        loan_amount: Number(loan),
        tenure_years: Number(tenure),
      },
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-4 w-4 text-green" />
        <h2 className="font-display text-lg font-medium text-navy">Financing pre-qualification</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Indicative eligibility across Karachi-relevant options, including the government's PM Apna Ghar Program.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Monthly income (PKR)" value={income} onChange={setIncome} />
        <Field label="Existing instalments" value={obligations} onChange={setObligations} />
        <Field label="Loan needed (PKR)" value={loan} onChange={setLoan} />
        <Field label="Tenure (years)" value={tenure} onChange={setTenure} />
      </div>

      <Button onClick={check} className="mt-5 w-full bg-navy text-navy-foreground hover:bg-navy/90 sm:w-auto">
        Check my eligibility
      </Button>

      {shown && (
        <div className="mt-6 space-y-3">
          {results.map((r) => (
            <div key={r.option.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.option.name}</p>
                  {r.option.kind === "government" && (
                    <Badge className="border-0 bg-green text-green-foreground">Govt. scheme</Badge>
                  )}
                  {r.option.kind === "islamic" && <Badge variant="outline">Islamic</Badge>}
                </div>
                <Badge
                  variant="outline"
                  className={r.eligible ? "border-green/40 text-green" : "border-border text-muted-foreground"}
                >
                  {r.eligible ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  {r.eligible ? "Likely eligible" : "Below requirement"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Markup" value={`${r.option.markupPct}% p.a.`} />
                <Stat label="Tenure used" value={`${r.tenureYears} yrs`} />
                <Stat label="Est. instalment" value={`${fmtPKRShort(r.requestedInstalment)}/mo`} />
                <Stat label="Max you'd qualify for" value={fmtPKRShort(r.maxAffordableLoan)} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{r.option.note}</p>
            </div>
          ))}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Estimates only — final approval, markup and limits are set by the bank or scheme. Your interest has been
            shared with the listing realtor so they can help with paperwork.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} className="h-10" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}
