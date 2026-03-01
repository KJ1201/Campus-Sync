import { useEffect, useRef } from 'react'

export default function CalendarStrip({ activeDate, onDateSelect }) {
    const scrollRef = useRef(null)

    // Generate window of days: previous 5 to next 14
    const days = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (let i = -5; i < 14; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        days.push(d)
    }

    const todayISO = new Date().toLocaleDateString('en-CA')

    useEffect(() => {
        // Initial scroll to today or activeDate
        const target = activeDate || todayISO
        const el = scrollRef.current?.querySelector(`[data-date="${target}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, [])

    useEffect(() => {
        if (activeDate) {
            const activeEl = scrollRef.current?.querySelector(`[data-date="${activeDate}"]`)
            activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }, [activeDate])

    return (
        <div style={{ position: 'relative' }}>
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '4px 0 16px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    position: 'relative',
                    cursor: 'grab'
                }}
            >
                {days.map((d) => {
                    const iso = d.toLocaleDateString('en-CA'); // YYYY-MM-DD local
                    const isActive = activeDate === iso
                    const isToday = iso === todayISO

                    return (
                        <button
                            key={iso}
                            data-date={iso}
                            onClick={() => onDateSelect(isActive ? '' : iso)}
                            style={{
                                flexShrink: 0,
                                width: '48px',
                                height: '64px',
                                borderRadius: '12px',
                                background: isActive ? 'var(--accent-green)' : 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                padding: '8px 0',
                                color: isActive ? '#000' : 'var(--text-secondary)',
                                position: 'relative'
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                                    e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = 'var(--border-default)';
                                    e.currentTarget.style.background = 'var(--bg-surface)';
                                }
                            }}
                        >
                            <span style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                opacity: isActive ? 0.8 : 0.6,
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-body)',
                                letterSpacing: '0.04em'
                            }}>
                                {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                            </span>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                lineHeight: 1
                            }}>
                                {d.getDate()}
                            </span>
                            {isToday && !isActive && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '6px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-green)'
                                }} />
                            )}
                        </button>
                    )
                })}
            </div>

            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 16,
                width: '40px',
                background: 'linear-gradient(to right, transparent, var(--bg-primary))',
                pointerEvents: 'none'
            }} />
        </div>
    )
}
