"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/app/components/ui/Card";
import { useExpenses } from "@/app/context/ExpenseContext";
import { useTranslation } from "@/app/context/LanguageContext";
import { formatCurrency, formatMonthYear } from "@/app/lib/utils";

export function SpendingChart() {
  const { getDashboardStats } = useExpenses();
  const { language, t } = useTranslation();
  const { monthlyData } = getDashboardStats();

  const chartData = monthlyData.map((item) => ({
    ...item,
    formattedMonth: formatMonthYear(item.month, language),
    formattedIncome: formatCurrency(item.income, "USD", language),
    formattedExpenses: formatCurrency(item.expenses, "USD", language),
  }));

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold text-primary-900 mb-4">{t('monthlyOverview')}</h3>
      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-primary-500">
          {t('noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="formattedMonth"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#94a3b8" }}
              axisLine={{ stroke: "#94a3b8" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#94a3b8" }}
              axisLine={{ stroke: "#94a3b8" }}
              tickFormatter={(value) => `${language === 'ru' ? '' : '$'}${value / 1000}k${language === 'ru' ? ' ₽' : ''}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                fontSize: "14px",
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={t('income')} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name={t('expenses')} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
