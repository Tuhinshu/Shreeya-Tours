const { Pool } = require('pg');

let pool = null;
let isReady = false;
let initPromise = null;

// In-memory store used strictly for test/dev environments when DATABASE_URL is not set
const memStore = {
  bookings: new Map(),
  payments: new Map(),
  contacts: new Map()
};

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
      // In production, enforce TLS certificate verification unless explicitly disabled
      const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false'
        ? false
        : (process.env.NODE_ENV === 'production');

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized }
      });

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`
          CREATE TABLE IF NOT EXISTS bookings (
            id VARCHAR(64) PRIMARY KEY,
            package_id VARCHAR(100) NOT NULL,
            package_name VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            travel_date VARCHAR(50) NOT NULL,
            pax INT DEFAULT 1,
            special_requests TEXT,
            base_amount NUMERIC NOT NULL,
            gst_amount NUMERIC NOT NULL,
            gst_rate NUMERIC NOT NULL,
            total_amount NUMERIC NOT NULL,
            tax_details JSONB,
            customer_state VARCHAR(100),
            office_state VARCHAR(100),
            invoice_date VARCHAR(50),
            status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS payments (
            id VARCHAR(64) PRIMARY KEY,
            booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
            cf_order_id VARCHAR(100) UNIQUE NOT NULL,
            payment_session_id VARCHAR(255),
            amount NUMERIC NOT NULL,
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(50) DEFAULT 'PENDING',
            cf_payment_id VARCHAR(100),
            payment_method VARCHAR(50),
            raw_payload JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS contacts (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            destination VARCHAR(255),
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await client.query('COMMIT');
        isReady = true;
        console.log('✅ PostgreSQL database schemas verified and ready.');
      } catch (err) {
        await client.query('ROLLBACK');
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
      JSON.stringify(booking.taxDetails || {}),
      booking.customerState,
      booking.officeState,
      booking.invoiceDate,
      booking.status || 'PENDING_PAYMENT'
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  // In-memory fallback for unit testing
  memStore.bookings.set(booking.id, { ...booking, createdAt: new Date().toISOString() });
  return booking;
}

async function getBookingById(id) {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      packageId: row.package_id,
      packageName: row.package_name,
      name: row.name,
      email: row.email,
      phone: row.phone,
      travelDate: row.travel_date,
      pax: row.pax,
      specialRequests: row.special_requests,
      baseAmount: parseFloat(row.base_amount),
      gstAmount: parseFloat(row.gst_amount),
      gstRate: parseFloat(row.gst_rate),
      totalAmount: parseFloat(row.total_amount),
      taxDetails: row.tax_details,
      customerState: row.customer_state,
      officeState: row.office_state,
      invoiceDate: row.invoice_date,
      status: row.status,
      createdAt: row.created_at
    };
  }

  return memStore.bookings.get(id) || null;
}

async function getBookings() {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      packageId: row.package_id,
      packageName: row.package_name,
      name: row.name,
      email: row.email,
      phone: row.phone,
      travelDate: row.travel_date,
      pax: row.pax,
      specialRequests: row.special_requests,
      baseAmount: parseFloat(row.base_amount),
      gstAmount: parseFloat(row.gst_amount),
      gstRate: parseFloat(row.gst_rate),
      totalAmount: parseFloat(row.total_amount),
      taxDetails: row.tax_details,
      customerState: row.customer_state,
      officeState: row.office_state,
      invoiceDate: row.invoice_date,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  return Array.from(memStore.bookings.values()).reverse();
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

  if (pool) {
    const query = `
      INSERT INTO payments (
        id, booking_id, cf_order_id, payment_session_id, amount, currency, status, cf_payment_id, payment_method, raw_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      payment.rawPayload ? JSON.stringify(payment.rawPayload) : null
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  memStore.payments.set(payment.cfOrderId, { ...payment, createdAt: new Date().toISOString() });
  return payment;
}

async function getPaymentByOrderId(orderId) {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM payments WHERE cf_order_id = $1', [orderId]);
    return res.rows[0] || null;
  }

  return memStore.payments.get(orderId) || null;
}

async function updatePaymentStatus(cfOrderId, status, cfPaymentId = null, paymentMethod = null, rawPayload = null) {
  checkReady();

  if (pool) {
    const res = await pool.query(
      `UPDATE payments 
       SET status = $1, cf_payment_id = COALESCE($2, cf_payment_id), 
           payment_method = COALESCE($3, payment_method), raw_payload = COALESCE($4, raw_payload),
           updated_at = CURRENT_TIMESTAMP 
       WHERE cf_order_id = $5 
       RETURNING *;`,
      [status, cfPaymentId, paymentMethod, rawPayload ? JSON.stringify(rawPayload) : null, cfOrderId]
    );
    return res.rows[0] || null;
  }

  const payment = memStore.payments.get(cfOrderId);
  if (payment) {
    payment.status = status;
    if (cfPaymentId) payment.cfPaymentId = cfPaymentId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (rawPayload) payment.rawPayload = rawPayload;
    payment.updatedAt = new Date().toISOString();
    memStore.payments.set(cfOrderId, payment);
    return payment;
  }
  return null;
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

async function getContacts() {
  checkReady();

  if (pool) {
    const res = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return res.rows;
  }

  return Array.from(memStore.contacts.values()).reverse();
}

function clearMemoryStoreForTesting() {
  memStore.bookings.clear();
  memStore.payments.clear();
  memStore.contacts.clear();
}

module.exports = {
  initDatabase,
  saveBooking,
  getBookingById,
  getBookings,
  updateBookingStatus,
  savePayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  saveContact,
  getContacts,
  clearMemoryStoreForTesting,
  setSimulatedFailure,
  setSimulatedNotReady,
  isDatabaseConnected: () => !!pool && isReady
};
