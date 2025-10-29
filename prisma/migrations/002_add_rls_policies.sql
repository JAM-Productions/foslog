-- RLS Policies for Better Auth Tables
-- This migration adds/updates RLS policies for Better Auth authentication tables

-- =====================================================
-- USERS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow service role full access to users" ON users;
DROP POLICY IF EXISTS "Allow users to read their own data" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow public to read user profiles" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON users;

-- Service role has full access (used by Better Auth)
CREATE POLICY "Allow service role full access to users" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read all user profiles (for public profiles)
CREATE POLICY "Allow public to read user profiles" ON users
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own data" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Allow insertion during signup (anon users)
CREATE POLICY "Allow authenticated users to insert" ON users
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- =====================================================
-- ACCOUNTS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow service role full access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow users to read their own accounts" ON accounts;
DROP POLICY IF EXISTS "Allow users to insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Allow users to update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Allow users to delete their own accounts" ON accounts;

-- Service role has full access
CREATE POLICY "Allow service role full access to accounts" ON accounts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to manage their own accounts
CREATE POLICY "Allow users to read their own accounts" ON accounts
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = "userId");

CREATE POLICY "Allow users to insert their own accounts" ON accounts
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own accounts" ON accounts
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = "userId")
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Allow users to delete their own accounts" ON accounts
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = "userId");

-- =====================================================
-- SESSIONS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow service role full access to sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to read their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to delete their own sessions" ON sessions;

-- Service role has full access
CREATE POLICY "Allow service role full access to sessions" ON sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to manage their own sessions
CREATE POLICY "Allow users to read their own sessions" ON sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = "userId");

CREATE POLICY "Allow users to insert their own sessions" ON sessions
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own sessions" ON sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = "userId")
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Allow users to delete their own sessions" ON sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = "userId");
