"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { ui, formatRelativeTime } from "@/lib/i18n";

const CACHE_KEY = "insights_cache";
const TTL_MS = 24 * 60 * 60 * 1000;

const ANGLES = [
  "what is going well",
  "what to watch",
  "biggest opportunity",
  "biggest risk",
  "what changed vs. last period",
] as const;

type Angle = (typeof ANGLES)[number];

type CacheShape = {
  bullets: string[];
  angle: Angle;
  timestamp: number;
};

type Props = {
  metrics: unknown;
};

const isCacheShape = (v: unknown): v is CacheShape => {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    Array.isArray(c.bullets) &&
    c.bullets.every((b) => typeof b === "string") &&
    typeof c.angle === "string" &&
    typeof c.timestamp === "number"
  );
};

const pickAngle = (): Angle =>
  ANGLES[Math.floor(Math.random() * ANGLES.length)];

const parseBullets = (text: string): string[] => {
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    const obj = JSON.parse(cleaned);
    if (obj && Array.isArray(obj.bullets)) {
      return obj.bullets
        .map((b: unknown) => String(b).trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  } catch {
    // fall through to line-splitting fallback
  }

  return cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
};

const sparkleIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden
  >
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
  </svg>
);

const refreshIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden
  >
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export function AIInsightsCard({ metrics }: Props) {
  const { lang } = useLanguage();
  const T = ui[lang].insights;

  const [cache, setCache] = useState<CacheShape | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    const angle = pickAngle();
    const question = [
      `Focus the analysis on: ${angle}.`,
      "Return STRICT JSON only, no prose, no code fences, in this exact shape:",
      `{"bullets": ["...", "...", "..."]}`,
      "Provide exactly 3 bullets, each a single sentence (≤25 words), grounded in concrete numbers from the data. Use SAR for money.",
    ].join(" ");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, data: metrics, language: lang }),
      });
      const json = (await res.json()) as
        | { success: true; data: { answer: string } }
        | { success: false; error: string };
      if (!json.success) throw new Error(json.error);
      const bullets = parseBullets(json.data.answer);
      if (bullets.length === 0) throw new Error("No bullets returned");
      const next: CacheShape = { bullets, angle, timestamp: Date.now() };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / disabled storage
      }
      setCache(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [metrics, lang]);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(CACHE_KEY);
    } catch {
      raw = null;
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isCacheShape(parsed)) {
          setCache(parsed);
          if (Date.now() - parsed.timestamp > TTL_MS) {
            void refresh();
          }
          return;
        }
      } catch {
        // fall through to first-time fetch
      }
    }
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const showSkeleton = !cache && loading;
  const angleLabel = cache
    ? (T.angleLabels as Record<string, string>)[cache.angle] ?? cache.angle
    : null;

  return (
    <section className="rounded-md border border-rule bg-surface p-6 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <header className="mb-4 flex items-end justify-between gap-4 border-b border-rule pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-ink">{sparkleIcon}</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              {T.section}
            </p>
            <h3 className="mt-1 font-serif text-xl tracking-tight text-ink">
              {cache ? angleLabel : T.reading}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-xs text-muted">
            {cache
              ? formatRelativeTime(cache.timestamp, now, lang)
              : ""}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>{refreshIcon}</span>
            {loading ? T.thinking : T.refresh}
          </button>
        </div>
      </header>

      {showSkeleton ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-4 w-full animate-pulse rounded-sm bg-foreground/[0.06]"
              style={{ width: `${90 - i * 10}%` }}
            />
          ))}
        </ul>
      ) : cache ? (
        <ul className="space-y-3 text-sm leading-relaxed text-foreground">
          {cache.bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[7px] inline-block h-1.5 w-1.5 flex-none rounded-full bg-ink" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-muted">No insights yet.</p>
      )}

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </p>
      ) : null}
    </section>
  );
}
