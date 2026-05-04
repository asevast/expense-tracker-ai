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
