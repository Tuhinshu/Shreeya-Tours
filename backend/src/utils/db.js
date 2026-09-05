const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.resolve(__dirname, '../../data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure persistent local storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pool = null;
let pgConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });

    // Verify connection and create schema
    pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        travel_date VARCHAR(50) NOT NULL,
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        infants INT DEFAULT 0,
        package_name VARCHAR(255) NOT NULL,
        base_amount NUMERIC NOT NULL,
        gst_amount NUMERIC NOT NULL,
        gst_rate NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        tax_details JSONB,
        customer_state VARCHAR(100),
        office_state VARCHAR(100),
        invoice_date VARCHAR(50),
        status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    `).then(() => {
      pgConnected = true;
      console.log('✅ PostgreSQL connected and schemas verified.');
    }).catch(err => {
      console.warn('⚠️ PostgreSQL connection failed, falling back to persistent JSON:', err.message);
      pgConnected = false;
    });
  } catch (err) {
    console.warn('⚠️ Could not initialize PostgreSQL pool:', err.message);
    pgConnected = false;
  }
}

// Helper: read JSON file safely
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return [];
  }
}

// Helper: write JSON file safely
function writeJson(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e.message);
  }
}

async function saveBooking(booking) {
  // Always save to persistent JSON
  const existing = readJson(BOOKINGS_FILE);
  existing.unshift(booking);
  writeJson(BOOKINGS_FILE, existing);

  // If PG connected, save to DB
  if (pool && pgConnected) {
    try {
      await pool.query(
        `INSERT INTO bookings (
          id, name, email, phone, travel_date, adults, children, infants,
          package_name, base_amount, gst_amount, gst_rate, total_amount,
          tax_details, customer_state, office_state, invoice_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          booking.id, booking.name, booking.email, booking.phone, booking.travelDate,
          booking.adults, booking.children, booking.infants, booking.packageName,
          booking.baseAmount, booking.gstAmount, booking.gstRate, booking.totalAmount,
          JSON.stringify(booking.taxDetails || {}), booking.customerState,
          booking.officeState, booking.invoiceDate, booking.status
        ]
      );
    } catch (err) {
      console.error('PostgreSQL insert error for booking:', err.message);
    }
  }

  return booking;
}

async function getBookings() {
  if (pool && pgConnected) {
    try {
      const res = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return res.rows;
    } catch (err) {
      console.error('PostgreSQL fetch error, falling back to JSON:', err.message);
    }
  }
  return readJson(BOOKINGS_FILE);
}

async function saveContact(contact) {
  const existing = readJson(CONTACTS_FILE);
  existing.unshift(contact);
  writeJson(CONTACTS_FILE, existing);

  if (pool && pgConnected) {
    try {
      await pool.query(
        'INSERT INTO contacts (id, name, email, phone, destination, message) VALUES ($1, $2, $3, $4, $5, $6)',
        [contact.id, contact.name, contact.email, contact.phone, contact.destination, contact.message]
      );
    } catch (err) {
      console.error('PostgreSQL insert error for contact:', err.message);
    }
  }

  return contact;
}

async function getContacts() {
  if (pool && pgConnected) {
    try {
      const res = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
      return res.rows;
    } catch (err) {
      console.error('PostgreSQL fetch error for contacts:', err.message);
    }
  }
  return readJson(CONTACTS_FILE);
}

module.exports = {
  saveBooking,
  getBookings,
  saveContact,
  getContacts,
  isDatabaseConnected: () => pgConnected
};
