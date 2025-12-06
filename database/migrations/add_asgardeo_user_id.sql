-- Migration: Add Asgardeo User ID column
-- Date: 2025-11-28
-- Purpose: Store Asgardeo user IDs locally to avoid 403 errors when managing users via SCIM API

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS asgardeo_user_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_asgardeo_user_id ON users(asgardeo_user_id);

COMMIT;
