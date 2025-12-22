# Coach Assistant Basket - Backend API

Backend Node.js + Express pour l'application Coach Assistant Basket.

## 🚀 Configuration Rapide

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration Supabase (Base de données gratuite)

#### Étape 1: Créer un compte Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Notez votre **Project URL** et vos **API Keys**

#### Étape 2: Créer les tables
1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Copiez le contenu de `database/schema.sql`
3. Exécutez le script SQL pour créer toutes les tables

#### Étape 3: Configurer les variables d'environnement
1. Copiez `.env.example` vers `.env`
2. Remplissez les valeurs :

```env
PORT=3000
NODE_ENV=development

# Supabase Configuration (trouvez ces valeurs dans votre dashboard Supabase)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# JWT Configuration
JWT_SECRET=votre_secret_jwt_changez_ca_en_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8081
```

### 3. Lancer le serveur

**Mode développement (avec auto-reload):**
```bash
npm run dev
```

**Mode production:**
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser mot de passe

### Athlètes
- `GET /api/athletes` - Liste des athlètes (filtres: groupe, sexe, poste, blesse)
- `GET /api/athletes/:id` - Détails d'un athlète
- `POST /api/athletes` - Créer un athlète (Coach/Admin)
- `PUT /api/athletes/:id` - Modifier un athlète (Coach/Adjoint/Admin)
- `DELETE /api/athletes/:id` - Supprimer un athlète (Coach/Admin)

### Séances
- `GET /api/sessions` - Liste des séances
- `GET /api/sessions/:id` - Détails d'une séance
- `POST /api/sessions` - Créer une séance (Coach/Adjoint/Admin)
- `PUT /api/sessions/:id` - Modifier une séance (Coach/Adjoint/Admin)
- `DELETE /api/sessions/:id` - Supprimer une séance (Coach/Admin)

### Exercices
- `GET /api/exercises` - Liste des exercices (filtres: category, subcategory)
- `GET /api/exercises/:id` - Détails d'un exercice
- `POST /api/exercises` - Créer un exercice (Coach/Adjoint/Admin)
- `PUT /api/exercises/:id` - Modifier un exercice (Coach/Adjoint/Admin)
- `DELETE /api/exercises/:id` - Supprimer un exercice (Coach/Admin)

### Planning
- `GET /api/planning` - Liste du planning (filtres: start_date, end_date)
- `POST /api/planning` - Créer un événement planning (Coach/Adjoint/Admin)
- `PUT /api/planning/:id` - Modifier un événement (Coach/Adjoint/Admin)
- `DELETE /api/planning/:id` - Supprimer un événement (Coach/Admin)

### Présence
- `GET /api/attendance` - Liste des présences (filtres: session_id, athlete_id)
- `POST /api/attendance` - Enregistrer une présence (Coach/Adjoint/Admin)
- `GET /api/attendance/stats` - Statistiques de présence

### Dashboard
- `GET /api/dashboard` - Statistiques du tableau de bord

## 🔐 Authentification

Toutes les routes (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un token JWT dans le header :

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🌐 Déploiement

### Option 1: Render (Gratuit et Recommandé)

1. Créez un compte sur [https://render.com](https://render.com)
2. Connectez votre repository GitHub
3. Créez un nouveau **Web Service**
4. Configuration :
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:** Ajoutez toutes les variables de `.env`
5. Déployez !

**URL de votre API:** `https://votre-app.onrender.com`

### Option 2: Railway

1. Créez un compte sur [https://railway.app](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre repository
4. Ajoutez les variables d'environnement
5. Déployez !

### Option 3: Vercel (Serverless)

1. Installez Vercel CLI: `npm i -g vercel`
2. Dans le dossier backend: `vercel`
3. Suivez les instructions

## 📱 Configuration Expo pour utiliser le backend déployé

Dans votre app Expo (`frontend`), créez un fichier `config/api.js` :

```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:3000'  // Local en développement
  : 'https://votre-app.onrender.com';  // Production

export default API_URL;
```

Puis utilisez-le dans vos appels API :

```javascript
import API_URL from './config/api';

fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 🧪 Tester l'API

### Avec curl

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"coach"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Avec Postman

Importez la collection d'API (à créer) ou testez manuellement les endpoints.

## 📝 Notes

- Le backend utilise **Supabase** comme base de données (PostgreSQL gratuit)
- L'authentification utilise **JWT**
- Les fichiers uploadés sont stockés dans le dossier `uploads/` (local) ou Supabase Storage (recommandé pour production)
- Pour la production, configurez Supabase Storage pour les photos et PDFs

## 🐛 Dépannage

### Erreur: "Supabase configuration missing"
- Vérifiez que votre fichier `.env` existe et contient `SUPABASE_URL` et `SUPABASE_KEY`

### Erreur: "Table does not exist"
- Exécutez le script SQL dans Supabase SQL Editor (`database/schema.sql`)

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL de votre app Expo

## 📚 Documentation Supabase

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

