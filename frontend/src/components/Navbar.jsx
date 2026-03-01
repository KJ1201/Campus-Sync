import { useNavigate } from 'react-router-dom'

export default function Navbar({ botConnected }) {
    const nav = useNavigate()

    return (
        <nav style={{
            height: '56px',
            background: 'rgba(10, 10, 12, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-default)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
        }}>
            <div
                onClick={() => nav('/')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                }}>
                    <div style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: botConnected ? 'var(--status-live-dot)' : 'var(--status-offline-dot)',
                        boxShadow: botConnected ? '0 0 6px rgba(74, 222, 128, 0.3)' : 'none'
                    }} />
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                    }}>
                        {botConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>
        </nav>
    )
}
