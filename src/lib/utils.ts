import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape HTML-special characters and trim. Use on any user-supplied text
 * before persisting to the database or rendering into non-React sinks.
 */
export function sanitizeInput(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/** Coerce arbitrary input to a non-negative number. */
export function sanitizeNumber(val: string | number): number {
  if (typeof val === "number") return Math.abs(Number.isFinite(val) ? val : 0);
  const n = parseFloat(String(val ?? "").replace(/[^0-9.]/g, ""));
  return Math.abs(Number.isFinite(n) ? n : 0);
}
