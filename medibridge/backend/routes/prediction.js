const express = require('express');
const { callOpenRouter } = require('../utils/ai');
const { mapIllnessToSpecialist } = require('../utils/specialistMapping');
const router = express.Router();

const SYSTEM_PROMPT = 'You are an advanced medical assistant AI. You analyze symptoms and provide possible conditions with safety-focused guidance. You never provide definitive diagnosis. You only suggest general OTC medications and recommend consulting doctors when necessary. Always return structured JSON.';

router.post('/', async (req, res) => {
  try {
    const { symptoms, model = 'gpt-4o-mini', api_key } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: 'Please provide symptoms' });
    }

    const userPrompt = `Analyze the following symptoms and provide medical guidance: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}`;

    // Try GPT-OSS first, then Trinity Mini, then Nemotron as fallback
    let result;
    let modelUsed = '';

    try {
      // Try GPT-OSS
      result = await callOpenRouter(userPrompt, SYSTEM_PROMPT, 'gpt-4o-mini', api_key);
      modelUsed = 'GPT-OSS';
    } catch (error) {
      console.log('GPT-OSS failed, trying Trinity Mini...');
      
      try {
        // Try Trinity Mini
        result = await callOpenRouter(userPrompt, SYSTEM_PROMPT, 'trinity-mini', api_key);
        modelUsed = 'Trinity Mini';
      } catch (error2) {
        console.log('Trinity Mini failed, trying Nemotron...');
        
        try {
          // Try Nemotron as fallback
          result = await callOpenRouter(userPrompt, SYSTEM_PROMPT, 'nvidia/nemotron-3-nano-30b-a3b:free', api_key);
          modelUsed = 'Nemotron';
        } catch (error3) {
          console.error('All models failed:', error3);
          return res.status(500).json({ 
            message: 'All AI models failed. Please try again later.',
            error: error3.message 
          });
        }
      }
    }

    let prediction;
    try {
      const content = result.content;
      if (typeof content === 'object') {
        prediction = content;
      } else {
        // Robust JSON extraction from AI response
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonStr = content.substring(start, end + 1);
          prediction = JSON.parse(jsonStr);
        } else {
          throw new Error('No JSON object found in AI response');
        }
      }
    } catch (e) {
      console.error('JSON Parse Error:', e, result.content);
      const errorLog = `[${new Date().toISOString()}] JSON_PARSE_ERROR: ${e.message}\nContent: ${result.content}\n`;
      fs.appendFileSync(path.join(__dirname, '../api.log'), errorLog);
      return res.status(500).json({ message: 'Failed to parse AI response as JSON' });
    }

    // Map predicted illnesses to appropriate specialists
    if (prediction.illnesses && prediction.illnesses.length > 0) {
      const primaryIllness = prediction.illnesses[0].name;
      const mappedSpecialist = mapIllnessToSpecialist(primaryIllness);
      
      // Override or fallback to AI's recommendation
      prediction.doctor_specialist = prediction.doctor_specialist || mappedSpecialist;
    }

    res.json({
      ...prediction,
      modelUsed,
      reasoning_details: result.reasoning_details,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Server error during prediction', error: error.message });
  }
});

module.exports = router;