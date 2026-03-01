export default function LiveRawFeed({ messages }) {
    if (!messages.length) return null

    return (
        <div style={{
            background: 'rgba(74,222,128,0.05)',
            border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: '12px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
        }}>
            <div style={{
                fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--accent-green)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                marginBottom: '0.25rem'
            }}>
                <span className="live-dot" style={{ width: 6, height: 6 }} />
                Live Raw Stream (Unprocessed)
            </div>
            {messages.map((m, i) => (
                <div key={i} className="card-enter" style={{
                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                    background: 'var(--bg-card)', padding: '0.5rem 0.75rem',
                    borderRadius: '8px', border: '1px solid var(--border)',
                    lineHeight: 1.4,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                            {m.sender} in {m.groupName}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p style={{ margin: 0 }}>{m.text}</p>
                </div>
            ))}
        </div>
    )
}
