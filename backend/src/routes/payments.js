const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const {
  getBookingById,
  updateBookingStatus,
  savePayment,
  getPaymentByOrderId,
  getActivePaymentByBookingId,
  updatePaymentStatus,
  isWebhookEventProcessed,
  recordProcessedWebhookEvent,
  processPaymentWebhookTransaction,
  verifyPaymentAccessToken
} = require('../utils/db');

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
 * Prevents concurrent duplicate orders for the same booking and generates opaque customer IDs.
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

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate payment for booking in ${booking.status} state.`
      });
    }

    // Check for existing active pending payment order to prevent duplicate active orders
    const existingActivePayment = await getActivePaymentByBookingId(bookingId);
    if (existingActivePayment && existingActivePayment.paymentSessionId) {
      console.info(`[Payment Order Reused] Active order ${existingActivePayment.cfOrderId} reused for booking ${bookingId}`);
      return res.status(200).json({
        success: true,
        mode: existingActivePayment.paymentSessionId.startsWith('mock_') ? 'MOCK' : 'LIVE',
        paymentSessionId: existingActivePayment.paymentSessionId,
        orderId: existingActivePayment.cfOrderId,
        orderToken: existingActivePayment.orderToken,
        amount: Number(existingActivePayment.amount),
        currency: existingActivePayment.currency || 'INR'
      });
    }

    // Generate secure server-side order ID and unguessable access token
    const serverOrderId = `CF_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const paymentId = `PAY_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    const orderToken = crypto.randomBytes(32).toString('hex');
    const authoritativeAmount = booking.totalAmount;

    // Generate opaque customer ID (never expose raw customer phone in provider identifier)
    const opaqueCustomerId = `cust_${crypto.createHash('sha256').update(booking.id + (booking.email || '')).digest('hex').slice(0, 16)}`;

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

      try {
        await savePayment({
          id: paymentId,
          bookingId: booking.id,
          cfOrderId: serverOrderId,
          paymentSessionId: mockSessionId,
          amount: authoritativeAmount,
          currency: 'INR',
          status: 'PENDING',
          orderToken
        });
      } catch (err) {
        // Handle DB-level unique constraint race condition
        if (err.code === '23505' || err.message.includes('one_active_pending')) {
          const active = await getActivePaymentByBookingId(booking.id);
          if (active) {
            return res.status(200).json({
              success: true,
              mode: 'MOCK',
              paymentSessionId: active.paymentSessionId,
              orderId: active.cfOrderId,
              orderToken: active.orderToken,
              amount: Number(active.amount),
              currency: active.currency || 'INR'
            });
          }
        }
        throw err;
      }

      return res.status(200).json({
        success: true,
        mode: 'MOCK',
        paymentSessionId: mockSessionId,
        orderId: serverOrderId,
        orderToken,
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
          customer_id: opaqueCustomerId,
          customer_name: booking.name,
          customer_email: booking.email,
          customer_phone: booking.phone
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/callback?order_id=${serverOrderId}&token=${orderToken}`
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

    try {
      await savePayment({
        id: paymentId,
        bookingId: booking.id,
        cfOrderId: serverOrderId,
        paymentSessionId: response.data.payment_session_id,
        amount: authoritativeAmount,
        currency: 'INR',
        status: 'PENDING',
        orderToken
      });
    } catch (err) {
      if (err.code === '23505' || err.message.includes('one_active_pending')) {
        const active = await getActivePaymentByBookingId(booking.id);
        if (active) {
          return res.status(200).json({
            success: true,
            mode: 'LIVE',
            paymentSessionId: active.paymentSessionId,
            orderId: active.cfOrderId,
            orderToken: active.orderToken,
            amount: Number(active.amount),
            currency: active.currency || 'INR'
          });
        }
      }
      throw err;
    }

    console.info(`[Payment Order Created] OrderID: ${serverOrderId} | BookingID: ${booking.id} | Amount: ₹${authoritativeAmount}`);

    return res.status(200).json({
      success: true,
      mode: 'LIVE',
      paymentSessionId: response.data.payment_session_id,
      orderId: serverOrderId,
      orderToken,
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
 * Description: CashFree webhook with exact signature verification, replay protection,
 * amount/currency reconciliation, durable event deduplication, and single-transaction persistence.
 */
router.post('/webhook', async (req, res) => {
  const secretKey = process.env.CASHFREE_SECRET_KEY;

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

  // Exact HMAC-SHA256 Base64 Signature Verification Scheme
  try {
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    const signaturePayload = `${timestamp}${rawBody}`;

    const expectedSignatureBase64 = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('base64');

    const sigBuf = Buffer.from(String(signature), 'utf8');
    const expectedBuf = Buffer.from(expectedSignatureBase64, 'utf8');

    const isValid = (sigBuf.length === expectedBuf.length) && crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (!isValid) {
      console.warn('[Webhook Invalid Signature] Exact Base64 signature verification failed.');
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

  // Authoritative State Transition & Amount Reconciliation inside single DB transaction
  try {
    const payload = req.body || {};
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = orderData.order_id || payload.order_id;
    const paymentStatus = paymentData.payment_status || payload.type || 'UNKNOWN';
    const cfPaymentId = paymentData.cf_payment_id || payload.cf_payment_id || null;
    const paymentMethod = paymentData.payment_method ? JSON.stringify(paymentData.payment_method) : null;
    const upperStatus = String(paymentStatus).toUpperCase();

    if (!orderId) {
      console.warn('[Webhook Notice] No order_id found in webhook payload');
      return res.status(200).json({ status: 'IGNORED_NO_ORDER_ID' });
    }

    // Durable Event-Level Deduplication Check
    const eventId = payload.event_id || cfPaymentId || (orderId + '_' + upperStatus);
    const alreadyProcessed = await isWebhookEventProcessed(eventId);
    if (alreadyProcessed) {
      console.info(`[Webhook Deduplication] Event ${eventId} already processed.`);
      return res.status(200).json({ status: 'ALREADY_PROCESSED', eventId });
    }

    const paymentRecord = await getPaymentByOrderId(orderId);
    if (!paymentRecord) {
      console.warn(`[Webhook Notice] Order not found in database: ${orderId}`);
      return res.status(404).json({ success: false, message: `Payment order not found: ${orderId}` });
    }

    const booking = paymentRecord.bookingId ? await getBookingById(paymentRecord.bookingId) : null;

    // Map CashFree status to internal states
    let newBookingStatus = null;
    let paymentDbStatus = 'PENDING';

    const isSuccess = (upperStatus === 'SUCCESS' || upperStatus === 'PAYMENT_SUCCESS');
    const isFailure = (upperStatus === 'FAILED' || upperStatus === 'PAYMENT_FAILED' || upperStatus === 'USER_DROPPED' || upperStatus === 'CANCELLED');

    if (isSuccess) {
      // Amount & Currency Verification: compare provider reported amount vs BOTH paymentRecord AND authoritative booking
      const providerAmount = Number(paymentData.payment_amount ?? orderData.order_amount);
      const providerCurrency = String(paymentData.payment_currency ?? orderData.order_currency ?? 'INR').toUpperCase();
      const recordedPaymentAmount = Number(paymentRecord.amount);
      const recordedBookingAmount = booking ? Number(booking.totalAmount) : recordedPaymentAmount;
      const recordedCurrency = String(paymentRecord.currency || 'INR').toUpperCase();

      if (
        isNaN(providerAmount) ||
        Math.abs(providerAmount - recordedPaymentAmount) > 0.05 ||
        Math.abs(providerAmount - recordedBookingAmount) > 0.05 ||
        providerCurrency !== recordedCurrency
      ) {
        console.error(`[Webhook Amount Mismatch] Order ${orderId}: Expected ₹${recordedPaymentAmount} (Booking: ₹${recordedBookingAmount}) ${recordedCurrency}, provider reported ₹${providerAmount} ${providerCurrency}`);
        await updatePaymentStatus(orderId, 'AMOUNT_MISMATCH', cfPaymentId, paymentMethod, payload);
        await recordProcessedWebhookEvent(eventId, payload.type || 'PAYMENT_SUCCESS', orderId, cfPaymentId, 'AMOUNT_MISMATCH');
        return res.status(400).json({
          success: false,
          message: 'Payment rejected: Provider amount or currency does not match internal record.'
        });
      }

      paymentDbStatus = 'SUCCESS';
      newBookingStatus = 'PAID';
    } else if (isFailure) {
      paymentDbStatus = 'FAILED';
      newBookingStatus = 'PAYMENT_FAILED';
    }

    // Check existing payment status terminal protection
    if (paymentRecord.status === 'SUCCESS') {
      console.info(`[Webhook Idempotent] Order ${orderId} is already resolved to SUCCESS.`);
      await recordProcessedWebhookEvent(eventId, payload.type || 'PAYMENT', orderId, cfPaymentId, 'SUCCESS');
      return res.status(200).json({ status: 'ALREADY_PROCESSED' });
    }

    // Protect terminal booking states from overwrite
    if (booking && !['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(booking.status)) {
      console.warn(`[Booking State Protected] Booking ${booking.id} is in terminal state '${booking.status}'; transition to '${newBookingStatus}' ignored.`);
      newBookingStatus = null;
    }

    // Execute atomic transaction for payment status, booking status, and webhook deduplication
    const txResult = await processPaymentWebhookTransaction({
      eventId,
      eventType: payload.type || 'PAYMENT',
      orderId,
      cfPaymentId,
      paymentDbStatus,
      newBookingStatus,
      bookingId: paymentRecord.bookingId,
      paymentMethod,
      rawPayload: payload
    });

    if (txResult.alreadyProcessed) {
      return res.status(200).json({ status: 'ALREADY_PROCESSED', eventId });
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

/**
 * Endpoint: GET /api/payments/status/:orderId
 * Description: Retrieves authoritative status of a payment order and associated booking.
 * Protected by an unguessable access token or admin API key.
 */
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId parameter is required' });
    }

    const token = req.query.token || req.headers['x-order-token'];
    const apiKey = req.headers['x-api-key'];

    const isAdmin = apiKey && process.env.ADMIN_API_KEY && (() => {
      const keyBuf = Buffer.from(String(apiKey));
      const expBuf = Buffer.from(String(process.env.ADMIN_API_KEY));
      return (keyBuf.length === expBuf.length) && crypto.timingSafeEqual(keyBuf, expBuf);
    })();

    const payment = await getPaymentByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: `Payment order not found: ${orderId}` });
    }

    // Enforce unguessable access token verification unless authenticated as admin
    if (!isAdmin) {
      if (!token || !verifyPaymentAccessToken(payment, token)) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Missing or invalid order access token'
        });
      }
    }

    const booking = payment.bookingId ? await getBookingById(payment.bookingId) : null;

    return res.status(200).json({
      success: true,
      orderId: payment.cfOrderId,
      amount: Number(payment.amount),
      currency: payment.currency || 'INR',
      paymentStatus: payment.status,
      bookingStatus: booking ? booking.status : null,
      bookingId: payment.bookingId
    });
  } catch (err) {
    console.error('[Payment Status Check Error]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment status' });
  }
});

/**
 * Endpoint: POST /api/payments/mock-complete (development/test only)
 * Description: Simulates provider payment confirmation in dev/test environments.
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/mock-complete', async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId is required' });
      }

      const payment = await getPaymentByOrderId(orderId);
      if (!payment) {
        return res.status(404).json({ success: false, message: `Payment order not found: ${orderId}` });
      }

      await updatePaymentStatus(orderId, 'SUCCESS', `mock_cf_${Date.now()}`, JSON.stringify({ method: 'MOCK_UPI' }), { simulated: true });
      if (payment.bookingId) {
        await updateBookingStatus(payment.bookingId, 'PAID');
      }

      return res.status(200).json({
        success: true,
        message: 'Mock payment marked as SUCCESS',
        orderId,
        paymentStatus: 'SUCCESS',
        bookingStatus: 'PAID'
      });
    } catch (err) {
      console.error('[Mock Complete Error]', err.message);
      return res.status(500).json({ success: false, message: 'Failed to complete mock payment' });
    }
  });
}

module.exports = router;
