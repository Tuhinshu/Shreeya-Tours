const express = require('express');
const router = express.Router();
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { calculateGST } = require('../utils/gstInvoice');
const { saveBooking, getBookings, saveContact, getContacts } = require('../utils/db');
const { escapeHtml } = require('../utils/escapeHtml');

// Env configs for SendGrid and WATI
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_FROM_EMAIL || 'shreeyatours19@gmail.com';
const WATI_API_URL = process.env.WATI_API_URL;
const WATI_ACCESS_TOKEN = process.env.WATI_ACCESS_TOKEN;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'shreeya-admin-secret-2026';

// Stricter rate limiter for enquiry submissions: max 20 requests per 15 mins
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this IP, please try again later.'
  }
});

/**
 * Authentication Middleware for protected admin routes
 */
function requireAdminAuth(req, res, next) {
  const providedKey = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!providedKey || providedKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API key'
    });
  }
  next();
}

/**
 * Helper: Sends SendGrid Transactional Email with HTML-escaped fields
 */
async function sendTransactionalEmail(booking) {
  if (!SENDGRID_API_KEY) {
    console.log(`✉️ [Mock SendGrid] Transactional invoice sent to: ${booking.email}`);
    return;
  }

  // HTML-escape user inputs to prevent HTML injection
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
    console.log(`✉️ Live SendGrid email sent successfully to ${booking.email}`);
  } catch (error) {
    console.error('SendGrid SMTP Mail Error:', error.response?.data || error.message);
  }
}

/**
 * Helper: Sends automated WhatsApp confirmation message using WATI
 */
async function sendWhatsAppNotification(booking) {
  if (!WATI_API_URL || !WATI_ACCESS_TOKEN) {
    console.log(`💬 [Mock WATI WhatsApp] Confirmation template dispatched to: ${booking.phone}`);
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
    console.log(`💬 Live WATI WhatsApp broadcast sent successfully to ${booking.phone}`);
  } catch (error) {
    console.error('WATI API Error:', error.response?.data || error.message);
  }
}

/**
 * Endpoint: POST /api/bookings/enquire
 * Description: Submits a travel booking enquiry, runs B2C GST math, persists to datastore, and fires notifications
 */
router.post('/enquire', enquiryLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, state, travelDate, adults, children, infants, packageName, basePrice, gstType } = req.body;

    if (!name || !email || !phone || !travelDate || !packageName || !basePrice || !gstType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Determine base rate based on adults and children (children charged 50% base rate)
    const adultCount = Math.max(1, parseInt(adults, 10) || 1);
    const childCount = Math.max(0, parseInt(children, 10) || 0);
    const infantCount = Math.max(0, parseInt(infants, 10) || 0);
    const parsedBasePrice = parseFloat(basePrice) || 0;

    const baseAmountSum = (parsedBasePrice * adultCount) + (parsedBasePrice * 0.5 * childCount);
    
    // Perform robust GST calculations
    const gstBreakdown = calculateGST(baseAmountSum, gstType, state || 'Delhi');

    const newBooking = {
      id: `BK-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      travelDate: String(travelDate).trim(),
      adults: adultCount,
      children: childCount,
      infants: infantCount,
      packageName: String(packageName).trim(),
      baseAmount: gstBreakdown.baseAmount,
      gstAmount: gstBreakdown.gstAmount,
      gstRate: gstBreakdown.gstRate * 100,
      totalAmount: gstBreakdown.totalAmount,
      taxDetails: gstBreakdown.taxDetails,
      customerState: state || 'Delhi',
      officeState: gstBreakdown.officeState,
      invoiceDate: gstBreakdown.invoiceDate,
      status: 'PENDING_PAYMENT'
    };

    // Persist to database/JSON file
    await saveBooking(newBooking);

    // Trigger background notifications asynchronously
    sendTransactionalEmail(newBooking);
    sendWhatsAppNotification(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Booking enquiry captured and persisted successfully',
      booking: newBooking
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: POST /api/bookings/contact
 * Description: Submits a general contact/inquiry form and persists to datastore
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

    const contactEntry = {
      id: `CT-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      destination: destination ? String(destination).trim() : 'General Enquiry',
      message: message ? String(message).trim() : '',
      createdAt: new Date().toISOString()
    };

    await saveContact(contactEntry);

    return res.status(201).json({
      success: true,
      message: 'Contact enquiry captured and persisted successfully',
      contact: contactEntry
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: GET /api/bookings
 * Description: Lists all registered enquiries (PROTECTED - Requires API Key)
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
 * Endpoint: GET /api/bookings/contacts
 * Description: Lists all contact inquiries (PROTECTED - Requires API Key)
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

