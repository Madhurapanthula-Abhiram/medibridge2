const express = require('express');
const router = express.Router();
const axios = require('axios');

// Use the user's specific OpenRouter API key
const OPENROUTER_API_KEY = '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';

// Chatbot endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required'
      });
    }

    console.log('Chatbot API: Received messages:', messages);
    console.log('API Key available:', !!OPENROUTER_API_KEY);
    console.log('API Key length:', OPENROUTER_API_KEY?.length || 0);

    // Create system prompt for medical assistant
    const systemPrompt = `You are Medron, a helpful AI medical assistant. 
Provide small, precise, and point-based answers.

GUIDELINES:
- Be extremely concise and precise. No long stories or unnecessary fillers.
- Use bullet points for clarity. Focus ONLY on important medical points.
- Only answer medical/health questions
- For non-medical questions, say: "I can only assist with medical and health-related queries."
- Provide accurate medical information
- Always include a disclaimer at the end
- Use emojis to be friendly and helpful.`;

    // Prepare messages with system prompt
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not configured');
      return res.json({
        text: "👋 Hi! I'm Medron, your AI Medical Assistant.\n\nI can help you with:\n• Symptom analysis 🤒\n• Medication info 💊\n• General health advice 🧘‍♀️\n\n⚠️ Please configure your OpenRouter API key in the backend .env file.\n\nThis information is for educational purposes only and is not a medical diagnosis. Please consult a qualified healthcare professional.",
        model: 'fallback'
      });
    }

    console.log(`Backend: Calling OpenRouter with model: nvidia/nemotron-3-nano-30b-a3b:free`);

    // API call with reasoning
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: chatMessages,
        reasoning: { enabled: true },
        temperature: 0.3,
        max_tokens: 400,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'MediBridge'
        },
        timeout: 30000
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response structure from OpenRouter');
    }

    // Extract assistant message with reasoning_details
    const assistantMessage = response.data.choices[0].message;
    console.log('Chatbot API: AI response received with reasoning');

    res.json({
      text: assistantMessage.content,
      reasoning_details: assistantMessage.reasoning_details,
      model: 'nvidia/nemotron-3-nano-30b-a3b:free'
    });

  } catch (error) {
    console.error('Chatbot API Error:', error.message);
    console.error('Error details:', error.response?.data);
    
    // Fallback response for API issues
    if (error.response?.status === 401 || !OPENROUTER_API_KEY) {
      return res.json({
        text: "👋 Hi! I'm Medron, your AI Medical Assistant.\n\nI can help you with:\n• Symptom analysis 🤒\n• Medication info 💊\n• General health advice 🧘‍♀️\n\n⚠️ The OpenRouter API key is invalid or expired. Please check your .env file.\n\nThis information is for educational purposes only and is not a medical diagnosis. Please consult a qualified healthcare professional.",
        model: 'fallback'
      });
    } else if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limited',
        message: 'Too many requests. Please wait a moment and try again.'
      });
    }

    res.status(500).json({
      error: 'Chatbot error',
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

module.exports = router;
