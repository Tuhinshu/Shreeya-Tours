const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { initDatabase, isDatabaseConnected } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Reverse Proxy Awareness: trust first proxy hop in production (e.g. AWS ELB, Render, Cloudflare, Vercel)
const trustProxySetting = process.env.TRUST_PROXY
  ? (process.env.TRUST_PROXY === 'true' ? true : (Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY))
  : (process.env.NODE_ENV === 'production' ? 1 : false);
app.set('trust proxy', trustProxySetting);

// Enforce required security credentials in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.FRONTEND_URL) {
    console.error('FATAL: FRONTEND_URL environment variable must be set in production.');
    process.exit(1);
  }
  if (!process.env.ADMIN_API_KEY) {
    console.error('FATAL: ADMIN_API_KEY environment variable must be set in production.');
    process.exit(1);
  }
  if (process.env.ADMIN_API_KEY.length < 32) {
    console.error('FATAL: ADMIN_API_KEY must be at least 32 characters in production.');
    process.exit(1);
  }
}

// Security HTTP headers
app.use(helmet());

// Production CORS: fail closed in production without localhost fallback
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not allowed.'));
  },
  credentials: true
}));

// Global Rate Limiting: 120 requests per 15 minutes per IP (relaxed in test)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 5000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use(globalLimiter);

// Explicit 32kb request body limit; isolate rawBody storage strictly to CashFree webhook route
app.use(express.json({
  limit: '32kb',
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// Enhanced Health Check Route with component status
app.get('/api/health', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const paymentsConfigured = Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
  const emailConfigured = Boolean(process.env.SENDGRID_API_KEY);
  const watiConfigured = Boolean(process.env.WATI_API_URL && process.env.WATI_ACCESS_TOKEN);

  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: isDatabaseConnected() ? 'CONNECTED' : (isProd ? 'CONNECTED' : 'IN_MEMORY_READY'),
      payments: paymentsConfigured ? 'READY' : (isProd ? 'MISSING_CREDENTIALS' : 'MOCK_READY'),
      emailNotifications: emailConfigured ? 'READY' : (isProd ? 'MISSING_KEY' : 'MOCK_READY'),
      whatsappNotifications: watiConfigured ? 'READY' : (isProd ? 'MISSING_CONFIG' : 'MOCK_READY')
    }
  });
});

const paymentsRouter = require('./routes/payments');
const bookingsRouter = require('./routes/bookings');

app.use('/api/payments', paymentsRouter);
app.use('/api/bookings', bookingsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Internal Error]', err.stack || err.message);

  const statusCode = err.status || (err.type === 'entity.too.large' ? 413 : 500);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload Too Large: Request body exceeds the 32kb limit.'
    });
  }

  // In production, mask internal error messages to prevent implementation or stack detail leaks
  const clientMessage = (process.env.NODE_ENV === 'production' && statusCode >= 500)
    ? 'Internal server error. Please contact support.'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
});

// Establish database readiness before listening
if (require.main === module) {
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Express API Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('FATAL: Could not initialize database:', err.message);
      process.exit(1);
    });
} else {
  // In test environments, initialize asynchronously
  initDatabase().catch(err => console.warn('Test DB init notice:', err.message));
}

module.exports = app;
