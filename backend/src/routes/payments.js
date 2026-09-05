const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Fetch credentials from env
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox'; // sandbox or production

const CASHFREE_BASE_URL = CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

/**
 * Endpoint: POST /api/payments/create-order
 * Description: Initiates a payment order session with CashFree
 */
router.post('/create-order', async (req, res, next) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

    if (!orderId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order initiation parameters'
      });
    }

    // Fallback Mock mode if credentials are missing
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.warn('⚠️ CashFree API credentials missing. Initiating MOCK payment session.');
      return res.status(200).json({
        success: true,
        mode: 'MOCK',
        paymentSessionId: `mock_session_${Date.now()}`,
        orderId: orderId,
        message: 'Mock payment order generated successfully'
      });
    }

    // Call CashFree PG API
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: parseFloat(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${customerPhone.replace(/[^0-9]/g, '')}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
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

    return res.status(200).json({
      success: true,
      mode: 'LIVE',
      paymentSessionId: response.data.payment_session_id,
      orderId: response.data.order_id,
      cfOrder: response.data
    });

  } catch (error) {
    console.error('CashFree Order Creation Error:', error.response?.data || error.message);
    next(error);
  }
});

/**
 * Endpoint: POST /api/payments/webhook
 * Description: CashFree Payment webhook listener with HMAC-SHA256 signature verification
 */
router.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  // In production or when credentials exist, strictly verify HMAC-SHA256 signature
  if (CASHFREE_SECRET_KEY) {
    if (!signature) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing x-webhook-signature header'
      });
    }

    try {
      const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
      const signaturePayload = timestamp ? `${timestamp}${rawBody}` : rawBody;
      
      const expectedSignatureBase64 = crypto
        .createHmac('sha256', CASHFREE_SECRET_KEY)
        .update(signaturePayload)
        .digest('base64');
      
      const expectedSignatureHex = crypto
        .createHmac('sha256', CASHFREE_SECRET_KEY)
        .update(signaturePayload)
        .digest('hex');

      const isValid = (signature === expectedSignatureBase64 || signature === expectedSignatureHex);

      if (!isValid) {
        console.warn('⚠️ Invalid CashFree webhook signature rejected');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid webhook signature'
        });
      }
    } catch (err) {
      console.error('Signature verification error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'Signature verification failed'
      });
    }
  } else {
    console.warn('⚠️ CASHFREE_SECRET_KEY not set - skipping webhook signature verification');
  }

  // Sanitized logging - ONLY log safe identifiers, never dump customer PII or raw payment credentials
  const orderId = req.body?.data?.order?.order_id || req.body?.order_id || 'UNKNOWN';
  const paymentStatus = req.body?.data?.payment?.payment_status || req.body?.type || 'RECEIVED';
  console.log(`🔔 Verified CashFree Webhook: orderId=${orderId}, status=${paymentStatus}`);

  // Respond with 200 OK to acknowledge receipt
  return res.status(200).json({ status: 'ACKNOWLEDGED' });
});

module.exports = router;

