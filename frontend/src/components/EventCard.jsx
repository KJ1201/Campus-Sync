import { CATEGORY_COLORS } from '../constants'
import { useNavigate, useLocation } from 'react-router-dom'

function isUrgent(dateIso) {
    if (!dateIso) return false
    const diff = (new Date(dateIso) - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3
}

export default function EventCard({ event, onDelete, onClick }) {
    const nav = useNavigate()
    const { search } = useLocation()
    const isAdmin = new URLSearchParams(search).get('admin') === 'true'
    const color = CATEGORY_COLORS[event.category] || '#94a3b8'
    const urgent = isUrgent(event.date_iso)

    const hasTime = event.date_iso && (event.date_iso.includes('T') || event.date_iso.includes(':'));
    const dateLabel = event.date_iso ? new Date(event.date_iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
    }) : null

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            nav(`/events/${event.id}${search}`)
        }
    }

    const handleDelete = (e) => {
        e.stopPropagation()
        if (window.confirm('Delete event?')) onDelete(event.id)
    }

    return (
        <div
            onClick={handleClick}
            className="reveal"
            style={{
                position: 'relative',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '14px',
                padding: '14px 14px 14px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                gap: '12px',
                minWidth: 0,
                boxShadow: '0 1px 8px rgba(0,0,0,0.35)',
                overflow: 'hidden'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '3.5px', background: color,
                borderRadius: '14px 0 0 14px'
            }} />

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                            background: `${color}15`, border: `1px solid ${color}33`,
                            color: color, borderRadius: '999px', padding: '1px 8px',
                            fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-body)',
                            textTransform: 'uppercase', letterSpacing: '0.06em'
                        }}>{event.category}</span>
                        <span style={{
                            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)',
                            borderRadius: '999px', padding: '1px 8px', fontSize: '11px',
                            color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-body)'
                        }}>{event.branch || 'ALL'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <h3 style={{
                        margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)', lineHeight: 1.3,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', flex: 1
                    }}>{event.event_name}</h3>

                    {event.poster_url && (
                        <img
                            src={event.poster_url}
                            alt="poster"
                            style={{
                                width: '52px', height: '52px', borderRadius: '10px',
                                objectFit: 'cover', border: '1px solid var(--border-default)',
                                flexShrink: 0
                            }}
                            onError={e => e.target.style.display = 'none'}
                        />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {dateLabel && (
                        <span style={{
                            fontSize: '12px', color: urgent ? 'var(--status-urgent-text)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontFamily: 'var(--font-body)'
                        }}>
                            <span style={{ fontSize: '11px' }}>🕒</span> {dateLabel}
                        </span>
                    )}
                    {event.venue && (
                        <span style={{
                            fontSize: '12px', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontFamily: 'var(--font-body)'
                        }}>
                            <span style={{ fontSize: '11px' }}>📍</span> {event.venue}
                        </span>
                    )}
                </div>
            </div>

            {isAdmin && (
                <button
                    onClick={handleDelete}
                    style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer',
                        borderRadius: '50%', width: '24px', height: '24px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                        backdropFilter: 'blur(4px)', color: '#fff', opacity: 0.6,
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                >🗑️</button>
            )}
        </div>
    )
}
