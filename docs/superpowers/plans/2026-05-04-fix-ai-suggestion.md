# Fix AI Category Suggestion and Expense Form UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix race conditions in category suggestion, ensure suggestions don't match current category, and clean up the suggestion UI.

**Architecture:** Update `useCategorySuggestion` hook to robustly handle the current category and prevent stale suggestions. Update `ExpenseForm` to pass the current category and refine the suggestion display logic.

**Tech Stack:** React, TypeScript, Next.js

---

### Task 1: Update `useCategorySuggestion` hook

**Files:**
- Modify: `app/hooks/useCategorySuggestion.ts`

- [ ] **Step 1: Robustly handle `currentCategory` and clear stale suggestions**

Update the hook to clear the suggestion immediately if it matches the new `currentCategory`.

```typescript
// app/hooks/useCategorySuggestion.ts

// ...
export function useCategorySuggestion(description: string, type: TransactionType, currentCategory?: Category) {
  // ...
  useEffect(() => {
    let active = true;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't suggest if AI is disabled or description is too short
    if (!config.enabled || !description.trim() || description.length < 3) {
      setSuggestion(null);
      return;
    }

    // Immediately clear suggestion if it now matches currentCategory
    if (suggestion === currentCategory) {
      setSuggestion(null);
    }

    // Debounce AI call
    timeoutRef.current = setTimeout(async () => {
      // ... (rest of the logic)
```

### Task 2: Update `ExpenseForm` UI and hook usage

**Files:**
- Modify: `app/components/Filters/ExpenseForm.tsx`

- [ ] **Step 1: Pass `formData.category` to `useCategorySuggestion`**

```typescript
// app/components/Filters/ExpenseForm.tsx
// ...
  const { suggestion, isLoading } = useCategorySuggestion(
    formData.description, 
    formData.type,
    formData.category
  );
// ...
```

- [ ] **Step 2: Fix the suggestion display logic**

Ensure "Suggested:" label only shows when there's an actual suggestion to show.

```tsx
// app/components/Filters/ExpenseForm.tsx
// ...
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
// ...
```

### Task 3: Verification

- [ ] **Step 1: Run lint and type check**

Run: `npm run lint` and `npx tsc --noEmit`

- [ ] **Step 2: Commit changes**

```bash
git add app/hooks/useCategorySuggestion.ts app/components/Filters/ExpenseForm.tsx
git commit -m "fix: ai category suggestion race conditions and UI cleanup"
```
