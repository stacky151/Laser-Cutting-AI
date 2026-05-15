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
    const body = await req.json();
    const { prompt, parameters } = body;

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
