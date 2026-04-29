"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Lang } from "./i18n";

type LanguageCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageCtx>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
    try {
      localStorage.setItem("lang", next);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      initialLang === "ar" ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", initialLang);
  }, [initialLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageCtx {
  return useContext(LanguageContext);
}
