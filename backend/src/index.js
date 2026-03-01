require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initDataFiles } = require('./data/store');
const eventsRouter = require('./routes/events');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded poster images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/', eventsRouter);

// Health check
app.get('/health', (req, res) => {
  const { isBotConnected } = require('./bot');
  res.json({ status: 'ok', botConnected: isBotConnected() });
});

// Init data files, then start bot, then listen
initDataFiles().then(() => {
  // Attach io to app so routes/bot can access it
  app.set('io', io);

  // Start the WhatsApp bot (pass io for event emission)
  require('./bot').startBot(io);

  server.listen(PORT, () => {
    console.log(`✅ CampusSync backend running on http://localhost:${PORT}`);
  });
});
