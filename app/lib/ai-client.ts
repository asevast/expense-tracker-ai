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
