import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callAI } from '../app/lib/ai-client';
import { AIConfig, AIMessage } from '../app/types';

describe('callAI', () => {
  const mockConfig: AIConfig = {
    enabled: true,
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'test-key',
    modelId: 'gpt-4',
  };

  const mockMessages: AIMessage[] = [{ role: 'user', content: 'hello' }];

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
    expect(result.content).toBe('hi');
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
    expect(result.content).toBe('hi');
  });

  it('should extract system message for Anthropic', async () => {
    const anthropicConfig: AIConfig = {
      ...mockConfig,
      provider: 'anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
    };

    const messagesWithSystem: AIMessage[] = [
      { role: 'system', content: 'you are a helpful assistant' },
      { role: 'user', content: 'hello' }
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ text: 'hi' }] }),
    } as Response);

    await callAI(anthropicConfig, messagesWithSystem);

    const lastCallBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    const innerBody = lastCallBody.body;

    expect(innerBody.system).toBe('you are a helpful assistant');
    expect(innerBody.messages).toHaveLength(1);
    expect(innerBody.messages[0].role).toBe('user');
  });

  it('should throw error on unexpected OpenAI response structure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'format' }),
    } as Response);

    await expect(callAI(mockConfig, mockMessages)).rejects.toThrow('Invalid AI response format');
  });

  it('should throw error on unexpected Anthropic response structure', async () => {
    const anthropicConfig: AIConfig = {
      ...mockConfig,
      provider: 'anthropic',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'format' }),
    } as Response);

    await expect(callAI(anthropicConfig, mockMessages)).rejects.toThrow('Invalid AI response format');
  });
});
