const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enforce strict CORS in production
const frontendUrl = process.env.FRONTEND_URL;
if (process.env.NODE_ENV === 'production' && !frontendUrl) {
  console.error('FATAL: FRONTEND_URL environment variable must be set in production.');
  process.exit(1);
}

// Security HTTP headers
app.use(helmet());

// Enable CORS for frontend accessibility
app.use(cors({
  origin: frontendUrl || 'http://localhost:3000',
  credentials: true
}));

// Global Rate Limiting: 120 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use(globalLimiter);

// Store rawBody for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
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
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express API Server running on port ${PORT}`);
  });
}

module.exports = app;
