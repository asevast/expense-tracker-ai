# Production PWA with Flexible AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the expense tracker into a production-ready PWA with flexible, BYOK AI features including auto-categorization and spending insights.

**Architecture:** A pure client-side PWA using standard web manifests for installation. AI integration uses a "Universal Adapter" pattern to support OpenAI-compatible APIs (Ollama, Groq, OpenRouter) and Anthropic via a lightweight Edge Proxy.

**Tech Stack:** Next.js 14, Tailwind CSS, Lucide Icons, localStorage for state, and Edge Functions for API proxying.

---

### Task 1: PWA Scaffolding

**Files:**
- Create: `public/manifest.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create the Web App Manifest**

```json
{
  "name": "Expense Tracker AI",
  "short_name": "ExpenseAI",
  "description": "Smart expense tracking with AI insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Update layout with PWA meta tags**

```tsx
// app/layout.tsx
// Add inside <head> via metadata or direct tags
export const metadata: Metadata = {
  title: "Expense Tracker AI",
  description: "Track your expenses smartly with AI-powered insights",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ExpenseAI",
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json app/layout.tsx
git commit -m "feat: add PWA manifest and meta tags"
```

---

### Task 2: AI Configuration State

**Files:**
- Modify: `app/types/index.ts`
- Create: `app/context/AIContext.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Define AI Config types**

```typescript
// app/types/index.ts
export type AIProvider = "openai" | "anthropic" | "local" | "openrouter";

export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  modelId: string;
}
```

- [ ] **Step 2: Create AIContext with localStorage persistence**

```tsx
// app/context/AIContext.tsx
"use client";
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { AIConfig, AIProvider } from '@/app/types';

interface AIContextType {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

const DEFAULT_CONFIG: AIConfig = {
  enabled: false,
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  modelId: 'gpt-4o-mini',
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useLocalStorage<AIConfig>('ai-config', DEFAULT_CONFIG);

  const updateConfig = useCallback((updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, [setConfig]);

  return (
    <AIContext.Provider value={{ config, updateConfig }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAIConfig = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAIConfig must be used within AIProvider");
  return context;
};
```

- [ ] **Step 3: Wrap app in AIProvider**

```tsx
// app/layout.tsx
import { AIProvider } from "@/app/context/AIContext";
// ...
<AIProvider>
  <ExpenseProvider>{children}</ExpenseProvider>
</AIProvider>
```

- [ ] **Step 4: Commit**

```bash
git add app/types/index.ts app/context/AIContext.tsx app/layout.tsx
git commit -m "feat: add AI configuration context and types"
```

---

### Task 3: Universal AI Client & Edge Proxy

**Files:**
- Create: `app/lib/ai-client.ts`
- Create: `app/api/proxy/route.ts`

- [ ] **Step 1: Create the Edge Proxy for CORS**

```typescript
// app/api/proxy/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { url, method, headers, body } = await req.json();
  
  try {
    const response = await fetch(url, {
      method,
      headers: { ...headers, 'User-Agent': 'ExpenseTrackerAI/1.0' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
```

- [ ] **Step 2: Implement the Universal AI Client**

```typescript
// app/lib/ai-client.ts
import { AIConfig } from "@/app/types";

export async function callAI(config: AIConfig, messages: any[]) {
  const isAnthropic = config.provider === 'anthropic';
  const url = isAnthropic ? 'https://api.anthropic.com/v1/messages' : `${config.baseUrl}/chat/completions`;
  
  const body = isAnthropic ? {
    model: config.modelId,
    max_tokens: 1024,
    messages: messages,
  } : {
    model: config.modelId,
    messages: messages,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isAnthropic) {
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  // Use proxy for Anthropic or if preferred
  const useProxy = isAnthropic || config.provider === 'openrouter';
  
  if (useProxy) {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ url, method: 'POST', headers, body }),
    });
    return res.json();
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}
```

- [ ] **Step 3: Commit**

```bash
git add app/lib/ai-client.ts app/api/proxy/route.ts
git commit -m "feat: add universal AI client and edge proxy"
```

---

### Task 4: AI Settings UI

**Files:**
- Create: `app/components/Settings/AISettingsModal.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the Settings Modal UI**

```tsx
// app/components/Settings/AISettingsModal.tsx
// Implement the form using the design from brainstorming:
// Fields: Provider (Select), BaseURL (Input), API Key (Input Password), Model ID (Input)
// Button: "Test & Save"
```

- [ ] **Step 2: Add Settings trigger to Header**

```tsx
// app/page.tsx
// Add a "Settings" icon button next to "Export Data"
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Settings/AISettingsModal.tsx app/page.tsx
git commit -m "feat: add AI settings UI"
```

---

### Task 5: AI Auto-Categorization

**Files:**
- Create: `app/hooks/useCategorySuggestion.ts`
- Modify: `app/components/Filters/ExpenseForm.tsx`

- [ ] **Step 1: Implement the suggestion hook**

```typescript
// app/hooks/useCategorySuggestion.ts
// Use callAI to send: 
// System: "You are a categorizer. Valid categories: [list]. Return ONLY the category name."
// User: "Category for: Uber ride"
```

- [ ] **Step 2: Update ExpenseForm to show suggestion**

```tsx
// app/components/Filters/ExpenseForm.tsx
// Watch description field, call useCategorySuggestion, show clickable chip.
```

- [ ] **Step 3: Commit**

```bash
git add app/hooks/useCategorySuggestion.ts app/components/Filters/ExpenseForm.tsx
git commit -m "feat: implement AI auto-categorization"
```

---

### Task 4: AI Insights Panel

**Files:**
- Create: `app/components/Dashboard/AIInsights.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement data aggregation and insights logic**

```tsx
// app/components/Dashboard/AIInsights.tsx
// Summarize expenses by category for the last month.
// Prompt AI: "Analyze this spending: [summary]. Provide 2-3 short insights."
```

- [ ] **Step 2: Add Insights Panel to Dashboard**

```tsx
// app/page.tsx
// Place <AIInsights /> above the charts.
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Dashboard/AIInsights.tsx app/page.tsx
git commit -m "feat: add AI insights dashboard panel"
```
