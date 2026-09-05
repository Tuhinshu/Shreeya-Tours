const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { getBookingById, updateBookingStatus, savePayment, getPaymentByOrderId, updatePaymentStatus } = require('../utils/db');

// CashFree API Configs
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox';

const CASHFREE_BASE_URL = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

/**
 * Endpoint: POST /api/payments/create-order
 * Description: Initiates a payment session using authoritative server-side pricing from the booking record.
 * Never accepts price, total amount, or order ID from the client.
 */
router.post('/create-order', async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required to initiate a payment order.'
      });
    }

    // Retrieve authoritative booking from database
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found for ID: ${bookingId}`
      });
    }

    if (booking.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid and confirmed.'
      });
    }

    // Generate secure server-side order ID (never trust client orderId)
    const serverOrderId = `CF_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const paymentId = `PAY_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    const authoritativeAmount = booking.totalAmount;

    // Handle missing production credentials
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Payment Error] CashFree credentials missing in production.');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway configuration error.'
        });
      }

      // Mock session for local development / test
      console.warn('⚠️ CashFree API credentials missing. Initiating MOCK payment session.');
      const mockSessionId = `mock_session_${Date.now()}`;

      await savePayment({
        id: paymentId,
        bookingId: booking.id,
        cfOrderId: serverOrderId,
        paymentSessionId: mockSessionId,
        amount: authoritativeAmount,
        currency: 'INR',
        status: 'PENDING'
      });

      return res.status(200).json({
        success: true,
        mode: 'MOCK',
        paymentSessionId: mockSessionId,
        orderId: serverOrderId,
        amount: authoritativeAmount,
        currency: 'INR'
      });
    }

    // Call live/sandbox CashFree Orders API
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: serverOrderId,
        order_amount: authoritativeAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${booking.phone.replace(/[^0-9]/g, '')}`,
          customer_name: booking.name,
          customer_email: booking.email,
          customer_phone: booking.phone
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/callback?order_id={order_id}`
        }
      },
      {
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      }
    );

    await savePayment({
      id: paymentId,
      bookingId: booking.id,
      cfOrderId: serverOrderId,
      paymentSessionId: response.data.payment_session_id,
      amount: authoritativeAmount,
      currency: 'INR',
      status: 'PENDING'
    });

    console.info(`[Payment Order Created] OrderID: ${serverOrderId} | BookingID: ${booking.id} | Amount: ₹${authoritativeAmount}`);

    return res.status(200).json({
      success: true,
      mode: 'LIVE',
      paymentSessionId: response.data.payment_session_id,
      orderId: serverOrderId,
      amount: authoritativeAmount,
      currency: 'INR'
    });

  } catch (error) {
    console.error('[Payment Create-Order Error]', error.response?.data || error.message);
    next(error);
  }
});

/**
 * Endpoint: POST /api/payments/webhook
 * Description: CashFree webhook with signature verification, replay protection, and booking state transitions.
 */
router.post('/webhook', async (req, res) => {
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  // Never silently skip verification in production
  if (!secretKey) {
    console.error('[Webhook Rejected] CASHFREE_SECRET_KEY is missing. Webhook verification cannot be performed.');
    return res.status(500).json({
      success: false,
      message: 'Payment gateway secret not configured'
    });
  }

  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  if (!signature) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing x-webhook-signature header'
    });
  }

  if (!timestamp) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Missing x-webhook-timestamp header for replay protection'
    });
  }

  // Replay Protection: Validate timestamp against a 300-second (5 min) tolerance window
  const now = Date.now();
  let parsedTimestamp = Number(timestamp);
  if (isNaN(parsedTimestamp)) {
    parsedTimestamp = new Date(timestamp).getTime();
  }

  if (isNaN(parsedTimestamp) || Math.abs(now - parsedTimestamp) > 300000) {
    console.warn(`[Webhook Replay Detected] Expired timestamp: ${timestamp} (server time: ${now})`);
    return res.status(400).json({
      success: false,
      message: 'Webhook request rejected: timestamp expired or outside allowed tolerance window.'
    });
  }

  // HMAC-SHA256 Signature Verification
  try {
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    const signaturePayload = `${timestamp}${rawBody}`;

    const expectedSignatureBase64 = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('base64');

    const expectedSignatureHex = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('hex');

    // Also support rawBody-only signature scheme
    const rawExpectedBase64 = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('base64');

    const rawExpectedHex = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex');

    const isValid = (
      signature === expectedSignatureBase64 ||
      signature === expectedSignatureHex ||
      signature === rawExpectedBase64 ||
      signature === rawExpectedHex
    );

    if (!isValid) {
      console.warn('[Webhook Invalid Signature] Verification failed for signature payload.');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid webhook signature'
      });
    }
  } catch (err) {
    console.error('[Webhook Verification Error]', err.message);
    return res.status(400).json({
      success: false,
      message: 'Signature verification processing failed'
    });
  }

  // Authoritative State Transition & Reconciliation
  try {
    const payload = req.body || {};
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = orderData.order_id || payload.order_id;
    const paymentStatus = paymentData.payment_status || payload.type || 'UNKNOWN';
    const cfPaymentId = paymentData.cf_payment_id || payload.cf_payment_id || null;
    const paymentMethod = paymentData.payment_method ? JSON.stringify(paymentData.payment_method) : null;

    if (!orderId) {
      console.warn('[Webhook Notice] No order_id found in webhook payload');
      return res.status(200).json({ status: 'IGNORED_NO_ORDER_ID' });
    }

    const paymentRecord = await getPaymentByOrderId(orderId);

    // Map CashFree status to internal states
    let newBookingStatus = null;
    let paymentDbStatus = 'PENDING';

    const upperStatus = String(paymentStatus).toUpperCase();
    if (upperStatus === 'SUCCESS' || upperStatus === 'PAYMENT_SUCCESS') {
      paymentDbStatus = 'SUCCESS';
      newBookingStatus = 'PAID';
    } else if (upperStatus === 'FAILED' || upperStatus === 'PAYMENT_FAILED' || upperStatus === 'USER_DROPPED' || upperStatus === 'CANCELLED') {
      paymentDbStatus = 'FAILED';
      newBookingStatus = 'PAYMENT_FAILED';
    }

    // Idempotency check: if payment already resolved to final state, do not repeat side effects
    if (paymentRecord && (paymentRecord.status === 'SUCCESS' || paymentRecord.status === 'PAID')) {
      console.info(`[Webhook Idempotent] Order ${orderId} already processed as PAID.`);
      return res.status(200).json({ status: 'ALREADY_PROCESSED' });
    }

    // Update payment record in database
    await updatePaymentStatus(orderId, paymentDbStatus, cfPaymentId, paymentMethod, payload);

    // Update associated booking state if linked
    if (paymentRecord && paymentRecord.bookingId && newBookingStatus) {
      await updateBookingStatus(paymentRecord.bookingId, newBookingStatus);
      console.info(`[Booking State Transition] Booking: ${paymentRecord.bookingId} ➔ ${newBookingStatus} (Order: ${orderId})`);
    }

    return res.status(200).json({
      status: 'ACKNOWLEDGED',
      orderId,
      state: paymentDbStatus
    });

  } catch (err) {
    console.error('[Webhook Processing Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment status update'
    });
  }
});

module.exports = router;
