const ABAAD_WA = (import.meta.env.VITE_ABAAD_WHATSAPP as string | undefined) || "923001234567";

export function waLink(phone: string, message: string): string {
  const clean = String(phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function abaadWaLink(message: string): string {
  return waLink(ABAAD_WA, message);
}
