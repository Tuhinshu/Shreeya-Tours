-- Migration 003: Constraints, Order Access Tokens, and Active Order Enforceability

-- Add unguessable order_token column to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_token VARCHAR(128);
CREATE INDEX IF NOT EXISTS idx_payments_order_token ON payments (order_token);

-- Enforce maximum of ONE active pending payment order per booking at the database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_active_pending ON payments (booking_id) WHERE (status = 'PENDING');

-- Status domain validation constraints
DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT chk_bookings_status CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD CONSTRAINT chk_payments_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'AMOUNT_MISMATCH', 'CANCELLED'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
