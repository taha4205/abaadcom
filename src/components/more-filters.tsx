import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type ExtraFilters = {
  beds: string; // "any" | "1" | ... | "5+"
  minPrice: string;
  maxPrice: string;
  minMarla: string;
};

export const DEFAULT_EXTRA: ExtraFilters = {
  beds: "any",
  minPrice: "",
  maxPrice: "",
  minMarla: "",
};

export function hasExtraFilters(f: ExtraFilters) {
  return f.beds !== "any" || !!f.minPrice || !!f.maxPrice || !!f.minMarla;
}

export function MoreFilters({
  value, onChange, showBeds = true,
}: { value: ExtraFilters; onChange: (v: ExtraFilters) => void; showBeds?: boolean }) {
  const [open, setOpen] = useState(false);
  const active = hasExtraFilters(value);
  const upd = <K extends keyof ExtraFilters>(k: K, v: string) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="md:col-span-12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70"
      >
        <SlidersHorizontal className="h-4 w-4" />
        More filters
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        {active && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green ring-2 ring-card" />
        )}
      </button>

      {open && (
        <div className="mt-4 grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {showBeds && (
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Beds</Label>
              <Select value={value.beds} onValueChange={(v) => upd("beds", v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5+">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-2">
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Price range (PKR)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={value.minPrice}
                onChange={(e) => upd("minPrice", e.target.value)}
                className="h-10"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={value.maxPrice}
                onChange={(e) => upd("maxPrice", e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Min size (Marla)</Label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={value.minMarla}
              onChange={(e) => upd("minMarla", e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 1 marla = 25 sqyd
export function applyExtraFilters<T extends { beds: number; priceNum: number; size: number; category: string }>(
  list: T[], f: ExtraFilters,
): T[] {
  return list.filter((p) => {
    if (f.beds !== "any") {
      const want = f.beds === "5+" ? 5 : parseInt(f.beds, 10);
      if (f.beds === "5+" ? p.beds < 5 : p.beds !== want) return false;
    }
    if (f.minPrice && p.priceNum < Number(f.minPrice)) return false;
    if (f.maxPrice && p.priceNum > Number(f.maxPrice)) return false;
    if (f.minMarla) {
      const minSqyd = Number(f.minMarla) * 25;
      if (p.size < minSqyd) return false;
    }
    return true;
  });
}
