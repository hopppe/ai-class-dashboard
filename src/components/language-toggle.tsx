"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  function select(next: "en" | "ar") {
    setLang(next);
    router.refresh();
  }

  return (
    <div
      className="flex items-center rounded-md border border-rule bg-background p-0.5"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => select("en")}
        className={[
          "rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
          lang === "en"
            ? "bg-ink text-surface"
            : "text-muted hover:text-ink",
        ].join(" ")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => select("ar")}
        className={[
          "rounded px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors",
          lang === "ar"
            ? "bg-ink text-surface"
            : "text-muted hover:text-ink",
        ].join(" ")}
        aria-pressed={lang === "ar"}
      >
        العربية
      </button>
    </div>
  );
}
