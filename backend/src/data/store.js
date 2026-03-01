const fs = require('fs').promises;
const path = require('path');

const EVENTS_PATH = path.join(__dirname, 'events.json');
const MESSAGES_PATH = path.join(__dirname, 'messages.json');

// Serialise all writes to events.json through a promise chain
// to prevent concurrent write corruption
let writeQueue = Promise.resolve();

async function initDataFiles() {
    for (const p of [EVENTS_PATH, MESSAGES_PATH]) {
        try { await fs.access(p); } catch { await fs.writeFile(p, '[]'); }
    }
}

async function readEvents() {
    return JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));
}

async function readMessages() {
    return JSON.parse(await fs.readFile(MESSAGES_PATH, 'utf8'));
}

function isDuplicate(newEvent, existingEvents) {
    // Normalise: lowercase, remove non-alphanumeric, collapse spaces
    const superNormalise = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

    const name = superNormalise(newEvent.event_name);
    const date = newEvent.date_iso ? new Date(newEvent.date_iso).toISOString().split('T')[0] : null;
    const venue = superNormalise(newEvent.venue);

    return existingEvents.some(prev => {
        const prevName = superNormalise(prev.event_name);
        const prevDate = prev.date_iso ? new Date(prev.date_iso).toISOString().split('T')[0] : null;
        const prevVenue = superNormalise(prev.venue);

        // Match Logic:
        // 1. Exact name + Date (just the day part)
        if (name === prevName && date === prevDate) return true;
        // 2. Fuzzy name (one contains other) + Same Date
        if (date && date === prevDate && (name.includes(prevName) || prevName.includes(name)) && name.length > 8) return true;
        // 3. No dates? Match by Name + Venue
        if (!date && !prevDate && name === prevName && venue && venue === prevVenue) return true;

        return false;
    });
}

async function appendEvent(event) {
    writeQueue = writeQueue.then(async () => {
        const events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));
        if (!isDuplicate(event, events)) {
            events.push(event);
            await fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
            return true; // was added
        }
        return false; // was skipped
    });
    return writeQueue;
}

async function bulkAppendMessages(newMsgs) {
    writeQueue = writeQueue.then(async () => {
        const msgs = JSON.parse(await fs.readFile(MESSAGES_PATH, 'utf8'));
        msgs.push(...newMsgs);
        // Keep latest 500 only for performance
        const trimmed = msgs.slice(-500);
        await fs.writeFile(MESSAGES_PATH, JSON.stringify(trimmed, null, 2));
    });
    return writeQueue;
}

async function bulkAppendEvents(newEvents) {
    writeQueue = writeQueue.then(async () => {
        const events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));
        const uniqueInBatch = [];

        for (const e of newEvents) {
            if (!isDuplicate(e, events) && !isDuplicate(e, uniqueInBatch)) {
                uniqueInBatch.push(e);
            }
        }

        if (uniqueInBatch.length > 0) {
            events.push(...uniqueInBatch);
            await fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
            return uniqueInBatch; // return what was actually added
        }
        return [];
    });
    return writeQueue;
}

async function deleteEvent(id) {
    writeQueue = writeQueue.then(async () => {
        const events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));
        const filtered = events.filter(e => e.id !== id);
        if (events.length !== filtered.length) {
            await fs.writeFile(EVENTS_PATH, JSON.stringify(filtered, null, 2));
            return true;
        }
        return false;
    });
    return writeQueue;
}

module.exports = {
    initDataFiles,
    readEvents,
    readMessages,
    appendEvent,
    bulkAppendMessages,
    bulkAppendEvents,
    deleteEvent
};
