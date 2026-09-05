const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const crypto = require('crypto');

// Set required environment variables before loading server
process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'test-admin-secret-key-32-characters-min!';
process.env.CASHFREE_SECRET_KEY = 'test_cashfree_secret_key_mock_12345';
process.env.PORT = '0'; // ephemeral port

const app = require('../src/server');
const { escapeHtml } = require('../src/utils/escapeHtml');
const {
  initDatabase,
  getBookingById,
  getPaymentByOrderId,
  setSimulatedFailure,
  setSimulatedNotReady
} = require('../src/utils/db');

// Helper to make local HTTP requests to the Express app
function makeRequest(server, options, postData, rawData = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;
    const isBuffer = Buffer.isBuffer(rawData);
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (isBuffer) {
      headers['Content-Length'] = rawData.length;
    }

    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (isBuffer) {
      req.write(rawData);
    } else if (postData !== undefined && postData !== null) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function getFutureDate(daysAhead = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function getPastDate(daysAgo = 2) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getFarFutureDate(daysAhead = 90) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function generateCashfreeWebhookPayload(orderId, paymentStatus = 'SUCCESS', timestamp = Date.now()) {
  const payload = {
    data: {
      order: {
        order_id: orderId,
        order_amount: 10498.95,
        order_currency: 'INR'
      },
      payment: {
        cf_payment_id: `cf_pay_${Date.now()}`,
        payment_status: paymentStatus,
        payment_amount: 10498.95,
        payment_currency: 'INR',
        payment_method: { upi: { channel: 'gpay' } }
      },
      customer_details: {
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '9876543210'
      }
    },
    event_time: new Date(timestamp).toISOString(),
    type: 'PAYMENT_SUCCESS_WEBHOOK'
  };

  const rawBody = JSON.stringify(payload);
  const signaturePayload = `${timestamp}${rawBody}`;
  const signature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
    .update(signaturePayload)
    .digest('base64');

  return { payload, rawBody, signature, timestamp };
}

test('Integration: HTML escaping helper prevents XSS', () => {
  assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(escapeHtml('"Hello" & \'World\''), '&quot;Hello&quot; &amp; &#039;World&#039;');
  assert.strictEqual(escapeHtml(null), '');
});

test('Integration & Security: Comprehensive Backend API & Hardening Suite', async (t) => {
  await initDatabase();
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));

  t.after(() => {
    server.close();
  });

  t.beforeEach(() => {
    setSimulatedFailure(false);
    setSimulatedNotReady(false);
  });

  // 1. Health check
  await t.test('GET /api/health returns status OK', async () => {
    const res = await makeRequest(server, { path: '/api/health', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'OK');
  });

  // 2. Valid booking submission
  await t.test('1. Valid booking submission with authoritative calculation', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Aarav Patel',
      email: 'aarav.valid@example.com',
      phone: '9876543210',
      state: 'Gujarat',
      travelDate: getFutureDate(12),
      pax: 2,
      packageId: 'goa-3n4d',
      specialRequests: 'Ground floor room preferred.'
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.booking.id.startsWith('BK_'), 'Booking ID must start with BK_');
    assert.strictEqual(res.body.booking.pax, 2);
    // Base price is 9999 * 2 = 19998; GST (5%) = 999.9; Total = 20997.9
    assert.strictEqual(res.body.booking.baseAmount, 19998);
    assert.strictEqual(res.body.booking.gstAmount, 999.9);
    assert.strictEqual(res.body.booking.totalAmount, 20997.9);
    assert.strictEqual(res.body.booking.status, 'PENDING_PAYMENT');
  });

  // 3. Missing required fields
  await t.test('2. Missing required fields rejected with 400', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Incomplete User'
      // missing email, phone, travelDate, packageId
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Missing required booking parameters/i);
  });

  // 4. Invalid email
  await t.test('3. Invalid email format rejected with 400', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Bad Email User',
      email: 'not-an-email-address',
      phone: '9876543210',
      travelDate: getFutureDate(10),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /valid email address/i);
  });

  // 5. Invalid phone
  await t.test('4. Invalid phone format (<10 digits) rejected with 400', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Bad Phone User',
      email: 'badphone@example.com',
      phone: '12345', // too short
      travelDate: getFutureDate(10),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /valid 10 to 15 digit phone/i);
  });

  // 6. Invalid/expired travel date
  await t.test('5. Past or out-of-bounds travel dates rejected with 400', async () => {
    // Past date
    const resPast = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Past Traveler',
      email: 'past@example.com',
      phone: '9876543210',
      travelDate: getPastDate(3),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resPast.statusCode, 400);
    assert.match(resPast.body.message, /minimum 1 day in advance/i);

    // Far future date (>60 days)
    const resFar = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Far Traveler',
      email: 'far@example.com',
      phone: '9876543210',
      travelDate: getFarFutureDate(90),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resFar.statusCode, 400);
    assert.match(resFar.body.message, /60-day booking window/i);
  });

  // 7. Invalid passenger count
  await t.test('6. Invalid passenger count (0 or >20) rejected with 400', async () => {
    const resZero = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Zero Pax',
      email: 'zeropax@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(10),
      pax: 0,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resZero.statusCode, 400);
    assert.match(resZero.body.message, /between 1 and 20/i);

    const resTooMany = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Too Many Pax',
      email: 'toomany@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(10),
      pax: 30,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resTooMany.statusCode, 400);
    assert.match(resTooMany.body.message, /between 1 and 20/i);
  });

  // 8. Unknown package ID
  await t.test('7. Unknown package ID rejected with 400', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Unknown Package User',
      email: 'unknownpkg@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(10),
      pax: 2,
      packageId: 'non-existent-tour-9999'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /Unknown or invalid package ID/i);
  });

  // 9. Attempt to manipulate package price
  await t.test('8. Client-supplied package price is completely ignored and overridden', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Price Hacker',
      email: 'hacker1@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(14),
      pax: 1,
      packageId: 'goa-3n4d', // authoritative basePrice: 9,999
      basePrice: 1,           // malicious client tries to pay ₹1
      baseAmount: 1
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.booking.baseAmount, 9999, 'Must use authoritative baseAmount of 9999');
    assert.strictEqual(res.body.booking.totalAmount, 10498.95, 'Must calculate totalAmount authoritative 10498.95');
  });

  // 10. Attempt to manipulate total amount
  await t.test('9. Client-supplied total amount is completely ignored and overridden', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Total Hacker',
      email: 'hacker2@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(16),
      pax: 2,
      packageId: 'kerala-hills-lake-escape-4n', // authoritative basePrice: 14,999 * 2 = 29,998
      totalAmount: 10                           // malicious client attempts ₹10 total
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.booking.baseAmount, 29998);
    // GST 5% = 1499.9; Total = 31497.9
    assert.strictEqual(res.body.booking.totalAmount, 31497.9);
  });

  // 11. Attempt to manipulate payment order ID
  await t.test('10. /create-order ignores client orderId and client amount', async () => {
    // First create a real booking
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Order Tamperer',
      email: 'ordertamper@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(18),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    // Call /create-order with client-supplied orderId and amount
    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId: bookingId,
      orderId: 'MALICIOUS_CLIENT_ORDER_ID_666',
      amount: 1
    });

    assert.strictEqual(payRes.statusCode, 200);
    assert.notStrictEqual(payRes.body.orderId, 'MALICIOUS_CLIENT_ORDER_ID_666', 'Server must generate orderId');
    assert.ok(payRes.body.orderId.startsWith('CF_'), 'Generated order ID should start with CF_');
    assert.strictEqual(payRes.body.amount, 10498.95, 'Authoritative amount must come from booking (10498.95)');
  });

  // 12. Booking ID uniqueness
  await t.test('11. Booking IDs are cryptographically unique UUIDs (no collision)', async () => {
    const generatedIds = new Set();
    for (let i = 0; i < 8; i++) {
      const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
        name: `Unique Test ${i}`,
        email: `unique_${i}_${Date.now()}@example.com`,
        phone: `987654321${i}`,
        travelDate: getFutureDate(20 + i),
        pax: 1,
        packageId: 'goa-3n4d'
      });
      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.body.bookingId);
      assert.ok(!generatedIds.has(res.body.bookingId), 'Collision detected on booking ID!');
      generatedIds.add(res.body.bookingId);
    }
    assert.strictEqual(generatedIds.size, 8);
  });

  // 13. Database write failure
  await t.test('12. Database write failure returns 500 and fails cleanly', async () => {
    setSimulatedFailure(true);
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Failure Test',
      email: 'failtest@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(25),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    setSimulatedFailure(false);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
  });

  // 14. Database unavailable during startup/request
  await t.test('13. Database unreadiness returns 503 Service Unavailable', async () => {
    setSimulatedNotReady(true);
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Unready Test',
      email: 'unready@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(25),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    setSimulatedNotReady(false);

    assert.strictEqual(res.statusCode, 503);
    assert.match(res.body.message, /Datastore is not ready/i);
  });

  // 15. Concurrent booking submissions
  await t.test('14. Concurrent booking submissions handled cleanly without state corruption', async () => {
    const promises = Array.from({ length: 5 }, (_, idx) => {
      return makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
        name: `Concurrent User ${idx}`,
        email: `concurrent_${idx}_${Date.now()}@example.com`,
        phone: `987654300${idx}`,
        travelDate: getFutureDate(22 + idx),
        pax: 1,
        packageId: 'goa-3n4d'
      });
    });

    const results = await Promise.all(promises);
    results.forEach(res => {
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.bookingId);
    });
  });

  // 16. Missing admin secret in production
  await t.test('15. Missing admin secret in production returns 500 configuration error', async () => {
    const originalKey = process.env.ADMIN_API_KEY;
    delete process.env.ADMIN_API_KEY;

    const res = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': 'some-key' }
    });

    process.env.ADMIN_API_KEY = originalKey; // restore

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Admin access configuration error/i);
  });

  // 17. Unauthorized admin request
  await t.test('16. Unauthorized admin request without key or with wrong key rejected with 401', async () => {
    // Missing key
    const resNoKey = await makeRequest(server, { path: '/api/bookings', method: 'GET' });
    assert.strictEqual(resNoKey.statusCode, 401);
    assert.strictEqual(resNoKey.body.success, false);

    // Wrong key
    const resWrongKey = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': 'wrong-unauthorized-key' }
    });
    assert.strictEqual(resWrongKey.statusCode, 401);
    assert.strictEqual(resWrongKey.body.success, false);
  });

  // 18. Valid admin request
  await t.test('17. Valid admin request with x-api-key returns 200 and audit-logged list', async () => {
    const res = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': process.env.ADMIN_API_KEY }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.bookings));
  });

  // 19. Missing Cashfree webhook signature
  await t.test('18. Webhook without x-webhook-signature rejected with 401', async () => {
    const { payload } = generateCashfreeWebhookPayload('ORD_TEST_SIG_1');
    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-timestamp': Date.now().toString()
      }
    }, payload);

    assert.strictEqual(res.statusCode, 401);
    assert.match(res.body.message, /Missing x-webhook-signature/i);
  });

  // 20. Invalid Cashfree webhook signature
  await t.test('19. Webhook with invalid/forged signature rejected with 401', async () => {
    const { payload, timestamp } = generateCashfreeWebhookPayload('ORD_TEST_SIG_2');
    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': 'FORGED_INVALID_HMAC_SIGNATURE_STRING==',
        'x-webhook-timestamp': timestamp.toString()
      }
    }, payload);

    assert.strictEqual(res.statusCode, 401);
    assert.match(res.body.message, /Invalid webhook signature/i);
  });

  // 21. Missing webhook secret in production
  await t.test('20. Missing webhook secret causes secure 500 rejection (never silently bypassed)', async () => {
    const originalSecret = process.env.CASHFREE_SECRET_KEY;
    delete process.env.CASHFREE_SECRET_KEY;

    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': 'mock_sig',
        'x-webhook-timestamp': Date.now().toString()
      }
    }, { test: true });

    process.env.CASHFREE_SECRET_KEY = originalSecret; // restore

    assert.strictEqual(res.statusCode, 500);
    assert.match(res.body.message, /secret not configured/i);
  });

  // 22. Expired/replayed webhook timestamp
  await t.test('21. Webhook timestamp outside allowed 300s window rejected with 400', async () => {
    const oldTimestamp = Date.now() - 400000; // 400s in the past (exceeds 300s tolerance)
    const { payload, signature } = generateCashfreeWebhookPayload('ORD_REPLAY_1', 'SUCCESS', oldTimestamp);

    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': oldTimestamp.toString()
      }
    }, payload);

    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /timestamp expired/i);
  });

  // 23. Successful payment updates booking to paid
  await t.test('22 & 23. Successful payment updates payment to SUCCESS and booking to PAID', async () => {
    // 1. Create booking
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Paid Booking User',
      email: 'paidbooking@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(30),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;
    assert.ok(bookingId, 'Booking creation must succeed');

    // 2. Create payment order
    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    assert.strictEqual(payRes.statusCode, 200);
    const cfOrderId = payRes.body.orderId;
    assert.ok(cfOrderId, 'Payment order must be created');

    // 3. Dispatch valid successful webhook
    const { rawBody, signature, timestamp } = generateCashfreeWebhookPayload(cfOrderId, 'SUCCESS');
    const hookRes = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(hookRes.statusCode, 200);
    assert.strictEqual(hookRes.body.status, 'ACKNOWLEDGED');

    // 4. Verify in DB
    const updatedBooking = await getBookingById(bookingId);
    assert.strictEqual(updatedBooking.status, 'PAID');

    const updatedPayment = await getPaymentByOrderId(cfOrderId);
    assert.strictEqual(updatedPayment.status, 'SUCCESS');

    // 22. Duplicate webhook test (idempotency)
    const duplicateRes = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(duplicateRes.statusCode, 200);
    assert.strictEqual(duplicateRes.body.status, 'ALREADY_PROCESSED');
  });

  // 24. Failed payment updates booking appropriately
  await t.test('24. Failed payment webhook transitions booking to PAYMENT_FAILED', async () => {
    // 1. Create booking
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Failed Booking User',
      email: 'failedbooking@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(32),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;
    assert.ok(bookingId);

    // 2. Create payment order
    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    const cfOrderId = payRes.body.orderId;
    assert.ok(cfOrderId);

    // 3. Dispatch failed webhook
    const { rawBody, signature, timestamp } = generateCashfreeWebhookPayload(cfOrderId, 'FAILED');
    const hookRes = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(hookRes.statusCode, 200);

    // 4. Verify in DB
    const updatedBooking = await getBookingById(bookingId);
    assert.strictEqual(updatedBooking.status, 'PAYMENT_FAILED');
  });

  // 25. Oversized request body rejection
  await t.test('25. Oversized request body (>32kb) rejected with 413 Payload Too Large', async () => {
    const hugeData = {
      name: 'Big User',
      email: 'big@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(35),
      pax: 1,
      packageId: 'goa-3n4d',
      padding: 'x'.repeat(40 * 1024) // 40KB exceeds 32kb limit
    };

    const res = await makeRequest(server, {
      path: '/api/bookings/enquire',
      method: 'POST'
    }, hugeData);

    assert.strictEqual(res.statusCode, 413);
  });

  // 26. Special requests successfully persisted
  await t.test('26. Special requests field is sanitized and persisted end-to-end', async () => {
    const specialText = 'Wheelchair required for senior citizen & strictly Jain food.';
    const sanitizedExpected = escapeHtml(specialText);
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Special Req User',
      email: 'specialreq@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(38),
      pax: 2,
      packageId: 'goa-3n4d',
      specialRequests: specialText
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.booking.specialRequests, sanitizedExpected);

    const saved = await getBookingById(res.body.bookingId);
    assert.strictEqual(saved.specialRequests, sanitizedExpected);
  });

  // 27. Booking and contact API success/failure behavior
  await t.test('27. Contact inquiry endpoint and quote endpoint success/failure behavior', async () => {
    // Quote endpoint valid
    const quoteRes = await makeRequest(server, { path: '/api/bookings/quote', method: 'POST' }, {
      packageId: 'kerala-hills-lake-escape-4n',
      pax: 3,
      state: 'Maharashtra'
    });
    assert.strictEqual(quoteRes.statusCode, 200);
    assert.strictEqual(quoteRes.body.success, true);
    assert.strictEqual(quoteRes.body.quote.baseAmount, 14999 * 3);

    // Quote endpoint invalid pax
    const quoteBadPax = await makeRequest(server, { path: '/api/bookings/quote', method: 'POST' }, {
      packageId: 'kerala-hills-lake-escape-4n',
      pax: 0
    });
    assert.strictEqual(quoteBadPax.statusCode, 400);

    // Contact endpoint valid
    const contactRes = await makeRequest(server, { path: '/api/bookings/contact', method: 'POST' }, {
      name: 'Sunita Rao',
      email: 'sunita@example.com',
      phone: '9876543210',
      destination: 'Gujarat Heritage',
      message: 'Interested in Rann Utsav packages.'
    });
    assert.strictEqual(contactRes.statusCode, 201);
    assert.strictEqual(contactRes.body.success, true);
    assert.ok(contactRes.body.contactId.startsWith('CT_'));

    // Contact endpoint missing name
    const contactBad = await makeRequest(server, { path: '/api/bookings/contact', method: 'POST' }, {
      email: 'sunita@example.com'
    });
    assert.strictEqual(contactBad.statusCode, 400);
  });
});
