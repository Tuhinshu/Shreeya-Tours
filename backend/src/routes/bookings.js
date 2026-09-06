const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { getPackageById, calculatePackageQuote } = require('../data/packages');
const { INDIAN_STATES, normalizeIndianState } = require('../data/indianStates');
const {
  saveBooking,
  getBookings,
  getBookingById,
  saveContact,
  getContacts,
  recordNotificationLog
} = require('../utils/db');
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
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > 30000) {
      recentSubmissions.delete(key);
    }
  }
}, 60000);
if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/**
 * Authentication Middleware for protected admin routes
 * Strictly requires environment variable ADMIN_API_KEY with no hardcoded fallback.
 */
/**
 * Authentication Middleware for protected admin routes
 * Strictly requires environment variable ADMIN_API_KEY with constant-time comparison to prevent timing attacks.
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

  let isValid = false;
  if (providedKey) {
    const keyBuf = Buffer.from(String(providedKey));
    const expectedBuf = Buffer.from(String(adminApiKey));
    isValid = (keyBuf.length === expectedBuf.length) && crypto.timingSafeEqual(keyBuf, expectedBuf);
  }

  if (!isValid) {
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
 * Helper: Executes an asynchronous operation with strict retry count and exponential backoff
 */
async function executeWithRetry(operation, maxRetries = 2, initialDelayMs = 500) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt <= maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Sanitizes external provider error details to prevent leaking tokens or payload bodies into logs
 */
function sanitizeProviderError(err) {
  return {
    message: err.message || 'Provider communication error',
    statusCode: err.response?.status || null,
    statusText: err.response?.statusText || null,
    errorCode: err.code || null
  };
}

/**
 * Helper: Sends SendGrid Transactional Email with output HTML-escaped fields, 5s timeout, and retry flow
 */
async function sendTransactionalEmail(booking) {
  if (!SENDGRID_API_KEY) {
    console.log(`✉️ [Mock SendGrid] Transactional email queued for booking: ${booking.id}`);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'EMAIL',
      recipient: booking.email,
      status: 'QUEUED_MOCK'
    });
    return;
  }

  const safeName = escapeHtml(booking.name);
  const safePackage = escapeHtml(booking.packageName);
  const safeDate = escapeHtml(booking.travelDate);
  const safeState = escapeHtml(booking.customerState);
  const safePhone = escapeHtml(booking.phone);
  const safeInvoiceDate = escapeHtml(booking.invoiceDate);
  const safeSpecialRequests = booking.specialRequests ? escapeHtml(booking.specialRequests) : 'None';

  try {
    await executeWithRetry(() =>
      axios.post(
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
                  <li>Special Notes: ${safeSpecialRequests}</li>
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
          },
          timeout: 5000 // 5-second strict timeout
        }
      )
    );
    console.log(`✉️ Live SendGrid email dispatched for booking ${booking.id}`);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'EMAIL',
      recipient: booking.email,
      status: 'SENT'
    });
  } catch (error) {
    const sanitized = sanitizeProviderError(error);
    console.error('[SendGrid Dispatch Error]', sanitized);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'EMAIL',
      recipient: booking.email,
      status: 'FAILED',
      errorMessage: `${sanitized.message} (status: ${sanitized.statusCode})`
    });
  }
}

/**
 * Helper: Sends automated WhatsApp confirmation message using WATI with 5s timeout and retry flow
 */
async function sendWhatsAppNotification(booking) {
  if (!WATI_API_URL || !WATI_ACCESS_TOKEN) {
    console.log(`💬 [Mock WATI WhatsApp] Confirmation queued for booking: ${booking.id}`);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'WHATSAPP',
      recipient: booking.phone,
      status: 'QUEUED_MOCK'
    });
    return;
  }

  try {
    await executeWithRetry(() =>
      axios.post(
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
          },
          timeout: 5000 // 5-second strict timeout
        }
      )
    );
    console.log(`💬 Live WATI WhatsApp broadcast dispatched for booking ${booking.id}`);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'WHATSAPP',
      recipient: booking.phone,
      status: 'SENT'
    });
  } catch (error) {
    const sanitized = sanitizeProviderError(error);
    console.error('[WATI Dispatch Error]', sanitized);
    await recordNotificationLog({
      referenceId: booking.id,
      notificationType: 'WHATSAPP',
      recipient: booking.phone,
      status: 'FAILED',
      errorMessage: `${sanitized.message} (status: ${sanitized.statusCode})`
    });
  }
}

/**
 * Endpoint: POST /api/bookings/quote
 * Description: Calculates authoritative server quote with GST based on packageId and pax.
 * Strictly validates pax integer and normalized Indian state.
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

    // Strict numeric pax validation: reject malformed strings like '2abc' or '1.5'
    if (typeof pax !== 'number' && (typeof pax !== 'string' || !/^\d+$/.test(String(pax).trim()))) {
      return res.status(400).json({ success: false, message: 'Passenger count (pax) must be a positive integer.' });
    }

    const parsedPax = Number(pax);
    if (!Number.isInteger(parsedPax) || parsedPax < 1 || parsedPax > 20) {
      return res.status(400).json({ success: false, message: 'Passenger count (pax) must be between 1 and 20.' });
    }

    // Controlled state validation
    let normalizedState = 'Gujarat';
    if (state) {
      normalizedState = normalizeIndianState(state);
      if (!normalizedState) {
        return res.status(400).json({ success: false, message: 'Invalid Indian state or union territory.' });
      }
    }

    const quote = calculatePackageQuote(packageId, parsedPax, normalizedState);

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

    // 5. Strict Date Validation: Exact YYYY-MM-DD regex and calendar existence check
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (typeof travelDate !== 'string' || !dateRegex.test(travelDate.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travelDate format. Expected YYYY-MM-DD.'
      });
    }

    const [year, month, day] = travelDate.trim().split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() + 1 !== month || parsedDate.getUTCDate() !== day) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travelDate: not a real calendar date.'
      });
    }

    const today = new Date();
    const minAllowedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const maxAllowedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
    const travelDateObj = new Date(year, month - 1, day);

    if (travelDateObj < minAllowedDate) {
      return res.status(400).json({
        success: false,
        message: 'Travel date must be in the future (minimum 1 day in advance).'
      });
    }
    if (travelDateObj > maxAllowedDate) {
      return res.status(400).json({
        success: false,
        message: 'Travel date cannot exceed the 60-day booking window.'
      });
    }

    // 6. Strict Passenger Limit Validation: reject malformed numeric inputs
    if (typeof pax !== 'number' && (typeof pax !== 'string' || !/^\d+$/.test(String(pax).trim()))) {
      return res.status(400).json({
        success: false,
        message: 'pax must be an integer between 1 and 20.'
      });
    }

    const adultCount = Number(pax);
    if (!Number.isInteger(adultCount) || adultCount < 1 || adultCount > 20) {
      return res.status(400).json({
        success: false,
        message: 'pax must be an integer between 1 and 20.'
      });
    }

    // 7. Controlled State Validation
    let customerState = 'Gujarat';
    if (state) {
      const normalized = normalizeIndianState(state);
      if (!normalized) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Indian state or union territory.'
        });
      }
      customerState = normalized;
    }

    // 8. Authoritative Package Resolution
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: `Unknown or invalid package ID: ${packageId}`
      });
    }

    // 9. Idempotency Check: prevent double submissions within 30 seconds
    const idempotencyKey = `${trimmedEmail}:${pkg.id}:${travelDate.trim()}`;
    if (recentSubmissions.has(idempotencyKey)) {
      return res.status(409).json({
        success: false,
        message: 'A booking enquiry for this package and date was just received. Please wait before resubmitting.'
      });
    }
    recentSubmissions.set(idempotencyKey, Date.now());

    // 10. Authoritative Server-Side Quote Calculation
    const quote = calculatePackageQuote(pkg.id, adultCount, customerState);

    // 11. Generate Collision-Resistant Server-Side ID
    const bookingId = `BK_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

    // 12. Store Validated Plain Text in specialRequests (avoid pre-escaping to prevent mixing storage and presentation)
    const plainSpecialRequests = specialRequests
      ? String(specialRequests).trim().slice(0, 500)
      : null;

    const newBooking = {
      id: bookingId,
      packageId: pkg.id,
      packageName: pkg.name,
      name: trimmedName,
      email: trimmedEmail,
      phone: cleanedPhone,
      travelDate: travelDate.trim(),
      pax: adultCount,
      specialRequests: plainSpecialRequests,
      baseAmount: quote.baseAmount,
      gstAmount: quote.gstAmount,
      gstRate: quote.gstRate,
      totalAmount: quote.totalAmount,
      taxDetails: quote.taxDetails,
      customerState: quote.customerState,
      state: quote.customerState,
      officeState: quote.officeState,
      invoiceDate: quote.invoiceDate,
      status: 'PENDING_PAYMENT'
    };

    // Persist to authoritative datastore
    await saveBooking(newBooking);

    // Redacted PII Logging
    console.info(`[Booking Created] ID: ${bookingId} | Package: ${pkg.id} | Amount: ₹${quote.totalAmount} | Status: PENDING_PAYMENT`);

    // Asynchronously dispatch confirmations with durable logging
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
        customerState: newBooking.customerState,
        state: newBooking.customerState,
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
      message: message ? String(message).trim().slice(0, 1000) : '',
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
 * Description: Lists registered enquiries with server-side pagination (PROTECTED - Requires ADMIN_API_KEY)
 */
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 20), 100);
    const status = req.query.status ? String(req.query.status).trim() : null;

    const bookings = await getBookings({ page, limit, status });

    res.json({
      success: true,
      total: bookings.pagination?.total ?? bookings.length,
      page: bookings.pagination?.page ?? page,
      limit: bookings.pagination?.limit ?? limit,
      totalPages: bookings.pagination?.totalPages ?? 1,
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
 * Description: Lists all contact inquiries with pagination (PROTECTED - Requires ADMIN_API_KEY)
 */
router.get('/contacts', requireAdminAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 20), 100);

    const contacts = await getContacts({ page, limit });

    res.json({
      success: true,
      total: contacts.pagination?.total ?? contacts.length,
      page: contacts.pagination?.page ?? page,
      limit: contacts.pagination?.limit ?? limit,
      totalPages: contacts.pagination?.totalPages ?? 1,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
