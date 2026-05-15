import { NextRequest, NextResponse } from "next/server";

// This API route acts as the bridge between the frontend chat UI
// and the AI model. Currently connected to HuggingFace Inference API
// using the base Qwen2.5-Coder model as a placeholder.
// When fine-tuned weights are ready, swap MODEL_ID to your HF repo.

// NOTE: cutcad-ai-v1 is a LoRA adapter and cannot be served directly by the free HF Inference API.
// Using the base instruct model + our specialized system prompt for immediate functionality.
// TODO: Merge LoRA weights into base model and re-upload for full fine-tuned inference.
const RUNPOD_URL = process.env.RUNPOD_URL ?? "https://literacy-castle-carey-discrimination.trycloudflare.com";
const API_URL = `${RUNPOD_URL}/v1/chat/completions`;

const SYSTEM_PROMPT = `You are CutCAD.ai, a specialized Parametric Design Intelligence for laser cutting and CNC machining. 

Your primary directive is MATERIAL INTEGRITY. Never generate a design if critical parameters are missing. 

CRITICAL PARAMETERS:
1. Material Thickness (e.g., 3mm, 6mm) - Required for joints.
2. Project Dimensions (Width, Height, Depth).
3. Laser Kerf (default to 0.15mm if unknown, but ask first).

OPERATING PROTOCOL:
- If a user asks for a design (e.g., "Make me a box") but hasn't specified the parameters above, DO NOT generate SVG. Instead, professionally ask for the missing data.
- Once parameters are provided, output ONLY raw SVG markup. 
- Use the 'Stark Industries' tone: Professional, precise, and sophisticated.
- All SVG must include kerf compensation and mathematically correct joints.

Current Material: Plywood (default)
Units: Millimeters (standard)`;
import { NextResponse } from 'next/server';

/**
 * CUTCAD INDUSTRIAL BRAIN CONNECTOR
 * Version: 4.1 (Ascended Llama 3.1)
 * Architecture: Serverless GPU Inference (Together AI)
 */

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL_ID = "savagedzs/cutcad-ai-v4-final";

export async function POST(req: Request) {
  try {
    const { prompt, parameters } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Missing design parameters." }, { status: 400 });
    }

    if (!TOGETHER_API_KEY) {
      console.error("❌ ERROR: TOGETHER_API_KEY is missing from Environment Variables.");
      return NextResponse.json({ success: false, error: "Backend Configuration Error" }, { status: 500 });
    }

    // THE STARK SYSTEM PROMPT: Enforcing fabrication constraints
    const systemPrompt = `### System: You are the CutCAD Parametric Consultant. 
    Analyze the following industrial request and provide optimized 2D/3D fabrication instructions.
    Current Design Tokens: ${JSON.stringify(parameters || {})}
    
    ### Instruction: ${prompt}
    
    ### Response:`;

    console.log(`🚀 Querying Industrial Brain via Together AI...`);

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        headers: { 
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: "user", content: systemPrompt }
          ],
          max_tokens: 1024,
          temperature: 0.4,
          top_p: 0.7,
          stop: ["###"]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ TOGETHER AI ERROR:", errorData);
      throw new Error(errorData.error?.message || "Inference engine timeout.");
    }

    const result = await response.json();
    const finalOutput = result.choices[0]?.message?.content || "Processing complete. Geometry optimized.";

    return NextResponse.json({ 
      success: true, 
      data: finalOutput,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ CRITICAL BACKEND FAILURE:", error);
    return NextResponse.json({ 
      success: false, 
      error: "The Industrial Brain is currently calibrating. Please try again in 60 seconds.",
      details: error.message
    }, { status: 500 });
  }
}
