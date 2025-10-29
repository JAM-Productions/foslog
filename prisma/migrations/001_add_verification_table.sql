-- Create verification table for Better Auth
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Enable Row Level Security (RLS) on verification table
ALTER TABLE verification ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for verification table
-- Allow service role to do everything (used by Better Auth)
CREATE POLICY "Allow service role full access to verification" ON verification
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert their own verification records
CREATE POLICY "Allow authenticated users to insert verification" ON verification
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to read their own verification records
CREATE POLICY "Allow users to read their own verification" ON verification
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update their own verification records
CREATE POLICY "Allow users to update their own verification" ON verification
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow users to delete their own verification records
CREATE POLICY "Allow users to delete their own verification" ON verification
    FOR DELETE
    TO authenticated
    USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);
CREATE INDEX IF NOT EXISTS verification_expires_at_idx ON verification("expiresAt");
