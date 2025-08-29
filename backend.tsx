import { GoogleGenAI } from "npm:@google/genai";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const GEMINI_MODEL = "gemini-2.5-flash";

// Helper for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests for the main logic. This prevents errors from other
  // request types (like GET from browser prefetches or health checks) that don't have a body.
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, modelName } = await req.json();

    if (!prompt || !modelName) {
      return new Response(JSON.stringify({ error: "Missing prompt or modelName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get multiple API keys from the environment variable
    const apiKeysEnv = process.env.API_KEYS;
    if (!apiKeysEnv) {
        console.error("API_KEYS environment variable is not set.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        console.error("API_KEYS environment variable is empty or invalid.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // This system instruction asks Gemini to act as the specified model.
    const systemInstruction = `You are an AI assistant impersonating ${modelName}. Your goal is to respond to the user's prompt in a way that accurately reflects the known style, tone, capabilities, and typical response format of ${modelName}. Do not, under any circumstances, reveal that you are an impersonation or that you are using another model. Maintain the persona of ${modelName} throughout the conversation. For the 'Perplexity' persona, you should invent some plausible sources and add citation markers like [1], [2] in the text. At the end of your response, on new lines, list the sources in the format: '[1]: Title of Source (https://example.com/source1)'.`;

    let stream = null;

    // Iterate through API keys until one succeeds
    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        try {
            console.log(`Attempting to generate content with API key index ${i}`);
            const ai = new GoogleGenAI({ apiKey: key });
            stream = await ai.models.generateContentStream({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            console.log(`Successfully connected with API key index ${i}. Starting stream.`);
            break; // Exit the loop on success
        } catch (error) {
            console.error(`API key index ${i} failed. Error:`, error.message);
            // If this was the last key, the loop will end and stream will be null.
        }
    }

    // If all keys failed, 'stream' will be null
    if (!stream) {
        console.error("All API keys failed.");
        return new Response(
            JSON.stringify({ error: "We are expecting very high traffic now, please try again later!" }),
            {
                status: 503, // Service Unavailable
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
    
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              const encoded = new TextEncoder().encode(text);
              controller.enqueue(encoded);
            }
          }
        } catch (error) {
          console.error("Error during Gemini stream processing:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    // Specifically handle JSON parsing errors, which can happen with malformed bodies.
    if (error instanceof SyntaxError) {
        console.error("JSON Parsing Error:", error.message);
        return new Response(JSON.stringify({ error: "Invalid JSON in request body. " + error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
    console.error("Handler error:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

console.log("Listening on http://localhost:8000");
serve(handler);