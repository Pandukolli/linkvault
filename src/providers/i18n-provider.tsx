"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { usePreferences } from "@/hooks/use-preferences";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { preferences, isLoading } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && preferences?.language && mounted) {
      if (i18n.language !== preferences.language) {
        i18n.changeLanguage(preferences.language);
      }
    }
  }, [preferences?.language, isLoading, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
