-- Final schema fix for ULICA project
-- Run this in Supabase SQL Editor

-- First, let's see what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add the missing lastLogin column
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- Add any other missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Verify the final structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
