const express = require('express');
const router = express.Router();
const { predictSymptoms } = require('../services/medicalAI');

/**
 * @route POST /api/predict-symptoms
 * @desc Predict diseases based on user symptoms
 * @access Public
 */
router.post('/predict-symptoms', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please provide detailed symptom information (at least 3 characters).'
            });
        }

        console.log(`[SymptomsRoute] Analyzing symptoms: "${symptoms.substring(0, 50)}..."`);

        const result = await predictSymptoms(symptoms);

        if (result.success === false) {
            return res.status(503).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('[SymptomsRoute] Internal Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while analyzing symptoms.'
        });
    }
});

module.exports = router;
