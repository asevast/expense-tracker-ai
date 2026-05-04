# Expense Tracker AI - Gemini Instructions

This repository contains a Next.js 14 application for tracking income and expenses with multi-currency support and localStorage persistence.

## Project Overview

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: React Context (`ExpenseContext`) with `useLocalStorage` hook for persistence.
- **Styling**: Tailwind CSS with custom `primary` color palette.
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest with React Testing Library and JSDOM.

## Directory Structure

- `app/`: Main application code (Next.js App Router).
  - `components/`: React components organized by feature.
    - `Dashboard/`: Analytics and summary cards.
    - `ExpenseList/`: Transaction tables and rows.
    - `Filters/`: Search, filtering, and entry forms.
    - `Exports/`: Exporting data to CSV, JSON, and PDF.
    - `ui/`: Reusable primitive components (Button, Card, Input, etc.).
  - `context/`: `ExpenseContext` for global state and business logic.
  - `hooks/`: Custom React hooks (e.g., `useLocalStorage`).
  - `lib/`: Utility functions (formatting, class merging, CSV generation).
  - `types/`: TypeScript interfaces and constants (Categories, Currencies).
- `tests/`: Unit and integration tests.
- `docs/`: Project documentation and plans.

## Core Architecture & Patterns

### State Management
The application uses a single `ExpenseContext` (`app/context/ExpenseContext.tsx`) to manage both the list of expenses and the current filter state.
- Data is persisted to `localStorage` automatically via the `useLocalStorage` hook.
- The context provides CRUD operations (`addExpense`, `updateExpense`, `deleteExpense`).
- Computed state like filtered expenses and dashboard statistics are derived within the context using `useMemo` and `useCallback`.

### Data Models
Types are defined in `app/types/index.ts`.
- `Expense`: Represents a single transaction.
- `FilterState`: Represents the current active filters.
- `DashboardStats`: Computed summary data for the dashboard.
- Constants for `CATEGORIES`, `CURRENCIES`, and `TRANSACTION_TYPES` are also defined here.

### Styling
- Tailwind CSS is used for all styling.
- A `cn` utility (`app/lib/utils.ts`) is used for conditional class merging (combining `clsx` and `tailwind-merge`).

## Key Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code using ESLint
npm run test     # Run tests in watch mode
npm run test:run # Run tests once
```

## Development Guidelines

- **Component Creation**: Use "use client" for components that require state, effects, or context. Place reusable primitives in `app/components/ui/`.
- **State Access**: Use the `useExpenses` hook to access the expense context.
- **Formatting**: Use formatting utilities in `app/lib/utils.ts` for currency and dates to ensure consistency.
- **Testing**: New features should include tests in the `tests/` directory or alongside components using Vitest.
- **Persistence**: Remember that all data is local to the user's browser.
