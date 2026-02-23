const axios = require('axios');

const API_KEY = process.env.OPENROUTER_API_KEY_MEDICAL;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'arcee-ai/trinity-mini:free',
    'openai/gpt-oss-20b:free'
];

const SYSTEM_PROMPT = `You are a professional medical diagnostic AI. Your task is to analyze patient symptoms and return a structured JSON report.

CRITICAL RULES:
1. OUTPUT ONLY RAW JSON. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATIONS.
2. Provide exactly top 3 possible illnesses.
3. For each illness, follow this EXACT schema:
   - name: Disease Name
   - description: 1-sentence patient-friendly description
   - specialty: Medical specialty (e.g., Cardiologist, Dermatologist)
   - severity: "Low", "Moderate", "High", or "Emergency"
   - confidence: Integer 0-100 (Be realistic)
   - symptoms: MUST provide exactly 4-6 common symptoms as a list of strings.
   - firstAid: MUST provide exactly 4-5 home remedies or immediate next steps as a list of strings.
   - carePlan: { 
       "medications": [
         { "name": "Med 1", "usage": "...", "purpose": "...", "guidance": "..." },
         { "name": "Med 2", "usage": "...", "purpose": "...", "guidance": "..." },
         { "name": "Med 3", "usage": "...", "purpose": "...", "guidance": "..." }
       ] 
     } (MUST PROVIDE EXACTLY 3 COMMON OTC MEDICATIONS)
   - emergencySigns: MUST provide exactly 4 clear points explaining when to see a doctor or seek urgent care.

4. USE SAFE OVER-THE-COUNTER (OTC) MEDICATIONS ONLY. Never suggest prescription drugs.
5. BE MEDICALLY CONSERVATIVE.

EXAMPLE RESPONSE:
{
  "success": true,
  "extractedSymptoms": ["cough", "fever"],
  "predictions": [
    {
      "name": "Common Cold",
      "description": "A viral infection of your nose and throat.",
      "specialty": "General Physician",
      "severity": "Low",
      "confidence": 90,
      "symptoms": ["Runny nose", "Sore throat", "Congestion", "Mild fever"],
      "firstAid": ["Stay hydrated", "Get plenty of rest", "Use saline nasal drops", "Gargle with salt water"],
      "carePlan": { 
        "medications": [
          { "name": "Paracetamol", "usage": "500-1000mg every 6 hours", "purpose": "Fever/Aches", "guidance": "Max 4g/day" },
          { "name": "Guaifenesin", "usage": "400mg every 12 hours", "purpose": "Cough Relief", "guidance": "Drink plenty of water" },
          { "name": "Diphenhydramine", "usage": "25-50mg before bed", "purpose": "Sleep/Congestion", "guidance": "May cause drowsiness" }
        ] 
      },
      "emergencySigns": [
        "Difficulty breathing or chest tightness",
        "Persistent high fever > 103F for 48h",
        "Slurred speech or sudden confusion",
        "Inability to keep down fluids/dehydration"
      ]
    }
  ],
  "specialization": "General Internal Medicine",
  "disclaimer": "This is not a medical diagnosis. Consult a professional."
}

Analyze these symptoms and respond with ONLY the JSON object:`;

/**
 * Extract JSON from a response that may contain markdown or extra text
 */
function extractJSON(text) {
    if (!text || typeof text !== 'string') return null;

    const trimmed = text.trim();

    // 1. Try stripping markdown blocks first as it is most common
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        try { return JSON.parse(codeBlockMatch[1]); } catch (e) { }
    }

    // 2. Try raw parse
    try { return JSON.parse(trimmed); } catch (e) { }

    // 3. Try finding the first '{' and last '}'
    const startIndex = trimmed.indexOf('{');
    const endIndex = trimmed.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        try {
            return JSON.parse(trimmed.substring(startIndex, endIndex + 1));
        } catch (e) { }
    }

    return null;
}

async function callModel(model, symptomText) {
    console.log(`[MedicalAI] Attempting with model: ${model}`);

    const requestBody = {
        model: model,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Symptoms: ${symptomText}` }
        ],
        temperature: 0.1, // Lower temperature for more consistent JSON
        max_tokens: 1500
    };

    const response = await axios.post(
        BASE_URL,
        requestBody,
        {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://medibridge.vercel.app',
                'X-Title': 'MediBridge Medical AI'
            },
            timeout: 45000 // Increase to 45 seconds for larger MoE models
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

    console.log(`[MedicalAI] Starting parallel race for 3 models...`);

    // Create parallel "racer" promises
    // We wrap them so they only resolve if they return valid data, otherwise they reject
    // This allows us to use Promise.any to get the FIRST SUCCESSFUL result.
    const racers = MODELS.map(async (model) => {
        try {
            const result = await callModel(model, symptomText);
            if (result && result.success) {
                return result;
            }
            throw new Error(`Model ${model} returned invalid data`);
        } catch (err) {
            console.error(`[MedicalAI] Racer ${model} failed:`, err.message);
            throw err; // Important: throw so Promise.any ignores this failure
        }
    });

    let finalResult = null;

    try {
        // Promise.any resolves as soon as ANY of the models succeed.
        // It is much faster than waiting for them one by one.
        finalResult = await Promise.any(racers);
        console.log(`[MedicalAI] Win! Result received from fastest model.`);
    } catch (err) {
        console.error('[MedicalAI] All parallel racers failed. Attempting one last sequential fallback...');
        // Last ditch effort: Try Arcee again as it is the most likely to be available
        try {
            finalResult = await callModel('arcee-ai/trinity-mini:free', symptomText);
        } catch (lastErr) {
            console.error('[MedicalAI] Sequential fallback also failed.');
        }
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
