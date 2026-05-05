# Add Expense Category

Add a new income or expense category end-to-end across the frontend.

## Usage
Provide the category name, type (income/expense), and preferred color when running this command.
Example: `Healthcare`, type: `expense`, color: `#ec4899`

## Steps

1. **Update `CATEGORIES` in `app/types/index.ts`**:
   - Add a new entry to the `CATEGORIES` const array
   - Fields required: `value`, `label`, `color`, `type` (`"income"` or `"expense"`)
   - Keep income categories grouped before expense categories; within each group, keep alphabetical order
   - The `value` becomes the canonical key used everywhere — choose it carefully, it is stored in `localStorage`

2. **Verify `Category` type updates automatically** — `Category` is derived via `(typeof CATEGORIES)[number]["value"]`, so no manual type change needed. Confirm TypeScript reports no new errors after the addition.

3. **Check all components that render category lists** — search for usages of `CATEGORIES` across `app/components/`. Confirm the new category appears automatically in:
   - `FilterBar` category dropdown
   - `ExportModal` category checkboxes
   - `CategoryBreakdown` chart
   - `ExpenseTable` category column/badge
   - Any `AddExpenseModal` or form with a category selector
   If any component has a hardcoded category list instead of importing from `types/index.ts`, fix it to use the shared constant.

4. **Verify color in `getCategoryColor`** — in `ExpenseContext.tsx`, `getCategoryColor` looks up `CATEGORIES` by value. Confirm it returns the correct color for the new category and does not fall back to the default `#6b7280`.

5. **Check `getDashboardStats`** — `categoryTotals` is built by iterating `CATEGORIES`, so the new category will be included automatically. Confirm no hardcoded category filtering elsewhere skips it.

6. **Manual smoke test checklist**:
   - [ ] New category appears in the Add/Edit expense form
   - [ ] New category appears in the filter dropdown
   - [ ] New category appears in the export modal category list
   - [ ] Adding an expense with this category shows correct color in CategoryBreakdown
   - [ ] Export to CSV/JSON/PDF includes the new category correctly

7. **Summarize all files changed** with a one-line description of each change.
