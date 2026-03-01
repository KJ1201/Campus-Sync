const io = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

const socket = io('http://localhost:3001', { transports: ['websocket'] });

socket.on('connect', () => {
    console.log('🔌 Connected to CampusSync backend.');

    const mockEvent = {
        id: uuidv4(),
        event_name: "JUST NOW: Surprise Coding Contest!",
        category: "Hackathon",
        branch: "All",
        date_iso: new Date().toISOString(), // Today
        venue: "Lab A",
        description: "A quick 1-hour sprint contest. Winners get swags! Come over now.",
        registration_link: "https://forms.gle/fastcode",
        group: "Campus Alerts 🚨",
        sender: "Bot Admin",
        timestamp: new Date().toISOString(),
        original_text: "🚨 Surprise coding contest in Lab A! Come now!"
    };

    console.log('🚀 Triggering live event toast...');
    socket.emit('test_new_event', mockEvent); // I need to add this listener to the backend or just emit locally.

    // Better yet, just send it to a special test endpoint on the backend
    fetch('http://localhost:3001/events/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockEvent)
    }).then(r => r.json()).then(d => {
        console.log('✅ Triggered! Check your browser for the toast.');
        process.exit();
    }).catch(e => {
        console.error('❌ Failed to trigger. Ensure backend is running.', e.message);
        process.exit();
    });
});
