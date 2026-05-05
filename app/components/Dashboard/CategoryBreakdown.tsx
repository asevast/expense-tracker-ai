"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/app/components/ui/Card";
import { useExpenses } from "@/app/context/ExpenseContext";
import { useTranslation } from "@/app/context/LanguageContext";
import { CATEGORIES } from "@/app/types";
import { formatCurrency, cn } from "@/app/lib/utils";

export function CategoryBreakdown() {
  const { getDashboardStats } = useExpenses();
  const { language, t } = useTranslation();
  const { categoryTotals } = getDashboardStats();

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const data = CATEGORIES
    .map((cat) => ({
      name: language === 'ru' ? cat.labelRu : cat.label,
      value: categoryTotals[cat.value],
      color: cat.color,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold text-primary-900 mb-4">{t('byCategory')}</h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-primary-500">
          {t('noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value, "USD", language)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                fontSize: "14px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="mt-4 text-center">
        <p className="text-sm text-primary-600">{t('total')}</p>
        <p className="text-2xl font-bold text-primary-900">{formatCurrency(total, "USD", language)}</p>
      </div>
    </Card>
  );
}
