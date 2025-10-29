# Database Migrations

This directory contains SQL migration files for the Foslog database (Supabase PostgreSQL).

## Files

1. **001_add_verification_table.sql** - Creates the `verification` table required by Better Auth for email verification, password resets, etc.
2. **002_add_rls_policies.sql** - Adds Row Level Security (RLS) policies for Better Auth tables (users, accounts, sessions, verification)

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Create a new query
4. Copy and paste the contents of each migration file in order (001, then 002)
5. Run each query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Apply migration 001
supabase db execute --file prisma/migrations/001_add_verification_table.sql

# Apply migration 002
supabase db execute --file prisma/migrations/002_add_rls_policies.sql
```

### Option 3: Using psql

If you have direct database access:

```bash
# Connect to your database
psql "postgresql://[YOUR_CONNECTION_STRING]"

# Run migrations
\i prisma/migrations/001_add_verification_table.sql
\i prisma/migrations/002_add_rls_policies.sql
```

## Important Notes

### RLS (Row Level Security)

These migrations enable Row Level Security on all Better Auth tables. This is essential for security when using Supabase.

The policies allow:
- **Service role**: Full access (used by Better Auth server-side)
- **Authenticated users**: Can manage their own data
- **Anonymous users**: Can create accounts during signup

### Database Connection

Better Auth requires two connection strings in your environment variables:

- `DATABASE_URL` - For direct connections (used by Prisma)
- `DIRECT_URL` - For connection pooling (optional but recommended for serverless)

Make sure your `DATABASE_URL` uses the **service role** key for Better Auth to bypass RLS when needed.

### Verification Table

The `verification` table is used by Better Auth for:
- Email verification during signup
- Password reset tokens
- Magic link authentication
- Email OTP verification

## After Running Migrations

1. Generate the Prisma client to update types:
   ```bash
   npx prisma generate
   ```

2. Verify the schema matches your database:
   ```bash
   npx prisma db pull
   ```

## Troubleshooting

If you encounter RLS-related errors:

1. Verify your `DATABASE_URL` uses the **service role** key (not the anon key)
2. Check that RLS policies are correctly applied using Supabase dashboard
3. Ensure your Better Auth configuration matches the database schema

For more information about Better Auth and Prisma, see:
- [Better Auth Documentation](https://better-auth.com)
- [Prisma Documentation](https://prisma.io/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
