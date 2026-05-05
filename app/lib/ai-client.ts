import { AIConfig, AIMessage } from '@/app/types';

export async function callAI(config: AIConfig, messages: AIMessage[]) {
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
    
    // Anthropic handles system messages as a top-level parameter
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    body = {
      model: config.modelId,
      messages: userMessages,
      max_tokens: 1024,
      ...(systemMessage && { system: systemMessage.content })
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

  const result = await response.json();
  
  // Normalize response
  if (isAnthropic) {
    const text = result.content?.[0]?.text;
    if (typeof text !== 'string') {
      throw new Error('Invalid AI response format: missing content text');
    }
    return { content: text };
  } else {
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid AI response format: missing choices content');
    }
    return { content };
  }
}
