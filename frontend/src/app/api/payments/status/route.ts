import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId query parameter is required.' },
        { status: 400 }
      );
    }

    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    const headers: Record<string, string> = {};
    if (token) {
      headers['x-order-token'] = token;
    }

    return await proxyToBackend({
      path: `/api/payments/status/${encodeURIComponent(orderId)}${tokenQuery}`,
      method: 'GET',
      headers
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}

