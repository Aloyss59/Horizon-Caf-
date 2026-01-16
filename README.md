# Horizon Café - Application Web

Application web complète pour **Horizon Café** avec système de chat en temps réel, menu interactif, et gestion des réservations.

## 🎯 Caractéristiques

- ✅ **Chat en temps réel** - Conversations privées et groupes
- ✅ **Authentification JWT** - Système de login sécurisé
- ✅ **Menu interactif** - Catalogue de produits avec images
- ✅ **Emploi du temps** - Planning du restaurant
- ✅ **Mode sombre/clair** - Thème personnalisable
- ✅ **Base de données SQLite** - Persistance des données

## 🚀 Stack Technologique

**Frontend:**
- HTML5, CSS3, JavaScript vanilla
- Responsive design
- Font Awesome pour les icônes

**Backend:**
- Node.js + Express.js
- Sequelize ORM
- SQLite
- JWT pour authentification
- Socket.io pour temps réel (WebSocket)

## 📁 Structure du Projet

```
Horizon Café/
├── backend/
│   ├── config/        # Configuration BD
│   ├── models/        # Modèles Sequelize
│   ├── routes/        # Endpoints API
│   ├── utils/         # Utilitaires
│   ├── seed.js        # Données initiales
│   ├── server.js      # Serveur principal
│   ├── package.json
│   └── .env           # Variables d'environnement
├── src/
│   ├── pages/         # Pages HTML
│   ├── js/            # Scripts JavaScript
│   ├── css/           # Feuilles de style
│   └── assets/        # Images et ressources
└── README.md
```

## ⚙️ Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes

1. **Installer les dépendances**
```bash
cd backend
npm install
cd ..
```

2. **Configurer les variables d'environnement**
Créer `backend/.env`:
```env
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

3. **Initialiser la base de données**
```bash
cd backend
node seed.js
```

4. **Démarrer le serveur backend**
```bash
node server.js
# Serveur écoute sur http://localhost:5000
```

5. **Servir le frontend**
Ouvrir `src/pages/index.html` dans un serveur HTTP (Live Server, Python http.server, etc.)
```bash
# Avec Python
python -m http.server 3000

# Ou avec Node.js/Express statique
npx serve src -l 3000
```

## 🔐 Utilisateurs de Test

Après exécution de `seed.js`:
- **Email:** sourdin.aloys@gmail.com
- **Mot de passe:** password123

- **Email:** test@example.com
- **Mot de passe:** password123

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Connexion
- `GET /api/auth/users/public` - Lister les utilisateurs

### Messages
- `GET /api/messages/conversations` - Charger conversations
- `GET /api/messages/chat/:chatId` - Charger messages
- `POST /api/messages/chat/:chatId` - Envoyer message
- `DELETE /api/messages/chat/:chatId` - Supprimer conversation

### Menu
- `GET /api/menu` - Lister items
- `POST /api/menu` - Créer item
- `PUT /api/menu/:id` - Modifier item
- `DELETE /api/menu/:id` - Supprimer item

## 🌐 Déploiement sur Render

### Préparation

1. **Créer un repository Git** (si pas déjà fait)
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Créer compte Render** https://render.com

3. **Connecter votre Git** (GitHub, GitLab, Gitea)

### Configuration Render

1. **Créer un Web Service** sur Render
   - Connecter votre repo
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && node server.js`
   - Environment: Node
   - Instance type: Free (ou Paid)

2. **Ajouter variables d'environnement** dans Render dashboard:
   - `JWT_SECRET` = votre clé secrète
   - `FRONTEND_URL` = votre URL Render
   - `EMAIL_USER` = votre email
   - `EMAIL_PASSWORD` = app password

3. **Frontend statique** (optionnel)
   - Créer un Static Site sur Render
   - Build command: `echo "Build static"`
   - Publish directory: `src`
   - Ou servir depuis le même backend avec Express

### Alternative: Servir Frontend depuis Backend

Modifier `backend/server.js` pour servir les fichiers statiques:
```javascript
app.use(express.static('../src'));
app.get('/', (req, res) => res.sendFile('../src/pages/index.html'));
```

## 🔧 Configuration pour Production

1. **CORS**: Mettre à jour `FRONTEND_URL` dans `.env`
2. **JWT_SECRET**: Utiliser une clé forte et aléatoire
3. **Base de données**: SQLite fonctionne, mais PostgreSQL recommandé pour production
4. **Logs**: Ajouter système de logging

## 🐛 Dépannage

**Erreur: Cannot find module**
```bash
cd backend && npm install
```

**Port déjà utilisé**
```bash
PORT=5001 node server.js
```

**Base de données corrompue**
```bash
rm backend/horizon_cafe.db
node seed.js
```

## 📝 Licence

Tous droits réservés © 2026 Horizon Café

## 👥 Contact

Pour questions ou support, contactez l'équipe Horizon Café.
