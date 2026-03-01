import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LiveToast({ event, onDismiss }) {
    const nav = useNavigate()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!event) return
        setTimeout(() => setVisible(true), 100)
        const t = setTimeout(() => {
            setVisible(false)
            setTimeout(onDismiss, 400)
        }, 6000)
        return () => clearTimeout(t)
    }, [event])

    if (!event) return null

    return (
        <div
            style={{
                position: 'fixed', bottom: '2rem', left: '50%',
                transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
                opacity: visible ? 1 : 0,
                zIndex: 1000,
                background: 'rgba(22, 22, 31, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--accent)',
                borderRadius: '20px',
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 15px var(--accent-muted)',
                maxWidth: '440px', width: 'calc(100vw - 2.5rem)',
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                cursor: 'pointer'
            }}
            onClick={() => nav(`/events/${event.id}`)}
        >
            <div style={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                🔔
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem'
                }}>
                    NEW BROADCAST
                </div>
                <div style={{
                    fontSize: '0.92rem', color: 'var(--text-primary)',
                    fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif'
                }}>
                    {event.event_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    via {event.group}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setVisible(false);
                        setTimeout(onDismiss, 400);
                    }}
                    style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem',
                        padding: '0.2rem', opacity: 0.6, transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.6}
                >✕</button>
            </div>
        </div>
    )
}
