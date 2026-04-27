import { Currency } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  const locale = currency === "USD" ? "en-US" : "ru-RU";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatSignedCurrency(amount: number, type: "income" | "expense", currency: Currency = "USD"): string {
  const formatted = formatCurrency(amount, currency);
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatted}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
