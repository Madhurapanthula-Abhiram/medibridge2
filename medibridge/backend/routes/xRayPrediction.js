const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeXRay } = require('../services/xrayAI');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

/**
 * POST /api/predict-xray
 * Upload and analyze X-ray image
 */
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        console.log(`[PredictXRay] Analyzing image: ${req.file.originalname} (${req.file.size} bytes)`);

        const analysis = await analyzeXRay(req.file.buffer);

        res.json({
            success: true,
            ...analysis
        });

    } catch (error) {
        console.error('[PredictXRay] Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to analyze X-ray image. Please try again later.'
        });
    }
});

module.exports = router;
