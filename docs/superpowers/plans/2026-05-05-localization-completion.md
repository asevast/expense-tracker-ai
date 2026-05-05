# Localization Fixes & Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix TypeScript build errors by updating type definitions with Russian labels and complete the translation of the application, including the footer and modals.

**Architecture:** 
1. Update shared types to include `labelRu`.
2. Expand `translations.ts` with missing keys.
3. Update components to use the `useTranslation` hook and pass the `language` parameter to utility functions.
4. Ensure the build passes and tests are updated if necessary.

**Tech Stack:** Next.js 14, TypeScript, React Context, Tailwind CSS.

---

### Task 1: Fix Types and Build Errors

**Files:**
- Modify: `app/types/index.ts`
- Run: `npx tsc --noEmit`

- [ ] **Step 1: Update TRANSACTION_TYPES and CATEGORIES in `app/types/index.ts`**

Update `TRANSACTION_TYPES` and `CATEGORIES` to include `labelRu`.

```typescript
export const TRANSACTION_TYPES = [
  { value: "expense", label: "Expense", labelRu: "Расход", color: "#ef4444" },
  { value: "income", label: "Income", labelRu: "Доход", color: "#10b981" },
] as const;

// ...

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
```

- [ ] **Step 2: Verify the build passes**

Run: `npx tsc --noEmit`
Expected: SUCCESS

- [ ] **Step 3: Commit types fix**

```bash
git add app/types/index.ts
git commit -m "fix: add labelRu to TRANSACTION_TYPES and CATEGORIES to fix build"
```

### Task 2: Complete Translations Dictionary

**Files:**
- Modify: `app/lib/translations.ts`

- [ ] **Step 1: Add missing keys for Footer, ExportModal, and AISettingsModal**

Add keys for footer, export modal fields, and AI settings fields in both 'en' and 'ru' objects.

```typescript
// New keys to add:
// footerBuiltWith: "Built with Next.js 14 & Tailwind CSS"
// footerBuiltWithRu: "Создано с помощью Next.js 14 и Tailwind CSS"
// exportFormat: "Export Format"
// exportFormatRu: "Формат экспорта"
// startDateOptional: "Start Date (optional)"
// startDateOptionalRu: "Дата начала (опционально)"
// endDateOptional: "End Date (optional)"
// endDateOptionalRu: "Дата окончания (опционально)"
// filenameLabel: "Filename (without extension)"
// filenameLabelRu: "Имя файла (без расширения)"
// filenamePlaceholder: "Enter filename"
// filenamePlaceholderRu: "Введите имя файла"
// recordsToExport: "Records to export"
// recordsToExportRu: "Записей для экспорта"
// previewLabel: "Preview (first {count} of {total} records)"
// previewLabelRu: "Предпросмотр (первые {count} из {total} записей)"
// exportButton: "Export {count} records"
// exportButtonRu: "Экспортировать {count} записей"
// exporting: "Exporting..."
// exportingRu: "Экспорт..."
// aiSettings: "AI Settings"
// aiSettingsRu: "Настройки AI"
// enableAI: "Enable AI Features"
// enableAIRu: "Включить функции AI"
// aiProvider: "AI Provider"
// aiProviderRu: "Провайдер AI"
// apiBaseUrl: "API Base URL"
// apiBaseUrlRu: "Базовый URL API"
// apiKey: "API Key"
// apiKeyRu: "Ключ API"
// modelId: "Model ID"
// modelIdRu: "ID модели"
// testConnection: "Test Connection"
// testConnectionRu: "Проверить соединение"
// connectionSuccess: "Connection successful"
// connectionSuccessRu: "Соединение успешно"
// connectionFailed: "Connection failed"
// connectionFailedRu: "Ошибка соединения"
```

- [ ] **Step 2: Commit translation changes**

```bash
git commit -am "feat: add missing translation keys for footer and modals"
```

### Task 3: Localize HomePage and Footer

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update currency formatting and footer in `app/page.tsx`**

Pass `language` to `formatCurrency` and `formatSignedCurrency`. Translate footer text.

- [ ] **Step 2: Commit HomePage changes**

```bash
git commit -am "feat: localize currency formatting and footer in HomePage"
```

### Task 4: Localize ExportModal

**Files:**
- Modify: `app/components/Exports/ExportModal.tsx`

- [ ] **Step 1: Apply translations and localized categories in `ExportModal.tsx`**

Use `useTranslation` hook. Use `labelRu` for categories when language is 'ru'. Localize table headers and PDF output if possible.

- [ ] **Step 2: Commit ExportModal changes**

```bash
git commit -am "feat: localize ExportModal"
```

### Task 5: Localize AISettingsModal

**Files:**
- Modify: `app/components/Settings/AISettingsModal.tsx`

- [ ] **Step 1: Apply translations in `AISettingsModal.tsx`**

Use `useTranslation` hook. Translate labels and messages.

- [ ] **Step 2: Commit AISettingsModal changes**

```bash
git commit -am "feat: localize AISettingsModal"
```

### Task 6: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Final Type Check**

Run: `npx tsc --noEmit`
Expected: SUCCESS

- [ ] **Step 3: Commit final verification**

```bash
git commit --allow-empty -m "chore: final localization verification"
```
