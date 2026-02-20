const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSupabase } = require('../supabaseClient');
const { auth } = require('../middleware/auth');
const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/history   — get own symptom history (latest 50)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const supabaseClient = getSupabase(req.token);

        // 1. Auto-cleanup: Delete records older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await supabaseClient
            .from('symptom_history')
            .delete()
            .eq('user_id', req.user.id)
            .lt('created_at', thirtyDaysAgo.toISOString());

        // 2. Fetch latest 50 records
        const { data, error } = await supabaseClient
            .from('symptom_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[History] GET error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/history  — save a new symptom prediction entry
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', [
    auth,
    body('symptoms_input').isArray({ min: 1 }).withMessage('At least one symptom required'),
    body('predicted_disease').optional().isString(),
    body('confidence_score').optional().isFloat({ min: 0, max: 1 }),
    body('severity').optional().isString(),
    validate
], async (req, res) => {
    try {
        const {
            symptoms_input,
            predicted_disease,
            confidence_score,
            precautions,
            medicines,
            severity,
            full_response
        } = req.body;

        const insertPayload = {
            user_id: req.user.id,
            symptoms_input: symptoms_input || [],
            predicted_disease: predicted_disease || null,
            confidence_score: confidence_score || null,
            precautions: precautions || [],
            medicines: medicines || [],
            severity: severity || null,
            full_response: full_response || null,
        };

        const { data, error } = await getSupabase(req.token)
            .from('symptom_history')
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            console.error('[History] Supabase insert error:', error.message, error.details);
            return res.status(400).json({ message: error.message });
        }
        return res.status(201).json(data);
    } catch (err) {
        console.error('[History] POST error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/history/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await getSupabase(req.token)
            .from('symptom_history')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) return res.status(400).json({ message: error.message });
        return res.json({ message: 'History entry deleted' });
    } catch (err) {
        console.error('[History] DELETE error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
