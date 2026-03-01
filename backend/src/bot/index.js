const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    Browsers,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { extractEvents, extractEventsFromBatch } = require('../ai/gemini');
const { appendEvent, bulkAppendMessages, bulkAppendEvents } = require('../data/store');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const SESSION_DIR = path.join(__dirname, '../../bot/session');

let botConnected = false;

function isBotConnected() {
    return botConnected;
}

async function startBot(io) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(SESSION_DIR, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 Using WA v${version.join('.')} (isLatest: ${isLatest})`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: require('pino')({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: true, // Crucial for getting older chats
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\n📱 Scan this QR code to connect the CampusSync bot:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            botConnected = true;
            console.log('✅ WhatsApp bot connected');
        }
        if (connection === 'close') {
            botConnected = false;
            const shouldReconnect =
                new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️  Bot disconnected. Reconnecting:', shouldReconnect, lastDisconnect?.error);
            if (shouldReconnect) {
                setTimeout(() => startBot(io), 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        await processMessages(messages, type === 'notify');
    });

    const onHistorySync = async ({ messages }) => {
        console.log(`📜 WhatsApp history detected: ${messages.length} messages found.`);
        // Process history in batches of 5 for free tier safety
        const recent = messages.slice(-100);
        for (let i = 0; i < recent.length; i += 5) {
            const batch = recent.slice(i, i + 5);
            await processMessages(batch, false);
            if (i + 5 < recent.length) {
                console.log(`⏳ Waiting 15s for next batch (Free Tier protection)...`);
                await new Promise(r => setTimeout(r, 15000));
            }
        }
        console.log(`✅ History sync complete.`);
    };

    sock.ev.on('messaging-history.set', onHistorySync);
    sock.ev.on('history-sync.set', onHistorySync);

    async function processMessages(messages, isLive) {
        const batchToAnalyze = [];
        const allRaw = [];

        for (const msg of messages) {
            if (msg.key.fromMe) continue;
            const groupId = msg.key.remoteJid;
            if (!groupId?.endsWith('@g.us')) continue;

            const groupMeta = await sock.groupMetadata(groupId).catch(() => ({}));
            const groupName = groupMeta.subject || groupId;
            const sender = msg.pushName || msg.key.participant || 'Unknown';
            const timestamp = new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString();

            const messageContent = msg.message;
            const text =
                messageContent?.conversation ||
                messageContent?.extendedTextMessage?.text ||
                messageContent?.imageMessage?.caption ||
                messageContent?.videoMessage?.caption ||
                '';

            if (!text.trim()) continue;

            const rawMsg = { groupName, sender, timestamp, text };
            allRaw.push(rawMsg);
            if (isLive) io.emit('new_message', rawMsg);

            // Limited history extraction
            const daysOld = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24);
            if (isLive || daysOld < 14) {
                let posterUrl = null;

                // Download Image (Live or Recent History)
                if (messageContent?.imageMessage) {
                    try {
                        const buffer = await downloadMediaMessage(
                            msg,
                            'buffer',
                            {},
                            {
                                logger: require('pino')({ level: 'silent' }),
                                reuploadRequest: sock.updateMediaMessage
                            }
                        );
                        if (buffer) {
                            const filename = `${uuidv4()}.jpg`;
                            await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
                            posterUrl = `/uploads/${filename}`;
                        }
                    } catch (err) {
                        console.error('❌ Failed to download poster:', err.message);
                    }
                }

                batchToAnalyze.push({ text, posterUrl, group: groupName, sender, timestamp, isLive });
            }
        }

        // Optimized Bulk Save
        if (allRaw.length > 0) {
            await bulkAppendMessages(allRaw);
            console.log(`💾 Saved ${allRaw.length} raw messages.`);
        }

        if (batchToAnalyze.length > 0) {
            const results = await extractEventsFromBatch(batchToAnalyze);
            const enriched = results.map(e => ({ id: uuidv4(), ...e }));

            if (enriched.length > 0) {
                const uniqueSaved = await bulkAppendEvents(enriched);
                if (uniqueSaved.length > 0 && isLive) {
                    for (const ev of uniqueSaved) {
                        io.emit('new_event', ev);
                        console.log(`📅 New event: ${ev.event_name}`);
                    }
                } else if (uniqueSaved.length === 0 && enriched.length > 0) {
                    console.log(`♻️  Skipped ${enriched.length} duplicate events.`);
                }
            }
        }
    }
}

module.exports = { startBot, isBotConnected };
