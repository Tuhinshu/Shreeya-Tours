import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/config/site';

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

    const backendUrl = SITE_CONFIG.apiUrl || 'http://localhost:5000';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${backendUrl}/api/bookings/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          destination: String(destination).trim(),
          message: `Travel Date: ${travelDate}, Travelers: ${travelers || 1}. Notes: ${message ? String(message).trim() : ''}`
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data.message || 'Contact submission rejected by server' },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Contact enquiry submitted and persisted successfully',
        enquiryId: data.contactId
      });

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Backend contact service unavailable';
      console.error('[Contact Backend Error]', errMsg);
      return NextResponse.json(
        { success: false, error: 'The contact service is currently unreachable. Please connect directly via WhatsApp.' },
        { status: 502 }
      );
    }

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Contact API Route Error]', errMsg);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing contact enquiry' },
      { status: 500 }
    );
  }
}
