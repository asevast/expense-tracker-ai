"use client";

import { useState } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { useTranslation } from "@/app/context/LanguageContext";
import { ExpenseRow } from "@/app/components/ExpenseList/ExpenseRow";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Plus, Receipt } from "lucide-react";
import { Expense } from "@/app/types";
import { ExpenseForm } from "@/app/components/Filters/ExpenseForm";

export function ExpenseTable() {
  const { getFilteredExpenses } = useExpenses();
  const { t } = useTranslation();
  const expenses = getFilteredExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <>
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-primary-200 p-4">
          <h2 className="text-lg font-semibold text-primary-900">{t('transactions')}</h2>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addExpense')}
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="mb-4 h-12 w-12 text-primary-400" />
            <h3 className="text-lg font-medium text-primary-900">{t('noTransactionsYet')}</h3>
            <p className="mt-2 text-sm text-primary-600">
              {t('getStartedAdding')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 border-b border-primary-200 bg-primary-50 p-4 text-xs font-medium uppercase tracking-wider text-primary-600 sm:grid-cols-12">
              <div className="sm:col-span-2">{t('date')}</div>
              <div className="sm:col-span-2">{t('type')}</div>
              <div className="sm:col-span-2">{t('category')}</div>
              <div className="sm:col-span-2">{t('amount')}</div>
              <div className="sm:col-span-3">{t('description')}</div>
              <div className="sm:col-span-1 text-right">{t('actions')}</div>
            </div>
            <div>
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => handleEdit(expense)}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      <ExpenseForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </>
  );
}
