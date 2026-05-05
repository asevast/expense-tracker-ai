"use client";

import { useState } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { StatsCard } from "@/app/components/Dashboard/StatsCard";
import { SpendingChart } from "@/app/components/Dashboard/SpendingChart";
import { CategoryBreakdown } from "@/app/components/Dashboard/CategoryBreakdown";
import { FilterBar } from "@/app/components/Filters/FilterBar";
import { ExpenseTable } from "@/app/components/ExpenseList/ExpenseTable";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Download,
  Settings,
} from "lucide-react";
import { formatCurrency, formatSignedCurrency } from "@/app/lib/utils";
import { ExportModal } from "@/app/components/Exports/ExportModal";
import { AISettingsModal } from "@/app/components/Settings/AISettingsModal";
import { AIInsights } from "@/app/components/Dashboard/AIInsights";
import { useTranslation } from "@/app/context/LanguageContext";
import { LanguageToggle } from "@/app/components/ui/LanguageToggle";

export default function HomePage() {
  const { getDashboardStats, getFilteredExpenses } = useExpenses();
  const { t, language } = useTranslation();
  const stats = getDashboardStats();
  const filteredExpenses = getFilteredExpenses();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const transactionCount = filteredExpenses.length;
  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpenses;
  const netBalance = stats.netBalance;

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="border-b border-primary-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">{t('appTitle')}</h1>
              <p className="mt-2 text-primary-600">
                {t('appSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="h-8 w-px bg-primary-200" />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsSettingsOpen(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </Button>
                <Button onClick={() => setIsExportOpen(true)} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('exportData')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t('netBalance')}
              value={formatSignedCurrency(Math.abs(netBalance), netBalance >= 0 ? "income" : "expense", "USD", language)}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatsCard
              title={t('totalIncome')}
              value={formatCurrency(totalIncome, "USD", language)}
              icon={<ArrowUp className="h-6 w-6 text-green-600" />}
            />
            <StatsCard
              title={t('totalExpenses')}
              value={formatCurrency(totalExpenses, "USD", language)}
              icon={<ArrowDown className="h-6 w-6 text-red-600" />}
            />
            <StatsCard
              title={t('transactions')}
              value={transactionCount.toString()}
              icon={<Receipt className="h-6 w-6" />}
            />
          </div>

          <AIInsights />

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
            © {new Date().getFullYear()} {t('appTitle')}. {t('footerBuiltWith')}.
          </p>
        </div>
      </footer>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <AISettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
