"use client";

import { Expense, CATEGORIES } from "@/app/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate, formatSignedCurrency, cn } from "@/app/lib/utils";
import { useExpenses } from "@/app/context/ExpenseContext";
import { useTranslation } from "@/app/context/LanguageContext";

interface ExpenseRowProps {
  expense: Expense;
  onEdit: () => void;
}

export function ExpenseRow({ expense, onEdit }: ExpenseRowProps) {
  const { deleteExpense, getCategoryColor } = useExpenses();
  const { language, t } = useTranslation();
  const color = getCategoryColor(expense.category);

  const handleDelete = () => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteExpense(expense.id);
    }
  };

  const typeColor = expense.type === "income" ? "text-green-600" : "text-red-600";
  const amountColor = expense.type === "income" ? "text-green-600" : "text-red-600";

  return (
    <div className="grid grid-cols-1 gap-4 items-center border-b border-primary-100 p-4 hover:bg-primary-50/50 transition-colors sm:grid-cols-12">
      <div className="sm:col-span-2">
        <span className="text-sm font-medium text-primary-900">{formatDate(expense.date, language)}</span>
      </div>
      <div className="sm:col-span-2">
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeColor} bg-opacity-10`}
            style={{ backgroundColor: expense.type === "income" ? "#10b98120" : "#ef444420" }}
          >
            {expense.type === "income" ? `↑ ${t('incomeIndicator')}` : `↓ ${t('expenseIndicator')}`}
          </span>
          <span className="text-xs text-primary-500">{expense.currency}</span>
        </span>
      </div>
      <div className="sm:col-span-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {language === 'ru' ? (CATEGORIES.find(c => c.value === expense.category)?.labelRu || expense.category) : expense.category}
        </span>
      </div>
      <div className="sm:col-span-2">
        <span className={`font-semibold ${amountColor}`}>
          {formatSignedCurrency(expense.amount, expense.type, expense.currency, language)}
        </span>
      </div>
      <div className="sm:col-span-3">
        <p className="text-sm text-primary-700 line-clamp-2">{expense.description}</p>
      </div>
      <div className="sm:col-span-1 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
