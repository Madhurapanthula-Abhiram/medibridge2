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
// GET /api/chat   — get chat history (optionally filtered by conversation_id)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        let query = supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (req.query.conversation_id) {
            query = query.eq('conversation_id', req.query.conversation_id);
        }

        const { data, error } = await query;
        if (error) return res.status(400).json({ message: error.message });
        return res.json(data);
    } catch (err) {
        console.error('[Chat] GET error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat  — save a chat message pair
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', [
    auth,
    body('user_message').trim().notEmpty().withMessage('user_message is required'),
    body('ai_response').trim().notEmpty().withMessage('ai_response is required'),
    validate
], async (req, res) => {
    try {
        const { user_message, ai_response, conversation_id } = req.body;

        const { data, error } = await supabase
            .from('chat_history')
            .insert({
                user_id: req.user.id,
                user_message,
                ai_response,
                conversation_id: conversation_id || undefined   // defaults to gen_random_uuid() in DB
            })
            .select()
            .single();

        if (error) return res.status(400).json({ message: error.message });
        return res.status(201).json(data);
    } catch (err) {
        console.error('[Chat] POST error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/chat/:id   — delete a single message
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) return res.status(400).json({ message: error.message });
        return res.json({ message: 'Chat message deleted' });
    } catch (err) {
        console.error('[Chat] DELETE error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/chat/conversation/:conversationId   — delete full conversation
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/conversation/:conversationId', auth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('conversation_id', req.params.conversationId)
            .eq('user_id', req.user.id);

        if (error) return res.status(400).json({ message: error.message });
        return res.json({ message: 'Conversation deleted' });
    } catch (err) {
        console.error('[Chat] DELETE conversation error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
