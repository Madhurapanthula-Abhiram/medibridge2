const axios = require('axios');

async function callOpenRouter(messages, systemPrompt = null, model = 'openai/gpt-oss-20b:free', apiKey = null) {
    const models = [
        'openai/gpt-oss-20b:free',
        'arcee-ai/trinity-mini:free',
        'nvidia/nemotron-3-nano-30b-a3b:free'
    ];

    let lastError = null;

    // If messages is just a string (old format), convert to messages array
    let currentMessages = typeof messages === 'string'
        ? [{ role: 'user', content: messages }]
        : messages;

    if (systemPrompt && !currentMessages.some(m => m.role === 'system')) {
        currentMessages = [{ role: 'system', content: systemPrompt }, ...currentMessages];
    }

    // Use the specified model if provided, otherwise try the default order
    const modelToTry = model || models[0];
    const apiKeyToUse = apiKey || process.env.OPENROUTER_API_KEY;

    try {
        console.log(`Attempting with model: ${modelToTry}`);
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: modelToTry,
                messages: currentMessages,
                temperature: 0.3,
                max_tokens: 350,
                top_p: 0.9,
                reasoning: { enabled: true }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKeyToUse}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://medibridge.com',
                    'X-Title': 'MediBridge Health'
                },
                timeout: 15000
            }
        );

        if (response.data && response.data.choices && response.data.choices[0].message) {
            const msg = response.data.choices[0].message;
            return {
                content: msg.content,
                reasoning_details: msg.reasoning_details || null,
                model: modelToTry
            };
        }
    } catch (error) {
        console.error(`Error with model ${modelToTry}:`, error.response?.data || error.message);
        lastError = error;
    }

    throw lastError || new Error('All models failed');
}

module.exports = { callOpenRouter };