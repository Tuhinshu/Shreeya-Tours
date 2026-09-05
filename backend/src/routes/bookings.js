const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { getPackageById, calculatePackageQuote } = require('../data/packages');
const { saveBooking, getBookings, getBookingById, saveContact, getContacts } = require('../utils/db');
const { escapeHtml } = require('../utils/escapeHtml');

// Env configs for SendGrid and WATI
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_FROM_EMAIL || 'shreeyatours19@gmail.com';
const WATI_API_URL = process.env.WATI_API_URL;
const WATI_ACCESS_TOKEN = process.env.WATI_ACCESS_TOKEN;

// Rate limiter for enquiry submissions: max 30 requests per 15 mins (relaxed in test)
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this IP, please try again later.'
  }
});

// Idempotency cache to prevent rapid duplicate double-submissions (window: 30s)
const recentSubmissions = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > 30000) {
      recentSubmissions.delete(key);
    }
  }
}, 60000);

/**
 * Authentication Middleware for protected admin routes
 * Strictly requires environment variable ADMIN_API_KEY with no hardcoded fallback.
 */
function requireAdminAuth(req, res, next) {
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (!adminApiKey) {
    console.error('[Admin Auth Error] ADMIN_API_KEY environment variable is not configured.');
    return res.status(500).json({
      success: false,
      message: 'Admin access configuration error'
    });
  }

  const providedKey = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!providedKey || providedKey !== adminApiKey) {
    console.warn(`[Admin Access Denied] IP: ${req.ip} | Action: ${req.method} ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API key'
    });
  }

  // Audit log authenticated admin access
  console.info(`[Admin Access Audit] IP: ${req.ip} | Action: ${req.method} ${req.originalUrl} | Time: ${new Date().toISOString()}`);
  next();
}

/**
 * Helper: Sends SendGrid Transactional Email with HTML-escaped fields
 */
async function sendTransactionalEmail(booking) {
  if (!SENDGRID_API_KEY) {
    console.log(`✉️ [Mock SendGrid] Transactional email queued for booking: ${booking.id}`);
    return;
  }

  const safeName = escapeHtml(booking.name);
  const safePackage = escapeHtml(booking.packageName);
  const safeDate = escapeHtml(booking.travelDate);
  const safeState = escapeHtml(booking.customerState);
  const safePhone = escapeHtml(booking.phone);
  const safeInvoiceDate = escapeHtml(booking.invoiceDate);

  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: booking.email }] }],
        from: { email: SENDGRID_SENDER, name: 'Shreeya Tours Bookings' },
        subject: `Booking Enquiry Confirmed - ${booking.packageName}`,
        content: [
          {
            type: 'text/html',
            value: `
              <h2>Thank you for choosing Shreeya Tours!</h2>
              <p>Hi ${safeName},</p>
              <p>Your enquiry for <strong>${safePackage}</strong> starting on ${safeDate} has been registered.</p>
              <h3>GST-Compliant B2C Invoice Summary</h3>
              <ul>
                <li>Base Amount: ₹${booking.baseAmount.toLocaleString('en-IN')}</li>
                <li>GST Calculated: ₹${booking.gstAmount.toLocaleString('en-IN')} (Rate: ${booking.gstRate}%)</li>
                <li><strong>Grand Total: ₹${booking.totalAmount.toLocaleString('en-IN')}</strong></li>
              </ul>
              <p>Billing State: ${safeState} | Invoice Date: ${safeInvoiceDate}</p>
              <p>We will contact you shortly on ${safePhone} to finalize the arrangements.</p>
            `
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✉️ Live SendGrid email dispatched for booking ${booking.id}`);
  } catch (error) {
    console.error('SendGrid SMTP Mail Error:', error.response?.data || error.message);
  }
}

/**
 * Helper: Sends automated WhatsApp confirmation message using WATI
 */
async function sendWhatsAppNotification(booking) {
  if (!WATI_API_URL || !WATI_ACCESS_TOKEN) {
    console.log(`💬 [Mock WATI WhatsApp] Confirmation queued for booking: ${booking.id}`);
    return;
  }

  try {
    await axios.post(
      `${WATI_API_URL}/api/v1/sendTemplateMessage`,
      {
        templateName: 'booking_confirmation_v1',
        receiverNumber: booking.phone,
        broadcastName: `Booking_${booking.id}`,
        parameters: [
          { name: 'customer_name', value: booking.name },
          { name: 'tour_name', value: booking.packageName },
          { name: 'travel_date', value: booking.travelDate }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${WATI_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`💬 Live WATI WhatsApp broadcast dispatched for booking ${booking.id}`);
  } catch (error) {
    console.error('WATI API Error:', error.response?.data || error.message);
  }
}

/**
 * Endpoint: POST /api/bookings/quote
 * Description: Calculates authoritative server quote with GST based on packageId and pax.
 */
router.post('/quote', (req, res) => {
  try {
    const { packageId, pax, state } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'packageId is required' });
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      return res.status(400).json({ success: false, message: `Unknown tour package: ${packageId}` });
    }

    const parsedPax = parseInt(pax, 10);
    if (isNaN(parsedPax) || parsedPax < 1 || parsedPax > 20) {
      return res.status(400).json({ success: false, message: 'Passenger count (pax) must be between 1 and 20.' });
    }

    const quote = calculatePackageQuote(packageId, parsedPax, state || 'Gujarat');

    return res.status(200).json({
      success: true,
      quote
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * Endpoint: POST /api/bookings/enquire
 * Description: Submits a travel booking enquiry with strict server-side validation and authoritative pricing.
 */
router.post('/enquire', enquiryLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, state, travelDate, pax, packageId, specialRequests } = req.body;

    // 1. Validate required fields
    if (!name || !email || !phone || !travelDate || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking parameters (name, email, phone, travelDate, packageId).'
      });
    }

    // 2. Strict Name Validation (2 to 100 characters, no markup)
    const trimmedName = String(name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 100 || /[<>]/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters and contain no HTML/script markup.'
      });
    }

    // 3. Strict RFC 5322 Email Validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const trimmedEmail = String(email).trim().toLowerCase();
    if (trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 4. Clean and validate phone number (10 to 15 digits)
    const cleanedPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10 to 15 digit phone number.'
      });
    }

    // 5. Server-Side Date Window Validation (Must be between tomorrow and +60 days)
    const inputDate = new Date(travelDate);
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travelDate format. Expected YYYY-MM-DD.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minAllowedDate = new Date(today);
    minAllowedDate.setDate(minAllowedDate.getDate() + 1); // Tomorrow onwards

    const maxAllowedDate = new Date(today);
    maxAllowedDate.setDate(maxAllowedDate.getDate() + 60); // 60 days max

    // Compare date parts only
    const travelDateOnly = new Date(inputDate.toISOString().split('T')[0]);
    if (travelDateOnly < minAllowedDate) {
      return res.status(400).json({
        success: false,
        message: 'Travel date must be in the future (minimum 1 day in advance).'
      });
    }
    if (travelDateOnly > maxAllowedDate) {
      return res.status(400).json({
        success: false,
        message: 'Travel date cannot exceed the 60-day booking window.'
      });
    }

    // 6. Strict Passenger Limit Validation (1 to 20 pax)
    const adultCount = parseInt(pax, 10);
    if (isNaN(adultCount) || adultCount < 1 || adultCount > 20) {
      return res.status(400).json({
        success: false,
        message: 'Passenger count must be an integer between 1 and 20.'
      });
    }

    // 7. Authoritative Package Resolution (Completely ignores client-supplied pricing/packageName)
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: `Unknown or invalid package ID: ${packageId}`
      });
    }

    // 8. Idempotency Check: prevent double submissions within 30 seconds
    const idempotencyKey = `${trimmedEmail}:${pkg.id}:${travelDateOnly.toISOString().split('T')[0]}`;
    if (recentSubmissions.has(idempotencyKey)) {
      return res.status(409).json({
        success: false,
        message: 'A booking enquiry for this package and date was just received. Please wait before resubmitting.'
      });
    }
    recentSubmissions.set(idempotencyKey, Date.now());

    // 9. Authoritative Server-Side Quote Calculation
    const quote = calculatePackageQuote(pkg.id, adultCount, state || 'Gujarat');

    // 10. Generate Collision-Resistant Server-Side ID
    const bookingId = `BK_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

    // Clean special requests
    const safeSpecialRequests = specialRequests
      ? escapeHtml(String(specialRequests).trim().slice(0, 500))
      : null;

    const newBooking = {
      id: bookingId,
      packageId: pkg.id,
      packageName: pkg.name,
      name: trimmedName,
      email: trimmedEmail,
      phone: cleanedPhone,
      travelDate: travelDateOnly.toISOString().split('T')[0],
      pax: adultCount,
      specialRequests: safeSpecialRequests,
      baseAmount: quote.baseAmount,
      gstAmount: quote.gstAmount,
      gstRate: quote.gstRate,
      totalAmount: quote.totalAmount,
      taxDetails: quote.taxDetails,
      customerState: quote.customerState,
      officeState: quote.officeState,
      invoiceDate: quote.invoiceDate,
      status: 'PENDING_PAYMENT'
    };

    // Persist to authoritative datastore
    await saveBooking(newBooking);

    // Redacted PII Logging
    console.info(`[Booking Created] ID: ${bookingId} | Package: ${pkg.id} | Amount: ₹${quote.totalAmount} | Status: PENDING_PAYMENT`);

    // Asynchronously dispatch confirmations
    sendTransactionalEmail(newBooking);
    sendWhatsAppNotification(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Booking enquiry captured and persisted successfully',
      bookingId: newBooking.id,
      booking: {
        id: newBooking.id,
        packageName: newBooking.packageName,
        travelDate: newBooking.travelDate,
        pax: newBooking.pax,
        specialRequests: newBooking.specialRequests,
        baseAmount: newBooking.baseAmount,
        gstAmount: newBooking.gstAmount,
        gstRate: newBooking.gstRate,
        totalAmount: newBooking.totalAmount,
        status: newBooking.status
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: POST /api/bookings/contact
 * Description: Submits a general inquiry form with validation and persistence.
 */
router.post('/contact', enquiryLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, destination, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone number are required.'
      });
    }

    const trimmedName = String(name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 100 || /[<>]/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters and contain no markup.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const trimmedEmail = String(email).trim().toLowerCase();
    if (trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanedPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10 to 15 digit phone number.'
      });
    }

    const contactId = `CT_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

    const contactEntry = {
      id: contactId,
      name: trimmedName,
      email: trimmedEmail,
      phone: cleanedPhone,
      destination: destination ? String(destination).trim().slice(0, 100) : 'General Enquiry',
      message: message ? escapeHtml(String(message).trim().slice(0, 1000)) : '',
      createdAt: new Date().toISOString()
    };

    await saveContact(contactEntry);

    console.info(`[Contact Captured] ID: ${contactId} | Destination: ${contactEntry.destination}`);

    return res.status(201).json({
      success: true,
      message: 'Contact enquiry captured and persisted successfully',
      contactId: contactEntry.id
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: GET /api/bookings
 * Description: Lists all registered enquiries (PROTECTED - Requires ADMIN_API_KEY)
 */
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const bookings = await getBookings();
    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: GET /api/bookings/:id
 * Description: Retrieves booking details by ID (PROTECTED - Requires ADMIN_API_KEY)
 */
router.get('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: GET /api/bookings/contacts
 * Description: Lists all contact inquiries (PROTECTED - Requires ADMIN_API_KEY)
 */
router.get('/contacts', requireAdminAuth, async (req, res, next) => {
  try {
    const contacts = await getContacts();
    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
