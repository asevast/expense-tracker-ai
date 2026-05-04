"use client";

import { useState, useEffect } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { CATEGORIES, TRANSACTION_TYPES, CURRENCIES, Currency, Category, Expense, TransactionType } from "@/app/types";
import { useCategorySuggestion } from "@/app/hooks/useCategorySuggestion";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function ExpenseForm({ isOpen, onClose, expense }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useExpenses();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    type: "expense" as TransactionType,
    currency: "USD" as Currency,
    category: "Food" as Category,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { suggestion, isLoading } = useCategorySuggestion(
    formData.description, 
    formData.type,
    formData.category
  );

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        amount: expense.amount.toString(),
        type: expense.type,
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "expense",
        currency: "USD",
        category: "Food" as Category,
        description: "",
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const expenseData = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      type: formData.type,
      currency: formData.currency,
      category: formData.category,
      description: formData.description.trim(),
    };

    if (expense) {
      updateExpense(expense.id, expenseData);
    } else {
      addExpense(expenseData);
    }

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset category to first available when type changes
      if (field === "type") {
        const filteredCategories = CATEGORIES.filter((cat) => cat.type === value);
        if (filteredCategories.length > 0 && !filteredCategories.find((cat) => cat.value === prev.category)) {
          newData.category = filteredCategories[0].value;
        }
      }
      return newData;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const availableCategories = CATEGORIES.filter((cat) => cat.type === formData.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? "Edit Expense" : "Add New Expense"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value as TransactionType)}
              options={TRANSACTION_TYPES.map((type) => ({ value: type.value, label: type.label }))}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value as Currency)}
              options={CURRENCIES.map((curr) => ({ value: curr.value, label: curr.label }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            error={errors.date}
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            error={errors.amount}
          />
        </div>

        <div className="space-y-1">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value as Category)}
            options={availableCategories.map((cat) => ({ value: cat.value, label: cat.label }))}
            error={errors.category}
          />
          {(suggestion || isLoading) && (
            <div className="flex items-center gap-2 px-1 text-sm animate-in fade-in slide-in-from-top-1">
              {isLoading ? (
                <span className="text-gray-500">AI is thinking...</span>
              ) : suggestion ? (
                <>
                  <span className="text-gray-500">Suggested:</span>
                  <button
                    type="button"
                    onClick={() => handleChange("category", suggestion)}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors text-xs font-medium"
                  >
                    {suggestion}
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          placeholder="Enter description..."
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {expense ? "Update" : "Add"} {expense ? (expense.type === "income" ? "Income" : "Expense") : "Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
