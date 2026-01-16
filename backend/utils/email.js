const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuration email - utiliser Gmail ou service email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Alternative : Service email temporaire pour développement
const testTransporter = nodemailer.createTestAccount().then(testAccount => {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
});

class EmailService {
  static async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/pages/verify-email.html?token=${verificationToken}&email=${user.email}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@horizoncafe.com',
      to: user.email,
      subject: '✉️ Vérifiez votre adresse email - Horizon Café',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00d2ff, #00ff88); padding: 2rem; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">☕ Bienvenue à Horizon Café</h1>
          </div>
          
          <div style="padding: 2rem; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <p>Bonjour ${user.firstName || user.username},</p>
            
            <p>Merci de vous être inscrit ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
            
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${verificationUrl}" style="background: #00d2ff; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                ✓ Vérifier mon email
              </a>
            </div>
            
            <p style="font-size: 0.9rem; color: #666;">
              Ou copiez ce lien dans votre navigateur :<br>
              <code>${verificationUrl}</code>
            </p>
            
            <p style="font-size: 0.9rem; color: #999; margin-top: 2rem; border-top: 1px solid #ddd; padding-top: 1rem;">
              Ce lien expire dans 24 heures.<br>
              Si vous n'avez pas créé ce compte, ignorez cet email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 1rem; font-size: 0.85rem; color: #999;">
            <p>© 2026 Horizon Café - Coffee Shop Étudiant</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✓ Email de vérification envoyé à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${resetToken}&email=${user.email}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@horizoncafe.com',
      to: user.email,
      subject: '🔐 Réinitialiser votre mot de passe - Horizon Café',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b4a, #ff9b7a); padding: 2rem; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🔐 Réinitialisation du mot de passe</h1>
          </div>
          
          <div style="padding: 2rem; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <p>Bonjour ${user.firstName || user.username},</p>
            
            <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetUrl}" style="background: #ff6b4a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Réinitialiser le mot de passe
              </a>
            </div>
            
            <p style="font-size: 0.9rem; color: #666;">
              Ou copiez ce lien :<br>
              <code>${resetUrl}</code>
            </p>
            
            <p style="font-size: 0.9rem; color: #999; margin-top: 2rem; border-top: 1px solid #ddd; padding-top: 1rem;">
              Ce lien expire dans 1 heure.<br>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✓ Email de réinitialisation envoyé à ${user.email}`);
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  }

  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = EmailService;
