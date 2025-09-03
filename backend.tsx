
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
    // For single-shot tasks, we can just use the first key.
    return apiKeys[0];
}

async function handleRefinePrompt(req: Request): Promise<Response> {
    const { prompt } = await req.json();
    if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt to refine" }), {
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
        const metaPrompt = `You are an expert at prompt engineering. Your task is to refine the following user-provided prompt to make it more detailed, clear, and effective for generating high-quality responses from a large language model. Do not respond to the prompt, just improve it. Return ONLY the refined prompt, without any introductory text, explanations, or markdown formatting.

User Prompt: "${prompt}"`;
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: metaPrompt,
        });

        return new Response(JSON.stringify({ refinedPrompt: response.text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error refining prompt:", error);
        return new Response(JSON.stringify({ error: "Failed to refine prompt." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
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
    
    const config: any = {};
    let systemInstruction;

    if (modelName === 'Perplexity') {
        config.tools = [{ googleSearch: {} }];
        systemInstruction = `
You are an AI research assistant. Your primary function is to use Google Search to find up-to-date information to answer the user's query accurately.

**RESPONSE PROTOCOL:**

1.  **Synthesize Answer:** First, write a comprehensive and well-structured answer to the user's query based on the search results. You can use paragraphs, headings, and bullet points as needed to best present the information.
2.  **NO INLINE CITATIONS:** You MUST NOT include any inline citations like [1], [2], or (source 1) within the main body of your answer. The answer should read naturally without any interruptions.
3.  **List Sources at the End:** After you have completely finished writing the answer, add a new section at the very end titled "Sources:".
4.  **Format Sources:** Under the "Sources:" heading, list each of the full URLs you used to generate the answer. Each URL should be on its own line.

**EXAMPLE OF CORRECT FORMAT:**

Here is a report of today's significant news headlines.

**International:**
*   The United States conducted a "kinetic strike" against alleged narcoterroists.
*   The Israel-Hamas war continues, with Israel launching a ground operation in the last Hamas stronghold in Gaza City.

**National (India):**
*   The 56th Goods and Services Tax (GST) Council meeting is underway in New Delhi.

Sources:
https://source.one/kinetic-strike
https://source.two/gaza-operation
https://source.three/gst-meeting
`;
    } else {
        // Base instruction for all other models
        systemInstruction = `You are an AI assistant impersonating ${modelName}. Your goal is to respond to the user's prompt in a way that accurately reflects the known style, tone, capabilities, and typical response format of ${modelName}. Do not, under any circumstances, reveal that you are an impersonation or that you are using another model. Maintain the persona of ${modelName} throughout the conversation.`;
        systemInstruction += ` Do not include any citations or source lists in your response.`;
    }

    // Append user-defined custom instructions to the base/model-specific instruction.
    if (customSystemInstruction && customSystemInstruction.trim() !== '') {
        systemInstruction += `\n\nAdditionally, you must strictly adhere to the following user-defined instructions for your persona:\n\n---\n${customSystemInstruction}\n---`;
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

    if (modelName === 'Perplexity') {
        // Use a pool of hardcoded API keys for web search functionality.
        // The system will try each key in order until one succeeds.
        // IMPORTANT: Replace these placeholders with your actual Google API keys.
        const WEB_SEARCH_API_KEYS = [
            "AIzaSyAok7h0EBhgvVhjVcsqK-g1-sMgsZMnxLQ", // Current active key
            "AIzaSyDax1ZojwLSWaqzwt5KNXKc4Y7DmUhZARM",
            "AIzaSyA4Bsklo0U4iwFiWq0QjA4AsFRSomncsww",
            "AIzaSyAi4fMTvDwa3JJTSFF8DSVf5cpsOkuaFlw",
            "AIzaSyBXqxlvGlTWU7umWoALp84F8dd2fgVJ7r8",
        ];

        for (const key of WEB_SEARCH_API_KEYS) {
            try {
                const ai = new GoogleGenAI({ apiKey: key });
                stream = await ai.models.generateContentStream({
                    model: GEMINI_MODEL,
                    contents: fullContents,
                    config: { ...config, systemInstruction }
                });
                console.log(`Web search successful with one of the keys.`);
                break; // If successful, exit the loop
            } catch (error) {
                console.error(`Web search API key failed. Error:`, error.message, `Continuing to next key.`);
                // If an error occurs, the loop will continue to the next key.
            }
        }
    } else {
        // For all other models, use the API keys from the environment variables.
        const apiKeysEnv = process.env.API_KEYS;
        if (!apiKeysEnv) {
            console.error("API_KEYS environment variable is not set.");
            return new Response(JSON.stringify({ error: "Server configuration error for AI responses." }), {
                status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
        const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);
        if (apiKeys.length === 0) {
            console.error("API_KEYS environment variable is empty or invalid.");
            return new Response(JSON.stringify({ error: "Server configuration error for AI responses." }), {
                status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
        
        for (const key of apiKeys) {
            try {
                const ai = new GoogleGenAI({ apiKey: key });
                stream = await ai.models.generateContentStream({
                    model: GEMINI_MODEL,
                    contents: fullContents,
                    config: { ...config, systemInstruction }
                });
                break; 
            } catch (error) {
                console.error(`API key failed. Error:`, error.message);
            }
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
    } else if (body.task === 'refinePrompt') {
        return await handleRefinePrompt(req);
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