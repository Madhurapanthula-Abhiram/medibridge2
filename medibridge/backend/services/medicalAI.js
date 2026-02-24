const axios = require('axios');

const API_KEY = process.env.OPENROUTER_API_KEY_MEDICAL;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// In-memory cache for symptom results
const predictionCache = new Map();

// Requested Models in Order: 1. Qwen, 2. Arcee, 3. Gemma
const MODELS = [
    'qwen/qwen3-4b:free',
    'arcee-ai/trinity-mini:free',
    'google/gemma-3-27b-it:free'
];

const SYSTEM_PROMPT = `Act as an experienced medical clinician. Use realistic, patient-safe reasoning.

When analyzing symptoms:
1. Think step-by-step like a doctor performing differential diagnosis.
2. Prioritize common causes.
3. Consider infectious and benign conditions first.
4. Do not overestimate malignancy risk.

Your task is to analyze patient symptoms and return a structured JSON report.
BE CONCISE. Use short, precise bullet points.

CRITICAL RULES:
1. OUTPUT ONLY RAW JSON. NO MARKDOWN. NO CODE BLOCKS.
2. Provide exactly top 3 possible illnesses.
3. Follow EXACT schema (name, description, specialty, severity, confidence, symptoms, firstAid, carePlan, emergencySigns).
4. USE SAFE OTC MEDICATIONS ONLY. Never suggest prescription drugs.

EXAMPLE RESPONSE:
{
  "success": true,
  "extractedSymptoms": ["cough"],
  "predictions": [
    {
      "name": "Common Cold",
      "description": "A viral infection of your nose and throat.",
      "specialty": "General Physician",
      "severity": "Low",
      "confidence": 90,
      "symptoms": ["Runny nose", "Sore throat"],
      "firstAid": ["Stay hydrated", "Get rest"],
      "carePlan": { 
        "medications": [
          { "name": "Paracetamol", "usage": "500mg q6h", "purpose": "Fever", "guidance": "Max 4g/day" },
          { "name": "Guaifenesin", "usage": "400mg q12h", "purpose": "Cough", "guidance": "Drink water" },
          { "name": "Loratadine", "usage": "10mg qd", "purpose": "Runny nose", "guidance": "May cause drowsiness" }
        ] 
      },
      "emergencySigns": ["Difficulty breathing", "High fever", "Confusion", "Dehydration"]
    }
  ],
  "disclaimer": "This is not a medical diagnosis. Consult a professional."
}`;

function extractJSON(text) {
    if (!text || typeof text !== 'string') return null;
    const trimmed = text.trim();
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        try { return JSON.parse(codeBlockMatch[1]); } catch (e) { }
    }
    try { return JSON.parse(trimmed); } catch (e) { }
    const startIndex = trimmed.indexOf('{');
    const endIndex = trimmed.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        try { return JSON.parse(trimmed.substring(startIndex, endIndex + 1)); } catch (e) { }
    }
    return null;
}

async function callModel(model, symptomText) {
    try {
        console.log(`[MedicalAI] Sequential Attempt: ${model}`);
        const response = await axios.post(
            BASE_URL,
            {
                model: model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Symptoms: ${symptomText}` }
                ],
                temperature: 0.1,
                max_tokens: 1200
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://medibridge.vercel.app',
                    'X-Title': 'MediBridge Medical AI'
                },
                timeout: 35000
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            const result = extractJSON(response.data.choices[0].message.content);
            if (result && result.predictions) {
                result.success = true;
                return result;
            }
        }
    } catch (err) {
        console.error(`[MedicalAI] Model ${model} failed:`, err.message);
    }
    return null;
}

async function predictSymptoms(symptomText) {
    if (!API_KEY) return { success: false, message: "Service not configured." };

    // 1. Check Cache (Normalize input for better hits)
    const normalizedInput = symptomText.toLowerCase().trim();
    if (predictionCache.has(normalizedInput)) {
        console.log('[MedicalAI] Cache Hit! Returning stored result.');
        return predictionCache.get(normalizedInput);
    }

    const emergencyKeywords = ['chest pain', 'heart pain', 'difficulty breathing', 'shortness of breath', 'severe bleeding', 'unconsciousness', 'stroke'];
    const hasEmergency = emergencyKeywords.some(kw => normalizedInput.includes(kw));

    console.log(`[MedicalAI] Starting Sequential Fallback (Qwen -> Arcee -> Gemma)`);

    let finalResult = null;

    // 2. Sequential Fallback Loop
    for (const model of MODELS) {
        finalResult = await callModel(model, symptomText);
        if (finalResult) break; // Stop as soon as we get a result
    }

    if (!finalResult) {
        return {
            success: false,
            message: "Our AI specialists are currently busy. Please try again or consult a doctor if symptoms are severe."
        };
    }

    // Apply Emergency logic
    if (hasEmergency) {
        finalResult.isEmergency = true;
        if (finalResult.predictions?.length > 0) finalResult.predictions[0].severity = 'Emergency';
    }

    // 3. Save to Cache
    predictionCache.set(normalizedInput, finalResult);

    return finalResult;
}

module.exports = { predictSymptoms };
