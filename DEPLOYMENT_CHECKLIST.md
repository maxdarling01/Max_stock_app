# Stripe Webhook Deployment - Quick Reference

## Pre-Deployment Checklist

### 1. Environment Variables (Supabase Dashboard → Edge Functions → Secrets)

Set these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx           # From Stripe Dashboard → API Keys
STRIPE_WEBHOOK_SECRET=whsec_xxxxx         # From Stripe Dashboard → Webhooks (see step 2)
SUPABASE_URL=https://xxxxx.supabase.co    # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=xxxxx           # From Supabase → Settings → API
SUPABASE_ANON_KEY=xxxxx                   # From Supabase → Settings → API
```

### 2. Stripe Webhook Configuration

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (whsec_xxxxx)
7. Add it to Supabase as `STRIPE_WEBHOOK_SECRET`

### 3. Deploy Edge Functions

Deploy both updated functions:

```bash
supabase functions deploy create-stripe-checkout
supabase functions deploy stripe-webhook
```

Or deploy via Supabase Dashboard if you don't have CLI.

### 4. Deploy Frontend

Build and deploy your frontend:

```bash
npm run build
# Deploy to Netlify/Vercel/etc
```

## Post-Deployment Verification

### Step 1: Test Payment (5 minutes)

1. Go to your pricing page
2. Click any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Wait on success page for activation

**Expected Result:**
- Success page shows "Processing" for 2-5 seconds
- Then shows "Payment Successful" with plan details
- User can immediately download assets

### Step 2: Verify Webhook Delivery (2 minutes)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click your webhook endpoint
3. Check "Recent deliveries" tab

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Event: checkout.session.completed
- ✅ No errors or retries

### Step 3: Check Database (1 minute)

1. Go to Supabase Dashboard → Table Editor → `subscriptions`
2. Find row for test user

**Expected Data:**
```
user_id: <test_user_id>
plan_type: "basic" (or whatever you purchased)
subscription_status: "active"
downloads_remaining: 7 (or plan amount)
stripe_customer_id: "cus_xxxxx"
stripe_subscription_id: "cs_xxxxx" or "pi_xxxxx"
```

### Step 4: Verify Logs (2 minutes)

1. Go to Supabase Dashboard → Edge Functions → stripe-webhook → Logs

**Expected Logs:**
```
=== WEBHOOK EVENT RECEIVED ===
Event Type: checkout.session.completed
Checkout Session ID: cs_xxxxx
Session Metadata: { user_id: 'xxx', plan_type: 'basic' }
Activating subscription for user: xxx
SUCCESS: Subscription activated for user xxx with plan basic
```

## Troubleshooting Guide

### Problem: Webhook returns 400 Invalid Signature

**Check:**
- Is `STRIPE_WEBHOOK_SECRET` set correctly?
- Does it match the signing secret from Stripe Dashboard?
- Did you redeploy the function after setting the secret?

**Fix:**
1. Copy signing secret from Stripe webhook endpoint
2. Update `STRIPE_WEBHOOK_SECRET` in Supabase
3. Redeploy: `supabase functions deploy stripe-webhook`

---

### Problem: Webhook returns 500 Error

**Check:**
- Are all environment variables set?
- Does the `subscriptions` table exist?
- Are there any typos in environment variable names?

**Fix:**
1. Check Edge Function logs for specific error
2. Verify all env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Ensure database schema matches expected structure

---

### Problem: Success page stays in "Processing" state forever

**Check:**
- Did webhook actually get delivered?
- Is subscription in database?
- Can user read subscriptions table (RLS)?

**Fix:**
1. Check Stripe Dashboard → Webhooks for delivery status
2. Query subscriptions table directly
3. Verify RLS policies allow user to read their subscription
4. Check browser console for polling errors

---

### Problem: Metadata missing from webhook payload

**Check:**
- Is `create-stripe-checkout` deployed?
- Are you passing the auth header when creating checkout?

**Fix:**
1. Redeploy `create-stripe-checkout`
2. Check Edge Function logs to see if metadata is being attached
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

### Problem: User activated but can't download

**Check:**
- Is subscription status "active"?
- Is downloads_remaining > 0?
- Do RLS policies allow downloads?

**Fix:**
1. Verify subscription row in database
2. Check RLS policies on assets table
3. Test download with direct database query

## Quick Commands

### Test Webhook Locally
```bash
stripe listen --forward-to https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

### View Supabase Logs
```bash
supabase functions logs stripe-webhook
```

### Query Test Subscription
```sql
SELECT * FROM subscriptions
WHERE user_id = 'YOUR_TEST_USER_ID';
```

### Force Webhook Retry (Stripe Dashboard)
1. Go to Webhooks → Your endpoint → Recent deliveries
2. Click failed event
3. Click "Resend" button

## Success Criteria

After deployment, verify these are all true:

- ✅ Webhook deliveries show 200 OK in Stripe Dashboard
- ✅ Subscription activates within 5 seconds of payment
- ✅ Success page transitions from "Processing" to "Success"
- ✅ User can immediately download assets
- ✅ Downloads decrement correctly in database
- ✅ Edge Function logs show "SUCCESS" messages
- ✅ No 400 or 500 errors in logs

## Support Resources

- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Webhook Signing**: https://stripe.com/docs/webhooks/signatures

## Emergency Rollback

If critical issues occur:

1. Disable webhook in Stripe Dashboard (stops new events)
2. Revert to previous function versions
3. Debug locally with Stripe CLI
4. Redeploy when fixed

## Next Steps After Success

1. Switch to Stripe live mode (update keys)
2. Update webhook endpoint to use live keys
3. Monitor webhook delivery success rate
4. Set up Stripe alerts for failed webhooks
5. Test recurring payments (invoice.payment_succeeded)
6. Test subscription cancellation flows

---

**Last Updated:** 2025-12-14
**Version:** 1.0.0
