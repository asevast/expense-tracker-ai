# Universal AI Client & Edge Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a robust AI client capable of interacting with multiple AI providers (OpenAI, Anthropic, OpenRouter) and an Edge Proxy to handle CORS limitations.

**Architecture:** 
- A Next.js Edge API route (`app/api/proxy/route.ts`) acting as a lightweight proxy.
- A library function `callAI` (`app/lib/ai-client.ts`) that abstracts provider-specific logic and decides when to use the proxy.

**Tech Stack:** Next.js (Edge Runtime), TypeScript, Vitest.

---

### Task 1: Create Edge Proxy for CORS

**Files:**
- Create: `app/api/proxy/route.ts`

- [ ] **Step 1: Create the Edge Proxy Route**
  The proxy should accept POST requests with a target URL, method, headers, and body.

```typescript
// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { url, method = 'POST', headers = {}, body } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/proxy/route.ts
git commit -m "feat: add edge proxy for AI API calls"
```

---

### Task 2: Implement Universal AI Client (TDD)

**Files:**
- Create: `app/lib/ai-client.ts`
- Create: `tests/ai-client.test.ts`

- [ ] **Step 1: Write failing tests for `callAI`**
  Mock the global `fetch` to simulate different responses and verify `callAI` behavior.

```typescript
// tests/ai-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callAI } from '../app/lib/ai-client';
import { AIConfig } from '../app/types';

describe('callAI', () => {
  const mockConfig: AIConfig = {
    enabled: true,
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'test-key',
    modelId: 'gpt-4',
  };

  const mockMessages = [{ role: 'user', content: 'hello' }];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call OpenAI directly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hi' } }] }),
    } as Response);

    const result = await callAI(mockConfig, mockMessages);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
        }),
      })
    );
    expect(result.choices[0].message.content).toBe('hi');
  });

  it('should call Anthropic via proxy', async () => {
    const anthropicConfig: AIConfig = {
      ...mockConfig,
      provider: 'anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ text: 'hi' }] }),
    } as Response);

    const result = await callAI(anthropicConfig, mockMessages);

    expect(fetch).toHaveBeenCalledWith(
      '/api/proxy',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('https://api.anthropic.com/v1/messages'),
      })
    );
    expect(result.content[0].text).toBe('hi');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**
  Run: `npm test tests/ai-client.test.ts`
  Expected: FAIL (callAI is not defined)

- [ ] **Step 3: Implement `callAI`**
  Implement provider-specific logic and proxy selection.

```typescript
// app/lib/ai-client.ts
import { AIConfig } from '@/app/types';

export async function callAI(config: AIConfig, messages: any[]) {
  const isAnthropic = config.provider === 'anthropic';
  const isOpenRouter = config.provider === 'openrouter';
  const useProxy = isAnthropic || isOpenRouter;

  let url = '';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let body: any = {};

  if (isAnthropic) {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = {
      model: config.modelId,
      messages,
      max_tokens: 1024,
    };
  } else {
    url = `${config.baseUrl}/chat/completions`;
    headers['Authorization'] = `Bearer ${config.apiKey}`;
    body = {
      model: config.modelId,
      messages,
    };
  }

  const fetchOptions = {
    method: 'POST',
    headers: useProxy ? { 'Content-Type': 'application/json' } : headers,
    body: JSON.stringify(useProxy ? { url, headers, body } : body),
  };

  const response = await fetch(useProxy ? '/api/proxy' : url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.error || `AI API call failed with status ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 4: Run tests to verify pass**
  Run: `npm test tests/ai-client.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai-client.ts tests/ai-client.test.ts
git commit -m "feat: implement universal AI client with provider-specific logic"
```
