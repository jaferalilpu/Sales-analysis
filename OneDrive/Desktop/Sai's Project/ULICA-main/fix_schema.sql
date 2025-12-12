-- Fix database schema for ULICA project
-- Run this in Supabase SQL Editor

-- Rename lastLogin to lastLoginAt
ALTER TABLE users RENAME COLUMN "lastLogin" TO "lastLoginAt";

-- Add any missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
