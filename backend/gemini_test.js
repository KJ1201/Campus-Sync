require('dotenv').config();
const { extractEvents } = require('./src/ai/gemini');

async function test() {
    console.log('Testing Gemini API with hardcoded message...');
    const text = 'ISTE Workshop on ML — 10th March, CS Hall, CSE students only, register at forms.gle/xyz';
    const meta = { group: 'Test Group', sender: 'Test User', timestamp: new Date().toISOString() };

    const events = await extractEvents(text, null, meta);
    console.log('Result:', JSON.stringify(events, null, 2));

    if (events.length > 0 && events[0].event_name) {
        console.log('✅ Gemini API test PASSED');
    } else {
        console.log('❌ Gemini API test FAILED');
    }
}

test();
