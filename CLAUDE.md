# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 expense tracker with AI capabilities. Tracks income/expenses with multi-currency support (USD, RUB), localStorage persistence, and cloud export features.

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
```

## Architecture

**State Management**: React Context (`ExpenseContext`) with `useLocalStorage` hook for persistence. All expense data lives in localStorage under `expenses` key.

**Data Flow**: `app/types/index.ts` defines all types (Expense, FilterState, DashboardStats, Category, Currency). Context exposes CRUD operations and computed stats (filtered results, totals, category breakdowns, monthly trends).

**Component Structure**:
- `app/context/ExpenseContext.tsx` — Global state provider
- `app/components/ui/` — Reusable UI primitives (Button, Input, Select, Modal, Card)
- `app/components/Dashboard/` — StatsCard, SpendingChart, CategoryBreakdown
- `app/components/Filters/` — FilterBar, ExpenseForm
- `app/components/ExpenseList/` — ExpenseTable, ExpenseRow
- `app/components/CloudExport/` — Multi-tab export modal (email, Google Sheets, backup schedules, sharing)

**Utilities**:
- `app/lib/utils.ts` — formatCurrency, formatDate, cn (classname merge)
- `app/lib/csv.ts` — CSV generation and download

**Styling**: Tailwind with custom `primary` color palette (slate-based). Uses `clsx` + `tailwind-merge` via `cn()` utility for conditional classes.

## Key Patterns

- Filters are stored in localStorage under `filters` key; filter logic lives in `getFilteredExpenses()`
- Dashboard stats are computed from filtered expenses via `getDashboardStats()`
- CloudExportModal is a large multi-tab component (~1000 lines) handling simulated export workflows
