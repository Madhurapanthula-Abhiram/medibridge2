const express = require('express');
const { body, validationResult } = require('express-validator');
const { getSupabase, supabase } = require('../supabaseClient');
const { auth } = require('../middleware/auth');
const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/profile   — get own profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await getSupabase(req.token)
            .from('profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error) return res.status(404).json({ message: 'Profile not found', error: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Profile] GET error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/profile   — create or update own profile (upsert)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/', [
    auth,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('full_name').optional().trim(),
    body('phone').optional().trim(),
    body('gender').optional().isIn(['male', 'female']),
    body('date_of_birth').optional(),
    body('height').optional().isNumeric(),
    body('weight').optional().isNumeric(),
    validate
], async (req, res) => {
    try {
        const allowed = ['name', 'full_name', 'email', 'phone', 'avatar', 'bio', 'gender', 'date_of_birth', 'height', 'weight'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const { data, error } = await getSupabase(req.token)
            .from('profiles')
            .upsert({ user_id: req.user.id, ...updates }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Profile] PUT error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/profile/change-password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/change-password', [
    auth,
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], async (req, res) => {
    try {
        const { error } = await supabase.auth.updateUser({ password: req.body.password });
        if (error) return res.status(400).json({ message: error.message });
        return res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('[Profile] Change-password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
