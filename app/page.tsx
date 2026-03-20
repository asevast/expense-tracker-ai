"use client";

import { useExpenses } from "@/app/context/ExpenseContext";
import { StatsCard } from "@/app/components/Dashboard/StatsCard";
import { SpendingChart } from "@/app/components/Dashboard/SpendingChart";
import { CategoryBreakdown } from "@/app/components/Dashboard/CategoryBreakdown";
import { FilterBar } from "@/app/components/Filters/FilterBar";
import { ExpenseTable } from "@/app/components/ExpenseList/ExpenseTable";
import { Card } from "@/app/components/ui/Card";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency, formatSignedCurrency } from "@/app/lib/utils";

export default function HomePage() {
  const { getDashboardStats, getFilteredExpenses } = useExpenses();
  const stats = getDashboardStats();
  const filteredExpenses = getFilteredExpenses();

  const transactionCount = filteredExpenses.length;
  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpenses;
  const netBalance = stats.netBalance;
  const averageIncome = stats.averageIncome;
  const averageExpense = stats.averageExpense;

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="border-b border-primary-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary-900">Expense Tracker</h1>
          <p className="mt-2 text-primary-600">
            Track, categorize, and analyze your expenses and income
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Net Balance"
              value={formatSignedCurrency(Math.abs(netBalance), netBalance >= 0 ? "income" : "expense", "USD")}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatsCard
              title="Total Income"
              value={formatCurrency(totalIncome)}
              icon={<ArrowUp className="h-6 w-6 text-green-600" />}
            />
            <StatsCard
              title="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<ArrowDown className="h-6 w-6 text-red-600" />}
            />
            <StatsCard
              title="Transactions"
              value={transactionCount.toString()}
              icon={<Receipt className="h-6 w-6" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SpendingChart />
            </div>
            <div className="lg:col-span-1">
              <CategoryBreakdown />
            </div>
          </div>

          <div>
            <FilterBar />
            <div className="mt-6">
              <ExpenseTable />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-primary-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-primary-600">
            © {new Date().getFullYear()} Expense Tracker AI. Built with Next.js 14 & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
