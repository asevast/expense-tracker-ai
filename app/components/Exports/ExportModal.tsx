"use client";

import { useState, useMemo, useEffect } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { CATEGORIES, Expense } from "@/app/types";
import { cn, formatCurrency } from "@/app/lib/utils";
import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "csv" | "json" | "pdf";

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { expenses } = useExpenses();

  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filename, setFilename] = useState(`expenses-export-${new Date().toISOString().split("T")[0]}`);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategories(CATEGORIES.map((cat) => cat.value));
      setFilename(`expenses-export-${new Date().toISOString().split("T")[0]}`);
      setStartDate("");
      setEndDate("");
      setFormat("csv");
    }
  }, [isOpen]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (startDate && expense.date < startDate) return false;
      if (endDate && expense.date > endDate) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(expense.category)) {
        return false;
      }
      return true;
    });
  }, [expenses, startDate, endDate, selectedCategories]);

  const previewData = filteredExpenses.slice(0, 20);
  const totalCount = filteredExpenses.length;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORIES.map((cat) => cat.value));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const exportToCSV = (data: Expense[]) => {
    const headers = ["Date", "Type", "Category", "Currency", "Amount", "Description"];
    const rows = data.map((expense) => [
      expense.date,
      expense.type,
      expense.category,
      expense.currency,
      expense.amount.toFixed(2),
      `"${expense.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: Expense[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async (data: Expense[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Expense Report", 14, 22);

    const totalAmount = data.reduce((sum, exp) => sum + exp.amount, 0);
    doc.setFontSize(10);
    doc.text(`Total Records: ${data.length}`, 14, 30);
    doc.text(`Total Amount: ${formatCurrency(totalAmount, "USD")}`, 14, 36);

    const tableData = data.map((expense) => [
      expense.date,
      expense.type,
      expense.category,
      expense.currency,
      expense.amount.toFixed(2),
      expense.description.substring(0, 30) + (expense.description.length > 30 ? "..." : ""),
    ]);

    (doc as any).autoTable({
      head: [["Date", "Type", "Category", "Currency", "Amount", "Description"]],
      body: tableData,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [41, 55, 85] },
    });

    doc.save(`${filename}.pdf`);
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses match the selected criteria");
      return;
    }

    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (format === "csv") {
        exportToCSV(filteredExpenses);
      } else if (format === "json") {
        exportToJSON(filteredExpenses);
      } else if (format === "pdf") {
        await exportToPDF(filteredExpenses);
      }
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case "csv":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "json":
        return <FileJson className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="lg">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-primary-700">Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {(["csv", "json", "pdf"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border-2 p-4 text-sm font-medium transition-colors",
                  format === f
                    ? "border-primary-600 bg-primary-50 text-primary-900"
                    : "border-primary-200 bg-white text-primary-700 hover:bg-primary-50"
                )}
              >
                {f === "csv" && <FileSpreadsheet className="h-5 w-5" />}
                {f === "json" && <FileJson className="h-5 w-5" />}
                {f === "pdf" && <FileText className="h-5 w-5" />}
                <span>{f.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-primary-700">Start Date (optional)</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-primary-700">End Date (optional)</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-primary-700">Categories</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllCategories}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-primary-200 p-3 sm:grid-cols-3">
            {CATEGORIES.map((category) => (
              <label
                key={category.value}
                className="flex items-center gap-2 text-sm text-primary-700 hover:bg-primary-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary-700">Filename (without extension)</label>
          <Input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value.replace(/[^a-z0-9_-]/gi, ""))}
            placeholder="Enter filename"
          />
        </div>

        <Card padding="md" className="bg-primary-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">Records to export</p>
              <p className="text-2xl font-bold text-primary-900">{totalCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-600">Format</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-primary-900">
                {getFormatIcon()}
                <span>{format.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </Card>

        {previewData.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-primary-700">
              Preview (first {previewData.length} of {totalCount} records)
            </label>
            <div className="overflow-x-auto rounded-md border border-primary-200">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 bg-white">
                  {previewData.map((expense, idx) => (
                    <tr key={expense.id || idx}>
                      <td className="px-4 py-2 text-sm text-primary-900">{expense.date}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            expense.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-primary-900">{expense.category}</td>
                      <td className="px-4 py-2 text-sm font-medium text-primary-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="px-4 py-2 text-sm text-primary-600 truncate max-w-xs">
                        {expense.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-primary-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || totalCount === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {totalCount} records
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}