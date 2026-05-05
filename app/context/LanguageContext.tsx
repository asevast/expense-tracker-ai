"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { Language } from '@/app/types';
import { translations, TranslationKey } from '@/app/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');

  const t = useCallback((key: TranslationKey) => {
    return translations[language][key] || translations['en'][key];
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
