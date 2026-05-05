"use client";

import { useTranslation } from "@/app/context/LanguageContext";
import { cn } from "@/app/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center p-1 bg-primary-100 rounded-lg">
      <button
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        aria-pressed={language === "en"}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          language === "en"
            ? "bg-white text-primary-900 shadow-sm"
            : "text-primary-600 hover:text-primary-800"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ru")}
        aria-label="Переключить на русский"
        aria-pressed={language === "ru"}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          language === "ru"
            ? "bg-white text-primary-900 shadow-sm"
            : "text-primary-600 hover:text-primary-800"
        )}
      >
        RU
      </button>
    </div>
  );
}
