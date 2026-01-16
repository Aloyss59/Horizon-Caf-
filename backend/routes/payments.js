const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Créer un paiement (charge les crédits)
router.post('/create', async (req, res) => {
    try {
        const { amount, credits, userId, name, email } = req.body;

        if (!userId || !amount || !credits) {
            return res.status(400).json({ error: 'Données manquantes' });
        }

        console.log(`[POST /api/payments/create] Paiement: ${(amount/100).toFixed(2)}€ = ${credits} crédits, userId: ${userId}`);

        // Trouver l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Ajouter les crédits
        const oldCredits = user.credits;
        user.credits = (user.credits || 0) + credits;
        await user.save();

        console.log(`[POST /api/payments/create] Crédits ajoutés: ${oldCredits} → ${user.credits}`);

        // Sauvegarder les logs de paiement (optionnel - nécessite une table Payment)
        // await Payment.create({
        //     userId: userId,
        //     amount: amount / 100,
        //     credits: credits,
        //     status: 'completed',
        //     paymentMethod: 'card'
        // });

        res.json({
            message: 'Paiement réussi et crédits ajoutés',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                credits: user.credits
            },
            transaction: {
                amount: amount / 100,
                credits: credits,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('[POST /api/payments/create] Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

// Obtenir l'historique des paiements d'un utilisateur
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // NOTE: Nécessite une table Payment avec l'historique
        // Pour l'instant, on retourne juste les crédits actuels
        res.json({
            userId: userId,
            currentCredits: user.credits,
            message: 'Historique des paiements (à implémenter avec table Payment)'
        });
    } catch (error) {
        console.error('[GET /api/payments/history] Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

module.exports = router;
