import { CATEGORY_COLORS } from '../constants'

export default function RawMessageCard({ message }) {
    const color = '#94a3b8' // Slate/Raw color
    const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    const date = message.timestamp ? new Date(message.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' }) : ''

    return (
        <div
            className="reveal"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1rem',
                borderLeft: `3px solid ${color}44`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'var(--bg-surface)';
            }}
        >
            {/* Header: Sender + Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>👤</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                            fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)',
                            fontFamily: 'var(--font-display)'
                        }}>{message.sender}</span>
                        <span style={{
                            fontSize: '0.7rem', color: 'var(--text-muted)',
                            fontWeight: 500, fontFamily: 'var(--font-body)'
                        }}>in {message.groupName}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{timestamp}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.6, fontFamily: 'var(--font-body)' }}>{date}</div>
                </div>
            </div>

            {/* Message Body */}
            <div style={{
                fontSize: '0.9rem', color: 'var(--text-secondary)',
                lineHeight: 1.6, whiteSpace: 'pre-wrap',
                wordBreak: 'break-word', overflow: 'hidden',
                padding: '0.5rem 0.2rem', background: 'rgba(0,0,0,0.1)',
                borderRadius: '8px', fontFamily: 'var(--font-body)'
            }}>
                {message.text}
            </div>

            {/* Footer / AI Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                <span style={{
                    fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)'
                }}>
                    📡 UNPROCESSED FEED
                </span>
                <span style={{ fontSize: '1rem', opacity: 0.4 }}>📟</span>
            </div>
        </div>
    )
}
