import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, pax, state } = body;

    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'packageId is required for quote calculation' },
        { status: 400 }
      );
    }

    return await proxyToBackend({
      path: '/api/bookings/quote',
      method: 'POST',
      body: {
        packageId,
        pax: Number(pax) || 1,
        state: state || 'Gujarat'
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid quote request payload' },
      { status: 400 }
    );
  }
}
