import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../constants'

const CATEGORY_URGENCY = { Exam: 0, Deadline: 1, Placement: 2 };

function smartSort(events, activeDate) {
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = events.filter(e => {
        const eventDate = e.date_iso ? e.date_iso.split('T')[0] : null;
        if (activeDate) {
            return eventDate === activeDate;
        } else {
            // Default: Hide past
            if (eventDate && eventDate < todayStr) return false;
            return true;
        }
    });

    return filtered.sort((a, b) => {
        if (!a.date_iso && !b.date_iso) return 0;
        if (!a.date_iso) return 1;
        if (!b.date_iso) return -1;

        const d = new Date(a.date_iso) - new Date(b.date_iso);
        if (d !== 0) return d;

        const ua = CATEGORY_URGENCY[a.category] ?? 99;
        const ub = CATEGORY_URGENCY[b.category] ?? 99;
        return ua - ub;
    });
}

export function useEvents({ category, branch, search, date }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchEvents = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (category) params.set('category', category)
            if (branch) params.set('branch', branch)
            if (search) params.set('search', search)
            if (date) params.set('date', date)
            const qs = params.toString()
            const res = await fetch(`${API_BASE}/events${qs ? `?${qs}` : ''}`)
            if (!res.ok) throw new Error('Failed to load events')
            const data = await res.json()
            setEvents(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [category, branch, search, date])

    useEffect(() => { fetchEvents() }, [fetchEvents])

    const prependEvent = useCallback((event) => {
        setEvents(prev => {
            // Deduplicate by ID
            if (prev.some(e => e.id === event.id)) return prev;

            // Deduplicate by Name + Date
            const simplify = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const name = simplify(event.event_name);
            const eventDateStr = event.date_iso ? event.date_iso.split('T')[0] : null;

            if (prev.some(e => simplify(e.event_name) === name && (e.date_iso ? e.date_iso.split('T')[0] : null) === eventDateStr)) {
                return prev;
            }

            // Date filtering for live ingestion
            if (date && eventDateStr !== date) return prev;

            // Smart Sort integration for live ingestion
            return smartSort([event, ...prev]);
        })
    }, [date])

    const removeEvent = useCallback((id) => {
        setEvents(prev => prev.filter(e => e.id !== id))
    }, [])

    return { events, loading, error, prependEvent, removeEvent, refetch: fetchEvents }
}
