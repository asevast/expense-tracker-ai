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
