import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, pax, travelDate, packageId, specialRequests, state } = body;

    // Validate required fields
    if (!name || !email || !phone || !travelDate || !packageId) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (name, email, phone, travelDate, packageId)' },
        { status: 400 }
      );
    }

    return await proxyToBackend({
      path: '/api/bookings/enquire',
      method: 'POST',
      body: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        state: state || 'Gujarat',
        travelDate,
        pax: Number(pax) || 1,
        packageId,
        specialRequests: specialRequests ? String(specialRequests).trim() : null
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid booking request payload.' },
      { status: 400 }
    );
  }
}

