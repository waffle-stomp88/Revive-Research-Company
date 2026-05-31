ALTER TABLE orders ADD COLUMN IF NOT EXISTS paypal_captured_amount DECIMAL(10,2);
