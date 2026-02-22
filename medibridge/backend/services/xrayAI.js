const axios = require('axios');

// Dedicated X-ray API key only
const API_KEYS = [
    process.env.XRAY_OPENROUTER_API_KEY
].filter(Boolean);
const OR_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ─── STEP 1: Vision models that can SEE the X-ray image ──────────────────────
// These models accept base64 images and can classify what they see
const VISION_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free'
];

const VISION_PROMPT = `You are a radiologist AI. Analyze this chest X-ray image.
Identify all visible conditions/findings. For each finding provide a label and confidence score (0.0 to 1.0).

Return ONLY a valid JSON array, no markdown, no explanation. Example:
[
  {"label": "Pneumonia", "score": 0.85},
  {"label": "Normal", "score": 0.10},
  {"label": "Pleural Effusion", "score": 0.05}
]

If the image is a normal healthy chest X-ray, return:
[{"label": "Normal", "score": 0.95}, {"label": "No significant findings", "score": 0.05}]

Return ONLY the JSON array.`;

// ─── STEP 2: Text LLM that explains the findings ────────────────────────────
const EXPLANATION_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free'
];

const EXPLANATION_PROMPT = `You are a medical imaging analyst. 
Based on the classification results from a Chest X-ray AI model, provide a detailed, easy-to-understand explanation for a patient.
Rules:
1. Explain what the findings mean in simple terms.
2. Provide immediate next steps (Care Plan) with at least 3 steps.
3. Specify which medical specialist to see.
4. List emergency "red flag" symptoms related to this finding.
5. Provide 3 common OTC or supportive treatments/medications if applicable.
6. Always include a clear medical disclaimer.
7. Return valid JSON only. No markdown, no code blocks, just the raw JSON object.

You MUST respond with ONLY this JSON format:
{
  "condition": "Name of primary condition found",
  "confidence": "Classification confidence as percentage string like 85%",
  "explanation": "Detailed patient-friendly explanation of 2-3 sentences",
  "specialist": "Recommended specialist to visit",
  "carePlan": ["Step 1", "Step 2", "Step 3"],
  "medications": [
    { "name": "Medication name", "purpose": "What it does", "usage": "How to take it" },
    { "name": "Medication name", "purpose": "What it does", "usage": "How to take it" },
    { "name": "Medication name", "purpose": "What it does", "usage": "How to take it" }
  ],
  "emergencySigns": ["Sign 1", "Sign 2", "Sign 3"],
  "disclaimer": "This is an AI-assisted analysis and not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation and treatment."
}`;

/**
 * Extract JSON from a response that may contain markdown or extra text
 */
function extractJSON(text) {
    if (!text || typeof text !== 'string') return null;

    const cleaned = text.trim();

    // Try direct parse
    try { return JSON.parse(cleaned); } catch (e) { /* continue */ }

    // Try to extract from markdown code blocks
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
        try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) { /* continue */ }
    }

    // Try to find JSON array
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        try { return JSON.parse(arrayMatch[0]); } catch (e) { /* continue */ }
    }

    // Try to find JSON object
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch (e) { /* continue */ }
    }

    return null;
}

/**
 * STEP 1: Send image to a vision model for classification
 */
async function classifyWithVision(imageBuffer) {
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    let lastError = null;

    for (const model of VISION_MODELS) {
        console.log(`[XRayAI] Trying vision model: ${model}`);
        try {
            const response = await axios.post(
                OR_BASE_URL,
                {
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: VISION_PROMPT },
                                { type: 'image_url', image_url: { url: dataUrl } }
                            ]
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OR_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://medibridge.vercel.app',
                        'X-Title': 'MediBridge X-Ray AI'
                    },
                    timeout: 45000
                }
            );

            const content = response.data?.choices?.[0]?.message?.content;
            if (!content) {
                console.warn(`[XRayAI] Empty response from ${model}`);
                continue;
            }

            console.log(`[XRayAI] Vision response from ${model}:`, content.substring(0, 300));

            const result = extractJSON(content);
            if (result && Array.isArray(result) && result.length > 0 && result[0].label) {
                console.log(`[XRayAI] ✅ Vision classification success with ${model}`);
                return result;
            }

            console.warn(`[XRayAI] Could not parse valid classification from ${model}`);
        } catch (error) {
            const status = error.response?.status;
            const errMsg = error.response?.data?.error?.message || error.message;
            console.warn(`[XRayAI] Vision model ${model} failed (HTTP ${status}):`, errMsg);
            lastError = errMsg;
        }
    }

    // If all vision models fail, return a generic classification so explanation still works
    console.warn('[XRayAI] ⚠️ All vision models failed, using fallback classification. Last error:', lastError);
    return [
        { label: 'Chest X-ray uploaded', score: 1.0 },
        { label: 'Unable to auto-classify - needs manual review', score: 0.0 }
    ];
}

/**
 * STEP 2: Send classification results to llama-3.3-70b for detailed explanation
 */
async function getExplanation(findings) {
    // Prepare findings text
    const findingsText = findings
        .map(f => `${f.label}: ${(f.score * 100).toFixed(1)}%`)
        .join(', ');

    console.log(`[XRayAI] Requesting explanation for: ${findingsText}`);

    let lastError = null;

    for (const model of EXPLANATION_MODELS) {
        console.log(`[XRayAI] Trying explanation model: ${model}`);
        try {
            const response = await axios.post(
                OR_BASE_URL,
                {
                    model: model,
                    messages: [
                        { role: 'system', content: EXPLANATION_PROMPT },
                        {
                            role: 'user',
                            content: `The Chest X-ray AI classification results are: ${findingsText}. Please provide a detailed analysis and return ONLY valid JSON.`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OR_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://medibridge.vercel.app',
                        'X-Title': 'MediBridge X-Ray AI'
                    },
                    timeout: 45000
                }
            );

            const content = response.data?.choices?.[0]?.message?.content;
            if (!content) {
                console.warn(`[XRayAI] Empty explanation from ${model}`);
                continue;
            }

            console.log(`[XRayAI] Explanation response from ${model}:`, content.substring(0, 300));

            const result = extractJSON(content);
            if (result && result.condition) {
                console.log(`[XRayAI] ✅ Explanation success with ${model}`);
                return result;
            }

            console.warn(`[XRayAI] Could not parse valid explanation JSON from ${model}`);
        } catch (error) {
            const status = error.response?.status;
            const errMsg = error.response?.data?.error?.message || error.message;
            console.warn(`[XRayAI] Explanation model ${model} failed (HTTP ${status}):`, errMsg);
            lastError = errMsg;
        }
    }

    throw new Error(`All explanation models failed. Last error: ${lastError}`);
}

/**
 * Main analysis function — called from the route
 */
async function analyzeXRay(imageBuffer) {
    if (!OR_API_KEY) {
        throw new Error('XRAY_OPENROUTER_API_KEY is not set in environment variables');
    }

    console.log('[XRayAI] ═══════════════════════════════════════');
    console.log('[XRayAI] Starting X-Ray analysis...');
    console.log(`[XRayAI] Image size: ${imageBuffer.length} bytes`);

    // STEP 1: Classify the image using a vision model
    const classification = await classifyWithVision(imageBuffer);
    console.log('[XRayAI] Classification:', JSON.stringify(classification));

    // STEP 2: Get detailed explanation using llama-3.3-70b
    const explanation = await getExplanation(classification);

    // Attach raw classification data
    explanation.rawClassification = classification;

    console.log('[XRayAI] ✅ Analysis complete!');
    console.log('[XRayAI] ═══════════════════════════════════════');

    return explanation;
}

module.exports = { analyzeXRay };
