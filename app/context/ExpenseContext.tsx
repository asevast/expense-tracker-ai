"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Expense, FilterState, DashboardStats, Category, CATEGORIES, TransactionType, TRANSACTION_TYPES } from "@/app/types";

interface ExpenseContextType {
  expenses: Expense[];
  filters: FilterState;
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  deleteExpense: (id: string) => void;
  setFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  getFilteredExpenses: () => Expense[];
  getDashboardStats: () => DashboardStats;
  getCategoryColor: (category: Category) => string;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: "",
  typeFilter: "all",
  categoryFilter: "all",
  currencyFilter: "all",
  startDate: "",
  endDate: "",
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  const [filters, setFiltersState] = useLocalStorage<FilterState>("filters", DEFAULT_FILTERS);

  const setFilters = useCallback((updates: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, [setFiltersState]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, [setFiltersState]);

  const addExpense = useCallback((expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [...prev, newExpense]);
  }, [setExpenses]);

  const updateExpense = useCallback((id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
          : expense
      )
    );
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }, [setExpenses]);

  const getFilteredExpenses = useCallback(() => {
    return expenses.filter((expense) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.typeFilter !== "all") {
        if (expense.type !== filters.typeFilter) return false;
      }

      if (filters.categoryFilter !== "all") {
        if (expense.category !== filters.categoryFilter) return false;
      }

      if (filters.currencyFilter !== "all") {
        if (expense.currency !== filters.currencyFilter) return false;
      }

      if (filters.startDate && expense.date < filters.startDate) return false;
      if (filters.endDate && expense.date > filters.endDate) return false;

      return true;
    });
  }, [expenses, filters]);

  const getDashboardStats = useCallback((): DashboardStats => {
    const filtered = getFilteredExpenses();

    const incomeExpenses = filtered.filter((e) => e.type === "income");
    const expenseExpenses = filtered.filter((e) => e.type === "expense");

    const totalIncome = incomeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpensesAmount = expenseExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpensesAmount;

    const incomeCount = incomeExpenses.length;
    const expenseCount = expenseExpenses.length;
    const averageIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    const averageExpense = expenseCount > 0 ? totalExpensesAmount / expenseCount : 0;

    const categoryTotals = CATEGORIES.reduce((acc, cat) => {
      acc[cat.value] = filtered
        .filter((e) => e.category === cat.value)
        .reduce((sum, e) => sum + e.amount, 0);
      return acc;
    }, {} as Record<Category, number>);

    const typeTotals = TRANSACTION_TYPES.reduce((acc, type) => {
      acc[type.value] = filtered
        .filter((e) => e.type === type.value)
        .reduce((sum, e) => sum + e.amount, 0);
      return acc;
    }, {} as Record<TransactionType, number>);

    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    filtered.forEach((expense) => {
      const month = expense.date.substring(0, 7);
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
      if (expense.type === "income") {
        current.income += expense.amount;
      } else {
        current.expenses += expense.amount;
      }
      monthlyMap.set(month, current);
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, income: data.income, expenses: data.expenses }));

    return {
      totalIncome,
      totalExpenses: totalExpensesAmount,
      netBalance,
      incomeCount,
      expenseCount,
      averageIncome,
      averageExpense,
      categoryTotals,
      typeTotals,
      monthlyData,
    };
  }, [getFilteredExpenses]);

  const getCategoryColor = useCallback((category: Category): string => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.color || "#6b7280";
  }, []);

  const value = useMemo(
    () => ({
      expenses,
      filters,
      addExpense,
      updateExpense,
      deleteExpense,
      setFilters,
      resetFilters,
      getFilteredExpenses,
      getDashboardStats,
      getCategoryColor,
    }),
    [
      expenses,
      filters,
      addExpense,
      updateExpense,
      deleteExpense,
      setFilters,
      resetFilters,
      getFilteredExpenses,
      getDashboardStats,
      getCategoryColor,
    ]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}
