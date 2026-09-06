import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId query parameter is required.' },
        { status: 400 }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || (!isProd ? 'http://localhost:5000' : null);

    if (isProd && !backendUrl) {
      return NextResponse.json(
        { success: false, error: 'Configuration Error: Production backend API URL is not configured.' },
        { status: 500 }
      );
    }

    try {
      const res = await fetch(`${backendUrl}/api/payments/status/${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data.message || 'Failed to retrieve payment status' },
          { status: res.status }
        );
      }

      return NextResponse.json(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Backend payment service unavailable';
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
