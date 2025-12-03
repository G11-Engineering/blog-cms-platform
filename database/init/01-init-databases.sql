-- Initialize all databases
-- NOTE: This SQL file uses default values. For production, update these values
-- to match your environment variables (POSTGRES_*_DB, POSTGRES_*_USER, POSTGRES_*_PASSWORD)
-- or use the docker-compose.yml which automatically creates databases with configurable names.

-- Default database names (can be customized via environment variables)
-- NOTE: PostgreSQL doesn't support IF NOT EXISTS for CREATE DATABASE
-- Run this script only if databases don't exist, or handle errors gracefully
CREATE DATABASE user_service;
CREATE DATABASE content_service;
CREATE DATABASE media_service;
CREATE DATABASE category_service;
CREATE DATABASE comment_service;

-- Create users for each service
-- NOTE: Update passwords to match your POSTGRES_*_PASSWORD environment variables
-- Default passwords shown here (change in production!)
-- PostgreSQL doesn't support IF NOT EXISTS for CREATE USER, so handle errors if user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'user_service') THEN
    CREATE USER user_service WITH PASSWORD 'user_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'content_service') THEN
    CREATE USER content_service WITH PASSWORD 'content_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'media_service') THEN
    CREATE USER media_service WITH PASSWORD 'media_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'category_service') THEN
    CREATE USER category_service WITH PASSWORD 'category_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'comment_service') THEN
    CREATE USER comment_service WITH PASSWORD 'comment_password';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_service TO user_service;
GRANT ALL PRIVILEGES ON DATABASE content_service TO content_service;
GRANT ALL PRIVILEGES ON DATABASE media_service TO media_service;
GRANT ALL PRIVILEGES ON DATABASE category_service TO category_service;
GRANT ALL PRIVILEGES ON DATABASE comment_service TO comment_service;
