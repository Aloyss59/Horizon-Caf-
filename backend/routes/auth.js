const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailService = require('../utils/email');

// Register - Inscription simple sans vérification email
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username et password requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    // Valider l'email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    // Créer l'utilisateur directement sans vérification email
    const user = await User.create({
      email,
      username,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      isEmailVerified: true,
      isActive: true
    });

    res.status(201).json({
      message: 'Inscription réussie !',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription: ' + error.message });
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 LOGIN ATTEMPT:', email);

    if (!email || !password) {
      console.log('❌ Email ou password manquant');
      return res.status(400).json({ error: 'Email et password requis' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    console.log('✓ Utilisateur trouvé:', user.username);

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Mot de passe invalide');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    console.log('✓ Mot de passe valide');

    // Générer le JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✓ Token généré pour:', user.username);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: user.credits,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ ERREUR CONNEXION:', error.message, error.stack);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: user.credits,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// Get all users (ADMIN ONLY)
router.get('/users/all', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    res.status(401).json({ error: 'Erreur: ' + error.message });
  }
});

// Get all users (PUBLIC - for admin panel password access)
router.get('/users/public', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Erreur: ' + error.message });
  }
});

// Update user credits (PUBLIC - for admin panel)
router.post('/users/:userId/credits', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, operation } = req.body; // operation: 'add' or 'set'

    if (!userId || amount === undefined || !operation) {
      return res.status(400).json({ error: 'userId, amount et operation requis' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (operation === 'add') {
      user.credits = (user.credits || 0) + amount;
    } else if (operation === 'set') {
      user.credits = amount;
    } else {
      return res.status(400).json({ error: 'Operation invalide: "add" ou "set"' });
    }

    if (user.credits < 0) {
      user.credits = 0;
    }

    await user.save();

    res.json({
      message: 'Crédits mis à jour',
      user: {
        id: user.id,
        username: user.username,
        credits: user.credits
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur: ' + error.message });
  }
});

// Delete user (PUBLIC - for admin panel)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const username = user.username;
    await user.destroy();

    res.json({
      message: 'Utilisateur supprimé avec succès',
      user: {
        id: userId,
        username: username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur: ' + error.message });
  }
});

module.exports = router;
