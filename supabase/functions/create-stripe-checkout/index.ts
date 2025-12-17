import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
    const { priceId, isSubscription, customerEmail, successUrl, cancelUrl } = await req.json();

    console.log('Creating checkout session');
    console.log('Price ID:', priceId);
    console.log('Is Subscription:', isSubscription);
    console.log('Customer Email:', customerEmail);

    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace(/^Bearer\s+/i, '');

    const { data: { user }, error: userError } =
    await supabase.auth.getUser(token);


    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - user not found" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = user.id;

    const planTypeMap: Record<string, string> = {
      'price_1SWMkEAViJR9tCfxxBexPSmD': 'basic',
      'price_1SWMmWAViJR9tCfxgFABERlT': 'pro',
      'price_1SWMnBAViJR9tCfxhsunTR4r': 'elite',
      'price_1SWMo7AViJR9tCfxvo2sIcoP': 'legendary',
      'price_1SWMosAViJR9tCfxdQEMI5iO': 'personalized',
    };

    const planType = planTypeMap[priceId] || 'basic';

    const finalSuccessUrl = `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;
    console.log('Final Success URL:', finalSuccessUrl);

    const sessionConfig: any = {
      mode: isSubscription ? "subscription" : "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan_type: planType,
      },
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    if (isSubscription) {
      sessionConfig.subscription_data = {
        metadata: {
          user_id: userId,
          plan_type: planType,
        },
      };
    } else {
      sessionConfig.payment_intent_data = {
        metadata: {
          user_id: userId,
          plan_type: planType,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Stripe session created:', session.id);
    console.log('Metadata attached:', { user_id: userId, plan_type: planType });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create checkout session" }),
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
