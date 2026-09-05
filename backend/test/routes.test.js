const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/server');
const { escapeHtml } = require('../src/utils/escapeHtml');

// Helper to make local HTTP requests to the Express app
function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
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

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

test('Integration: HTML escaping helper prevents XSS', () => {
  assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(escapeHtml('"Hello" & \'World\''), '&quot;Hello&quot; &amp; &#039;World&#039;');
  assert.strictEqual(escapeHtml(null), '');
});

test('Integration: Backend API routes', async (t) => {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/health returns status OK', async () => {
    const res = await makeRequest(server, { path: '/api/health', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'OK');
  });

  await t.test('POST /api/bookings/enquire validates missing fields', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Test Customer'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/bookings/enquire successfully saves booking and calculates GST', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/enquire', method: 'POST' }, {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 9876543210',
      state: 'Gujarat',
      travelDate: '2026-10-15',
      adults: 2,
      children: 1,
      infants: 0,
      packageName: 'Golden Triangle Heritage',
      basePrice: 15000,
      gstType: 'standard_tour'
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.booking.id.startsWith('BK-'));
    // baseAmount = 15000 * 2 + 15000 * 0.5 * 1 = 37500
    assert.strictEqual(res.body.booking.baseAmount, 37500);
    assert.strictEqual(res.body.booking.gstAmount, 1875);
    assert.strictEqual(res.body.booking.totalAmount, 39375);
  });

  await t.test('POST /api/bookings/contact saves contact query', async () => {
    const res = await makeRequest(server, { path: '/api/bookings/contact', method: 'POST' }, {
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '9876543211',
      destination: 'Kerala Backwaters',
      message: 'Looking for a 5-day honeymoon package.'
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.contact.name, 'Rahul Verma');
  });

  await t.test('GET /api/bookings without API key is rejected with 401', async () => {
    const res = await makeRequest(server, { path: '/api/bookings', method: 'GET' });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('GET /api/bookings with valid x-api-key returns 200 and data', async () => {
    const adminKey = process.env.ADMIN_API_KEY || 'shreeya-admin-secret-2026';
    const res = await makeRequest(server, {
      path: '/api/bookings',
      method: 'GET',
      headers: { 'x-api-key': adminKey }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.bookings));
    assert.ok(res.body.bookings.length >= 1);
  });

  await t.test('POST /api/payments/create-order returns mock session when credentials missing', async () => {
    const res = await makeRequest(server, { path: '/api/payments/create-order', method: 'POST' }, {
      orderId: 'ORD_TEST_123',
      amount: 15000,
      customerName: 'Aarav Patel',
      customerEmail: 'aarav@example.com',
      customerPhone: '9988776655'
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.mode, 'MOCK');
    assert.strictEqual(res.body.orderId, 'ORD_TEST_123');
  });

  await t.test('POST /api/payments/webhook acknowledges receipt', async () => {
    const res = await makeRequest(server, { path: '/api/payments/webhook', method: 'POST' }, {
      data: {
        order: { order_id: 'ORD_TEST_123' },
        payment: { payment_status: 'SUCCESS' }
      }
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ACKNOWLEDGED');
  });
});
