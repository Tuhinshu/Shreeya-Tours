import { NextResponse } from 'next/server';

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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/payments/mock-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
