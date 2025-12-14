import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLAN_DOWNLOADS: Record<string, number> = {
  basic: 7,
  pro: 15,
  elite: 30,
  legendary: 999999,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  let event: Stripe.Event;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      console.error("Stripe keys not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.text();

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("=== WEBHOOK EVENT RECEIVED ===");
    console.log("Event Type:", event.type);
    console.log("Event ID:", event.id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event, stripe, supabase);
    } else if (event.type === "customer.subscription.created") {
      await handleSubscriptionCreated(event, supabase);
    } else if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(event, supabase);
    } else if (event.type === "invoice.payment_succeeded") {
      await handleInvoicePaymentSucceeded(event, stripe, supabase);
    } else if (event.type === "invoice.payment_failed") {
      await handleInvoicePaymentFailed(event, supabase);
    } else {
      console.log("Ignoring event type:", event.type);
    }

    return new Response(
      JSON.stringify({ success: true, received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function handleCheckoutCompleted(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: any
) {
  try {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Checkout Session ID:", session.id);
    console.log("Session Metadata:", session.metadata);

    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;

    if (!userId) {
      console.warn("No user_id in session metadata, cannot activate subscription");
      return;
    }

    if (!planType) {
      console.warn("No plan_type in session metadata, using default 'basic'");
    }

    const finalPlanType = planType || "basic";
    const downloadsRemaining = PLAN_DOWNLOADS[finalPlanType] || 7;

    console.log("Activating subscription for user:", userId);
    console.log("Plan Type:", finalPlanType);
    console.log("Downloads:", downloadsRemaining);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let stripeCustomerId = session.customer as string;
    let stripeSubscriptionId = session.subscription as string;

    if (session.mode === "payment") {
      stripeSubscriptionId = session.payment_intent as string;
    }

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let finalDownloads = downloadsRemaining;

    if (existingSub && (finalPlanType === "pro" || finalPlanType === "elite")) {
      const maxRollover = finalPlanType === "pro" ? 30 : 60;
      finalDownloads = Math.min(
        (existingSub.downloads_remaining || 0) + downloadsRemaining,
        maxRollover
      );
      console.log("Existing subscription found, rolling over downloads to:", finalDownloads);
    }

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_type: finalPlanType,
          downloads_remaining: finalDownloads,
          downloads_used_this_month: 0,
          subscription_status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: now.toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error("Database upsert error:", upsertError);
      throw upsertError;
    }

    console.log(`SUCCESS: Subscription activated for user ${userId} with plan ${finalPlanType}`);
  } catch (error) {
    console.error("Error in handleCheckoutCompleted:", error);
    throw error;
  }
}

async function handleSubscriptionCreated(event: Stripe.Event, supabase: any) {
  try {
    const subscription = event.data.object as Stripe.Subscription;

    console.log("Subscription Created:", subscription.id);
    console.log("Subscription Metadata:", subscription.metadata);

    const userId = subscription.metadata?.user_id;
    const planType = subscription.metadata?.plan_type;

    if (!userId) {
      console.warn("No user_id in subscription metadata");
      return;
    }

    const finalPlanType = planType || "basic";
    const downloadsRemaining = PLAN_DOWNLOADS[finalPlanType] || 7;

    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_type: finalPlanType,
          downloads_remaining: downloadsRemaining,
          downloads_used_this_month: 0,
          subscription_status: "active",
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error("Database upsert error:", upsertError);
      throw upsertError;
    }

    console.log(`SUCCESS: Subscription created for user ${userId}`);
  } catch (error) {
    console.error("Error in handleSubscriptionCreated:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event, supabase: any) {
  try {
    const subscription = event.data.object as Stripe.Subscription;

    console.log("Subscription Updated:", subscription.id);
    console.log("Subscription Status:", subscription.status);

    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.warn("No user_id in subscription metadata");
      return;
    }

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingSub) {
      console.warn("No existing subscription found for user:", userId);
      return;
    }

    let updateData: any = {
      subscription_status: subscription.status === "active" ? "active" : "cancelled",
      updated_at: new Date().toISOString(),
    };

    if (subscription.status === "active") {
      const periodStart = new Date(subscription.current_period_start * 1000);
      const periodEnd = new Date(subscription.current_period_end * 1000);

      updateData.current_period_start = periodStart.toISOString();
      updateData.current_period_end = periodEnd.toISOString();
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log(`SUCCESS: Subscription updated for user ${userId}`);
  } catch (error) {
    console.error("Error in handleSubscriptionUpdated:", error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: any
) {
  try {
    const invoice = event.data.object as Stripe.Invoice;

    console.log("Invoice Payment Succeeded:", invoice.id);
    console.log("Subscription ID:", invoice.subscription);

    if (!invoice.subscription) {
      console.log("No subscription associated with invoice, skipping");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );

    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.warn("No user_id in subscription metadata");
      return;
    }

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingSub) {
      console.warn("No existing subscription found for user:", userId);
      return;
    }

    const planType = existingSub.plan_type || "basic";
    const downloadsRemaining = PLAN_DOWNLOADS[planType] || 7;
    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        downloads_remaining: downloadsRemaining,
        downloads_used_this_month: 0,
        subscription_status: "active",
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log(`SUCCESS: Subscription renewed for user ${userId} with plan ${planType}`);
  } catch (error) {
    console.error("Error in handleInvoicePaymentSucceeded:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event, supabase: any) {
  try {
    const invoice = event.data.object as Stripe.Invoice;

    console.log("Invoice Payment Failed:", invoice.id);

    if (!invoice.subscription) {
      console.log("No subscription associated with invoice, skipping");
      return;
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        subscription_status: "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", invoice.subscription);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log(`SUCCESS: Payment failed status updated for subscription ${invoice.subscription}`);
  } catch (error) {
    console.error("Error in handleInvoicePaymentFailed:", error);
    throw error;
  }
}
