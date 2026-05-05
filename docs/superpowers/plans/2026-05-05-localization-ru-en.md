# Multi-Language Support (RU/EN) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement RU/EN localization with a UI toggle, translated static strings, localized formatting, and language-aware AI prompts.

**Architecture:** A lightweight "i18n-lite" system using React Context (`LanguageContext`) and a centralized translation map. Persistence is handled via `localStorage`.

**Tech Stack:** Next.js 14, React Context, Tailwind CSS, LocalStorage.

---

### Task 1: Localization Infrastructure

**Files:**
- Modify: `app/types/index.ts`
- Create: `app/lib/translations.ts`
- Create: `app/context/LanguageContext.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Define Language type**
Add to `app/types/index.ts`:
```typescript
export type Language = 'en' | 'ru';
```

- [ ] **Step 2: Create translation map**
Create `app/lib/translations.ts`:
```typescript
export const translations = {
  en: {
    appTitle: "Expense Tracker",
    appSubtitle: "Track, categorize, and analyze your expenses and income",
    settings: "Settings",
    exportData: "Export Data",
    netBalance: "Net Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    transactions: "Transactions",
    spendingChart: "Spending Overview",
    categoryBreakdown: "Category Breakdown",
    addExpense: "Add Transaction",
    description: "Description",
    amount: "Amount",
    date: "Date",
    category: "Category",
    type: "Type",
    currency: "Currency",
    save: "Save",
    cancel: "Cancel",
    analyze: "Analyze Spending",
    aiInsights: "AI Insights",
    noData: "No transactions found",
  },
  ru: {
    appTitle: "Менеджер Расходов",
    appSubtitle: "Отслеживайте, категоризируйте и анализируйте ваши доходы и расходы",
    settings: "Настройки",
    exportData: "Экспорт данных",
    netBalance: "Чистый баланс",
    totalIncome: "Общий доход",
    totalExpenses: "Общие расходы",
    transactions: "Транзакции",
    spendingChart: "Обзор расходов",
    categoryBreakdown: "Разбивка по категориям",
    addExpense: "Добавить транзакцию",
    description: "Описание",
    amount: "Сумма",
    date: "Дата",
    category: "Категория",
    type: "Тип",
    currency: "Валюта",
    save: "Сохранить",
    cancel: "Отмена",
    analyze: "Анализировать расходы",
    aiInsights: "AI Аналитика",
    noData: "Транзакции не найдены",
  }
};
```

- [ ] **Step 3: Create LanguageContext**
Create `app/context/LanguageContext.tsx` using `useLocalStorage`:
```tsx
"use client";
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { Language } from '@/app/types';
import { translations } from '@/app/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
};
```

- [ ] **Step 4: Wrap app in LanguageProvider**
Modify `app/layout.tsx`:
```tsx
import { LanguageProvider } from "@/app/context/LanguageContext";
// ... inside RootLayout
<LanguageProvider>
  <AIProvider>
    <ExpenseProvider>{children}</ExpenseProvider>
  </AIProvider>
</LanguageProvider>
```

- [ ] **Step 5: Commit**
```bash
git add app/types/index.ts app/lib/translations.ts app/context/LanguageContext.tsx app/layout.tsx
git commit -m "feat: add localization infrastructure (Context, Translations)"
```

---

### Task 2: Localized Utilities

**Files:**
- Modify: `app/lib/utils.ts`

- [ ] **Step 1: Update formatters to accept locale**
Modify `app/lib/utils.ts` to accept an optional `locale` string or derive it from a language param.
```typescript
export function formatCurrency(amount: number, currency: Currency = "USD", language: Language = 'en'): string {
  const locale = language === 'ru' ? 'ru-RU' : (currency === "USD" ? "en-US" : "ru-RU");
  // ... rest of logic
}
```

- [ ] **Step 2: Commit**
```bash
git add app/lib/utils.ts
git commit -m "refactor: make utilities locale-aware"
```

---

### Task 3: Language Toggle & Integration

**Files:**
- Create: `app/components/ui/LanguageToggle.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create LanguageToggle component**
Create `app/components/ui/LanguageToggle.tsx` using Tailwind for the segmented control style.

- [ ] **Step 2: Integrate toggle in Header**
Modify `app/page.tsx` to include `<LanguageToggle />` in the header next to the Settings button.

- [ ] **Step 3: Translate Header strings**
Use `useTranslation()` in `app/page.tsx` for title and subtitle.

- [ ] **Step 4: Commit**
```bash
git add app/components/ui/LanguageToggle.tsx app/page.tsx
git commit -m "feat: add language toggle and translate header"
```

---

### Task 4: UI String Translation

**Files:**
- Modify: `app/components/Dashboard/StatsCard.tsx`
- Modify: `app/components/Dashboard/SpendingChart.tsx`
- Modify: `app/components/Dashboard/CategoryBreakdown.tsx`
- Modify: `app/components/Filters/FilterBar.tsx`
- Modify: `app/components/ExpenseList/ExpenseTable.tsx`
- Modify: `app/components/Filters/ExpenseForm.tsx`

- [ ] **Step 1: Apply `useTranslation` to all components**
Replace hardcoded strings with `t('key')`.

- [ ] **Step 2: Commit**
```bash
git commit -m "feat: translate all UI components"
```

---

### Task  TASK 5: AI Language Support

**Files:**
- Modify: `app/hooks/useCategorySuggestion.ts`
- Modify: `app/components/Dashboard/AIInsights.tsx`

- [ ] **Step 1: Update AI Prompts**
Pass the current `language` to the AI hooks and include it in the prompt (e.g., "Respond in [Language]").

- [ ] **Step 2: Commit**
```bash
git commit -m "feat: make AI features language-aware"
```
