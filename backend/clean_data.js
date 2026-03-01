const fs = require('fs');
const path = require('path');
const EVENTS_PATH = path.join(__dirname, 'src', 'data', 'events.json');

function superNormalise(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDateString(iso) {
    if (!iso) return null;
    try {
        return new Date(iso).toISOString().split('T')[0];
    } catch {
        return superNormalise(iso);
    }
}

function clean() {
    console.log('🧹 Aggressive cleaning initiated...');
    const raw = fs.readFileSync(EVENTS_PATH, 'utf8');
    const events = JSON.parse(raw);

    const unique = [];
    let skipped = 0;

    for (const e of events) {
        const name = superNormalise(e.event_name);
        const date = getDateString(e.date_iso);
        const venue = superNormalise(e.venue);

        const isDup = unique.some(prev => {
            const prevName = superNormalise(prev.event_name);
            const prevDate = getDateString(prev.date_iso);
            const prevVenue = superNormalise(prev.venue);

            if (name === prevName && date === prevDate) return true;
            if (date && date === prevDate && (name.includes(prevName) || prevName.includes(name)) && name.length > 5) return true;
            if (!date && !prevDate && name === prevName && venue && venue === prevVenue) return true;

            return false;
        });

        if (!isDup) {
            unique.push(e);
        } else {
            skipped++;
            console.log(`🗑️  Removed duplicate: ${e.event_name} [${e.date_iso}]`);
        }
    }

    fs.writeFileSync(EVENTS_PATH, JSON.stringify(unique, null, 2));
    console.log(`✅ Kept ${unique.length} events, cleaned ${skipped} duplicates.`);
}

clean();
