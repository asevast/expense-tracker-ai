import { Currency, Language } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatCurrency(
  amount: number,
  currency: Currency = "USD",
  language?: Language
): string {
  // If language is provided, it takes precedence. 
  // Otherwise, use currency-based defaults.
  const locale = language
    ? (language === "ru" ? "ru-RU" : "en-US")
    : (currency === "USD" ? "en-US" : "ru-RU");
    
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatSignedCurrency(
  amount: number,
  type: "income" | "expense",
  currency: Currency = "USD",
  language?: Language
): string {
  const formatted = formatCurrency(Math.abs(amount), currency, language);
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatted}`;
}

export function formatDate(dateString: string, language: Language = "en"): string {
  const locale = language === "ru" ? "ru-RU" : "en-US";
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(monthString: string, language: Language = "en"): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const locale = language === "ru" ? "ru-RU" : "en-US";
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
