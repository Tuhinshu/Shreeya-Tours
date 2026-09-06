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
      'Connection': 'close',
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

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFutureDate(daysAhead = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatDate(d);
}

function getPastDate(daysAgo = 2) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

function getFarFutureDate(daysAhead = 90) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatDate(d);
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
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
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

  // 26. Special requests successfully persisted as plain text
  await t.test('26. Special requests field is stored as plain text without pre-escaping', async () => {
    const specialText = 'Wheelchair required for senior citizen & strictly Jain food.';
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Special Req User',
      email: 'specialreq@example.com',
      phone: '9876543210',
      state: 'Gujarat',
      travelDate: getFutureDate(38),
      pax: 2,
      packageId: 'goa-3n4d',
      specialRequests: specialText
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.booking.specialRequests, specialText);

    const saved = await getBookingById(res.body.bookingId);
    assert.strictEqual(saved.specialRequests, specialText);
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

  // 28. Strict PAX validation: rejects malformed numeric strings
  await t.test('28. Strict PAX validation rejects malformed values (2abc, 1.5, negative)', async () => {
    for (const badPax of ['2abc', '1.5', 'pax2', -1, 0, 25]) {
      const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
        name: 'Bad Pax User',
        email: 'badpax@example.com',
        phone: '9876543210',
        travelDate: getFutureDate(15),
        pax: badPax,
        packageId: 'goa-3n4d'
      });
      assert.strictEqual(res.statusCode, 400, `Expected 400 for pax: ${badPax}`);
      assert.match(res.body.message, /pax must be an integer between 1 and 20/i);
    }
  });

  // 29. Strict date validation: rejects impossible calendar dates and format errors
  await t.test('29. Strict date validation rejects non-existent dates (2026-02-31) and malformed formats', async () => {
    for (const badDate of ['2026-02-31', '2026-04-31', 'not-a-date', '2026/12/25', '12-05-2026']) {
      const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
        name: 'Bad Date User',
        email: 'baddate@example.com',
        phone: '9876543210',
        travelDate: badDate,
        pax: 2,
        packageId: 'goa-3n4d'
      });
      assert.strictEqual(res.statusCode, 400, `Expected 400 for travelDate: ${badDate}`);
      assert.match(res.body.message, /YYYY-MM-DD|calendar/i);
    }

    // Boundary dates: tomorrow (allowed) vs today (rejected) vs day 60 (allowed) vs day 61 (rejected)
    const resTomorrow = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Tomorrow Traveler',
      email: 'tomorrow@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(1),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resTomorrow.statusCode, 201, 'Tomorrow booking must be allowed');

    const resDay60 = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Day 60 Traveler',
      email: 'day60@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(60),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resDay60.statusCode, 201, 'Day 60 booking must be allowed');

    const resDay61 = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Day 61 Traveler',
      email: 'day61@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(61),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resDay61.statusCode, 400, 'Day 61 booking must be rejected');
  });

  // 30. Indian State validation: accepts valid state, normalizes casing, rejects invalid
  await t.test('30. Indian state validation rejects fake states and normalizes casing', async () => {
    const resInvalidState = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Fake State User',
      email: 'fakestate@example.com',
      phone: '9876543210',
      state: 'Atlantis State',
      travelDate: getFutureDate(15),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resInvalidState.statusCode, 400);
    assert.match(resInvalidState.body.message, /Invalid Indian state/i);

    const resNormalized = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Normalized State User',
      email: 'normalized@example.com',
      phone: '9876543210',
      state: 'karnataka',
      travelDate: getFutureDate(15),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    assert.strictEqual(resNormalized.statusCode, 201);
    assert.strictEqual(resNormalized.body.booking.state, 'Karnataka');
  });

  // 31. Server-side price authority: ignores client-submitted prices
  await t.test('31. Server-side price authority overrides any client-submitted monetary values', async () => {
    const resTampered = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Price Hacker',
      email: 'hacker@example.com',
      phone: '9876543210',
      state: 'Gujarat',
      travelDate: getFutureDate(20),
      pax: 2,
      packageId: 'goa-3n4d',
      baseAmount: 1,      // Attempted client tamper
      totalAmount: 1,     // Attempted client tamper
      gstAmount: 0
    });
    assert.strictEqual(resTampered.statusCode, 201);
    // Real base price is 9999 * 2 = 19998; total = 20997.9
    assert.strictEqual(resTampered.body.booking.baseAmount, 19998);
    assert.strictEqual(resTampered.body.booking.totalAmount, 20997.9);
  });

  // 32. Webhook rejects hex-encoded signature variants
  await t.test('32. Webhook rejects hex-encoded signatures (exact Base64 required)', async () => {
    const timestamp = Date.now();
    const payload = { data: { order: { order_id: 'HEX_SIG_TEST' } } };
    const rawBody = JSON.stringify(payload);
    const signaturePayload = `${timestamp}${rawBody}`;

    const hexSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(signaturePayload)
      .digest('hex'); // Hexadecimal signature variant

    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': hexSignature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(res.statusCode, 401);
    assert.match(res.body.message, /Invalid webhook signature/i);
  });

  // 33. Webhook rejects raw-body-only signatures (missing timestamp prefix)
  await t.test('33. Webhook rejects raw-body-only signatures lacking timestamp in HMAC payload', async () => {
    const timestamp = Date.now();
    const payload = { data: { order: { order_id: 'RAW_ONLY_SIG_TEST' } } };
    const rawBody = JSON.stringify(payload);

    // Signature computed on rawBody alone without timestamp
    const rawOnlySignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(rawBody)
      .digest('base64');

    const res = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': rawOnlySignature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(res.statusCode, 401);
    assert.match(res.body.message, /Invalid webhook signature/i);
  });

  // 34. Webhook rejects amount and currency mismatch
  await t.test('34. Webhook rejects payment amount and currency mismatch and does not mark booking PAID', async () => {
    // 1. Create booking
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Mismatch User',
      email: 'mismatch@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(25),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    // 2. Create order
    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    const orderId = payRes.body.orderId;
    assert.ok(orderId);

    // 3. Webhook with mismatched amount (provider reported 100 instead of 10498.95)
    const timestamp = Date.now();
    const payload = {
      data: {
        order: { order_id: orderId, order_amount: 100, order_currency: 'INR' },
        payment: {
          cf_payment_id: `cf_mismatch_${Date.now()}`,
          payment_status: 'SUCCESS',
          payment_amount: 100, // TAMPERED AMOUNT
          payment_currency: 'INR'
        }
      },
      type: 'PAYMENT_SUCCESS_WEBHOOK'
    };
    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    const hookRes = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    assert.strictEqual(hookRes.statusCode, 400);
    assert.match(hookRes.body.message, /Provider amount or currency does not match/i);

    // 4. Verify booking was NEVER marked PAID
    const booking = await getBookingById(bookingId);
    assert.strictEqual(booking.status, 'PENDING_PAYMENT');

    const payment = await getPaymentByOrderId(orderId);
    assert.strictEqual(payment.status, 'AMOUNT_MISMATCH');
  });

  // 35. Active order reuse: reuses existing pending order to prevent duplicate orders
  await t.test('35. Repeated order creation reuses existing active pending order within 15 minutes', async () => {
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Reuse Order User',
      email: 'reuse@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(28),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    // First create-order call
    const firstOrder = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    assert.strictEqual(firstOrder.statusCode, 200);
    const orderId1 = firstOrder.body.orderId;

    // Second create-order call (concurrent or repeated)
    const secondOrder = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    assert.strictEqual(secondOrder.statusCode, 200);
    const orderId2 = secondOrder.body.orderId;

    // Must reuse the same order ID
    assert.strictEqual(orderId1, orderId2, 'Subsequent order creation must reuse active pending order');
  });

  // 36. State machine protection: cannot pay cancelled or terminal bookings
  await t.test('36. State machine prevents paying already cancelled or refunded bookings', async () => {
    const { updateBookingStatus } = require('../src/utils/db');
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Cancelled User',
      email: 'cancelled@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(35),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    // Manually set booking to CANCELLED
    await updateBookingStatus(bookingId, 'CANCELLED');

    // Attempting to create order must fail
    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    assert.strictEqual(payRes.statusCode, 400);
    assert.match(payRes.body.message, /Cannot initiate payment for booking in CANCELLED state/i);
  });

  // 37. Admin pagination support
  await t.test('37. Admin endpoints support pagination with page and limit query params', async () => {
    const resPaginated = await makeRequest(server, {
      path: '/api/bookings?page=1&limit=5',
      method: 'GET',
      headers: { 'x-api-key': process.env.ADMIN_API_KEY }
    });
    assert.strictEqual(resPaginated.statusCode, 200);
    assert.strictEqual(resPaginated.body.page, 1);
    assert.strictEqual(resPaginated.body.limit, 5);
    assert.ok(resPaginated.body.bookings.length <= 5);
    assert.ok(typeof resPaginated.body.total === 'number');
  });

  // 38. Payment status query endpoint requires unguessable access token
  await t.test('38. GET /api/payments/status/:orderId returns authoritative payment & booking status with token', async () => {
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Status Check User',
      email: 'statuscheck@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(40),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    const orderId = payRes.body.orderId;
    const orderToken = payRes.body.orderToken;
    assert.ok(orderToken, 'Order creation must return an unguessable access token');

    // 1. Missing token must be rejected with 401
    const noTokenRes = await makeRequest(server, {
      path: `/api/payments/status/${orderId}`,
      method: 'GET'
    });
    assert.strictEqual(noTokenRes.statusCode, 401);
    assert.match(noTokenRes.body.message, /access token/i);

    // 2. Invalid token must be rejected with 401
    const badTokenRes = await makeRequest(server, {
      path: `/api/payments/status/${orderId}?token=invalid-fake-token`,
      method: 'GET'
    });
    assert.strictEqual(badTokenRes.statusCode, 401);
    assert.match(badTokenRes.body.message, /access token/i);

    // 3. Valid token query parameter returns authoritative status
    const statusRes = await makeRequest(server, {
      path: `/api/payments/status/${orderId}?token=${orderToken}`,
      method: 'GET'
    });
    assert.strictEqual(statusRes.statusCode, 200);
    assert.strictEqual(statusRes.body.orderId, orderId);
    assert.strictEqual(statusRes.body.paymentStatus, 'PENDING');
    assert.strictEqual(statusRes.body.bookingStatus, 'PENDING_PAYMENT');

    // 4. Valid token in header x-order-token returns authoritative status
    const headerStatusRes = await makeRequest(server, {
      path: `/api/payments/status/${orderId}`,
      method: 'GET',
      headers: { 'x-order-token': orderToken }
    });
    assert.strictEqual(headerStatusRes.statusCode, 200);
    assert.strictEqual(headerStatusRes.body.orderId, orderId);
  });

  // 39. Concurrency test: simultaneous create-order requests enforce one active payment order
  await t.test('39. Concurrency: simultaneous create-order requests enforce one active order per booking', async () => {
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Concurrent Order User',
      email: 'concurrent@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(42),
      pax: 2,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    // Fire 5 concurrent create-order requests simultaneously
    const requests = Array.from({ length: 5 }, () =>
      makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, { bookingId })
    );

    const responses = await Promise.all(requests);
    for (const res of responses) {
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.orderId);
    }

    // All 5 concurrent calls must return the same order ID
    const orderIds = new Set(responses.map(r => r.body.orderId));
    assert.strictEqual(orderIds.size, 1, 'All concurrent create-order requests must resolve to the same active order');
  });

  // 40. Admin authentication timingSafeEqual and key validation
  await t.test('40. Admin authentication uses timingSafeEqual and handles edge-case key lengths', async () => {
    // Exact key passes
    const goodRes = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': process.env.ADMIN_API_KEY }
    });
    assert.strictEqual(goodRes.statusCode, 200);

    // Key of different length rejected safely without throwing error
    const shortKeyRes = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': 'short' }
    });
    assert.strictEqual(shortKeyRes.statusCode, 401);

    // Key of same length but mismatched character rejected
    const alteredKey = 'x' + process.env.ADMIN_API_KEY.slice(1);
    const alteredRes = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': alteredKey }
    });
    assert.strictEqual(alteredRes.statusCode, 401);
  });

  // 41. Webhook atomic deduplication and state machine protection
  await t.test('41. Webhook transaction enforces atomic updates and rejects invalid terminal transitions', async () => {
    // Create booking and order
    const bookRes = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Terminal State User',
      email: 'terminal@example.com',
      phone: '9876543210',
      travelDate: getFutureDate(45),
      pax: 1,
      packageId: 'goa-3n4d'
    });
    const bookingId = bookRes.body.bookingId;

    const payRes = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      bookingId
    });
    const cfOrderId = payRes.body.orderId;

    // Manually cancel the booking via admin/db simulation
    const booking = await getBookingById(bookingId);
    booking.status = 'CANCELLED';

    // Attempt to pay via webhook
    const { rawBody, signature, timestamp } = generateCashfreeWebhookPayload(cfOrderId, 'SUCCESS');
    const hookRes = await makeRequest(server, {
      path: '/api/payments/webhook',
      method: 'POST',
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp.toString()
      }
    }, null, Buffer.from(rawBody, 'utf-8'));

    // Webhooks return 200 ACKNOWLEDGED to prevent infinite retries from provider, but booking transition is suppressed
    assert.strictEqual(hookRes.statusCode, 200);
    assert.strictEqual(hookRes.body.status, 'ACKNOWLEDGED');

    // Booking status must still be CANCELLED (never overwritten)
    const checkedBooking = await getBookingById(bookingId);
    assert.strictEqual(checkedBooking.status, 'CANCELLED');
  });
});


