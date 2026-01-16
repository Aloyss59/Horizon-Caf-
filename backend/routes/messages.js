const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 AUTH CHECK - Header:', authHeader ? authHeader.substring(0, 30) + '...' : 'MANQUANT');
  
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('❌ Token manquant dans Authorization header');
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    console.log('✓ Token valide pour user:', decoded.id);
    next();
  } catch (err) {
    console.log('❌ Token invalide:', err.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};

// POST: Send message to chat
router.post('/chat/:chatId', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    
    console.log('📝 NEW MESSAGE - User:', req.userId, 'Chat:', chatId, 'Text:', text.substring(0, 30));

    if (!text) {
      console.log('❌ Texte vide');
      return res.status(400).json({ error: 'Message text requis' });
    }

    // Extraire le recipientId si c'est un direct message (dm_<userId>)
    let recipientId = null;
    if (chatId.startsWith('dm_')) {
      recipientId = chatId.substring(3);
    }

    const message = await Message.create({
      senderId: req.userId,
      recipientId: recipientId,
      channelId: chatId,
      content: text,
      messageType: 'direct'
    });

    console.log('✓ Message créé:', message.id);

    res.status(201).json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        chatId: message.channelId,
        text: message.content,
        timestamp: message.createdAt,
        type: 'user'
      }
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Récupérer les messages d'une conversation
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    console.log('📨 GET MESSAGES - Chat:', chatId);

    const messages = await Message.findAll({
      where: { channelId: chatId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']]
    });
    
    console.log('✓ Messages trouvés:', messages.length);

    res.json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        senderUsername: m.sender?.username,
        chatId: m.channelId,
        text: m.content,
        timestamp: m.createdAt,
        type: 'user'
      }))
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Supprimer une conversation et ses messages
router.delete('/chat/:chatId', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    console.log('🗑️ DELETE CHAT - User:', req.userId, 'Chat:', chatId);
    
    // Supprimer tous les messages de cette conversation
    const deleted = await Message.destroy({
      where: { channelId: chatId }
    });
    
    console.log('✓ Messages supprimés:', deleted);
    
    res.json({
      success: true,
      message: `${deleted} message(s) supprimé(s)`,
      deleted
    });
  } catch (error) {
    console.error('Erreur suppression conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'direct' } = req.body;

    if (!content || (!recipientId && messageType === 'direct')) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const message = await Message.create({
      senderId: req.userId,
      recipientId,
      content,
      messageType
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation with user
router.get('/user/:recipientId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId, recipientId: req.params.recipientId },
          { senderId: req.params.recipientId, recipientId: req.userId }
        ]
      },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Récupérer les conversations d'un utilisateur
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    console.log('📬 GET CONVERSATIONS - User:', req.userId);
    
    // Trouver tous les messages où cet utilisateur est sender OU recipient
    const { Op } = require('sequelize');
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId },
          { recipientId: req.userId }
        ]
      },
      attributes: ['channelId'],
      raw: true
    });

    // Extraire les IDs uniques des conversations
    const conversationIds = [...new Set(messages.map(m => m.channelId))];
    console.log('🗂️ Conversations trouvées:', conversationIds.length);

    // Pour chaque conversation, récupérer les messages
    const conversations = {};
    for (const chatId of conversationIds) {
      const allMessages = await Message.findAll({
        where: { channelId: chatId },
        include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
        order: [['createdAt', 'ASC']]
      });

      if (allMessages.length > 0) {
        const lastMsg = allMessages[allMessages.length - 1];
        
        // Déterminer le type et le nom de la conversation
        const isDirect = chatId.startsWith('dm_');
        const senderNames = [...new Set(allMessages.map(m => m.sender.username))];
        
        conversations[chatId] = {
          type: isDirect ? 'direct' : 'group',
          name: senderNames.length === 1 && isDirect ? senderNames[0] : senderNames.join(', '),
          members: [...new Set(allMessages.map(m => m.senderId))],
          messages: allMessages.map(m => ({
            id: m.id,
            senderId: m.senderId,
            senderUsername: m.sender.username,
            text: m.content,
            timestamp: m.createdAt,
            type: 'user'
          }))
        };
      }
    }

    console.log('✓ Conversations retournées');
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('❌ Erreur récupération conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Récupérer les messages d'une conversation
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.findAll({
      where: { channelId: chatId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inbox
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { recipientId: req.userId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
