# Stripe Webhook Setup & Verification Guide

This guide will help you set up and verify that your Stripe webhook integration is working correctly.

## Overview

The subscription flow now uses **webhooks as the single source of truth**. This means:

- Stripe sends webhook events to your backend when payments succeed
- The `stripe-webhook` Edge Function activates subscriptions in your database
- The frontend simply polls the database to detect activation
- No subscription activation happens via redirect URLs

## Changes Made

### 1. create-stripe-checkout Function
**Updated to include metadata:**
- Retrieves authenticated user from auth header
- Maps price IDs to plan types
- Attaches `user_id` and `plan_type` to session metadata
- Attaches metadata to both `subscription_data` and `payment_intent_data`

### 2. stripe-webhook Function
**Completely rewritten to use metadata:**
- Uses `metadata.user_id` instead of email lookup
- Uses `metadata.plan_type` instead of fetching from Stripe products
- Handles all required events:
  - `checkout.session.completed` - Initial subscription activation
  - `customer.subscription.created` - Subscription object created
  - `customer.subscription.updated` - Subscription status changes
  - `invoice.payment_succeeded` - Recurring payment success
  - `invoice.payment_failed` - Payment failure handling
- Always returns 200 OK (except signature failures = 400)
- Idempotent and safe to retry
- Comprehensive logging for debugging

### 3. SuccessPage Component
**Changed to UI-only:**
- Does NOT call `activate-subscription` function
- Polls Supabase every 2 seconds for subscription status
- Shows loading state while waiting for webhook
- Shows success message when subscription is activated
- Gracefully handles webhook delays (up to 60 seconds)

## Deployment Steps

### Step 1: Set Environment Variables in Supabase

You need to configure the following environment variables for your Edge Functions:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Add/verify these secrets:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx  # Your Stripe secret key (test or live)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Webhook signing secret (see Step 2)
SUPABASE_URL=https://xxxxx.supabase.co  # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # Your Supabase service role key
SUPABASE_ANON_KEY=xxxxx  # Your Supabase anon key
```

### Step 2: Configure Stripe Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_PROJECT_REF` with your actual Supabase project reference

4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**

6. Copy the **Signing secret** (starts with `whsec_`)
   - Go back to Supabase Edge Functions → Secrets
   - Add it as `STRIPE_WEBHOOK_SECRET`

### Step 3: Deploy Edge Functions

Deploy the updated Edge Functions to Supabase:

```bash
# Deploy create-stripe-checkout
supabase functions deploy create-stripe-checkout

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

If you don't have the Supabase CLI, you can deploy from the Supabase Dashboard by uploading the function code.

### Step 4: Test the Webhook

#### Option A: Use Stripe Test Mode

1. Go to your application's pricing page
2. Click on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date, any CVC, any postal code
5. Complete the checkout

#### Option B: Use Stripe CLI (Recommended for Testing)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward webhooks to your local or deployed function:
   ```bash
   stripe listen --forward-to https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
3. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Verification Checklist

Use this checklist to verify your webhook integration is working correctly:

### Pre-Deployment Checks
- [ ] All environment variables are set in Supabase Edge Functions
- [ ] Webhook endpoint is added in Stripe Dashboard
- [ ] Webhook signing secret is configured as `STRIPE_WEBHOOK_SECRET`
- [ ] Both Edge Functions are deployed to Supabase

### Test Payment Flow
- [ ] User can complete checkout successfully
- [ ] User is redirected to success page
- [ ] Success page shows "Processing Your Payment" state
- [ ] Subscription appears in database within a few seconds
- [ ] Success page automatically shows "Payment Successful"
- [ ] User can download assets after subscription activation

### Stripe Dashboard Verification
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Check recent webhook deliveries
4. Verify:
   - [ ] Webhook deliveries show **200 OK** status
   - [ ] No failed deliveries or 400/500 errors
   - [ ] Events are being received and processed

### Supabase Logs Verification
1. Go to Supabase Dashboard → Edge Functions → Logs
2. Check `stripe-webhook` logs
3. Verify you see:
   - [ ] "WEBHOOK EVENT RECEIVED" messages
   - [ ] Event type and event ID logged
   - [ ] "Activating subscription for user:" messages
   - [ ] "SUCCESS: Subscription activated" messages
   - [ ] No error stack traces

### Database Verification
1. Go to Supabase Dashboard → Table Editor → `subscriptions`
2. After a test purchase, verify:
   - [ ] New row appears with correct `user_id`
   - [ ] `plan_type` matches purchased plan
   - [ ] `subscription_status` is `"active"`
   - [ ] `downloads_remaining` matches plan limits
   - [ ] `stripe_customer_id` and `stripe_subscription_id` are populated
   - [ ] `current_period_start` and `current_period_end` are set

### User Experience Verification
- [ ] Success page doesn't show "Activation Error"
- [ ] User sees their plan details after webhook processes
- [ ] User can immediately download assets after activation
- [ ] Downloads decrement correctly in database
- [ ] Subscription badge shows correct plan and downloads

## Troubleshooting

### Webhook Returns 400 Invalid Signature
**Problem:** Webhook signature verification is failing

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correctly set in Supabase
2. Make sure you copied the signing secret from the correct webhook endpoint
3. Ensure you're using the secret for the right environment (test vs live)
4. Redeploy the `stripe-webhook` function after updating the secret

### Webhook Returns 500 Error
**Problem:** Edge Function is crashing

**Solution:**
1. Check Supabase Edge Function logs for error details
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Check database schema matches expected structure
4. Ensure `subscriptions` table exists and has correct columns

### Subscription Not Activating
**Problem:** Payment succeeds but subscription stays inactive

**Solution:**
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Look for webhook delivery errors or missing events
3. Verify webhook is receiving `checkout.session.completed` events
4. Check Edge Function logs for processing errors
5. Manually test webhook with Stripe CLI trigger

### Success Page Stays in "Processing" State
**Problem:** Frontend never detects subscription activation

**Solution:**
1. Check if webhook was delivered successfully (Stripe Dashboard)
2. Verify subscription was created in Supabase database
3. Check browser console for polling errors
4. Verify user has correct permissions to read `subscriptions` table
5. Check RLS policies on `subscriptions` table

### Metadata Not Appearing in Webhook Events
**Problem:** `user_id` or `plan_type` missing from webhook payload

**Solution:**
1. Verify `create-stripe-checkout` function is deployed
2. Check that metadata is being attached to checkout session
3. Review Edge Function logs to see metadata being logged
4. Ensure frontend is passing auth header to checkout function

## Architecture Diagram

```
User Clicks "Subscribe"
        ↓
Frontend calls create-stripe-checkout
        ↓
Edge Function creates Stripe session with metadata
        ↓
User completes payment on Stripe
        ↓
Stripe sends webhook to stripe-webhook Edge Function
        ↓
Webhook verifies signature
        ↓
Webhook reads metadata (user_id, plan_type)
        ↓
Webhook upserts subscription in Supabase
        ↓
Frontend polls and detects activation
        ↓
User can download assets
```

## Key Benefits of Webhook Approach

1. **Reliability:** Stripe guarantees webhook delivery with automatic retries
2. **Security:** Signature verification ensures authenticity
3. **Idempotency:** Safe to process same event multiple times
4. **Audit Trail:** Complete webhook history in Stripe Dashboard
5. **Separation of Concerns:** Frontend doesn't handle payment logic
6. **Works Everywhere:** No redirect URL dependencies or CORS issues

## Next Steps

After successful verification:

1. Test recurring payments by waiting for `invoice.payment_succeeded` events
2. Test subscription cancellation flows
3. Monitor webhook delivery success rate in production
4. Set up Stripe webhook alerts for failed deliveries
5. Review Edge Function logs regularly for any errors

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Check Stripe webhook delivery logs
3. Review this troubleshooting guide
4. Test with Stripe CLI for detailed debugging
5. Verify all environment variables are correctly set
