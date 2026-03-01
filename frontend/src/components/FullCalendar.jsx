import { useState } from 'react'

export default function FullCalendar({ activeDate, onDateSelect, onClose, events = [] }) {
    const today = new Date()
    const [viewDate, setViewDate] = useState(activeDate ? new Date(activeDate) : new Date())

    const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    const month = viewDate.getMonth()
    const year = viewDate.getFullYear()

    // Get days in month
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

    // Days grid
    const blanks = Array(firstDay).fill(null)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const calendarDays = [...blanks, ...days]

    // Event lookup
    const hasEvent = (day) => {
        if (!day) return false
        const dStr = new Date(year, month, day).toISOString().split('T')[0]
        return events.some(e => e.date_iso && e.date_iso.split('T')[0] === dStr)
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
        }} onClick={onClose}>
            <div
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'var(--bg-surface)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-strong)',
                    padding: '24px',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{monthName}</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={prevMonth} className="btn-ghost" style={{ padding: '8px', minWidth: '40px' }}>←</button>
                        <button onClick={nextMonth} className="btn-ghost" style={{ padding: '8px', minWidth: '40px' }}>→</button>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    marginBottom: '12px',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                }}>
                    {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(d => <span key={d}>{d.toUpperCase()}</span>)}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px',
                }}>
                    {calendarDays.map((day, i) => {
                        if (day === null) return <div key={`blank-${i}`} />

                        const dateStr = new Date(year, month, day).toISOString().split('T')[0]
                        const isActive = activeDate === dateStr
                        const isToday = today.toISOString().split('T')[0] === dateStr
                        const eventsExist = hasEvent(day)

                        return (
                            <button
                                key={i}
                                onClick={() => { onDateSelect(isActive ? '' : dateStr); onClose() }}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '12px',
                                    border: isActive ? '1px solid var(--accent-green)' : '1px solid transparent',
                                    background: isActive ? 'var(--accent-green)' : (isToday ? 'var(--bg-surface-elevated)' : 'transparent'),
                                    color: isActive ? '#000' : (isToday ? 'var(--accent-green)' : 'var(--text-primary)'),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    transition: 'all 0.1s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isToday ? 'var(--bg-surface-elevated)' : 'transparent' }}
                            >
                                {day}
                                {eventsExist && (
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: isActive ? '#000' : 'var(--accent-green)',
                                        opacity: 0.8
                                    }} />
                                )}
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        marginTop: '24px',
                        padding: '12px',
                        background: 'transparent',
                        border: '1px solid var(--border-default)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Close Calendar
                </button>
            </div>
        </div>
    )
}
