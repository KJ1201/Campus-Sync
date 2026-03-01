import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { useFilters } from '../hooks/useFilters'
import { useEvents } from '../hooks/useEvents'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DetailPanel from '../components/DetailPanel'
import SearchBar from '../components/SearchBar'
import CategoryFilterBar from '../components/CategoryFilterBar'
import CalendarStrip from '../components/CalendarStrip'
import StatsBar from '../components/StatsBar'
import EventFeedList from '../components/EventFeedList'
import RawMessageCard from '../components/RawMessageCard'
import LiveToast from '../components/LiveToast'
import { API_BASE } from '../constants'

export default function AllEventsPage() {
    const nav = useNavigate()
    const { search: searchParams } = useLocation()
    const { category, search, date, setFilter, setFilters, clearFilters, hasFilters } = useFilters()
    const { events, loading, prependEvent, removeEvent } = useEvents({ category, search, date })
    const [botConnected, setBotConnected] = useState(false)
    const [toast, setToast] = useState(null)
    const [stats, setStats] = useState({ total: 0, upcoming: 0 })
    const [rawMessages, setRawMessages] = useState([])
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280)
    const [selectedEventId, setSelectedEventId] = useState(null)
    const [fullCalendarOpen, setFullCalendarOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1280)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        fetch(`${API_BASE}/health`)
            .then(r => r.json())
            .then(d => setBotConnected(d.botConnected))
            .catch(() => setBotConnected(false))
    }, [])

    useEffect(() => {
        fetch(`${API_BASE}/stats`)
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => { })
    }, [events.length]) // Refresh when event list changes

    useEffect(() => {
        fetch(`${API_BASE}/messages${date ? `?date=${date}` : ''}`)
            .then(r => r.json())
            .then(d => {
                setRawMessages(d)
            })
            .catch(() => { })
    }, [date])

    useSocket((data, type) => {
        if (type === 'new_event') {
            prependEvent(data)
            setToast(data)
        } else if (type === 'new_message') {
            setRawMessages(prev => [data, ...prev].slice(0, 50))
        }
        setBotConnected(true)
    })

    const activeFilterCount = [category, search, date].filter(Boolean).length

    // Mobile Layout
    if (!isDesktop) {
        return (
            <div style={{ minHeight: '100svh', background: 'var(--bg-primary)', paddingBottom: '2rem' }}>
                <div className="bg-glow" />
                <Navbar botConnected={botConnected} />

                <main style={{ maxWidth: 640, margin: '0 auto', padding: '12px 20px 80px' }}>
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={search}
                                onChange={v => setFilter('search', v)}
                            />
                        </div>
                        <button
                            onClick={() => setFullCalendarOpen(true)}
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer'
                            }}
                        >📅</button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <CalendarStrip
                            activeDate={date}
                            onDateSelect={v => setFilter('date', v)}
                        />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <CategoryFilterBar
                            active={category}
                            onSelect={v => setFilters({ category: v, date: '' })}
                        />
                    </div>


                    <div style={{ marginBottom: '24px' }}>
                        <StatsBar
                            total={stats.total}
                            activeFilterCount={activeFilterCount}
                            matchingCount={events.length}
                            upcomingCount={stats.upcoming}
                        />
                    </div>

                    {category === 'Raw' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rawMessages.map((msg, i) => (
                                <RawMessageCard key={i} message={msg} />
                            ))}
                        </div>
                    ) : (
                        <EventFeedList
                            events={events}
                            loading={loading}
                            hasFilters={hasFilters}
                            onClearFilters={clearFilters}
                            onDeleteEvent={removeEvent}
                        />
                    )}
                </main>

                {fullCalendarOpen && (
                    <FullCalendar
                        activeDate={date}
                        onDateSelect={v => setFilter('date', v)}
                        onClose={() => setFullCalendarOpen(false)}
                        events={events}
                    />
                )}

                {toast && <LiveToast event={toast} onDismiss={() => setToast(null)} />}
            </div>
        )
    }

    // Desktop Layout (1280px+)
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
            <div className="bg-glow" />

            {/* Left Sidebar (240px) */}
            <Sidebar
                activeCategory={category}
                onApplyFilters={setFilters}
                botConnected={botConnected}
                activeDate={date}
            />

            {/* Center Panel (Feed) */}
            <main style={{
                marginLeft: '240px',
                marginRight: '380px',
                flex: 1,
                padding: '32px',
                minHeight: '100vh',
                overflowY: 'auto'
            }}>
                <header style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '24px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            margin: 0,
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 'normal'
                        }}>
                            {category === 'Past' ? 'Past Events Archive' : (category ? category : (date ? `Events on ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}` : 'Upcoming Events'))}
                        </h1>
                        <div style={{ width: '300px', display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <SearchBar
                                    value={search}
                                    onChange={v => setFilter('search', v)}
                                    isDesktop={true}
                                />
                            </div>
                            <button
                                onClick={() => setFullCalendarOpen(true)}
                                title="Full Monthly View"
                                style={{
                                    width: '36px', height: '36px', borderRadius: '999px',
                                    background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                            >📅</button>
                        </div>
                    </div>

                    <CalendarStrip
                        activeDate={date}
                        onDateSelect={v => setFilter('date', v)}
                    />
                </header>

                <div style={{ marginBottom: '32px' }}>
                    <StatsBar
                        total={stats.total}
                        activeFilterCount={activeFilterCount}
                        matchingCount={events.length}
                        upcomingCount={stats.upcoming}
                    />
                </div>

                <EventFeedList
                    events={events}
                    loading={loading}
                    hasFilters={hasFilters}
                    onClearFilters={clearFilters}
                    onDeleteEvent={removeEvent}
                    onEventSelect={setSelectedEventId}
                />
            </main>

            {/* Right Panel (Detail) */}
            <aside style={{
                width: '380px',
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-default)',
                padding: '28px 24px',
                overflowY: 'auto',
                zIndex: 10
            }}>
                <DetailPanel
                    eventId={selectedEventId}
                />
            </aside>

            {fullCalendarOpen && (
                <FullCalendar
                    activeDate={date}
                    onDateSelect={v => setFilter('date', v)}
                    onClose={() => setFullCalendarOpen(false)}
                    events={events}
                />
            )}

            {toast && <LiveToast event={toast} onDismiss={() => setToast(null)} />}
        </div>
    )
}
import FullCalendar from '../components/FullCalendar'
