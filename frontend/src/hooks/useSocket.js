import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_BASE } from '../constants'

export function useSocket(onNewEvent) {
    const socketRef = useRef(null)

    useEffect(() => {
        const socket = io(API_BASE || 'http://localhost:3001', {
            transports: ['websocket'],
        })
        socketRef.current = socket

        socket.on('new_event', (event) => {
            onNewEvent?.(event, 'new_event')
        })

        socket.on('new_message', (msg) => {
            onNewEvent?.(msg, 'new_message')
        })

        return () => socket.disconnect()
    }, []) // eslint-disable-line

    return socketRef
}
