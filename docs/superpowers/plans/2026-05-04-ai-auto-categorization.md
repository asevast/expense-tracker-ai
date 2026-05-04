# AI Auto-Categorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement AI-powered category suggestions in the expense form to help users categorize transactions based on their descriptions.

**Architecture:** 
- A custom hook `useCategorySuggestion` will handle debouncing description changes, calling the AI client, and validating suggestions against the allowed categories.
- The `ExpenseForm` component will use this hook and display a suggestion chip when a relevant category is identified.
- TDD will be used to ensure the hook logic is correct and handles edge cases (e.g., AI disabled, API errors, invalid categories).

**Tech Stack:** React, TypeScript, Vitest, AI Context/Client.

---

### Task 1: Research & Setup

**Files:**
- Read: `app/types/index.ts`
- Read: `app/lib/ai-client.ts`
- Read: `app/context/AIContext.tsx`
- Read: `tests/ai-client.test.ts` (for test patterns)

- [ ] **Step 1: Verify environment and constants**
Ensure `CATEGORIES` and `callAI` are available and understood. (Already done during initial research).

---

### Task 2: Implement useCategorySuggestion hook (TDD)

**Files:**
- Create: `app/hooks/useCategorySuggestion.ts`
- Create: `tests/useCategorySuggestion.test.ts`

- [ ] **Step 1: Write failing test for basic suggestion**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCategorySuggestion } from '@/app/hooks/useCategorySuggestion';
import * as aiClient from '@/app/lib/ai-client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/lib/ai-client');
vi.mock('@/app/context/AIContext', () => ({
  useAIConfig: () => ({
    config: { enabled: true, provider: 'openai', apiKey: 'test' }
  })
}));

describe('useCategorySuggestion', () => {
  it('suggests a category based on description', async () => {
    vi.mocked(aiClient.callAI).mockResolvedValue({
      choices: [{ message: { content: 'Food' } }]
    });

    const { result } = renderHook(() => useCategorySuggestion('Lunch at restaurant', 'expense'));

    await waitFor(() => expect(result.current.suggestedCategory).toBe('Food'), { timeout: 2000 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/useCategorySuggestion.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement minimal hook logic**

```typescript
import { useState, useEffect } from 'react';
import { useAIConfig } from '@/app/context/AIContext';
import { callAI } from '@/app/lib/ai-client';
import { CATEGORIES, Category, TransactionType } from '@/app/types';

export function useCategorySuggestion(description: string, type: TransactionType) {
  const { config } = useAIConfig();
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.enabled || !description.trim() || description.length < 3) {
      setSuggestedCategory(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const categories = CATEGORIES.filter(c => c.type === type).map(c => c.value).join(', ');
        const prompt = `You are a professional financial assistant. Categorize the given expense description into exactly one of these categories: [${categories}]. Return ONLY the category name, no extra text.`;
        
        const response = await callAI(config, [
          { role: 'system', content: prompt },
          { role: 'user', content: description }
        ]);

        const suggestion = response.choices[0].message.content.trim() as Category;
        const isValid = CATEGORIES.some(c => c.value === suggestion && c.type === type);
        
        if (isValid) {
          setSuggestedCategory(suggestion);
        } else {
          setSuggestedCategory(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to suggest category');
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description, type, config]);

  return { suggestedCategory, isLoading, error };
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/useCategorySuggestion.test.ts`
Expected: PASS

- [ ] **Step 5: Add more test cases (Edge cases)**
- AI disabled should return null.
- Invalid category from AI should return null.
- Debouncing behavior.

- [ ] **Step 6: Implement final hook refinements**
Ensure it handles errors gracefully and doesn't update state after unmount.

- [ ] **Step 7: Commit hook**

```bash
git add app/hooks/useCategorySuggestion.ts tests/useCategorySuggestion.test.ts
git commit -m "feat: implement useCategorySuggestion hook with TDD"
```

---

### Task 3: Integrate into ExpenseForm

**Files:**
- Modify: `app/components/Filters/ExpenseForm.tsx`

- [ ] **Step 1: Use the hook in ExpenseForm**
Import and call `useCategorySuggestion` with current description and type.

- [ ] **Step 2: Add suggestion UI**
Display a chip below the category select when `suggestedCategory` is present and different from `formData.category`.

```tsx
{suggestedCategory && suggestedCategory !== formData.category && (
  <div className="mt-1 flex items-center gap-2">
    <span className="text-xs text-gray-500">AI Suggestion:</span>
    <button
      type="button"
      onClick={() => handleChange("category", suggestedCategory)}
      className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
    >
      {suggestedCategory}
    </button>
  </div>
)}
{isLoading && <span className="text-xs text-gray-400">Thinking...</span>}
```

- [ ] **Step 3: Verify manually**
Open the Add Expense modal, type "Starbucks", see "Food" suggested, click it.

- [ ] **Step 4: Commit UI changes**

```bash
git add app/components/Filters/ExpenseForm.tsx
git commit -m "feat: show AI category suggestions in ExpenseForm"
```

---

### Task 4: Final Validation

- [ ] **Step 1: Run all tests**
Run: `npm test`

- [ ] **Step 2: Self-review**
Check for any console errors or type issues.
