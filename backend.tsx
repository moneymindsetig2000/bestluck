import { GoogleGenAI } from "npm:@google/genai";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const GEMINI_MODEL = "gemini-2.5-flash";

// Helper for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface ImagePayload {
  mimeType: string;
  data: string;
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests for the main logic.
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, modelName, images } = await req.json();

    if ((!prompt || prompt.trim() === '') && (!images || images.length === 0)) {
       return new Response(JSON.stringify({ error: "Missing prompt or images" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!modelName) {
      return new Response(JSON.stringify({ error: "Missing modelName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // FIX: Get API key from environment variable, per guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable is not set.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // This system instruction asks Gemini to act as the specified model.
    const systemInstruction = `You are an AI assistant impersonating ${modelName}. Your goal is to respond to the user's prompt in a way that accurately reflects the known style, tone, capabilities, and typical response format of ${modelName}. Do not, under any circumstances, reveal that you are an impersonation or that you are using another model. Maintain the persona of ${modelName} throughout the conversation. For the 'Perplexity' persona, you should invent some plausible sources and add citation markers like [1], [2] in the text. At the end of your response, on new lines, list the sources in the format: '[1]: Title of Source (https://example.com/source1)'.`;
    
    const parts = [];
    if (prompt && prompt.trim() !== '') {
        parts.push({ text: prompt });
    }
    if (images && Array.isArray(images) && images.length > 0) {
        const imageParts = images.map((image: ImagePayload) => ({
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            },
        }));
        parts.push(...imageParts);
    }
    
    let stream;
    try {
        const ai = new GoogleGenAI({ apiKey });
        stream = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
            }
        });
    } catch (error) {
        console.error("API call failed. Error:", error.message);
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