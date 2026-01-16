require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Force recreate tables for clean state
    await sequelize.sync({ force: true });
    console.log('✓ Tables recreated');

    // Create or update users - Pass plain passwords, beforeCreate hook will hash them
    const user1 = await User.create({
      username: 'Aloys',
      password: 'password123',
      email: 'sourdin.aloys@gmail.com',
      firstName: 'Aloys',
      lastName: 'Sourdin',
      isActive: true,
      isEmailVerified: true,
      role: 'admin'
    });
    console.log('✓ User 1 created:', user1.email);

    const user2 = await User.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      isEmailVerified: true,
      role: 'user'
    });
    console.log('✓ User 2 created:', user2.email);

    // Create welcome message for General group
    const generalChatId = 'grp_general';
    await Message.create({
      senderId: user1.id,
      recipientId: null,
      channelId: generalChatId,
      content: '👋 Bienvenue dans le groupe General! C\'est un espace pour discuter avec tous les utilisateurs.',
      messageType: 'group'
    });
    console.log('✓ General group welcome message created');

    console.log('\n✅ Seeding completed!');
    console.log('\nCredentials:');
    console.log('User 1: sourdin.aloys@gmail.com / password123');
    console.log('User 2: test@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
