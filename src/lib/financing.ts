/** Indicative Karachi home-financing options. Informational only — no bank APIs. */
export type FinanceOption = {
  id: string;
  name: string;
  kind: "islamic" | "conventional" | "government";
  markupPct: number;
  maxTenureYears: number;
  maxAmount: number | null;
  maxDsrPct: number; // share of monthly income allowed as installment
  note: string;
};

export const FINANCE_OPTIONS: FinanceOption[] = [
  {
    id: "apna-ghar",
    name: "PM Apna Ghar Program",
    kind: "government",
    markupPct: 5,
    maxTenureYears: 20,
    maxAmount: 10_000_000,
    maxDsrPct: 40,
    note: "Subsidised government scheme: 5% markup, financing up to Rs. 10M, tenure up to 20 years. Eligibility conditions apply (first home, income bands).",
  },
  {
    id: "meezan",
    name: "Meezan Bank — Easy Home",
    kind: "islamic",
    markupPct: 21,
    maxTenureYears: 20,
    maxAmount: 100_000_000,
    maxDsrPct: 45,
    note: "Shariah-compliant diminishing musharakah. Rate varies with KIBOR; figures shown are indicative.",
  },
  {
    id: "hbl",
    name: "HBL HomeLoan",
    kind: "conventional",
    markupPct: 22,
    maxTenureYears: 20,
    maxAmount: 100_000_000,
    maxDsrPct: 45,
    note: "Conventional mortgage priced off 1-year KIBOR plus bank spread.",
  },
];

export function monthlyInstalment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export type PrequalResult = {
  option: FinanceOption;
  maxAffordableLoan: number;
  requestedLoan: number;
  requestedInstalment: number;
  eligible: boolean;
  tenureYears: number;
};

/** Rough pre-qualification: cap by DSR against income and by product limits. */
export function prequalify(params: {
  monthlyIncome: number;
  monthlyObligations: number;
  loanAmount: number;
  tenureYears: number;
}): PrequalResult[] {
  const { monthlyIncome, monthlyObligations, loanAmount } = params;
  return FINANCE_OPTIONS.map((option) => {
    const tenureYears = Math.min(params.tenureYears, option.maxTenureYears);
    const capacity = Math.max(0, monthlyIncome * (option.maxDsrPct / 100) - monthlyObligations);
    const perMillion = monthlyInstalment(1_000_000, option.markupPct, tenureYears);
    const byIncome = perMillion > 0 ? (capacity / perMillion) * 1_000_000 : 0;
    const maxAffordableLoan = Math.max(0, Math.min(byIncome, option.maxAmount ?? Infinity));
    const requestedLoan = Math.min(loanAmount, option.maxAmount ?? Infinity);
    const requestedInstalment = monthlyInstalment(requestedLoan, option.markupPct, tenureYears);
    return {
      option,
      maxAffordableLoan,
      requestedLoan,
      requestedInstalment,
      eligible: loanAmount > 0 && requestedLoan >= loanAmount && requestedInstalment <= capacity,
      tenureYears,
    };
  });
}
