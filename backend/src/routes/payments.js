const express = require('express');
const router = express.Router();
const axios = require('axios');

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
          customer_id: `cust_${customerPhone}`,
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
 * Description: CashFree Payment webhook listener
 */
router.post('/webhook', (req, res) => {
  // Webhook payload signature validation would occur here in production
  const { data } = req.body;
  
  console.log('🔔 Received CashFree Webhook Payload:', req.body);
  
  // Respond with 200 OK to acknowledge receipt
  return res.status(200).json({ status: 'ACKNOWLEDGED' });
});

module.exports = router;
