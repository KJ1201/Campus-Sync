export default function StatsBar({ total, activeFilterCount, botConnected }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="reveal">
            <StatCard label="Total Events" value={total} color="var(--accent-blue)" />
            <StatCard label="Matching" value={activeFilterCount > 0 ? total : 'All'} color="var(--accent-green)" />
            <StatCard label="Urgent" value={0} color="var(--accent-red)" isUrgent />
        </div>
    )
}

function StatCard({ label, value, color, isUrgent }) {
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            minWidth: 0
        }}>
            <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-body)'
            }}>{label}</span>
            <span style={{
                fontSize: '28px',
                fontWeight: 800,
                color: isUrgent && value > 0 ? 'var(--accent-red)' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                lineHeight: 1
            }}>{value}</span>
            <div style={{
                height: '3px',
                width: '16px',
                background: color,
                borderRadius: '99px',
                marginTop: '8px',
                opacity: 0.8
            }} />
        </div>
    )
}
