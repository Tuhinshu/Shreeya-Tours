import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/config/site';
import { persistBooking } from '@/utils/localStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, pax, travelDate, packageId, packageName, basePrice, totalAmount, state } = body;

    // Validate required fields
    if (!name || !email || !phone || !travelDate || !packageName) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (name, email, phone, travelDate, packageName)' },
        { status: 400 }
      );
    }

    // Clean and validate phone number (10 to 13 digits)
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-13 digit phone number' },
        { status: 400 }
      );
    }

    const bookingId = `ST-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingRecord = {
      id: bookingId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      pax: Number(pax) || 1,
      travelDate,
      packageId: packageId || 'custom',
      packageName: packageName.trim(),
      basePrice: Number(basePrice) || 0,
      totalAmount: Number(totalAmount) || (Number(basePrice) * (Number(pax) || 1)),
      customerState: state || 'Gujarat',
      submittedAt: new Date().toISOString(),
      status: 'PENDING_CONFIRMATION'
    };

    // 1. Guaranteed local persistence (never drop a lead)
    persistBooking(bookingRecord);
    console.info(`[Booking Enquiry Persisted] ID: ${bookingId} | Client: ${bookingRecord.name} | Tour: ${packageName}`);

    // 2. Forward to Express backend API if configured
    let backendResponse = null;
    if (SITE_CONFIG.apiUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${SITE_CONFIG.apiUrl}/api/bookings/enquire`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: bookingRecord.name,
            email: bookingRecord.email,
            phone: bookingRecord.phone,
            state: bookingRecord.customerState,
            travelDate: bookingRecord.travelDate,
            adults: bookingRecord.pax,
            children: 0,
            infants: 0,
            packageName: bookingRecord.packageName,
            basePrice: bookingRecord.basePrice,
            gstType: 'standard_tour'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          backendResponse = await res.json();
          console.info(`[Booking Backend Forwarded] Successfully synced with Express backend`);
        } else {
          console.warn(`[Booking Backend Notice] Backend returned status ${res.status}`);
        }
      } catch (err: any) {
        // Backend offline or timeout; local storage already secured
        console.warn(`[Booking Backend Notice] Backend sync bypassed: ${err?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking enquiry submitted and persisted successfully',
      bookingId,
      backendSynced: !!backendResponse?.success,
      details: {
        name: bookingRecord.name,
        packageName: bookingRecord.packageName,
        pax: bookingRecord.pax,
        travelDate: bookingRecord.travelDate,
        invoice: backendResponse?.booking?.totalAmount ? {
          totalAmount: backendResponse.booking.totalAmount,
          gstAmount: backendResponse.booking.gstAmount,
          gstRate: backendResponse.booking.gstRate
        } : undefined
      }
    });

  } catch (error) {
    console.error('[Booking API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing booking' },
      { status: 500 }
    );
  }
}

