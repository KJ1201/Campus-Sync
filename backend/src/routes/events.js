const express = require('express');
const router = express.Router();
const { readEvents, readMessages, deleteEvent } = require('../data/store');

const CATEGORY_URGENCY = { Exam: 0, Deadline: 1, Placement: 2 };

function sortEvents(events) {
    const today = new Date().toISOString().split('T')[0];

    // Sort all incoming events chronologically
    const sorted = [...events].sort((a, b) => {
        if (!a.date_iso && !b.date_iso) return 0;
        if (!a.date_iso) return 1;
        if (!b.date_iso) return -1;

        const d = new Date(a.date_iso) - new Date(b.date_iso);
        if (d !== 0) return d;

        const ua = CATEGORY_URGENCY[a.category] ?? 99;
        const ub = CATEGORY_URGENCY[b.category] ?? 99;
        return ua - ub;
    });

    return sorted;
}

function applyFilters(events, { category, search, date }) {
    const today = new Date().toISOString().split('T')[0];

    return events.filter(e => {
        const eventDate = e.date_iso ? e.date_iso.split('T')[0] : null;

        if (date) {
            return eventDate === date;
        }

        if (category === 'Past') {
            return eventDate && eventDate < today;
        }

        if (category && category !== 'Raw' && e.category?.toLowerCase() !== category.toLowerCase()) return false;

        if (search) {
            const q = search.toLowerCase();
            if (!e.event_name?.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) return false;
        }

        // Default view (no date, no specific Past category): hide past
        // BUT if a specific date is requested from the calendar, we SHOULD show it even if it's past
        if (!date && category !== 'Past' && eventDate && eventDate < today) return false;

        return true;
    });
}

// GET /events
router.get('/events', async (req, res) => {
    try {
        const events = await readEvents();
        const { category, search, date } = req.query;
        const filtered = applyFilters(events, { category, search, date });
        const sorted = sortEvents(filtered);
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read events' });
    }
});

// GET /events/:id
router.get('/events/:id', async (req, res) => {
    try {
        const events = await readEvents();
        const event = events.find(e => e.id === req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read events' });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const messages = await readMessages();
        const { date } = req.query;
        let filtered = messages;
        if (date) {
            filtered = messages.filter(m => m.timestamp && m.timestamp.startsWith(date));
        }
        // Return latest 50 messages
        res.json(filtered.slice(-50).reverse());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const events = await readEvents();
        const today = new Date().toISOString().split('T')[0];
        const upcoming = events.filter(e => {
            const ed = e.date_iso ? e.date_iso.split('T')[0] : null;
            return !ed || ed >= today;
        }).length;
        res.json({ total: events.length, upcoming });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

router.delete('/events/:id', async (req, res) => {
    try {
        const deleted = await deleteEvent(req.params.id);
        if (deleted) res.json({ success: true });
        else res.status(404).json({ error: 'Event not found' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
