-- Add permanent founding-member flag to the users table.
-- Set once on first login when the user's email matches a waitlistSignups row
-- with foundingMember = true. Never recomputed afterward.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founding_member boolean DEFAULT false;
