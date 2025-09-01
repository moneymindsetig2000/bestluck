
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

// Function to get a random API key from the list
const getApiKey = (): string | null => {
    const apiKeysEnv = process.env.API_KEYS;
    if (!apiKeysEnv) {
        console.error("API_KEYS environment variable is not set.");
        return null;
    }
    const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        console.error("API_KEYS environment variable is empty or invalid.");
        return null;
    }
    // For the single instruction generation, we can just use the first key.
    return apiKeys[0];
}

async function handleInstructionGeneration(req: Request): Promise<Response> {
    const { instructionPrompt } = await req.json();
    if (!instructionPrompt) {
        return new Response(JSON.stringify({ error: "Missing instructionPrompt" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const metaPrompt = `You are an expert system prompt engineer. A user wants an AI with a specific persona. Your task is to expand their brief description into a detailed, well-structured system prompt that an AI can follow. Do NOT include any conversational text, introductory sentences, explanations about what you are doing, or markdown separators like '---'. Your entire response must be ONLY the system prompt itself, ready to be used directly. User's description: "${instructionPrompt}"`;
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: metaPrompt,
        });

        return new Response(JSON.stringify({ instruction: response.text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error generating instruction:", error);
        return new Response(JSON.stringify({ error: "Failed to generate instruction." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

async function handleChat(req: Request): Promise<Response> {
    const { prompt, modelName, images, history, customSystemInstruction } = await req.json();

    if ((!prompt || prompt.trim() === '') && (!images || images.length === 0)) {
       return new Response(JSON.stringify({ error: "Missing prompt or images" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!modelName) {
      return new Response(JSON.stringify({ error: "Missing modelName" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Get multiple API keys from the environment variable
    const apiKeysEnv = process.env.API_KEYS;
    if (!apiKeysEnv) {
        console.error("API_KEYS environment variable is not set.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
    const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        console.error("API_KEYS environment variable is empty or invalid.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    let systemInstruction = `You are an AI assistant impersonating ${modelName}. Your goal is to respond to the user's prompt in a way that accurately reflects the known style, tone, capabilities, and typical response format of ${modelName}. Do not, under any circumstances, reveal that you are an impersonation or that you are using another model. Maintain the persona of ${modelName} throughout the conversation.`;
    
    if (customSystemInstruction && customSystemInstruction.trim() !== '') {
        systemInstruction += `\n\nAdditionally, you must strictly adhere to the following user-defined instructions for your persona:\n\n---\n${customSystemInstruction}\n---`;
    }

    if (modelName === 'Perplexity') {
        systemInstruction += ` You MUST invent some plausible sources for your information. Add citation markers like [1], [2] in the text where the information is used. After the main body of your response, you MUST list these sources on new lines. The format for the source list is critical for the application to work. It must be exactly: '[1]: Title of Source (https://example.com/source1)'. There should be no other text or characters after the source list.`;
    } else {
        systemInstruction += ` Do not include any citations or source lists in your response.`;
    }
    
    const userParts = [];
    if (prompt && prompt.trim() !== '') {
        userParts.push({ text: prompt });
    }
    if (images && Array.isArray(images) && images.length > 0) {
        const imageParts = images.map((image: ImagePayload) => ({
            inlineData: { mimeType: image.mimeType, data: image.data }
        }));
        userParts.push(...imageParts);
    }

    const newUserContent = { role: 'user', parts: userParts };
    const fullContents = [...(history || []), newUserContent];
    
    let stream = null;
    for (const key of apiKeys) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            stream = await ai.models.generateContentStream({
                model: GEMINI_MODEL,
                contents: fullContents,
                config: { systemInstruction }
            });
            break; 
        } catch (error) {
            console.error(`API key failed. Error:`, error.message);
        }
    }

    if (!stream) {
        return new Response(
            JSON.stringify({ error: "We are expecting very high traffic now, please try again later!" }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
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
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.clone().json(); // Clone to read body safely
    if (body.task === 'generateInstruction') {
        return await handleInstructionGeneration(req);
    } else {
        return await handleChat(req);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: "Invalid JSON in request body. " + error.message }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
    console.error("Handler error:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal server error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

console.log("Listening on http://localhost:8000");
serve(handler);
