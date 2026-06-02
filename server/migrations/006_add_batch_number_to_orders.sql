-- Migration 006: Add batchNumber column to orders table
-- Idempotent via IF NOT EXISTS guard

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'batch_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN batch_number text;
  END IF;
END $$;
