const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT_TEMPLATE = `You are an academic event extraction assistant for a college campus.

Today's date is {current_date}. Use this to interpret all relative date references
(e.g. "this Friday", "next week", "25th March") into absolute ISO 8601 dates.

Below are recent messages from various college WhatsApp groups.
For each message that contains an event, announcement, opportunity, or deadline,
extract and return a structured JSON object.

Ignore casual chatter, memes, greetings, and messages with no actionable content.

Return a JSON array. Each object must have exactly these fields:
{
  "event_name": "short clear title of the event",
  "poster_url": "use the value passed in context if provided, else null",
  "description": "2-3 sentence clean description of the event",
  "registration_link": "any registration or info URL found, else null",
  "date_iso": "ISO 8601 date string if a date is mentioned, else null",
  "venue": "physical location or online platform mentioned, else null",
  "branch": "which branch(es) this is for — e.g. CSE, ECE, All, ME+CE. Use All if open to everyone.",
  "category": "exactly one of: Hackathon | Seminar | Workshop | Placement | Exam | Cultural | Sports | Deadline | General",
  "group": "name of the WhatsApp group this came from",
  "sender": "sender display name",
  "original_text": "the raw original message verbatim",
  "timestamp": "ISO timestamp of when the message was received"
}

Category classification rules:
- Hackathon: any competitive coding, building, or ideation event
- Seminar: guest lectures, talks, expert sessions, panel discussions
- Workshop: hands-on practical skill-building sessions
- Placement: job drives, internship listings, company visits, PPTs
- Exam: internal tests, makeup exams, assessment circulars
- Cultural: fests, performances, art, music, dance, drama
- Sports: athletic events, trials, inter-college tournaments
- Deadline: registration or submission deadlines with no associated physical event
- General: everything else — use sparingly, only when no other category fits

Return only valid JSON array. No explanation. No markdown.

Context: {context}

Messages:
{messages}`;

const modelName = 'gemini-2.5-flash';

/**
 * Local pre-filter to skip casual chat and save API quota.
 */
function isLikelyEvent(text) {
    if (!text || text.length < 20) return false;
    const keywords = ['register', 'venue', 'hackathon', 'workshop', 'seminar', 'date', 'time', 'prize', 'deadline', 'form.gle', 'https://', 'http://', 'link', 'competition', 'exam', 'placement', 'drive'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
}

/**
 * Extracts structured events from one or more messages in a single call.
 * This is 5x more efficient for rate limits.
 */
async function extractEventsFromBatch(messagesBatch) {
    // 1. Local Pre-filter: only process messages that look like events
    const candidates = messagesBatch.filter(m => isLikelyEvent(m.text));
    if (candidates.length === 0) return [];

    const currentDate = new Date().toISOString().split('T')[0];

    // 2. Format as a numbered list for Gemini
    const messagesBlob = candidates.map((m, i) =>
        `[MSG #${i + 1}] [Group: ${m.group || 'Unknown'}] [Sender: ${m.sender || 'Unknown'}] [Time: ${m.timestamp}]\nText: ${m.text}\nPoster Context: ${m.posterUrl || 'None'}`
    ).join('\n\n---\n\n');

    const prompt = PROMPT_TEMPLATE
        .replace('{current_date}', currentDate)
        .replace('{context}', `You are processing ${candidates.length} messages. For each one that is an academic/technical event, add it to the JSON array.`)
        .replace('{messages}', messagesBlob);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(clean);

        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        if (err.message.includes('429')) {
            console.error(`[Gemini] Quota Exceeded (429). Skipping batch...`);
        } else {
            console.error(`[Gemini] Batch failed: ${err.message}`);
        }
        return [];
    }
}

// For backward compatibility while refactoring bot/index.js
async function extractEvents(text, posterUrl, meta) {
    return extractEventsFromBatch([{ text, posterUrl, ...meta }]);
}

module.exports = { extractEvents, extractEventsFromBatch };
