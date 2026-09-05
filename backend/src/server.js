const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { initDatabase } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Enable CORS for frontend accessibility
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

