const fs = require('fs');
const path = require('path');

const EVENTS_PATH = path.join(__dirname, 'backend/src/data/events.json');

const superNormalise = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

function findConflictingInBatch(newEvent, existingEvents) {
    const name = superNormalise(newEvent.event_name);
    const date = newEvent.date_iso ? new Date(newEvent.date_iso).toISOString().split('T')[0] : null;

    return existingEvents.find(prev => {
        const prevName = superNormalise(prev.event_name);
        const prevDate = prev.date_iso ? new Date(prev.date_iso).toISOString().split('T')[0] : null;

        const isNameMatch = (name === prevName) ||
            (name.length > 12 && (name.includes(prevName) || prevName.includes(name)));
        if (!isNameMatch) return false;
        if (date && prevDate && date !== prevDate) return false;
        return true;
    });
}

function mergeEvents(oldEvent, newEvent) {
    return {
        ...oldEvent,
        ...newEvent,
        poster_url: newEvent.poster_url || oldEvent.poster_url,
        date_iso: (newEvent.date_iso?.length >= (oldEvent.date_iso?.length || 0))
            ? newEvent.date_iso : oldEvent.date_iso,
        registration_link: newEvent.registration_link || oldEvent.registration_link,
        venue: newEvent.venue || oldEvent.venue,
        id: oldEvent.id
    };
}

try {
    const data = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
    const unique = [];

    for (const event of data) {
        const conflict = findConflictingInBatch(event, unique);
        if (conflict) {
            const index = unique.findIndex(u => u.id === conflict.id);
            unique[index] = mergeEvents(conflict, event);
        } else {
            unique.push(event);
        }
    }

    fs.writeFileSync(EVENTS_PATH, JSON.stringify(unique, null, 2));
    console.log(`✅ Cleaned and MERGED events.json. Reduced ${data.length} -> ${unique.length} events.`);
} catch (err) {
    console.error('Error cleaning events:', err);
}
