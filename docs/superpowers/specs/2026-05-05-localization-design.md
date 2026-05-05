# Design Spec: Multi-Language Support (RU/EN)

**Date:** 2026-05-05
**Topic:** Localization (RU/EN)
**Status:** Draft

## 1. Overview
Add support for Russian (RU) and English (EN) languages. This includes a UI toggle, translation of all static strings, localized date/currency formatting, and language-aware AI prompts.

## 2. Architecture

### 2.1 Language State Management
- **Context:** `LanguageContext` will store the active locale.
- **Persistence:** Save the selected language to `localStorage` under the key `language`.
- **Default:** Detect browser language (fallback to `en`).

### 2.2 Translation System ("i18n-lite")
- **Dictionary:** A centralized `app/lib/translations.ts` file containing a map for both languages.
- **Hook:** `useTranslation` hook to easily access strings in components.
- **Structure:**
  ```typescript
  {
    en: { dashboard: "Dashboard", ... },
    ru: { dashboard: "Панель управления", ... }
  }
  ```

## 3. UI/UX

### 3.1 Language Toggle
- **Placement:** In the main header, next to the "Settings" button.
- **Design:** A segmented control (EN | RU).

### 3.2 Dynamic Data
- **Categories:** Update `CATEGORIES` and `TRANSACTION_TYPES` to include translated labels or use the translation map.
- **AI Prompts:** Pass the current language to `callAI` so suggestions and insights are returned in the correct language.
- **Formatting:** Update `utils.ts` to use the current locale for `Intl.NumberFormat` and `toLocaleDateString`.

## 4. Implementation Steps
1. **Define Types:** Add `Language` type to `types/index.ts`.
2. **Translation Map:** Create `app/lib/translations.ts`.
3. **Language Context:** Create `app/context/LanguageContext.tsx`.
4. **Utility Updates:** Refactor `app/lib/utils.ts` to respect the language context.
5. **Language Toggle Component:** Create `app/components/ui/LanguageToggle.tsx`.
6. **UI Integration:** Apply `useTranslation` across all components (Dashboard, ExpenseList, Filters, Settings).
7. **AI Language Support:** Update `useCategorySuggestion` and `AIInsights` prompts.

## 5. Success Criteria
- [ ] User can switch between RU and EN.
- [ ] Choice is persisted across page refreshes.
- [ ] Dates and currencies format correctly (e.g., "5 May" vs "5 мая").
- [ ] AI categorization suggests in Russian when RU is active.
- [ ] Dashboard insights are provided in Russian when RU is active.
