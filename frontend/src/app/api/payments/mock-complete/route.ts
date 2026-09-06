import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Mock payments are disabled in production' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    return await proxyToBackend({
      path: '/api/payments/mock-complete',
      method: 'POST',
      body: { orderId }
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

