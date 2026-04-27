# Analyze Spending Logic

Audit the data layer, stats calculations, and UI coverage of the expense tracker.

## Steps

1. **Review the Expense type** — open `app/types/index.ts`. List all fields on the `Expense` interface. Flag any fields that are defined but never read in components, or used inconsistently (e.g., `currency` ignored in totals).

2. **Audit `getDashboardStats`** in `app/context/ExpenseContext.tsx`:
   - Verify `totalIncome`, `totalExpenses`, and `netBalance` calculations are correct
   - Check `categoryTotals` covers all categories in `CATEGORIES` — no silent zeroes for new categories
   - Check `monthlyData`: confirm timezone handling (`date.substring(0, 7)` assumes ISO strings — verify this holds for all add/edit paths)
   - Identify any stat that would break if `expenses` is empty

3. **Audit filter logic** in `getFilteredExpenses`:
   - Verify date range filtering (`<` / `>` string comparison) works correctly with the date format used in the app
   - Check that `searchQuery` matches on all user-visible fields (currently only `description` and `category` — is `amount` or `date` search needed?)
   - Confirm `currencyFilter` correctly isolates multi-currency totals

4. **Check category coverage in UI** — scan `app/components/` for any hardcoded category lists or colors that are out of sync with `CATEGORIES` in `types/index.ts`. Every place that references categories should derive from the single source of truth.

5. **Review export correctness** in `app/components/Exports/ExportModal.tsx`:
   - CSV: check that amounts use consistent decimal format; verify description escaping handles commas and newlines
   - PDF: confirm `formatCurrency` is called with the correct per-expense `currency`, not a hardcoded `"USD"`
   - JSON: verify exported shape matches the `Expense` interface exactly

6. **Check localStorage resilience** in `app/hooks/useLocalStorage.ts`:
   - What happens on a corrupted or outdated stored value (e.g., old schema missing new fields)?
   - Is there a migration or default-value fallback?

7. **Output a report**:
   - ✅ What is solid
   - ⚠️ Bugs or edge cases found (with file + line reference)
   - 🔧 Concrete fixes, ordered by severity
