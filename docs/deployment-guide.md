# Deployment Guide: Fixing Login and Signup Issues

This guide explains how to deploy the fixes for the login and signup issues caused by missing Better Auth tables and RLS policies.

## Issue Summary

After enabling Supabase RLS (Row Level Security), the application was failing with:
```
The table `public.verification` does not exist in the current database.
```

Additionally, the CORS configuration was using an invalid format (multiple origins in a single header value).

## Changes Made

### 1. Database Schema Changes

- **Added `verification` table** to Prisma schema (`prisma/schema.prisma`)
  - Required by Better Auth for email verification, password resets, magic links, etc.
  - Fields: `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`

### 2. SQL Migrations for Supabase

Created migration files in `prisma/migrations/`:

- **001_add_verification_table.sql**: Creates the verification table with proper RLS policies
- **002_add_rls_policies.sql**: Adds/updates RLS policies for all Better Auth tables (users, accounts, sessions)

### 3. CORS Configuration Fix

- Fixed invalid CORS header format in `app/api/auth/[...all]/route.ts`
- Changed from comma-separated origins to dynamic origin selection
- Added `Access-Control-Allow-Credentials: true` header

## Deployment Steps

### Step 1: Apply Database Migrations

Choose one of the following methods to apply the migrations:

#### Option A: Supabase Dashboard (Recommended for Quick Fix)

1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `prisma/migrations/001_add_verification_table.sql`
6. Paste and click **Run**
7. Repeat for `prisma/migrations/002_add_rls_policies.sql`

#### Option B: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db execute --file prisma/migrations/001_add_verification_table.sql
supabase db execute --file prisma/migrations/002_add_rls_policies.sql
```

#### Option C: Using psql (Direct Database Connection)

```bash
# Connect to your database (get connection string from Supabase dashboard)
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# Run migrations
\i prisma/migrations/001_add_verification_table.sql
\i prisma/migrations/002_add_rls_policies.sql
```

### Step 2: Verify Database URL Configuration

Ensure your environment variables are correctly set:

```env
# Use the service role connection string (not anon key)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Important**: 
- The `DATABASE_URL` must use a connection string with service role privileges
- Better Auth needs to bypass RLS for certain operations
- Do NOT use the anon key for the backend connection

### Step 3: Update Prisma Client

After applying migrations, regenerate the Prisma client:

```bash
npx prisma generate
```

### Step 4: Deploy Application Changes

Deploy the updated code to Vercel:

```bash
# If you have Vercel CLI
vercel --prod

# Or push to main branch to trigger automatic deployment
git push origin main
```

### Step 5: Verify the Fix

1. Visit https://foslog.vercel.app
2. Try signing up with a new account
3. Try logging in with an existing account
4. Try social login (Google/GitHub)

All authentication flows should now work without errors.

## What Each Migration Does

### Migration 001: Verification Table

Creates the `verification` table with:
- RLS enabled
- Service role has full access
- Authenticated users can insert/read/update/delete verification records
- Indexes on `identifier` and `expiresAt` for performance

### Migration 002: RLS Policies

Updates RLS policies for Better Auth tables:

**Users table**:
- Service role: Full access
- Public: Can read user profiles
- Users: Can update their own profile
- Anonymous: Can create accounts during signup

**Accounts table**:
- Service role: Full access
- Users: Can manage their own OAuth accounts

**Sessions table**:
- Service role: Full access
- Users: Can manage their own sessions

## Troubleshooting

### Error: "permission denied for table verification"

- Check that your `DATABASE_URL` uses the service role key
- Verify RLS policies are correctly applied

### Error: "relation 'verification' does not exist"

- Run migration 001 again
- Check if migration was applied: `SELECT * FROM verification LIMIT 1;`

### CORS Errors

- Verify the origin is in the allowed list: `http://localhost:3000` or `https://foslog.vercel.app`
- Check browser console for specific CORS error messages

### Error: "Prisma Client is out of sync"

```bash
npx prisma generate
```

## Rollback (If Needed)

If you need to rollback the migrations:

```sql
-- Remove verification table
DROP TABLE IF EXISTS verification;

-- Remove RLS policies (if needed)
DROP POLICY IF EXISTS "Allow service role full access to users" ON users;
-- ... (repeat for other policies)
```

## Additional Resources

- [Better Auth Documentation](https://better-auth.com)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)

## Support

If you encounter issues, please:
1. Check the error logs in Vercel dashboard
2. Verify database connection in Supabase dashboard
3. Review RLS policies in Supabase > Database > Policies
4. Open a GitHub issue with full error details
