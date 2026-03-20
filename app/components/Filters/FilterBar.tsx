"use client";

import { useExpenses } from "@/app/context/ExpenseContext";
import { CATEGORIES, TRANSACTION_TYPES, CURRENCIES } from "@/app/types";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { Search, X, Download } from "lucide-react";
import { downloadCSV } from "@/app/lib/csv";

export function FilterBar() {
  const { filters, setFilters, resetFilters, getFilteredExpenses } = useExpenses();
  const hasActiveFilters =
    filters.searchQuery ||
    filters.typeFilter !== "all" ||
    filters.categoryFilter !== "all" ||
    filters.currencyFilter !== "all" ||
    filters.startDate ||
    filters.endDate;

  const handleExportCSV = () => {
    const expenses = getFilteredExpenses();
    if (expenses.length === 0) {
      alert("No expenses to export");
      return;
    }
    downloadCSV(expenses);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-primary-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <Select
              value={filters.typeFilter}
              onChange={(e) => setFilters({ typeFilter: e.target.value as typeof filters.typeFilter })}
              options={[
                { value: "all", label: "All Types" },
                ...TRANSACTION_TYPES.map((type) => ({ value: type.value, label: type.label })),
              ]}
            />
          </div>

          <div className="lg:col-span-1">
            <Select
              value={filters.currencyFilter}
              onChange={(e) => setFilters({ currencyFilter: e.target.value as typeof filters.currencyFilter })}
              options={[
                { value: "all", label: "All Currencies" },
                ...CURRENCIES.map((curr) => ({ value: curr.value, label: curr.label })),
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                className="w-full rounded-md border border-primary-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Select
              value={filters.categoryFilter}
              onChange={(e) => setFilters({ categoryFilter: e.target.value as typeof filters.categoryFilter })}
              options={[
                { value: "all", label: "All Categories" },
                ...CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label })),
              ]}
            />
          </div>

          <div className="lg:col-span-1">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ startDate: e.target.value })}
              placeholder="Start date"
            />
          </div>

          <div className="lg:col-span-1">
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ endDate: e.target.value })}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-primary-600 flex-wrap">
          <span className="font-medium">Active filters:</span>
          {filters.typeFilter !== "all" && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              Type: {filters.typeFilter}
            </span>
          )}
          {filters.currencyFilter !== "all" && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              Currency: {filters.currencyFilter}
            </span>
          )}
          {filters.searchQuery && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              Search: {filters.searchQuery}
            </span>
          )}
          {filters.categoryFilter !== "all" && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              Category: {filters.categoryFilter}
            </span>
          )}
          {filters.startDate && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              From: {filters.startDate}
            </span>
          )}
          {filters.endDate && (
            <span className="rounded-full bg-primary-100 px-3 py-1">
              To: {filters.endDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
