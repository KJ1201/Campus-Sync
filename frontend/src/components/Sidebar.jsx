import { useNavigate } from 'react-router-dom'
import { CATEGORIES, CATEGORY_COLORS, BRANCHES } from '../constants'

export default function Sidebar({ activeCategory, onApplyFilters, botConnected, activeDate }) {
    const nav = useNavigate()

    const miniDays = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        miniDays.push(d)
    }

    return (
        <aside style={{
            width: '240px',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-default)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            overflowY: 'auto',
            zIndex: 10
        }}>
            <div
                onClick={() => nav('/')}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '36px',
                    marginBottom: '8px'
                }}
            >
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                }}>CampusSync</span>
                <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    animation: 'pulse 2s infinite',
                    boxShadow: '0 0 6px var(--accent-green)',
                }} />
            </div>

            <div>
                <Label>DISCOVER</Label>
                <NavItem
                    label="Upcoming Events"
                    active={!activeCategory && !activeDate}
                    onClick={() => onApplyFilters({ category: '', date: '' })}
                />
                <NavItem
                    label="Past Events"
                    active={activeCategory === 'Past'}
                    onClick={() => onApplyFilters({ category: 'Past', date: '' })}
                />
            </div>

            <div style={{ marginBottom: '-8px' }}>
                <Label>CALENDAR</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', padding: '0 4px' }}>
                    {miniDays.map((d, i) => {
                        const iso = d.toLocaleDateString('en-CA') // YYYY-MM-DD local
                        const isActive = activeDate === iso
                        return (
                            <button
                                key={iso}
                                onClick={() => onApplyFilters({ date: isActive ? '' : iso })}
                                style={{
                                    height: '32px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive ? 'var(--accent-green)' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                    color: isActive ? '#000' : 'var(--text-secondary)',
                                }}
                            >
                                <span style={{ fontSize: '8px', fontWeight: 700 }}>{d.toLocaleDateString('en-IN', { weekday: 'narrow' })}</span>
                                <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{d.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div>
                <Label>FILTER</Label>
                {CATEGORIES.map(cat => (
                    <NavItem
                        key={cat}
                        label={cat}
                        active={activeCategory === cat}
                        color={CATEGORY_COLORS[cat]}
                        onClick={() => onApplyFilters({ category: activeCategory === cat ? '' : cat, date: '' })}
                    />
                ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: botConnected ? 'var(--status-live-dot)' : 'var(--status-offline-dot)',
                        boxShadow: botConnected ? '0 0 8px rgba(74, 222, 128, 0.4)' : 'none'
                    }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {botConnected ? 'Bot Connected' : 'Bot Offline'}
                    </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {botConnected ? 'Listening to WhatsApp active groups' : 'Service currently unavailable'}
                </span>
            </div>
        </aside>
    )
}

function Label({ children }) {
    return (
        <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            paddingLeft: '12px'
        }}>
            {children}
        </div>
    )
}

function NavItem({ label, active, onClick, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                height: '34px',
                padding: '0 10px',
                borderRadius: '10px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                background: active ? 'var(--bg-surface-elevated)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                transition: 'all 0.15s',
                borderLeft: active ? `2px solid ${color || 'var(--accent-green)'}` : '2px solid transparent',
                textAlign: 'left'
            }}
            onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'var(--bg-surface)';
            }}
            onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent';
            }}
        >
            {label}
        </button>
    )
}
