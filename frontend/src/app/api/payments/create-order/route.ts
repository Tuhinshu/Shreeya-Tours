import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required to create a payment order.' },
        { status: 400 }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || (!isProd ? 'http://localhost:5000' : null);

    if (isProd && !backendUrl) {
      console.error('[Config Error] NEXT_PUBLIC_API_URL is missing in production.');
      return NextResponse.json(
        { success: false, error: 'Configuration Error: Production backend API URL is not configured.' },
        { status: 500 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data.message || 'Failed to create payment order' },
          { status: res.status }
        );
      }

      return NextResponse.json(data);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Backend payment service unavailable';
      console.error('[Payment Backend Error]', errMsg);
      return NextResponse.json(
        { success: false, error: 'The payment gateway service is currently unreachable. Please try again or reach out on WhatsApp.' },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid payment request payload.' },
      { status: 400 }
    );
  }
}
