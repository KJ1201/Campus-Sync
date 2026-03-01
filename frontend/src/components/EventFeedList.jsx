import { useState, useEffect } from 'react'
import EventCard from './EventCard'

function getDateInfo(dateIso) {
    if (!dateIso) return null
    const date = new Date(dateIso)
    return {
        number: date.getDate(),
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        month: date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
        fullLabel: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
    }
}

function groupByDate(events) {
    const dated = events.filter(e => e.date_iso);
    const undated = events.filter(e => !e.date_iso);

    // Use a Map to preserve the sorted order from props
    const groupsMap = new Map();

    for (const e of dated) {
        const dateKey = e.date_iso.split('T')[0];
        if (!groupsMap.has(dateKey)) groupsMap.set(dateKey, []);
        groupsMap.get(dateKey).push(e);
    }

    return { groups: Array.from(groupsMap.entries()), undated };
}

export default function EventFeedList({ events, loading, hasFilters, onClearFilters, onDeleteEvent, onEventSelect }) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280)
    const [undatedOpen, setUndatedOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1280)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="shimmer" style={{ height: 120, borderRadius: '14px', border: '1px solid var(--border-default)' }} />
                ))}
            </div>
        )
    }

    if (!events.length) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }} className="reveal">
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{hasFilters ? '🔍' : '📭'}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {hasFilters ? 'No events found' : 'The feed is currently quiet'}
                </div>
                {hasFilters && (
                    <button onClick={onClearFilters} className="btn-ghost" style={{ marginTop: '16px' }}>Clear Filters</button>
                )}
            </div>
        )
    }

    const { groups, undated } = groupByDate(events)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? '32px' : '24px' }}>
            {groups.map(([dateKey, groupEvents]) => {
                const info = getDateInfo(groupEvents[0].date_iso)

                if (isDesktop) {
                    return (
                        <div key={dateKey} style={{ display: 'flex', gap: '0' }} className="reveal">
                            <div style={{ width: '80px', flexShrink: 0, paddingTop: '6px' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '32px',
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1
                                }}>{info.number}</div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--text-muted)',
                                    letterSpacing: '0.08em',
                                    marginTop: '4px'
                                }}>{info.day}</div>
                            </div>
                            <div style={{ flex: 1, borderLeft: '1px solid var(--border-default)', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {groupEvents.map(e => (
                                    <EventCard key={e.id} event={e} onDelete={onDeleteEvent} onClick={() => onEventSelect?.(e.id)} />
                                ))}
                            </div>
                        </div>
                    )
                }

                return (
                    <div key={dateKey} className="reveal">
                        <div style={{
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                            color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '2px'
                        }}>
                            {info.fullLabel}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {groupEvents.map(e => (
                                <EventCard key={e.id} event={e} onDelete={onDeleteEvent} />
                            ))}
                        </div>
                    </div>
                )
            })}

            {undated.length > 0 && (
                <div className="reveal">
                    <button
                        onClick={() => setUndatedOpen(!undatedOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px 8px',
                            borderBottom: '1px solid var(--border-default)', marginBottom: '12px'
                        }}
                    >
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>UNDATED ARCHIVE ({undated.length})</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginLeft: 'auto' }}>{undatedOpen ? '▲' : '▼'}</span>
                    </button>
                    {undatedOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {undated.map(e => (
                                <EventCard key={e.id} event={e} onDelete={onDeleteEvent} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
