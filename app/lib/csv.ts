import { Expense } from "@/app/types";
import { formatDate } from "./utils";

export function generateCSV(expenses: Expense[]): string {
  const headers = ["Date", "Type", "Category", "Currency", "Amount", "Description"];

  const rows = expenses.map((expense) => [
    expense.date,
    expense.type,
    expense.category,
    expense.currency,
    expense.amount.toFixed(2),
    `"${expense.description.replace(/"/g, '""')}"`,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadCSV(expenses: Expense[], filename: string = "expenses.csv"): void {
  const csv = generateCSV(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
