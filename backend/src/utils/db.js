const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let pool = null;
let isReady = false;
let initPromise = null;

// In-memory store used strictly for test/dev environments when DATABASE_URL is not set
const memStore = {
  bookings: new Map(),
  payments: new Map(),
  contacts: new Map(),
  processedWebhookEvents: new Map(),
  notificationLogs: new Map()
};

/**
 * Executes versioned SQL migrations located in backend/src/migrations/
 */
async function runMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { rows } = await client.query('SELECT version FROM schema_migrations;');
  const applied = new Set(rows.map(r => r.version));

  const migrationsDir = path.join(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    if (!applied.has(file)) {
      console.log(`[DB Migration] Applying ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1);', [file]);
        await client.query('COMMIT');
        console.log(`[DB Migration] Applied ${file} successfully.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[DB Migration Error] Failed applying ${file}:`, err.message);
        throw err;
      }
    }
  }
}

/**
 * Establish datastore readiness before accepting booking traffic.
 * In production, fails loudly if DATABASE_URL is missing or unreachable.
 */
async function initDatabase() {
  if (isReady) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      throw new Error('FATAL: DATABASE_URL must be configured in production.');
    }

    if (process.env.DATABASE_URL) {
      const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false'
        ? false
        : (process.env.NODE_ENV === 'production');

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized }
      });

      const client = await pool.connect();
      try {
        await runMigrations(client);
        isReady = true;
        console.log('✅ PostgreSQL database migrations verified and ready.');
      } catch (err) {
        isReady = false;
        throw err;
      } finally {
        client.release();
      }
    } else {
      isReady = true;
      console.log('ℹ️ Operating with in-memory datastore (development/test mode).');
    }
    return true;
  })();

  return initPromise;
}

let simulatedDbFailure = false;
let simulatedNotReady = false;

function setSimulatedFailure(val) {
  simulatedDbFailure = Boolean(val);
}

function setSimulatedNotReady(val) {
  simulatedNotReady = Boolean(val);
}

function checkReady() {
  if (!isReady || simulatedNotReady) {
    const error = new Error('Datastore is not ready. Please try again shortly.');
    error.status = 503;
    throw error;
  }
  if (simulatedDbFailure) {
    const error = new Error('Simulated database write failure');
    error.status = 500;
    throw error;
  }
}

/**
 * Sanitize payment payload to retain only necessary audit fields and redact sensitive financial PII
 */
function sanitizePaymentPayload(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const orderData = raw.data?.order || raw.order || {};
  const paymentData = raw.data?.payment || raw.payment || {};
  return {
    order_id: orderData.order_id || raw.order_id || null,
    cf_payment_id: paymentData.cf_payment_id || raw.cf_payment_id || null,
    payment_status: paymentData.payment_status || raw.type || null,
    payment_amount: paymentData.payment_amount ?? orderData.order_amount ?? null,
    payment_currency: paymentData.payment_currency ?? orderData.order_currency ?? 'INR',
    payment_method: paymentData.payment_method?.type || (typeof paymentData.payment_method === 'string' ? paymentData.payment_method : null),
    event_time: raw.event_time || new Date().toISOString()
  };
}

async function saveBooking(booking) {
  checkReady();

  if (pool) {
    const query = `
      INSERT INTO bookings (
        id, package_id, package_name, name, email, phone, travel_date, pax,
        special_requests, base_amount, gst_amount, gst_rate, total_amount,
        tax_details, customer_state, office_state, invoice_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;
    const values = [
      booking.id,
      booking.packageId,
      booking.packageName,
      booking.name,
      booking.email,
      booking.phone,
      booking.travelDate,
      booking.pax,
      booking.specialRequests || null,
      booking.baseAmount,
      booking.gstAmount,
      booking.gstRate,
      booking.totalAmount,
      booking.taxDetails ? JSON.stringify(booking.taxDetails) : null,
      booking.customerState || 'Gujarat',
      booking.officeState || 'Gujarat',
      booking.invoiceDate,
      booking.status || 'PENDING_PAYMENT'
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  memStore.bookings.set(booking.id, { ...booking, createdAt: new Date().toISOString() });
  return booking;
}

async function getBookingById(bookingId) {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    return res.rows[0] || null;
  }

  return memStore.bookings.get(bookingId) || null;
}

async function getBookings(options = {}) {
  checkReady();

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), 100);
  const offset = (page - 1) * limit;
  const statusFilter = options.status ? String(options.status).trim() : null;

  if (pool) {
    let countQuery = 'SELECT COUNT(*) FROM bookings';
    let query = 'SELECT * FROM bookings';
    const params = [];
    const countParams = [];

    if (statusFilter) {
      countQuery += ' WHERE status = $1';
      countParams.push(statusFilter);
      query += ' WHERE status = $1';
      params.push(statusFilter);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [countRes, rowsRes] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(query, params)
    ]);

    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // Attach pagination metadata directly to the array for backward compatibility
    const items = rowsRes.rows;
    items.pagination = { total, page, limit, totalPages };
    return items;
  }

  let all = Array.from(memStore.bookings.values()).reverse();
  if (statusFilter) {
    all = all.filter(b => b.status === statusFilter);
  }

  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const items = all.slice(offset, offset + limit);
  items.pagination = { total, page, limit, totalPages };
  return items;
}

async function updateBookingStatus(bookingId, status) {
  checkReady();

  if (pool) {
    const res = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, bookingId]
    );
    return res.rows[0] || null;
  }

  const existing = memStore.bookings.get(bookingId);
  if (existing) {
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    memStore.bookings.set(bookingId, existing);
    return existing;
  }
  return null;
}

async function savePayment(payment) {
  checkReady();

  const sanitized = sanitizePaymentPayload(payment.rawPayload);
  const orderToken = payment.orderToken || null;

  if (pool) {
    const query = `
      INSERT INTO payments (
        id, booking_id, cf_order_id, payment_session_id, amount, currency, status, cf_payment_id, payment_method, raw_payload, order_token
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      payment.id,
      payment.bookingId,
      payment.cfOrderId,
      payment.paymentSessionId || null,
      payment.amount,
      payment.currency || 'INR',
      payment.status || 'PENDING',
      payment.cfPaymentId || null,
      payment.paymentMethod || null,
      sanitized ? JSON.stringify(sanitized) : null,
      orderToken
    ];
    const res = await pool.query(query, values);
    const row = res.rows[0];
    if (row && row.order_token && !row.orderToken) {
      row.orderToken = row.order_token;
    }
    return row;
  }

  // Enforce DB-level constraint: Maximum of 1 active PENDING order per booking
  if ((payment.status || 'PENDING') === 'PENDING') {
    const hasActivePending = Array.from(memStore.payments.values()).some(
      p => p.bookingId === payment.bookingId && p.status === 'PENDING'
    );
    if (hasActivePending) {
      const err = new Error('duplicate key value violates unique constraint "idx_payments_one_active_pending"');
      err.code = '23505';
      throw err;
    }
  }

  memStore.payments.set(payment.cfOrderId, {
    ...payment,
    orderToken,
    rawPayload: sanitized,
    createdAt: new Date().toISOString()
  });
  return payment;
}

async function getPaymentByOrderId(orderId) {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM payments WHERE cf_order_id = $1', [orderId]);
    const row = res.rows[0] || null;
    if (row && row.order_token && !row.orderToken) {
      row.orderToken = row.order_token;
    }
    return row;
  }

  return memStore.payments.get(orderId) || null;
}

/**
 * Finds an active pending payment order for a booking to prevent concurrent duplicate orders
 */
async function getActivePaymentByBookingId(bookingId) {
  checkReady();

  if (pool) {
    const res = await pool.query(
      `SELECT * FROM payments 
       WHERE booking_id = $1 AND status = 'PENDING' AND created_at > NOW() - INTERVAL '15 minutes'
       ORDER BY created_at DESC LIMIT 1`,
      [bookingId]
    );
    const row = res.rows[0] || null;
    if (row && row.order_token && !row.orderToken) {
      row.orderToken = row.order_token;
    }
    return row;
  }

  const active = Array.from(memStore.payments.values())
    .filter(p => p.bookingId === bookingId && p.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  if (active) {
    const ageMs = Date.now() - new Date(active.createdAt).getTime();
    if (ageMs < 15 * 60 * 1000) {
      return active;
    }
  }
  return null;
}

async function updatePaymentStatus(cfOrderId, status, cfPaymentId = null, paymentMethod = null, rawPayload = null) {
  checkReady();

  const sanitized = sanitizePaymentPayload(rawPayload);

  if (pool) {
    const res = await pool.query(
      `UPDATE payments 
       SET status = $1, cf_payment_id = COALESCE($2, cf_payment_id), 
           payment_method = COALESCE($3, payment_method), raw_payload = COALESCE($4, raw_payload),
           updated_at = CURRENT_TIMESTAMP 
       WHERE cf_order_id = $5 
       RETURNING *;`,
      [status, cfPaymentId, paymentMethod, sanitized ? JSON.stringify(sanitized) : null, cfOrderId]
    );
    const row = res.rows[0] || null;
    if (row && row.order_token && !row.orderToken) {
      row.orderToken = row.order_token;
    }
    return row;
  }

  const payment = memStore.payments.get(cfOrderId);
  if (payment) {
    payment.status = status;
    if (cfPaymentId) payment.cfPaymentId = cfPaymentId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (sanitized) payment.rawPayload = sanitized;
    payment.updatedAt = new Date().toISOString();
    memStore.payments.set(cfOrderId, payment);
    return payment;
  }
  return null;
}

/**
 * Webhook Event Deduplication Helpers with DB-level uniqueness constraint
 */
async function isWebhookEventProcessed(eventId) {
  checkReady();
  if (!eventId) return false;

  if (pool) {
    const res = await pool.query('SELECT 1 FROM processed_webhook_events WHERE event_id = $1', [eventId]);
    return res.rows.length > 0;
  }

  return memStore.processedWebhookEvents.has(eventId);
}

async function recordProcessedWebhookEvent(eventId, eventType, orderId, cfPaymentId, status) {
  checkReady();
  if (!eventId) return;

  if (pool) {
    await pool.query(
      `INSERT INTO processed_webhook_events (event_id, event_type, order_id, cf_payment_id, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [eventId, eventType, orderId, cfPaymentId, status]
    );
    return;
  }

  if (memStore.processedWebhookEvents.has(eventId)) {
    const err = new Error('duplicate key value violates unique constraint "processed_webhook_events_pkey"');
    err.code = '23505';
    throw err;
  }

  memStore.processedWebhookEvents.set(eventId, {
    eventId,
    eventType,
    orderId,
    cfPaymentId,
    status,
    processedAt: new Date().toISOString()
  });
}

/**
 * Atomic Transaction Processor for Webhooks:
 * Updates payment status, booking status, and records processed webhook event inside one atomic DB transaction.
 */
async function processPaymentWebhookTransaction({
  eventId,
  eventType,
  orderId,
  cfPaymentId,
  paymentDbStatus,
  newBookingStatus,
  bookingId,
  paymentMethod,
  rawPayload
}) {
  checkReady();
  const sanitized = sanitizePaymentPayload(rawPayload);

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Record webhook event (fails with 23505 if already processed)
      await client.query(
        `INSERT INTO processed_webhook_events (event_id, event_type, order_id, cf_payment_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [eventId, eventType, orderId, cfPaymentId, paymentDbStatus]
      );

      // 2. Update payment status
      await client.query(
        `UPDATE payments 
         SET status = $1, cf_payment_id = COALESCE($2, cf_payment_id), 
             payment_method = COALESCE($3, payment_method), raw_payload = COALESCE($4, raw_payload),
             updated_at = CURRENT_TIMESTAMP 
         WHERE cf_order_id = $5`,
        [paymentDbStatus, cfPaymentId, paymentMethod, sanitized ? JSON.stringify(sanitized) : null, orderId]
      );

      // 3. Update booking status only if in eligible state
      if (bookingId && newBookingStatus) {
        await client.query(
          `UPDATE bookings 
           SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 AND status IN ('PENDING_PAYMENT', 'PAYMENT_FAILED')`,
          [newBookingStatus, bookingId]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        return { alreadyProcessed: true };
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // In-memory atomic block
  if (memStore.processedWebhookEvents.has(eventId)) {
    return { alreadyProcessed: true };
  }

  memStore.processedWebhookEvents.set(eventId, {
    eventId,
    eventType,
    orderId,
    cfPaymentId,
    status: paymentDbStatus,
    processedAt: new Date().toISOString()
  });

  const payment = memStore.payments.get(orderId);
  if (payment) {
    payment.status = paymentDbStatus;
    if (cfPaymentId) payment.cfPaymentId = cfPaymentId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (sanitized) payment.rawPayload = sanitized;
    payment.updatedAt = new Date().toISOString();
    memStore.payments.set(orderId, payment);
  }

  if (bookingId && newBookingStatus) {
    const booking = memStore.bookings.get(bookingId);
    if (booking && ['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(booking.status)) {
      booking.status = newBookingStatus;
      booking.updatedAt = new Date().toISOString();
      memStore.bookings.set(bookingId, booking);
    }
  }

  return { success: true };
}

function verifyPaymentAccessToken(payment, token) {
  if (!payment || !payment.orderToken || !token) return false;
  const userBuf = Buffer.from(String(token));
  const expectedBuf = Buffer.from(String(payment.orderToken));
  return (userBuf.length === expectedBuf.length) && crypto.timingSafeEqual(userBuf, expectedBuf);
}

/**
 * Notification Outbox Logging Helpers
 */
async function recordNotificationLog({ referenceId, notificationType, recipient, status, errorMessage }) {
  checkReady();
  const id = `NOTIF_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

  if (pool) {
    await pool.query(
      `INSERT INTO notification_logs (id, reference_id, notification_type, recipient, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, referenceId, notificationType, recipient, status, errorMessage || null]
    );
    return id;
  }

  memStore.notificationLogs.set(id, {
    id,
    referenceId,
    notificationType,
    recipient,
    status,
    errorMessage: errorMessage || null,
    createdAt: new Date().toISOString()
  });
  return id;
}

async function saveContact(contact) {
  checkReady();

  if (pool) {
    const res = await pool.query(
      'INSERT INTO contacts (id, name, email, phone, destination, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [contact.id, contact.name, contact.email, contact.phone, contact.destination, contact.message]
    );
    return res.rows[0];
  }

  memStore.contacts.set(contact.id, { ...contact, createdAt: new Date().toISOString() });
  return contact;
}

async function getContacts(options = {}) {
  checkReady();

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), 100);
  const offset = (page - 1) * limit;

  if (pool) {
    const [countRes, rowsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM contacts'),
      pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
    ]);
    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);
    const items = rowsRes.rows;
    items.pagination = { total, page, limit, totalPages };
    return items;
  }

  const all = Array.from(memStore.contacts.values()).reverse();
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const items = all.slice(offset, offset + limit);
  items.pagination = { total, page, limit, totalPages };
  return items;
}

function clearMemoryStoreForTesting() {
  memStore.bookings.clear();
  memStore.payments.clear();
  memStore.contacts.clear();
  memStore.processedWebhookEvents.clear();
  memStore.notificationLogs.clear();
}

module.exports = {
  initDatabase,
  saveBooking,
  getBookingById,
  getBookings,
  updateBookingStatus,
  savePayment,
  getPaymentByOrderId,
  getActivePaymentByBookingId,
  updatePaymentStatus,
  isWebhookEventProcessed,
  recordProcessedWebhookEvent,
  processPaymentWebhookTransaction,
  verifyPaymentAccessToken,
  recordNotificationLog,
  saveContact,
  getContacts,
  clearMemoryStoreForTesting,
  setSimulatedFailure,
  setSimulatedNotReady,
  isDatabaseConnected: () => !!pool && isReady
};
