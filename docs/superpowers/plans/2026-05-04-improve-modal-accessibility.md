# Improve Modal Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the `Modal` component's accessibility by adding ARIA roles, labels, and proper title linking.

**Architecture:** Use ARIA standards for dialog components. Specifically `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linked to the modal title.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React.

---

### Task 1: Create Modal Accessibility Test

**Files:**
- Create: `tests/Modal.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '@/app/components/ui/Modal';
import React from 'react';

describe('Modal Accessibility', () => {
  it('has correct accessibility attributes', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    
    const title = screen.getByText('Test Modal');
    expect(title.id).toBe('modal-title');
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/Modal.test.tsx`
Expected: FAIL (Role "dialog" not found, or attributes missing)

- [ ] **Step 3: Commit**

```bash
git add tests/Modal.test.tsx
git commit -m "test: add accessibility tests for Modal component"
```

### Task 2: Implement Accessibility Improvements

**Files:**
- Modify: `app/components/ui/Modal.tsx`

- [ ] **Step 1: Update Modal implementation**

Modify `app/components/ui/Modal.tsx` to add roles and attributes.

```tsx
// ... around line 32
      <div
        className={cn(
          "relative z-50 w-full rounded-lg bg-white p-6 shadow-xl",
          {
            "max-w-md": size === "sm",
            "max-w-lg": size === "md",
            "max-w-2xl": size === "lg",
          }
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-primary-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md text-primary-500 hover:bg-primary-100 p-1 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
// ...
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm test tests/Modal.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/Modal.tsx
git commit -m "feat: improve Modal accessibility with ARIA roles and labels"
```
