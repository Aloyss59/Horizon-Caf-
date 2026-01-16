#!/usr/bin/env node
/**
 * Script to manually initialize database
 * Usage: node backend/manual-init.js
 */

require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

const manualInit = async () => {
  try {
    console.log('🔄 Manual database initialization...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    // Force sync (recreate all tables)
    console.log('📝 Syncing models...');
    await sequelize.sync({ force: false });
    console.log('✓ Models synchronized');

    // Create default admin user
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'sourdin.aloys@gmail.com' },
      defaults: {
        username: 'Aloys',
        password: 'password123',
        firstName: 'Aloys',
        lastName: 'Sourdin',
        isActive: true,
        isEmailVerified: true,
        role: 'admin'
      }
    });

    if (adminCreated) {
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create default test user
    const [testUser, testUserCreated] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
        role: 'user'
      }
    });

    if (testUserCreated) {
      console.log('✓ Test user created');
    } else {
      console.log('✓ Test user already exists');
    }

    // Create welcome message
    const welcomeCount = await Message.count({
      where: { channelId: 'grp_general' }
    });

    if (welcomeCount === 0) {
      await Message.create({
        senderId: admin.id,
        recipientId: null,
        channelId: 'grp_general',
        content: '👋 Bienvenue dans le groupe General! C\'est un espace pour discuter avec tous les utilisateurs.',
        messageType: 'group'
      });
      console.log('✓ Welcome message created');
    } else {
      console.log('✓ Welcome message already exists');
    }

    console.log('\n✅ Manual initialization complete!\n');
    console.log('📋 Credentials:');
    console.log('  Admin: sourdin.aloys@gmail.com / password123');
    console.log('  User:  test@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

manualInit();
