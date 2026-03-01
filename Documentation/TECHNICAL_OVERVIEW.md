# CampusSync — Technical Overview
> Developer onboarding reference. Read this before touching any code.

---

## 1. What Is This?

CampusSync is a WhatsApp-to-structured-event pipeline for college campuses. A Baileys bot listens to college WhatsApp groups, pipes messages through Gemini AI to extract structured event data, and streams results to a React frontend in real time via Socket.io.

**No login. No raw messages. Just clean event cards.**

---

## 2. Repository Structure

```
CampusSync/
├── Documentation/
│   ├── PRD.md                  # Full product requirements
│   ├── TECHNICAL_OVERVIEW.md   # ← you are here
│   └── TASK_TRACKER.md         # Build progress tracker
│
├── backend/
│   ├── src/
│   │   ├── index.js            # Express + Socket.io entry point
│   │   ├── bot/
│   │   │   └── index.js        # Baileys WhatsApp bot
│   │   ├── ai/
│   │   │   └── gemini.js       # Gemini extraction module
│   │   ├── data/
│   │   │   ├── store.js        # Read/write helpers + async write queue
│   │   │   ├── events.json     # Processed events (auto-created, gitignored)
│   │   │   └── messages.json   # Raw messages log (internal, gitignored)
│   │   └── routes/
│   │       └── events.js       # GET /events, GET /events/:id
│   ├── uploads/                # Poster images downloaded from WhatsApp (gitignored)
│   ├── .env                    # Local secrets (gitignored)
│   ├── .env.example            # Template — copy to .env and fill in
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx             # Vite entry point
    │   ├── App.jsx              # Router setup
    │   ├── constants.js         # CATEGORY_COLORS, BRANCHES, CATEGORIES
    │   ├── hooks/
    │   │   ├── useSocket.js     # Socket.io connection + new_event listener
    │   │   ├── useEvents.js     # Fetch + filter events from API
    │   │   └── useFilters.js    # URL search param filter state
    │   ├── pages/
    │   │   ├── AllEventsPage.jsx
    │   │   └── EventDetailPage.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── SearchBar.jsx
    │       ├── CategoryFilterBar.jsx
    │       ├── BranchFilterBar.jsx
    │       ├── StatsBar.jsx
    │       ├── EventFeedList.jsx
    │       ├── EventCard.jsx
    │       ├── EventDetailView.jsx
    │       └── LiveToast.jsx
    ├── index.css               # Global design tokens + Tailwind base
    ├── vite.config.js          # Dev proxy → localhost:3001
    └── package.json
```

---

## 3. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| WhatsApp integration | `@whiskeysockets/baileys` | Only viable open-source WA Web library |
| Backend runtime | Node.js + Express | Simple, fast, great Socket.io support |
| Real-time | Socket.io | Bi-directional push; trivial frontend client |
| AI extraction | Google Gemini Flash (`gemini-1.5-flash`) | Fast, cheap, excellent JSON extraction |
| Frontend framework | React + Vite | Fast dev server; component model suits card UI |
| Styling | Tailwind CSS | Utility-first, dark mode, rapid prototyping |
| Routing | React Router v6 | URL-based filter state (back-button safe) |
| Database (prototype) | JSON flat files | Zero setup, readable, sufficient for demo |
| Database (production) | MongoDB | Schema-flexible, scales with event volume |

---

## 4. Local Setup

### Prerequisites
- Node.js ≥ 18
- A **dummy WhatsApp account** (a spare SIM / number — NOT your personal one)
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd CampusSync

# 2. Install backend dependencies
cd backend
npm install

# 3. Create your .env file
cp .env.example .env
# → Open .env and paste your GEMINI_API_KEY

# 4. Start the backend
npm run dev
# QR code will print in the terminal — scan with your dummy WhatsApp account

# 5. In a new terminal, install and start the frontend
cd ../frontend
npm install
npm run dev
# → Opens at http://localhost:5173
```

> **Baileys session:** After scanning QR once, the session is saved in `backend/bot/session/`. The bot reconnects automatically on restart without re-scanning, as long as this folder exists. **Do not delete it.**

---

## 5. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Google AI Studio key for Gemini Flash |
| `PORT` | No | Backend port (default: `3001`) |

---

## 6. Backend Deep Dive

### 6.1 Entry Point — `src/index.js`
- Creates Express app + HTTP server + Socket.io server in one file
- Mounts `/uploads` as a static directory
- Mounts `routes/events.js` at `/`
- Starts the Baileys bot import (side-effectful — bot connects on require)
- Initializes `data/events.json` and `data/messages.json` to `[]` if they don't exist

### 6.2 Baileys Bot — `src/bot/index.js`
- Creates a Baileys `makeWASocket` with `useMultiFileAuthState` pointed at `./bot/session/`
- Listens to `messages.upsert` events
- **Filters out:** own bot messages (`message.key.fromMe`), non-text messages with no caption
- **Image handling:** if message contains an image, calls Baileys `downloadMediaMessage()`, saves buffer to `uploads/<uuid>.jpg`
- Calls `extractEvents(text, posterUrl)` from the Gemini module
- Appends raw message to `messages.json` (internal log, never exposed)
- Writes each extracted event to `events.json` via the write queue
- Emits `new_event` via Socket.io for each event

### 6.3 Gemini Module — `src/ai/gemini.js`

Exports one function:
```js
extractEvents(messageText, posterUrl = null) → Promise<EventObject[]>
```

- Injects `new Date().toISOString().split('T')[0]` as `{current_date}` into the prompt
- Calls `gemini-1.5-flash` with the structured extraction prompt (see PRD §5.10)
- Parses the JSON array response
- On **any error** (bad JSON, timeout, API error) → returns `[]` and logs the error. Never throws.

### 6.4 Data Store — `src/data/store.js`

**Write queue:** All writes to `events.json` are serialized:
```js
let queue = Promise.resolve();
const writeEvents = (events) => {
  queue = queue.then(() => fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2)));
  return queue;
};
```
This prevents file corruption when multiple Gemini responses resolve simultaneously.

### 6.5 API Routes — `src/routes/events.js`

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/events` | `category`, `branch`, `search` | All events, sorted, filtered |
| GET | `/events/:id` | — | Single event by UUID |
| GET | `/health` | — | `{ status: "ok", botConnected: bool }` |

**Sorting logic:**
1. Events with a `date_iso` are sorted ASC (soonest first)
2. Same-date tiebreak: `Exam > Deadline > Placement > everything else`
3. Events with no `date_iso` are appended at the end

---

## 7. Frontend Deep Dive

### 7.1 Filter State lives in the URL

Filters are stored as URL search params (`?category=Hackathon&branch=CSE&search=DSA`). This means:
- Sharing a filtered URL works out of the box
- Back button from Event Detail restores filters automatically (no extra state management needed)
- `useFilters.js` hook wraps `useSearchParams` from React Router

### 7.2 Socket.io Client — `useSocket.js`

Connects to `http://localhost:3001` (or `VITE_API_URL` in production). Listens for `new_event` events. On receive, triggers a callback that prepends the event to the feed at the correct date position and shows the LiveToast.

### 7.3 Category Colors — `src/constants.js`

```js
export const CATEGORY_COLORS = {
  Hackathon: '#a78bfa',
  Seminar:   '#60a5fa',
  Workshop:  '#22d3ee',
  Placement: '#4ade80',
  Exam:      '#f87171',
  Cultural:  '#f472b6',
  Sports:    '#fb923c',
  Deadline:  '#fbbf24',
  General:   '#94a3b8',
};
```

All components reference this single constant — never hardcode category colors elsewhere.

### 7.4 `General` Category Treatment

The `General` chip in `CategoryFilterBar` is rendered at 85% size with reduced opacity. It is still clickable. This prevents low-value catch-all announcements from visually dominating the filter bar.

---

## 8. Data Models

### Event Object (stored in `events.json`)

```json
{
  "id": "uuid-v4",
  "event_name": "DSA Workshop — ISTE",
  "poster_url": "http://localhost:3001/uploads/abc123.jpg",
  "description": "A hands-on 3-hour workshop on dynamic programming...",
  "registration_link": "https://forms.gle/xyz",
  "date_iso": "2026-03-10",
  "venue": "CS Seminar Hall, Block A",
  "branch": "CSE",
  "category": "Workshop",
  "group": "ISTE — Events",
  "sender": "Priya Sharma",
  "original_text": "Hey everyone! ISTE is hosting a DSA workshop...",
  "timestamp": "2026-03-01T14:23:00.000Z"
}
```

---

## 9. Key Design Decisions

| Decision | Rationale |
|---|---|
| Flat JSON files for storage | Zero setup for a hackathon; the write queue prevents corruption |
| URL search params for filter state | Back-button from detail page restores filters for free |
| `General` de-emphasized in UI | Prevents low-value noise from dominating the filter bar |
| `{current_date}` injected into Gemini prompt | Resolves relative dates ("this Friday") to absolute ISO dates |
| Silent drop on Gemini errors | Prevents frontend crashes; bad messages just don't appear |
| Baileys session persisted to disk | One-time QR scan; reconnects automatically on server restart |
| `/uploads/` served as Express static | Simple, no S3/cloud needed for prototype |

---

## 10. Common Gotchas

- **Baileys is unofficial** — WhatsApp may occasionally disconnect the session. If the bot stops receiving messages, delete `bot/session/` and re-scan QR.
- **Gemini rate limit** — Free tier is ~15 RPM. Don't connect to high-traffic groups during demo.
- **Image poster_url** — Only populated if the original WhatsApp message included an image. Most text-only announcements will have `poster_url: null`.
- **Date parsing** — Gemini is good but not perfect. Always inject `{current_date}` so relative dates resolve correctly.
- **Concurrent writes** — Always use `store.js` write helpers, never write to `events.json` directly with `fs.writeFile`.
