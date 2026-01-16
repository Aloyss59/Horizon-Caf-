require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const sequelize = require('./config/database');
const initDatabase = require('./init-db');

// Imports routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');

// Imports models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../src')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', require('./routes/payments'));

// Servir index.html pour la route racine
app.get(/^\/$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/index.html'));
});

// Servir les fichiers HTML spécifiques depuis /pages/
app.get(/\.html$/, (req, res) => {
  // Vérifier si c'est un fichier dans /pages/
  const file = path.join(__dirname, '../src/pages', req.path.replace(/^\//, ''));
  res.sendFile(file, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, '../src/pages/index.html'));
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.io events
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('userOnline', (userId) => {
    userSockets.set(userId, socket.id);
    io.emit('userStatusChanged', { userId, status: 'online' });
  });

  socket.on('sendMessage', (data) => {
    const { senderId, recipientId, content, messageType } = data;
    const recipientSocket = userSockets.get(recipientId);

    if (recipientSocket) {
      io.to(recipientSocket).emit('newMessage', {
        senderId,
        content,
        messageType,
        timestamp: new Date()
      });
    }
  });

  socket.on('typing', (data) => {
    const { userId, recipientId } = data;
    const recipientSocket = userSockets.get(recipientId);

    if (recipientSocket) {
      io.to(recipientSocket).emit('userTyping', { userId });
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUserId;
    for (const [userId, socketId] of userSockets) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('userStatusChanged', { userId: disconnectedUserId, status: 'offline' });
    }
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on('joinChannel', (channelId) => {
    socket.join(`channel-${channelId}`);
  });

  socket.on('leaveChannel', (channelId) => {
    socket.leave(`channel-${channelId}`);
  });
});

// Initialize database et démarrer le serveur
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database (creates tables if needed, adds default data)
    await initDatabase();

    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 Serveur Horizon Café démarré sur le port ${PORT}`);
      console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔌 WebSocket activé avec Socket.io\n`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = server;
