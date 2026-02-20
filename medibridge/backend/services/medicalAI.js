const axios = require('axios');

const API_KEY = process.env.OPENROUTER_API_KEY_MEDICAL;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
    'arcee-ai/trinity-mini:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free'
];

const SYSTEM_PROMPT = `You are a medical AI assistant.
Rules:
* Provide top 3 possible illnesses
* For each illness, include:
  - name: Disease Name
  - description: Very short 1-sentence description
  - specialty: Medical specialty (e.g. Cardiologist, Dermatologist)
  - severity: Low, Moderate, High, or Emergency
  - confidence: Percentage (e.g. 85)
  - symptoms: List of 4-6 common symptoms
  - firstAid: List of 3-4 home remedies or immediate actions
  - carePlan: {
      medications: List of OTC objects { name, usage, purpose, guidance }
    }
  - emergencySigns: List of red flag signs to seek urgent help
* Never suggest prescription drugs
* Be medically conservative
* Output valid JSON only, no markdown, no explanation outside JSON

Response Format (respond ONLY with this JSON, nothing else):
{
  "success": true,
  "extractedSymptoms": ["list"],
  "predictions": [
    {
      "name": "...",
      "description": "...",
      "specialty": "...",
      "severity": "...",
      "confidence": 85,
      "symptoms": ["..."],
      "firstAid": ["..."],
      "carePlan": {
        "medications": [{ "name": "...", "usage": "...", "purpose": "...", "guidance": "..." }]
      },
      "emergencySigns": ["..."]
    }
  ],
  "specialization": "Primary Specialization",
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
}`;

/**
 * Extract JSON from a response that may contain markdown or extra text
 */
function extractJSON(text) {
    if (!text || typeof text !== 'string') return null;

    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Continue to extraction methods
    }

    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            // Continue
        }
    }

    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // Continue
        }
    }

    return null;
}

async function callModel(model, symptomText) {
    console.log(`[MedicalAI] Attempting with model: ${model}`);

    const requestBody = {
        model: model,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Analyze these symptoms and respond with ONLY the JSON format specified: ${symptomText}` }
        ],
        temperature: 0.3,
        max_tokens: 1200
    };

    const response = await axios.post(
        BASE_URL,
        requestBody,
        {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5000',
                'X-Title': 'MediBridge Medical AI'
            },
            timeout: 15000 // 15 second timeout
        }
    );

    if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        console.log(`[MedicalAI] Raw response from ${model}:`, content.substring(0, 200));

        const result = extractJSON(content);
        if (result && result.predictions) {
            console.log(`[MedicalAI] Successfully parsed response from ${model}`);
            // Ensure success flag
            result.success = true;
            return result;
        } else {
            console.error(`[MedicalAI] Failed to extract valid JSON from ${model} response`);
            return null;
        }
    }

    return null;
}

async function predictSymptoms(symptomText) {
    if (!API_KEY) {
        console.error('[MedicalAI] OPENROUTER_API_KEY_MEDICAL is not set!');
        return {
            success: false,
            message: "Medical AI service is not configured. Please contact support."
        };
    }

    // Emergency Detection (CRITICAL)
    const emergencyKeywords = [
        'chest pain', 'heart pain', 'difficulty breathing', 'shortness of breath',
        'severe bleeding', 'unconsciousness', 'passed out', 'bluish lips',
        'confusion', 'slurred speech', 'facial drooping', 'stroke', 'seizure'
    ];
    const lowerInput = symptomText.toLowerCase();
    const hasEmergency = emergencyKeywords.some(kw => lowerInput.includes(kw));

    let finalResult = null;

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const result = await callModel(model, symptomText);
                if (result) {
                    finalResult = result;
                    break;
                }
            } catch (err) {
                console.error(`[MedicalAI] Error with ${model}:`, err.message);
                if (err.response?.status === 429) await new Promise(r => setTimeout(r, 2000));
            }
        }
        if (finalResult) break;
    }

    if (!finalResult) {
        return {
            success: false,
            message: "Unable to analyze symptoms right now. Please seek professional help if severe."
        };
    }

    // Apply Emergency Override
    if (hasEmergency) {
        finalResult.isEmergency = true;
        if (finalResult.predictions && finalResult.predictions.length > 0) {
            finalResult.predictions[0].severity = 'Emergency';
        }
    }

    return finalResult;
}

module.exports = {
    predictSymptoms
};
