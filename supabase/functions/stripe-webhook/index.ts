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

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe keys not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
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

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Webhook event:", event.type);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "payment_intent.succeeded"
    ) {
      const session = event.data.object as any;
      const customerEmail = session.customer_email || session.receipt_email;

      if (!customerEmail) {
        console.warn("No customer email found in webhook event");
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

      const { data: authUser } = await supabase.auth.admin.listUsers();
      const user = authUser.users.find((u: any) => u.email === customerEmail);

      if (!user) {
        console.warn(`User not found for email: ${customerEmail}`);
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

      let planType = "basic";
      let downloadsRemaining = PLAN_DOWNLOADS.basic;

      if (event.type === "checkout.session.completed") {
        const checkoutSession = session as any;
        if (checkoutSession.line_items) {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            checkoutSession.id
          );
          const lineItem = lineItems.data[0];

          if (lineItem?.price?.product) {
            const product = await stripe.products.retrieve(
              lineItem.price.product as string
            );
            planType = product.metadata?.plan_type || "basic";
            downloadsRemaining = PLAN_DOWNLOADS[planType] || 7;
          }
        }
      }

      const now = new Date();
      const periodStart = now;
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            plan_type: planType,
            downloads_remaining: downloadsRemaining,
            downloads_used_this_month: 0,
            subscription_status: "active",
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            stripe_customer_id: customerEmail,
            stripe_subscription_id: session.id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log(
        `Subscription activated for user ${user.id} with plan ${planType}`
      );
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;
      const customerEmail = invoice.customer_email || invoice.receipt_number;

      if (customerEmail) {
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const user = authUser.users.find((u: any) => u.email === customerEmail);

        if (user) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              subscription_status: "payment_failed",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Failed to update subscription status:", updateError);
          } else {
            console.log(
              `Payment failed for user ${user.id}. Subscription status updated.`
            );
          }
        }
      }
    }

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
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook processing failed" }),
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
