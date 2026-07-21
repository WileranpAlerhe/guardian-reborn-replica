import { useEffect, useRef, useState } from "react";

const PREFIX = "curupiro:countdown:";

function readEnd(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeEnd(key: string, end: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, String(end));
  } catch {
    /* ignore */
  }
}

/**
 * Countdown persistente em localStorage.
 * SSR e primeiro render do client retornam o mesmo valor determinístico
 * (`initialSeconds`) para evitar mismatch de hidratação. Depois do mount,
 * o hook lê/grava em localStorage e continua de onde parou.
 */
export function usePersistentCountdown(key: string, initialSeconds: number) {
  const endRef = useRef<number>(0);
  // Deterministic initial value on both server and first client render.
  const [t, setT] = useState<number>(initialSeconds);

  useEffect(() => {
    const now = Date.now();
    const stored = readEnd(key);
    if (stored && stored > now) {
      endRef.current = stored;
    } else {
      endRef.current = now + initialSeconds * 1000;
      writeEnd(key, endRef.current);
    }

    const tick = () => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      if (left <= 0) {
        endRef.current = Date.now() + initialSeconds * 1000;
        writeEnd(key, endRef.current);
        setT(initialSeconds);
      } else {
        setT(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);

    const onStorage = (e: StorageEvent) => {
      if (e.key === PREFIX + key && e.newValue) {
        const n = Number(e.newValue);
        if (Number.isFinite(n)) {
          endRef.current = n;
          tick();
        }
      }
    };
    window.addEventListener("storage", onStorage);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [key, initialSeconds]);

  const m = Math.floor(t / 60);
  const s = t % 60;
  const h = Math.floor(m / 60);
  return {
    total: t,
    h: String(h).padStart(2, "0"),
    m: String(m % 60).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    mm: String(m).padStart(2, "0"),
    formatted: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
  };
}
