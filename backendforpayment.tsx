import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import Razorpay from "npm:razorpay";
import { createHmac } from "https://deno.land/std@0.182.0/node/crypto.ts";

// Helper for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Initialize Razorpay with credentials from environment variables.
// These must be set in your Deno Deploy project settings.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Endpoint to create a new payment order
async function handleCreateOrder(req: Request): Promise<Response> {
  try {
    const options = {
      amount: 79900, // Amount in the smallest currency unit (799 * 100 paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
        return new Response(JSON.stringify({ error: "Order creation failed" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(JSON.stringify({ error: "Could not create order." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// Endpoint to verify the payment signature for security
async function handleVerifyPayment(req: Request): Promise<Response> {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return new Response(JSON.stringify({ error: "Missing payment verification details" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            return new Response(JSON.stringify({ verified: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ verified: false, error: "Signature mismatch" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return new Response(JSON.stringify({ verified: false, error: "Internal server error during verification." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}


async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  if (req.method === "POST" && url.pathname === "/create-order") {
    return handleCreateOrder(req);
  }

  if (req.method === "POST" && url.pathname === "/verify-payment") {
    return handleVerifyPayment(req);
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

console.log("Razorpay payment backend listening on http://localhost:8000");
serve(handler);