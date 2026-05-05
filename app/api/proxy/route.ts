import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ALLOWED_DOMAINS = [
  'api.anthropic.com',
  'openrouter.ai',
  'api.openai.com',
];

export async function POST(req: NextRequest) {
  try {
    const { url, method = 'POST', headers = {}, body } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Security: Validate target URL domain
    try {
      const targetUrl = new URL(url);
      if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
        return NextResponse.json(
          { error: `Domain ${targetUrl.hostname} is not whitelisted` },
          { status: 403 }
        );
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        'User-Agent': 'ExpenseTrackerAI/1.0',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { text: await response.text() };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
