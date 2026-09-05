import { NextResponse } from 'next/server';

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

    // Clean and validate phone number
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-13 digit phone number' },
        { status: 400 }
      );
    }

    const enquiryId = `ENQ-${Date.now().toString(36).toUpperCase()}`;

    const enquiryRecord = {
      id: enquiryId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      destination,
      travelDate,
      travelers: Number(travelers) || 1,
      message: message?.trim() || '',
      submittedAt: new Date().toISOString()
    };

    console.info(`[Contact Enquiry Received] ID: ${enquiryId} | Client: ${enquiryRecord.name} | Dest: ${destination}`);

    return NextResponse.json({
      success: true,
      message: 'Contact enquiry submitted successfully',
      enquiryId
    });

  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing contact enquiry' },
      { status: 500 }
    );
  }
}
