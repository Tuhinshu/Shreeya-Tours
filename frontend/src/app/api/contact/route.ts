import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/config/site';
import { persistContact } from '@/utils/localStore';

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
      destination: destination.trim(),
      travelDate,
      travelers: Number(travelers) || 1,
      message: message?.trim() || '',
      submittedAt: new Date().toISOString()
    };

    // 1. Guaranteed local persistence
    persistContact(enquiryRecord);
    console.info(`[Contact Enquiry Persisted] ID: ${enquiryId} | Client: ${enquiryRecord.name} | Dest: ${destination}`);

    // 2. Forward to Express backend API if configured
    let backendSynced = false;
    if (SITE_CONFIG.apiUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${SITE_CONFIG.apiUrl}/api/bookings/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: enquiryRecord.name,
            email: enquiryRecord.email,
            phone: enquiryRecord.phone,
            destination: enquiryRecord.destination,
            message: `Travel Date: ${travelDate}, Travelers: ${travelers}. Notes: ${enquiryRecord.message}`
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          backendSynced = true;
          console.info(`[Contact Backend Forwarded] Successfully synced with Express backend`);
        }
      } catch (err: any) {
        console.warn(`[Contact Backend Notice] Backend sync bypassed: ${err?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contact enquiry submitted and persisted successfully',
      enquiryId,
      backendSynced
    });

  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing contact enquiry' },
      { status: 500 }
    );
  }
}

