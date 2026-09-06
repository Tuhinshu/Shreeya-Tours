import { NextResponse } from 'next/server';

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

      const res = await fetch(`${backendUrl}/api/bookings/enquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          state: state || 'Gujarat',
          travelDate,
          pax: Number(pax) || 1,
          packageId,
          specialRequests: specialRequests ? String(specialRequests).trim() : null
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data.message || 'Booking submission rejected by server' },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Booking enquiry submitted and persisted successfully',
        bookingId: data.bookingId,
        booking: data.booking
      });

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Backend booking service unavailable';
      console.error('[Booking Backend Error]', errMsg);
      return NextResponse.json(
        { success: false, error: 'The booking service is currently unreachable. Please try again or reach out on WhatsApp.' },
        { status: 502 }
      );
    }

  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid booking request payload.' },
      { status: 400 }
    );
  }
}
