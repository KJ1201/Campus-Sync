import { CATEGORIES, CATEGORY_COLORS } from '../constants'

export default function CategoryFilterBar({ active, onSelect }) {
    return (
        <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto',
            paddingBottom: '2px', scrollbarWidth: 'none',
        }}>
            {/* All chip */}
            <Chip
                label="All"
                color="var(--accent-green)"
                isActive={!active}
                onClick={() => onSelect('')}
            />
            {CATEGORIES.map(cat => (
                <Chip
                    key={cat}
                    label={cat}
                    color={CATEGORY_COLORS[cat]}
                    isActive={active === cat}
                    onClick={() => onSelect(active === cat ? '' : cat)}
                />
            ))}

            {/* Raw Message Feed */}
            <Chip
                label="Raw Feed"
                color="#94a3b8"
                isActive={active === 'Raw'}
                onClick={() => onSelect('Raw')}
            />
        </div>
    )
}

function Chip({ label, color, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                flexShrink: 0,
                height: '30px',
                padding: '0 14px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                border: isActive ? `1px solid ${color}` : '1px solid var(--border-default)',
                background: isActive ? `${color}15` : 'var(--bg-surface-elevated)',
                color: isActive ? color : 'var(--text-muted)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onMouseEnter={e => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }
            }}
            onMouseLeave={e => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                }
            }}
        >
            {label}
        </button>
    )
}
