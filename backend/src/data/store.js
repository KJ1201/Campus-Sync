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

function findConflictingEvent(newEvent, existingEvents) {
    const superNormalise = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const name = superNormalise(newEvent.event_name);
    const date = newEvent.date_iso ? new Date(newEvent.date_iso).toISOString().split('T')[0] : null;

    return existingEvents.find(prev => {
        const prevName = superNormalise(prev.event_name);
        const prevDate = prev.date_iso ? new Date(prev.date_iso).toISOString().split('T')[0] : null;

        // 1. Name Check (Exact or significant overlap for long names)
        const isNameMatch = (name === prevName) ||
            (name.length > 12 && (name.includes(prevName) || prevName.includes(name)));

        if (!isNameMatch) return false;

        // 2. Date Check:
        // If both have different dates, they are separate occurrences (e.g. weekly meet)
        if (date && prevDate && date !== prevDate) return false;

        // 3. Otherwise, it's a conflict (same day, or one is undated)
        return true;
    });
}

function mergeEvents(oldEvent, newEvent) {
    // New event properties win, but keep old ones if new ones are null/empty
    return {
        ...oldEvent,
        ...newEvent,
        // Ensure we don't lose the poster if the new message didn't have one
        poster_url: newEvent.poster_url || oldEvent.poster_url,
        // Ensure we keep the better date (ISO with time > ISO without time > null)
        date_iso: (newEvent.date_iso?.length >= (oldEvent.date_iso?.length || 0))
            ? newEvent.date_iso : oldEvent.date_iso,
        // Keep registration link if new one is missing
        registration_link: newEvent.registration_link || oldEvent.registration_link,
        venue: newEvent.venue || oldEvent.venue,
        id: oldEvent.id // Maintain the original ID for frontend stability
    };
}

async function appendEvent(event, sourceMsgId = null) {
    writeQueue = writeQueue.then(async () => {
        let events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));

        if (sourceMsgId) {
            events = events.filter(e => e.sourceMsgId !== sourceMsgId);
        }

        const conflict = findConflictingEvent(event, events);

        if (conflict) {
            const merged = mergeEvents(conflict, event);
            if (sourceMsgId) merged.sourceMsgId = sourceMsgId;
            events = events.map(e => e.id === conflict.id ? merged : e);
        } else {
            if (sourceMsgId) event.sourceMsgId = sourceMsgId;
            events.push(event);
        }

        await fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
        return true;
    });
    return writeQueue;
}

async function bulkAppendMessages(newMsgs) {
    writeQueue = writeQueue.then(async () => {
        let msgs = JSON.parse(await fs.readFile(MESSAGES_PATH, 'utf8'));

        for (const nm of newMsgs) {
            const idx = msgs.findIndex(m => m.msgId && m.msgId === nm.msgId);
            if (idx !== -1) {
                msgs[idx] = { ...msgs[idx], ...nm };
            } else {
                msgs.push(nm);
            }
        }

        // Keep latest 500 only for performance
        const trimmed = msgs.slice(-500);
        await fs.writeFile(MESSAGES_PATH, JSON.stringify(trimmed, null, 2));
    });
    return writeQueue;
}

async function bulkAppendEvents(newEvents, sourceMsgId = null) {
    writeQueue = writeQueue.then(async () => {
        let events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));

        if (sourceMsgId) {
            events = events.filter(e => e.sourceMsgId !== sourceMsgId);
        }

        const addedEvents = [];

        for (const e of newEvents) {
            if (sourceMsgId) e.sourceMsgId = sourceMsgId;

            const conflictInStore = findConflictingEvent(e, events);
            if (conflictInStore) {
                const merged = mergeEvents(conflictInStore, e);
                events = events.map(old => old.id === conflictInStore.id ? merged : old);
                addedEvents.push(merged);
            } else {
                const conflictInBatch = findConflictingEvent(e, addedEvents);
                if (conflictInBatch) {
                    const merged = mergeEvents(conflictInBatch, e);
                    const index = addedEvents.findIndex(added => added.id === conflictInBatch.id);
                    addedEvents[index] = merged;
                    events = events.map(old => old.id === conflictInBatch.id ? merged : old);
                } else {
                    events.push(e);
                    addedEvents.push(e);
                }
            }
        }

        if (addedEvents.length > 0) {
            await fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
            return addedEvents;
        }
        return [];
    });
    return writeQueue;
}

async function deleteEventsByMessageId(msgId) {
    writeQueue = writeQueue.then(async () => {
        const events = JSON.parse(await fs.readFile(EVENTS_PATH, 'utf8'));
        const filtered = events.filter(e => e.sourceMsgId !== msgId);
        if (events.length !== filtered.length) {
            await fs.writeFile(EVENTS_PATH, JSON.stringify(filtered, null, 2));
            return true;
        }
        return false;
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
