import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, destination, travelDate, travelers, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !destination || !travelDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, email, phone, destination, travelDate)' },
        { status: 400 }
      );
    }

    return await proxyToBackend({
      path: '/api/bookings/contact',
      method: 'POST',
      body: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        destination: String(destination).trim(),
        message: `Travel Date: ${travelDate}, Travelers: ${travelers || 1}. Notes: ${message ? String(message).trim() : ''}`
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid contact request payload.' },
      { status: 400 }
    );
  }
}

