require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    // Sync models
    await sequelize.sync();
    console.log('✓ Database models synchronized');

    // Check if admin user exists, create if not
    const adminExists = await User.findOne({ where: { email: 'sourdin.aloys@gmail.com' } });
    
    if (!adminExists) {
      console.log('📝 Creating default admin user...');
      await User.create({
        username: 'Aloys',
        password: 'password123',
        email: 'sourdin.aloys@gmail.com',
        firstName: 'Aloys',
        lastName: 'Sourdin',
        isActive: true,
        isEmailVerified: true,
        role: 'admin'
      });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Check if welcome message exists
    const welcomeMsg = await Message.findOne({
      where: { channelId: 'grp_general' }
    });

    if (!welcomeMsg && adminExists) {
      console.log('📝 Creating welcome message...');
      await Message.create({
        senderId: adminExists.id,
        recipientId: null,
        channelId: 'grp_general',
        content: '👋 Bienvenue dans le groupe General! C\'est un espace pour discuter avec tous les utilisateurs.',
        messageType: 'group'
      });
      console.log('✓ Welcome message created');
    }

    console.log('\n✅ Database initialization complete\n');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = initDatabase;
