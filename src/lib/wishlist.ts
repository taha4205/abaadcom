import { useEffect, useState, useCallback } from "react";

const KEY = "abaad_wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("abaad-wishlist-change"));
}

export function getWishlist(): string[] {
  return read();
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const onChange = () => setIds(read());
    window.addEventListener("abaad-wishlist-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("abaad-wishlist-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string | number) => {
    const sid = String(id);
    const cur = read();
    const next = cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid];
    write(next);
  }, []);

  const has = useCallback((id: string | number) => ids.includes(String(id)), [ids]);

  return { ids, has, toggle, count: ids.length };
}
