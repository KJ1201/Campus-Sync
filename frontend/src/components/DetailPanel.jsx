import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_COLORS, API_BASE } from '../constants'

function isUrgent(dateIso) {
    if (!dateIso) return false
    const diff = (new Date(dateIso) - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3
}

export default function DetailPanel({ eventId, onClose }) {
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isPosterOpen, setIsPosterOpen] = useState(false)

    useEffect(() => {
        if (!eventId) {
            setEvent(null);
            return;
        }
        setLoading(true)
        fetch(`${API_BASE}/events/${eventId}`)
            .then(r => r.json())
            .then(d => { setEvent(d); setLoading(false) })
            .catch(() => { setEvent(null); setLoading(false) })
    }, [eventId])

    if (!eventId) return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '40px'
        }}>
            <span style={{ fontSize: '32px', opacity: 0.5 }}>✨</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)' }}>Select an event</div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)' }}>Click any event to see full details here</div>
        </div>
    )

    if (loading) return (
        <div style={{ padding: '24px' }}>
            <div className="shimmer" style={{ width: '100%', height: '200px', borderRadius: '14px', marginBottom: '20px' }} />
            <div className="shimmer" style={{ width: '60%', height: '24px', borderRadius: '4px', marginBottom: '12px' }} />
            <div className="shimmer" style={{ width: '100%', height: '80px', borderRadius: '4px' }} />
        </div>
    )

    if (!event) return null

    const color = CATEGORY_COLORS[event.category] || '#94a3b8'
    const urgent = isUrgent(event.date_iso)
    const dateLabel = event.date_iso ? new Date(event.date_iso).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }) : 'Date TBA'

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', overflowX: 'hidden' }} className="reveal">
                {onClose && (
                    <button onClick={onClose} style={{
                        alignSelf: 'flex-start', background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0 10px'
                    }}>← Back</button>
                )}

                <div
                    onClick={() => event.poster_url && setIsPosterOpen(true)}
                    style={{
                        width: '100%',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-default)',
                        maxHeight: '220px',
                        cursor: event.poster_url ? 'zoom-in' : 'default',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (event.poster_url) e.currentTarget.style.borderColor = 'var(--accent-green)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
                >
                    {event.poster_url ? (
                        <img src={event.poster_url} style={{ width: '100%', height: 'auto', maxHeight: '320px', objectFit: 'cover' }} alt="poster" />
                    ) : (
                        <div style={{
                            height: '160px', background: 'var(--bg-surface-elevated)', border: '2px dashed var(--border-subtle)',
                            borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-muted)', gap: '8px'
                        }}>
                            <span style={{ fontSize: '24px' }}>🖼️</span>
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>No poster attached</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                        background: `${color}15`, color, border: `1px solid ${color}33`,
                        borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 700,
                        textTransform: 'uppercase', fontFamily: 'var(--font-body)'
                    }}>{event.category}</span>
                    <span style={{
                        background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)',
                        borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600,
                        color: 'var(--text-muted)', fontFamily: 'var(--font-body)'
                    }}>{event.branch || 'ALL'}</span>
                </div>

                <h1 style={{
                    margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)', lineHeight: 1.2, letterSpacing: '-0.03em'
                }}>{event.event_name}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                        background: urgent ? 'var(--status-urgent-bg)' : 'var(--bg-surface)',
                        border: `1px solid ${urgent ? 'var(--status-urgent-border)' : 'var(--border-default)'}`,
                        borderRadius: '10px', color: urgent ? 'var(--status-urgent-text)' : 'var(--text-secondary)',
                        fontSize: '14px', fontWeight: 500
                    }}>
                        <span>📅</span> {dateLabel}
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                        borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500
                    }}>
                        <span>📍</span> {event.venue || 'Venue TBA'}
                    </div>
                </div>

                {event.registration_link && (
                    <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ textDecoration: 'none' }}
                    >
                        Register Now →
                    </a>
                )}

                <div style={{ marginTop: '8px' }}>
                    <div style={{
                        fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px'
                    }}>Message Details</div>
                    <div style={{
                        fontSize: '13.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        padding: '12px',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}>
                        {event.original_text}
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
                    fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                    <span style={{ fontWeight: 600 }}>{event.group}</span>
                    <span>•</span>
                    <span>via {event.sender}</span>
                    <span>•</span>
                    <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Poster Full View Modal - Portal to document.body to break stacking context */}
            {isPosterOpen && event.poster_url && createPortal(
                <div
                    onClick={() => setIsPosterOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999, // Ensure it's on top of everything
                        background: 'rgba(0,0,0,0.95)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        cursor: 'zoom-out',
                        animation: 'reveal 0.3s ease'
                    }}
                >
                    <img
                        src={event.poster_url}
                        style={{
                            maxWidth: '96%',
                            maxHeight: '94vh',
                            borderRadius: '12px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            objectFit: 'contain'
                        }}
                        onClick={e => e.stopPropagation()}
                        alt="full poster"
                    />
                    <button
                        onClick={() => setIsPosterOpen(false)}
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >✕</button>
                </div>,
                document.body
            )}
        </>
    )
}
