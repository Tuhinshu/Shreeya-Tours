const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateGST } = require('../utils/gstInvoice');

// Env configs for SendGrid and WATI
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_FROM_EMAIL || 'shreeyatours19@gmail.com';
const WATI_API_URL = process.env.WATI_API_URL;
const WATI_ACCESS_TOKEN = process.env.WATI_ACCESS_TOKEN;

// Local in-memory store for bookings/enquiries (simulate database)
const bookingsDb = [];

/**
 * Helper: Sends SendGrid Transactional Email
 */
async function sendTransactionalEmail(booking) {
  if (!SENDGRID_API_KEY) {
    console.log(`✉️ [Mock SendGrid] Transactional invoice sent to: ${booking.email}`);
    return;
  }

  try {
    // Send API call to SendGrid
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
              <p>Hi ${booking.name},</p>
              <p>Your enquiry for <strong>${booking.packageName}</strong> starting on ${booking.travelDate} has been registered.</p>
              <h3>GST-Compliant B2C Invoice Summary</h3>
              <ul>
                <li>Base Amount: ₹${booking.baseAmount.toLocaleString('en-IN')}</li>
                <li>GST Calculated: ₹${booking.gstAmount.toLocaleString('en-IN')} (Rate: ${booking.gstRate}%)</li>
                <li><strong>Grand Total: ₹${booking.totalAmount.toLocaleString('en-IN')}</strong></li>
              </ul>
              <p>Billing State: ${booking.customerState} | Invoice Date: ${booking.invoiceDate}</p>
              <p>We will contact you shortly on ${booking.phone} to finalize the arrangements.</p>
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
    // Dispatch template message via WATI api endpoint
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
 * Description: Submits a travel booking enquiry, runs B2C GST math, and fires notifications
 */
router.post('/enquire', async (req, res, next) => {
  try {
    const { name, email, phone, state, travelDate, adults, children, infants, packageName, basePrice, gstType } = req.body;

    if (!name || !email || !phone || !travelDate || !packageName || !basePrice || !gstType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Determine base rate based on adults and children (children charged 50% base rate)
    const baseAmountSum = (basePrice * parseInt(adults)) + (basePrice * 0.5 * parseInt(children));
    
    // Perform robust GST calculations
    const gstBreakdown = calculateGST(baseAmountSum, gstType, state);

    const newBooking = {
      id: `BK-${Date.now()}`,
      name,
      email,
      phone,
      travelDate,
      adults: parseInt(adults),
      children: parseInt(children),
      infants: parseInt(infants),
      packageName,
      baseAmount: gstBreakdown.baseAmount,
      gstAmount: gstBreakdown.gstAmount,
      gstRate: gstBreakdown.gstRate * 100,
      totalAmount: gstBreakdown.totalAmount,
      taxDetails: gstBreakdown.taxDetails,
      customerState: state,
      officeState: gstBreakdown.officeState,
      invoiceDate: gstBreakdown.invoiceDate,
      status: 'PENDING_PAYMENT'
    };

    bookingsDb.push(newBooking);

    // Trigger background notifications asynchronously
    sendTransactionalEmail(newBooking);
    sendWhatsAppNotification(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Booking enquiry captured successfully',
      booking: newBooking
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint: GET /api/bookings
 * Description: Lists all registered enquiries
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: bookingsDb.length,
    bookings: bookingsDb
  });
});

module.exports = router;
