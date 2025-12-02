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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_email) {
      throw new Error("No customer email in session");
    }

    const { data: authUser } = await supabase.auth.admin.listUsers();
    const user = authUser.users.find(u => u.email === session.customer_email);

    if (!user) {
      throw new Error("User not found");
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const lineItem = lineItems.data[0];

    if (!lineItem?.price?.product) {
      throw new Error("No product found in checkout session");
    }

    const product = await stripe.products.retrieve(lineItem.price.product as string);
    const planType = product.metadata?.plan_type || 'basic';

    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const downloadsRemaining = PLAN_DOWNLOADS[planType] || 7;

    const { error: updateError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_type: planType,
        downloads_remaining: downloadsRemaining,
        downloads_used_this_month: 0,
        subscription_status: 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        stripe_customer_id: session.customer_email,
        stripe_subscription_id: session.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      throw updateError;
    }

    const responseData = {
      success: true,
      planType,
      downloadsRemaining,
      periodEnd: periodEnd.toISOString(),
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Activation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to activate subscription" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
