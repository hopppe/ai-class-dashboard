"use client";

import { LanguageProvider } from "@/lib/language-context";
import type { Lang } from "@/lib/i18n";

export function ClientProviders({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
  );
}
