# Scaffold AI Categorization

Add automatic AI-powered category suggestions when the user types an expense description.
This feature does not exist yet — this command implements it from scratch using the Claude API.

## Target UX
When a user types a description in the Add Expense form, a "Suggest category" button (or auto-trigger after a short debounce) calls Claude and pre-fills the Category field with the best match from `CATEGORIES`.

## Steps

1. **Create `app/lib/categorize.ts`** — the AI categorization utility:
   - Function signature: `async function suggestCategory(description: string, amount?: number): Promise<Category | null>`
   - Call `POST https://api.anthropic.com/v1/messages` with model `claude-haiku-4-5-20251001`
   - System prompt: instruct the model to return **only** one of the valid category values from `CATEGORIES` in `app/types/index.ts` — no explanation, no markdown, just the raw value string
   - Include the full list of valid categories and their types (income/expense) in the system prompt so the model knows the allowed values
   - User message: `"Description: ${description}${amount ? `, Amount: ${amount}` : ''}"`
   - Parse and validate the response: if it is not a valid `Category` value, return `null`
   - Handle network errors and non-2xx responses gracefully — always return `null` on failure, never throw

2. **Create `app/api/categorize/route.ts`** — a Next.js API route that proxies the Claude call:
   - This keeps the Anthropic API key server-side only
   - Accept `POST` with body `{ description: string, amount?: number }`
   - Validate input — reject empty descriptions with `400`
   - Call `suggestCategory` and return `{ category: string | null }`
   - Set `ANTHROPIC_API_KEY` from `process.env` — never hardcode it

3. **Add `ANTHROPIC_API_KEY` to environment config**:
   - Add to `.env.local`: `ANTHROPIC_API_KEY=your_key_here`
   - Add to `.env.example`: `ANTHROPIC_API_KEY=` (empty, for documentation)
   - Add to `.gitignore` if `.env.local` is not already listed

4. **Create `app/hooks/useCategorySuggestion.ts`** — a React hook:
   - Debounce the description input by 600ms before firing the API call
   - Expose: `{ suggestedCategory, isLoading, error, clearSuggestion }`
   - Cancel in-flight requests on unmount or new input (use `AbortController`)

5. **Integrate into the Add/Edit Expense form**:
   - Find the description `<Input>` field in the expense form component
   - Wire up `useCategorySuggestion` to the description value
   - Show a subtle "Suggested: [Category]" chip below the category selector when a suggestion is available
   - Clicking the chip applies the suggestion; an ✕ button dismisses it
   - Show a small spinner in the chip area while `isLoading` is true

6. **Smoke test checklist**:
   - [ ] Typing "lunch at McDonald's" suggests `Food`
   - [ ] Typing "monthly salary" suggests `Salary`
   - [ ] Typing gibberish does not crash — suggestion is empty or null
   - [ ] API key missing → error is caught silently, no suggestion shown
   - [ ] Category field still works normally without any suggestion interaction

7. **Summarize all new and modified files** with a one-line description of each.
