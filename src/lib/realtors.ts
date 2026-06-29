export type ResponseTime = "under_1h" | "same_day" | "within_24h";

export function responseTimeLabel(rt?: string | null): { label: string; dot: string } {
  switch (rt) {
    case "under_1h":
      return { label: "Replies in under 1 hour", dot: "bg-green" };
    case "same_day":
      return { label: "Replies same day", dot: "bg-amber-500" };
    case "within_24h":
    default:
      return { label: "Replies within 24 hours", dot: "bg-navy" };
  }
}
