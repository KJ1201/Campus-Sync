import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CATEGORY_COLORS, API_BASE } from '../constants'

function isUrgent(dateIso) {
    if (!dateIso) return false
    const diff = (new Date(dateIso) - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3
}

export default function EventDetailPage() {
    const { id } = useParams()
    const nav = useNavigate()
    const { search } = useLocation()
    const isAdmin = new URLSearchParams(search).get('admin') === 'true'
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [rawOpen, setRawOpen] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetch(`${API_BASE}/events/${id}`)
            .then(r => r.json())
            .then(d => { setEvent(d); setLoading(false) })
            .catch(() => { setEvent(null); setLoading(false) })
    }, [id])

    if (loading) return (
        <div style={{ minHeight: '100svh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="shimmer" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        </div>
    )

    if (!event) return (
        <div style={{ minHeight: '100svh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <span style={{ fontSize: '48px' }}>🔍</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>Event not found</div>
            <button onClick={() => nav('/')} className="btn-primary">Back to Feed</button>
        </div>
    )

    const color = CATEGORY_COLORS[event.category] || '#94a3b8'
    const urgent = isUrgent(event.date_iso)
    const dateLabel = event.date_iso ? new Date(event.date_iso).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }) : 'Date TBA'

    return (
        <div style={{ minHeight: '100svh', background: 'var(--bg-primary)', paddingBottom: '80px' }}>
            <div className="bg-glow" />

            <main style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ padding: '24px 20px 0' }}>
                    <button
                        onClick={() => nav(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}
                    >
                        ← Back to feed
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
                        {event.poster_url ? (
                            <img src={event.poster_url} style={{ width: '100%', height: 'auto', maxHeight: '320px', objectFit: 'cover' }} alt="poster" />
                        ) : (
                            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', opacity: 0.3 }}>🎪</div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                            background: `${color}15`, color, border: `1px solid ${color}33`,
                            borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-body)'
                        }}>{event.category}</span>
                        <span style={{
                            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)',
                            borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-body)'
                        }}>{event.branch || 'ALL BRANCHES'}</span>
                    </div>

                    <h1 style={{
                        margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)', lineHeight: 1.2, letterSpacing: '-0.03em'
                    }}>{event.event_name}</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                            background: urgent ? 'var(--status-urgent-bg)' : 'var(--bg-surface)',
                            border: `1px solid ${urgent ? 'var(--status-urgent-border)' : 'var(--border-default)'}`,
                            borderRadius: '12px', color: urgent ? 'var(--status-urgent-text)' : 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-body)'
                        }}>
                            <span>📅</span> {dateLabel}
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                            borderRadius: '12px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-body)'
                        }}>
                            <span>📍</span> {event.venue || 'Venue TBA'}
                        </div>
                    </div>

                    <p style={{
                        margin: 0, fontSize: '15px', color: 'var(--text-secondary)',
                        lineHeight: 1.65, fontFamily: 'var(--font-body)'
                    }}>{event.description}</p>

                    {event.registration_link && (
                        <a
                            href={event.registration_link}
                            target="_blank" rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ textDecoration: 'none', height: '48px', fontSize: '16px' }}
                        >
                            Register Now →
                        </a>
                    )}

                    <div style={{
                        marginTop: '10px', padding: '20px', background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)', borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', gap: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📡</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Source: {event.group}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Forwarded by {event.sender}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setRawOpen(!rawOpen)}
                            style={{
                                width: '100%', textAlign: 'left', background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px',
                                color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                                display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)'
                            }}
                        >
                            Original Message
                            <span>{rawOpen ? '▲' : '▼'}</span>
                        </button>
                        {rawOpen && (
                            <pre style={{
                                margin: 0, padding: '14px', background: 'rgba(0,0,0,0.2)',
                                borderRadius: '10px', border: '1px solid var(--border-subtle)',
                                fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                                whiteSpace: 'pre-wrap', lineHeight: 1.5
                            }}>
                                {event.original_text}
                            </pre>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
