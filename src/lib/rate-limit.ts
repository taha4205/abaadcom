const RATE_LIMIT_KEY = "abaad_ai_calls";
const MAX_CALLS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

type Stored = { calls: number[]; window: number };

function read(): Stored {
  if (typeof window === "undefined") return { calls: [], window: Date.now() };
  try {
    return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{"calls":[],"window":0}');
  } catch {
    return { calls: [], window: Date.now() };
  }
}

export function checkRateLimit(): { allowed: boolean; remaining: number } {
  if (typeof window === "undefined") return { allowed: true, remaining: MAX_CALLS };
  const now = Date.now();
  const stored = read();
  if (now - stored.window > WINDOW_MS) {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ calls: [now], window: now }));
    return { allowed: true, remaining: MAX_CALLS - 1 };
  }
  const recent = stored.calls.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_CALLS) return { allowed: false, remaining: 0 };
  recent.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ calls: recent, window: stored.window || now }));
  return { allowed: true, remaining: MAX_CALLS - recent.length };
}

export const RATE_LIMIT_MAX = MAX_CALLS;
