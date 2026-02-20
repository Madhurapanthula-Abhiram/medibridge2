const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../supabaseClient');
const { auth } = require('../middleware/auth');
const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/health   — get own health profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('health_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ message: 'Health profile not found' });
        }
        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Health] GET error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/health   — create or update own health profile (upsert)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/', [
    auth,
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood group'),
    validate
], async (req, res) => {
    try {
        const allowed = [
            'height', 'weight', 'blood_group', 'allergies',
            'chronic_conditions', 'medications', 'lifestyle_flags', 'emergency_contact'
        ];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const { data, error } = await supabase
            .from('health_profiles')
            .upsert({ user_id: req.user.id, ...updates }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Health] PUT error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
