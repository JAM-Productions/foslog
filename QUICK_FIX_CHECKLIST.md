# Quick Fix Checklist

Use this checklist to quickly deploy the login/signup fix to production.

## ✅ Pre-Deployment Checklist

- [ ] Review the changes in this PR
- [ ] Understand the issue (see `IMPLEMENTATION_SUMMARY.md`)
- [ ] Have access to Supabase Dashboard
- [ ] Have DATABASE_URL with service role key

## 🚀 Deployment Steps (5 minutes)

### Step 1: Apply Database Migrations (2 minutes)

1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **SQL Editor**
3. Run `prisma/migrations/001_add_verification_table.sql`
4. Run `prisma/migrations/002_add_rls_policies.sql`

### Step 2: Verify Environment Variables (1 minute)

Check that these are set in Vercel:
- `DATABASE_URL` - Uses service role (not anon key)
- `DIRECT_URL` - For connection pooling
- `BETTER_AUTH_SECRET` - Set and consistent
- `BETTER_AUTH_URL` - Points to production URL

### Step 3: Merge and Deploy (1 minute)

```bash
# Merge this PR to main
# Vercel will automatically deploy
```

### Step 4: Verify (1 minute)

Visit https://foslog.vercel.app and test:
- [ ] Sign up with new email
- [ ] Sign in with existing account
- [ ] Social login (Google/GitHub)

## 🔍 If Something Goes Wrong

### Error: "permission denied for table verification"
→ DATABASE_URL needs service role key, not anon key

### Error: "relation 'verification' does not exist"
→ Migration not applied, check Supabase SQL Editor

### CORS errors in browser
→ Check origin is `http://localhost:3000` or `https://foslog.vercel.app`

### Still having issues?
→ See `docs/deployment-guide.md` for detailed troubleshooting

## 📞 Need Help?

1. Check `docs/deployment-guide.md` - Detailed deployment guide
2. Check `IMPLEMENTATION_SUMMARY.md` - Technical details
3. Open a GitHub issue with error logs

## ⚡ One-Command Verification (After Deployment)

```bash
# Test that verification table exists
# Run in Supabase SQL Editor:
SELECT COUNT(*) FROM verification;
```

Expected: Returns 0 (table exists but is empty)

## 🎉 Success Indicators

- ✅ No errors in Vercel logs
- ✅ Users can sign up
- ✅ Users can log in
- ✅ Social auth works
- ✅ No CORS errors in browser console
