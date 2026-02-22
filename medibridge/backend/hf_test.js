require('dotenv').config();
const axios = require('axios');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODELS = [
    'torchxrayvision/densenet121-res224-chex',
    'codewithdark/vit-chest-xray',
    'ianpan/chest-x-ray-basic'
];

async function test() {
    console.log('Testing HF API Key:', HF_API_KEY ? 'Present' : 'Missing');

    for (const model of HF_MODELS) {
        try {
            console.log(`Checking model: ${model}...`);
            const response = await axios.get(`https://api-inference.huggingface.co/models/${model}`, {
                headers: { 'Authorization': `Bearer ${HF_API_KEY}` }
            });
            console.log(`- ${model} Status:`, response.status);
            console.log(`- ${model} Headers:`, response.headers['x-compute-type']);
        } catch (error) {
            console.log(`- ${model} Error:`, error.response?.status, error.response?.data?.error || error.message);
        }
    }
}

test();
