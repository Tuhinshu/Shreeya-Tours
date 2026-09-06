-- Migration 002: Indexes, Webhook Event Deduplication, and Notification Outbox Logs

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (email);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings (travel_date);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_cf_order_id ON payments (cf_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

-- Durable webhook event deduplication table
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  event_id VARCHAR(100) PRIMARY KEY,
  event_type VARCHAR(100),
  order_id VARCHAR(100),
  cf_payment_id VARCHAR(100),
  status VARCHAR(50),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON processed_webhook_events (order_id);

-- Durable notification logs / outbox
CREATE TABLE IF NOT EXISTS notification_logs (
  id VARCHAR(64) PRIMARY KEY,
  reference_id VARCHAR(64),
  notification_type VARCHAR(50) NOT NULL, -- 'EMAIL' or 'WHATSAPP'
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'SENT', 'FAILED', 'QUEUED'
  error_message TEXT,
  attempt_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_ref ON notification_logs (reference_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs (status);
