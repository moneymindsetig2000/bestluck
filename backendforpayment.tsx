
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

// --- CONFIGURATION ---
// IMPORTANT: In a real production environment, this secret should be stored securely
// as an environment variable (e.g., Deno.env.get("RAZORPAY_WEBHOOK_SECRET")), not hardcoded.
const RAZORPAY_WEBHOOK_SECRET = "AIClavis@123";

// Standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-razorpay-signature",
};

// --- PUTER FS LOGIC (PLACEHOLDER) ---
// This function represents where you would update the user's subscription.
// NOTE: This is a placeholder. A backend Deno server CANNOT directly and securely
// write to a specific user's private Puter File System. This is a significant
// architectural challenge. The Puter FS is designed for client-side access
// within an authenticated user's session.
//
// To make this work, you would need to re-architect to use a central database
// (like Supabase, Firebase, or your own) that your backend can write to, and
// your frontend can read from to check the user's subscription status.
async function updateUserToPro(userId: string) {
  console.log(`[SUCCESS] Verified payment for user: ${userId}.`);
  console.log(`[ACTION] Should now update subscription status for user ${userId} to 'pro'.`);
  //
  // PSEUDO-CODE for what would happen with a central database:
  //
  // const dbClient = await connectToDatabase();
  // await dbClient.table('subscriptions').update({ plan: 'pro' }).eq('user_id', userId);
  //
  // The frontend would then read from this database instead of Puter FS for subscription info.
  
  // This function will just log a success message for now.
  return Promise.resolve();
}


// --- WEBHOOK HANDLER ---
async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { pathname } = new URL(req.url);

  // We only care about POST requests to our webhook endpoint
  if (req.method !== "POST" || pathname !== "/webhook") {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text(); // Get raw body for signature verification

    if (!signature) {
      console.error("Webhook Error: Missing x-razorpay-signature header.");
      return new Response(JSON.stringify({ error: "Signature missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. VERIFY THE SIGNATURE using Web Crypto API (the correct Deno way)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    // Convert the ArrayBuffer to a hex string to compare with the header
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");


    if (generatedSignature !== signature) {
      console.error("Webhook Error: Invalid signature.");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // 2. PROCESS THE EVENT
    const event = JSON.parse(rawBody);
    console.log("Received valid webhook event:", event.event);

    // We only care about the 'payment.captured' event
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      
      // IMPORTANT: To link a payment to a user, you must pass a 'user_id' in the 'notes'
      // section when creating the payment link on your frontend. The current static link
      // does not do this. This needs to be implemented on the frontend.
      const userId = paymentEntity.notes?.user_id;

      if (!userId) {
        console.error("Webhook Error: 'user_id' not found in payment notes. Cannot upgrade user.");
        // We still return 200 to Razorpay because the webhook itself was valid.
        // The issue is with the data provided, not the webhook delivery.
        return new Response(JSON.stringify({ status: "OK - but no user_id found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // 3. UPDATE USER'S SUBSCRIPTION (using the placeholder function)
      await updateUserToPro(userId);
    }
    
    // 4. ACKNOWLEDGE RECEIPT
    // It's crucial to send a 200 OK response back to Razorpay to let them know
    // you have successfully received the webhook.
    return new Response(JSON.stringify({ status: "OK" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

console.log("Razorpay Webhook Server listening on http://localhost:8000/webhook");
serve(handler);
