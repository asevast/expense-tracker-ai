export const TRANSACTION_TYPES = [
  { value: "expense", label: "Expense", labelRu: "Расход", color: "#ef4444" },
  { value: "income", label: "Income", labelRu: "Доход", color: "#10b981" },
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number]["value"];

export const CURRENCIES = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "RUB", label: "RUB (₽)", symbol: "₽" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

export type Language = 'en' | 'ru';

export const CATEGORIES = [
  // Income categories
  { value: "Salary", label: "Salary", labelRu: "Зарплата", color: "#10b981", type: "income" as TransactionType },
  { value: "Freelance", label: "Freelance", labelRu: "Фриланс", color: "#14b8a6", type: "income" as TransactionType },
  { value: "Investment", label: "Investment", labelRu: "Инвестиции", color: "#06b6d4", type: "income" as TransactionType },
  { value: "Gift", label: "Gift", labelRu: "Подарок", color: "#0ea5e9", type: "income" as TransactionType },
  { value: "Other Income", label: "Other Income", labelRu: "Прочий доход", color: "#84cc16", type: "income" as TransactionType },
  // Expense categories
  { value: "Food", label: "Food", labelRu: "Еда", color: "#ef4444", type: "expense" as TransactionType },
  { value: "Transportation", label: "Transportation", labelRu: "Транспорт", color: "#f97316", type: "expense" as TransactionType },
  { value: "Entertainment", label: "Entertainment", labelRu: "Развлечения", color: "#eab308", type: "expense" as TransactionType },
  { value: "Shopping", label: "Shopping", labelRu: "Покупки", color: "#3b82f6", type: "expense" as TransactionType },
  { value: "Bills", label: "Bills", labelRu: "Счета", color: "#8b5cf6", type: "expense" as TransactionType },
  { value: "Other", label: "Other", labelRu: "Прочее", color: "#6b7280", type: "expense" as TransactionType },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export interface Expense {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  currency: Currency;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  typeFilter: TransactionType | "all";
  categoryFilter: Category | "all";
  currencyFilter: Currency | "all";
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  averageIncome: number;
  averageExpense: number;
  categoryTotals: Record<Category, number>;
  typeTotals: Record<TransactionType, number>;
  monthlyData: { month: string; income: number; expenses: number }[];
}

export type AIProviderType = "openai" | "anthropic" | "local" | "openrouter";

export interface AIConfig {
  enabled: boolean;
  provider: AIProviderType;
  baseUrl: string;
  apiKey: string;
  modelId: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

