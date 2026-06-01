-- Migration: Add is_founding_member flag to users
-- Marks users whose email matched a waitlist signup with foundingMember: true.
-- Idempotent: IF NOT EXISTS is safe whether or not the column already exists.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT false;
