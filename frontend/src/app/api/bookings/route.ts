import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, pax, travelDate, packageId, packageName, basePrice, totalAmount } = body;

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
      packageName,
      basePrice: Number(basePrice) || 0,
      totalAmount: Number(totalAmount) || (Number(basePrice) * (Number(pax) || 1)),
      submittedAt: new Date().toISOString(),
      status: 'NEW_ENQUIRY'
    };

    // In server environment, log structured lead
    console.info(`[Booking Enquiry Received] ID: ${bookingId} | Client: ${bookingRecord.name} | Tour: ${packageName} | PAX: ${bookingRecord.pax}`);

    return NextResponse.json({
      success: true,
      message: 'Booking enquiry submitted successfully',
      bookingId,
      details: {
        name: bookingRecord.name,
        packageName: bookingRecord.packageName,
        pax: bookingRecord.pax,
        travelDate: bookingRecord.travelDate
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
