// Socket.io client pour chat temps réel
// SOCKET_URL est défini dans config.js (détecte automatiquement l'environnement)
const SOCKET_URL = typeof SOCKET_URL !== 'undefined' ? SOCKET_URL : 'http://localhost:5000';

class ChatSocket {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.isConnected) return;

    this.socket = io(SOCKET_URL, {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connecté:', this.socket.id);
      this.isConnected = true;
      this.socket.emit('userOnline', userId);
    });

    this.socket.on('newMessage', (data) => {
      this._emit('messageReceived', data);
    });

    this.socket.on('userTyping', (data) => {
      this._emit('userTyping', data);
    });

    this.socket.on('userStatusChanged', (data) => {
      this._emit('userStatusChanged', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket déconnecté');
      this.isConnected = false;
      this._emit('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this._emit('error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  sendMessage(recipientId, content, messageType = 'direct') {
    if (this.isConnected) {
      this.socket.emit('sendMessage', {
        senderId: localStorage.getItem('currentUserId'),
        recipientId,
        content,
        messageType
      });
    }
  }

  notifyTyping(recipientId) {
    if (this.isConnected) {
      this.socket.emit('typing', {
        userId: localStorage.getItem('currentUserId'),
        recipientId
      });
    }
  }

  joinChannel(channelId) {
    if (this.isConnected) {
      this.socket.emit('joinChannel', channelId);
    }
  }

  leaveChannel(channelId) {
    if (this.isConnected) {
      this.socket.emit('leaveChannel', channelId);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  _emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
}

const chatSocket = new ChatSocket();
