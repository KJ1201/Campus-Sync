import { useEffect, useRef, useState } from 'react'

export default function SearchBar({ value, onChange, isDesktop }) {
    const [local, setLocal] = useState(value || '')
    const timer = useRef(null)

    useEffect(() => { setLocal(value || '') }, [value])

    function handleChange(e) {
        const v = e.target.value
        setLocal(v)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => onChange(v), 300)
    }

    function handleClear() {
        setLocal('')
        clearTimeout(timer.current)
        onChange('')
    }

    const height = isDesktop ? '36px' : '40px'

    return (
        <div style={{ position: 'relative', width: '100%', height }} className="reveal">
            <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '14px',
                opacity: 0.6
            }}>🔍</span>
            <input
                type="text"
                value={local}
                onChange={handleChange}
                placeholder="Search events, descriptions…"
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '999px',
                    padding: '0 14px 0 36px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-body)',
                }}
                onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-green)';
                    e.target.style.background = 'var(--bg-surface-hover)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.background = 'var(--bg-surface-elevated)';
                }}
            />
            {local && (
                <button
                    onClick={handleClear}
                    style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1,
                        padding: '0.2rem',
                    }}>✕</button>
            )}
        </div>
    )
}
