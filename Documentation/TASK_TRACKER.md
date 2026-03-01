# CampusSync — Task Tracker

> Update this file as work progresses. Use `[ ]` → `[/]` → `[x]`.

---

## Phase 1 — Project Scaffolding
- [x] Create monorepo folder structure (`backend/`, `frontend/`)
- [x] Write `backend/package.json` and install all dependencies (212 packages)
- [x] Initialize `frontend/` with Vite 7 + React + Tailwind CSS + React Router + socket.io-client
- [x] Frontend dev server starts cleanly at http://localhost:5173

---

## Phase 2 — Backend Foundation
- [x] Express server with CORS, port config from `.env`
- [x] Socket.io attached to same HTTP server
- [x] `/uploads/` served as Express static directory
- [x] `data/events.json` and `data/messages.json` auto-created on startup if missing
- [x] Async write-queue utility in `src/data/store.js`
- [x] `GET /health` endpoint responding with bot connection status

---

## Phase 3 — Gemini Extraction Module
- [x] Prompt template in `src/ai/gemini.js` with `{current_date}` and `{messages}` injection
- [x] `extractEvents(text, posterUrl)` function — calls Gemini Flash, returns structured array
- [x] JSON parse with try/catch — silent drop + log on any Gemini error
- [ ] Manual test: hardcoded sample WhatsApp message returns correct 8-field event object

---

## Phase 4 — Baileys WhatsApp Bot
- [x] `makeWASocket` with `useMultiFileAuthState` → session persisted in `bot/session/`
- [x] QR code printed to terminal on first run; auto-reconnect on subsequent runs
- [x] `messages.upsert` handler — filters out own bot messages and non-text messages
- [x] Image download via `downloadMediaMessage()` → saved to `uploads/<uuid>.jpg`
- [ ] Full pipeline: receive message → extract events → write to `events.json` → emit `new_event`

---

## Phase 5 — REST API Endpoints
- [x] `GET /events` — reads `events.json`, applies `?category`, `?branch`, `?search`, `?date` query params
- [x] Date sort: ASC by `date_iso`; urgency tiebreak (Exam > Deadline > Placement); undated last
- [x] `GET /events/:id` — returns single event by UUID
- [x] Date filter: Exact YYYY-MM-DD match for `?date`

---

## Phase 6 — Frontend Scaffolding & Design System
- [x] Vite + React + Tailwind initialized in `frontend/`
- [x] React Router v6 with two routes: `/` and `/events/:id`
- [x] `src/constants.js` — `CATEGORY_COLORS`, `BRANCHES`, `CATEGORIES` arrays
- [x] Global CSS design tokens: dark background, Inter font, base utility classes
- [x] Vite dev proxy → `http://localhost:3001` (avoids CORS in dev)
- [x] `useSocket.js` hook connected and receiving test events

---

## Phase 7 — All Events Page
- [x] `Navbar` — CampusSync logo + green pulsing live-bot indicator
- [x] `SearchBar` — full-width, debounced 300ms, clear (×) button
- [x] `CategoryFilterBar` — 9 chips; `General` chip smaller + muted; active chip highlighted
- [x] `BranchFilterBar` — 7 chips (All, CSE, ECE, ME, CE, EE, Other)
- [x] `StatsBar` — total visible events + active filter count + bot status dot
- [x] `EventCard` — category badge, branch chip, event name, 80×80px poster thumbnail, date chip (red if ≤3 days), venue, 2-line description preview
- [x] `EventFeedList` — date group headers (Today / Tomorrow / formatted date), UndatedSection at bottom
- [x] Filter state stored in URL search params; all filters combine correctly

---

## Phase 8 — Event Detail Page + LiveToast
- [x] `EventDetailPage` — full-width poster hero (220px) or category-colored placeholder
- [x] All 8 fields rendered as distinct visual blocks
- [x] `DateChip` shows "Date TBA" if `date_iso` is null; red if within 3 days
- [x] `VenueChip` shows "Venue TBA" if `venue` is null
- [x] `RegisterButton` — full-width green CTA; hidden if `registration_link` is null
- [x] `SourceInfo` — group, sender, timestamp in muted text
- [x] `RawMessageAccordion` — collapsed by default, expands to show `original_text`
- [x] Back button navigates to `/` with URL filter params preserved
- [x] `LiveToast` — slides in from bottom on `new_event` socket event
- [x] Toast shows group source name + "View" button → navigates to `/events/:id`

---

## Phase 9 — Polish & Demo Prep
- [x] Empty feed state (no events yet) — friendly illustration + message
- [x] No-results state (filters match nothing) — "No events match your filters" + Clear button
- [x] Loading shimmer on initial `GET /events` fetch
- [x] Card entrance animations — fade + slide up on mount
- [x] Desktop 3-column layout (Sidebar + Feed + Detail Panel)
- [x] Premium CSS design system: HSL colors, glassmorphism, Syne/DM Sans fonts

---

## Phase 10 — Calendar Integration
- [x] `CalendarStrip` horizontal scroll component for mobile feed
- [x] `MiniCalendar` sidebar component for desktop navigation
- [x] URL-synced `date` filtering in `useFilters`
- [x] Real-time date-aware ingestion in `useEvents`
- [x] Backend support for exact day filtering (YYYY-MM-DD)

---

## Bugs & Notes

| Date | Note |
|---|---|
| 2026-03-01 | Rebuilt frontend with premium dark-glassmorphism theme and 3-column desktop layout. |
| 2026-03-01 | Implemented dual-calendar system (Strip + Sidebar) for intuitive date-based navigation. |
