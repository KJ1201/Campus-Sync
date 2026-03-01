import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../constants'
import { useSocket } from './useSocket'

export function useMessages() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/messages`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setMessages(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    useSocket((data, type) => {
        // We modify useSocket to handle different types if needed, 
        // but for now let's just use it manually in the Page or update it.
    })

    const addMessage = useCallback((msg) => {
        setMessages(prev => [msg, ...prev].slice(0, 50))
    }, [])

    return { messages, loading, addMessage }
}
