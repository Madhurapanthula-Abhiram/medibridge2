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
// GET /api/favorites   — get all favorite doctors
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { data, error } = await getSupabase(req.token)
            .from('favorite_doctors')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Favorites] GET error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/favorites  — add a doctor to favorites
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', [
    auth,
    body('doctor_name').trim().notEmpty().withMessage('Doctor name is required'),
    validate
], async (req, res) => {
    try {
        const { doctor_name, hospital_name, specialty, location, contact_info } = req.body;

        const { data, error } = await getSupabase(req.token)
            .from('favorite_doctors')
            .insert({
                user_id: req.user.id,
                doctor_name,
                hospital_name,
                specialty,
                location,
                contact_info: contact_info || {}
            })
            .select()
            .single();

        if (error) {
            // Unique constraint violation — already in favorites
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Doctor already in favorites' });
            }
            return res.status(400).json({ message: error.message });
        }
        return res.status(201).json(data);
    } catch (err) {
        console.error('[Favorites] POST error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/favorites/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await getSupabase(req.token)
            .from('favorite_doctors')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) return res.status(400).json({ message: error.message });
        return res.json({ message: 'Doctor removed from favorites' });
    } catch (err) {
        console.error('[Favorites] DELETE error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
