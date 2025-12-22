# 🚀 Guide de Déploiement - Coach Assistant Basket

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer le backend et donner l'accès au client pour tester l'application.

---

## 🗄️ Étape 1: Configuration Supabase (Base de données gratuite)

### 1.1 Créer un compte Supabase

1. Allez sur **[https://supabase.com](https://supabase.com)**
2. Cliquez sur **"Start your project"** ou **"Sign Up"**
3. Créez un compte (gratuit)
4. Créez un nouveau projet :
   - **Name:** `coach-assistant-basket`
   - **Database Password:** Choisissez un mot de passe fort (notez-le !)
   - **Region:** Choisissez la région la plus proche (Europe pour l'Algérie)
   - Cliquez sur **"Create new project"**

### 1.2 Obtenir les clés API

Une fois le projet créé :

1. Allez dans **Settings** → **API**
2. Notez ces informations :
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (c'est votre `SUPABASE_KEY`)
   - **service_role key:** `eyJhbGc...` (c'est votre `SUPABASE_SERVICE_ROLE_KEY`)

⚠️ **Important:** Ne partagez JAMAIS la `service_role key` publiquement !

### 1.3 Créer les tables

1. Dans Supabase Dashboard, allez dans **SQL Editor** (menu de gauche)
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `backend/database/schema.sql` de ce projet
4. Copiez tout le contenu et collez-le dans l'éditeur SQL
5. Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
6. Vérifiez que toutes les tables sont créées (vous devriez voir "Success")

---

## 💻 Étape 2: Configuration Backend Local

### 2.1 Installer les dépendances

```bash
cd backend
npm install
```

### 2.2 Configurer les variables d'environnement

1. Créez un fichier `.env` dans le dossier `backend/`
2. Copiez le contenu suivant et remplissez avec vos valeurs Supabase :

```env
PORT=3000
NODE_ENV=development

# Supabase Configuration (remplacez par vos valeurs)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# JWT Configuration (changez ce secret en production !)
JWT_SECRET=changez_cette_cle_secrete_en_production_123456789
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8081
```

### 2.3 Tester le backend localement

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Server running on port 3000
📱 Frontend URL: http://localhost:8081
🌍 Environment: development
```

Testez avec :
```bash
curl http://localhost:3000/health
```

---

## 🌐 Étape 3: Déployer le Backend (Render - Gratuit)

### 3.1 Préparer le repository

1. Assurez-vous que votre code est sur GitHub :
   ```bash
   git add .
   git commit -m "Backend setup"
   git push origin main
   ```

### 3.2 Créer un compte Render

1. Allez sur **[https://render.com](https://render.com)**
2. Cliquez sur **"Get Started for Free"**
3. Créez un compte (gratuit)
4. Connectez votre compte GitHub

### 3.3 Déployer le backend

1. Dans Render Dashboard, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Sélectionnez le repository `Coach Assistant Basket`
4. Configuration :
   - **Name:** `coach-assistant-backend`
   - **Region:** Choisissez la région la plus proche
   - **Branch:** `main`
   - **Root Directory:** `backend` (important !)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free** (gratuit)

5. Cliquez sur **"Advanced"** et ajoutez les variables d'environnement :
   ```
   PORT=3000
   NODE_ENV=production
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   JWT_SECRET=votre_secret_jwt_production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://votre-app-expo.com
   ```

6. Cliquez sur **"Create Web Service"**
7. Attendez le déploiement (2-3 minutes)

### 3.4 Obtenir l'URL du backend déployé

Une fois déployé, Render vous donne une URL comme :
```
https://coach-assistant-backend.onrender.com
```

⚠️ **Note:** Le service gratuit s'endort après 15 minutes d'inactivité. Le premier appel peut prendre 30 secondes pour se réveiller.

---

## 📱 Étape 4: Configurer Expo pour utiliser le backend déployé

### 4.1 Créer le fichier de configuration API

Créez `frontend/config/api.js` :

```javascript
// Configuration API
const API_URL = __DEV__ 
  ? 'http://localhost:3000'  // Local en développement
  : 'https://coach-assistant-backend.onrender.com';  // Production (remplacez par votre URL Render)

export default API_URL;
```

### 4.2 Mettre à jour AuthProvider

Modifiez `frontend/components/Common/AuthProvider.js` pour utiliser l'API réelle au lieu des données mockées.

---

## 🔗 Étape 5: Donner l'accès au client pour tester

### Option A: Expo Go (Recommandé pour tests rapides)

1. **Installez Expo Go** sur votre téléphone :
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Lancez l'app en développement :**
   ```bash
   cd frontend
   npm start
   ```
   
3. **Scannez le QR code** avec Expo Go

4. **Partagez avec le client :**
   - Le client doit avoir Expo Go installé
   - Partagez le QR code ou le lien Expo
   - ⚠️ Le client doit être sur le même réseau WiFi ou utiliser le tunnel Expo

### Option B: Build de test (Pour tests plus sérieux)

1. **Installez EAS CLI :**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configurez EAS :**
   ```bash
   cd frontend
   eas build:configure
   ```

3. **Créez un build de test :**
   ```bash
   eas build --platform android --profile preview
   # ou
   eas build --platform ios --profile preview
   ```

4. **Partagez le lien de téléchargement** avec le client

### Option C: Expo Snack (Pour démo rapide)

1. Allez sur [https://snack.expo.dev](https://snack.expo.dev)
2. Importez votre code
3. Partagez le lien avec le client

---

## 📋 Checklist pour le client

Donnez cette checklist au client pour tester :

- [ ] **Backend déployé:** `https://votre-backend.onrender.com/health` répond
- [ ] **Base de données:** Tables créées dans Supabase
- [ ] **App Expo:** Peut se connecter au backend
- [ ] **Authentification:** Peut créer un compte et se connecter
- [ ] **Fonctionnalités:** Tester les principales fonctionnalités

---

## 🔧 Dépannage

### Le backend ne démarre pas

- Vérifiez les variables d'environnement dans Render
- Vérifiez les logs dans Render Dashboard
- Vérifiez que `SUPABASE_URL` et `SUPABASE_KEY` sont corrects

### Erreur CORS

- Vérifiez que `FRONTEND_URL` dans Render correspond à l'URL Expo
- Pour Expo Go, utilisez `*` temporairement (pas en production !)

### Le backend s'endort (Render gratuit)

- C'est normal, le premier appel prend 30 secondes
- Pour éviter ça, utilisez un service de "ping" gratuit comme [UptimeRobot](https://uptimerobot.com)

### L'app Expo ne peut pas se connecter

- Vérifiez que l'URL API est correcte dans `frontend/config/api.js`
- Vérifiez que le backend est bien déployé et accessible
- Testez avec `curl` ou Postman d'abord

---

## 📞 Support

- **Supabase:** [Documentation](https://supabase.com/docs)
- **Render:** [Documentation](https://render.com/docs)
- **Expo:** [Documentation](https://docs.expo.dev)

---

## ✅ Résumé des URLs importantes

- **Backend Local:** `http://localhost:3000`
- **Backend Déployé:** `https://coach-assistant-backend.onrender.com` (remplacez par votre URL)
- **Supabase Dashboard:** `https://app.supabase.com`
- **Render Dashboard:** `https://dashboard.render.com`

---

**Bon déploiement ! 🚀**

