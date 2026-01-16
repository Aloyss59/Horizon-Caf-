/**
 * Script pour nettoyer tous les messages et conversations
 * Réinitialise la base de données aux messages d'accueil uniquement
 */

require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

const cleanDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Supprimer tous les messages existants
    await Message.destroy({ where: {} });
    console.log('✓ All messages deleted');

    // Récupérer les utilisateurs existants
    const users = await User.findAll();
    if (users.length === 0) {
      console.log('❌ No users found. Please run seed.js first');
      process.exit(1);
    }

    const admin = users.find(u => u.role === 'admin') || users[0];
    console.log(`✓ Using admin user: ${admin.email}`);

    // Créer un nouveau message de bienvenue pour le groupe General
    const generalChatId = 'grp_general';
    await Message.create({
      senderId: admin.id,
      recipientId: null,
      channelId: generalChatId,
      content: '👋 Bienvenue dans le groupe General! C\'est un espace pour discuter avec tous les utilisateurs.',
      messageType: 'group'
    });
    console.log('✓ General group reset with welcome message');

    console.log('\n✅ Database cleaned and reset successfully!');
    console.log('📝 All messages removed');
    console.log('💬 Group conversations reset');
    console.log('👥 Users preserved');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
