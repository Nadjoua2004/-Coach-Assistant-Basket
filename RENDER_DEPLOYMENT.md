# 🚀 Déploiement Backend sur Render

## Étapes de déploiement

### 1. Préparer le code sur GitHub

Assurez-vous que votre code est sur GitHub :

```bash
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

### 2. Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Créez un compte (gratuit)
4. Connectez votre compte **GitHub**

### 3. Créer un nouveau Web Service

1. Dans Render Dashboard, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Sélectionnez le repository `Coach Assistant Basket`
4. Cliquez sur **"Connect"**

### 4. Configurer le service

Remplissez les champs suivants :

- **Name:** `coach-assistant-backend`
- **Region:** Choisissez la région la plus proche (Europe recommandé)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** **Free** (gratuit)

### 5. Ajouter les variables d'environnement

Dans la section **"Environment Variables"**, ajoutez toutes ces variables :

```
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://qeblpbvuqkoiprpyjtql.supabase.co
SUPABASE_KEY=votre_publishable_key
SUPABASE_SERVICE_ROLE_KEY=votre_secret_key

# JWT
JWT_SECRET=votre_secret_jwt_changez_ca_en_production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=*

# Cloudflare R2 (si configuré)
R2_ACCOUNT_ID=votre_r2_account_id
R2_ACCESS_KEY_ID=votre_r2_access_key_id
R2_SECRET_ACCESS_KEY=votre_r2_secret_access_key
R2_BUCKET_NAME=coach-assistant-basket
R2_ENDPOINT=https://votre_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 6. Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez le déploiement (2-3 minutes)
3. Une fois déployé, vous obtiendrez une URL comme :
   ```
   https://coach-assistant-backend.onrender.com
   ```

### 7. Tester le déploiement

Testez votre API déployée :

```bash
# Health check
curl https://coach-assistant-backend.onrender.com/health

# Ou ouvrez dans le navigateur
https://coach-assistant-backend.onrender.com/health
```

### 8. Mettre à jour le frontend

Dans `frontend/config/api.js`, changez l'URL de production :

```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://coach-assistant-backend.onrender.com';  // Votre URL Render
```

## ⚠️ Notes importantes

### Service gratuit Render

- Le service gratuit s'endort après **15 minutes d'inactivité**
- Le premier appel après l'endormissement peut prendre **30 secondes** pour se réveiller
- Pour éviter ça, utilisez un service de ping gratuit comme [UptimeRobot](https://uptimerobot.com)

### CORS

Si vous avez des erreurs CORS :
- Utilisez `FRONTEND_URL=*` temporairement pour tester
- En production, mettez l'URL exacte de votre app Expo

### Logs

Pour voir les logs :
- Render Dashboard → Votre service → **"Logs"**
- Très utile pour déboguer

## ✅ Checklist

- [ ] Code sur GitHub
- [ ] Compte Render créé
- [ ] Web Service créé avec bonne configuration
- [ ] Variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] Health check fonctionne
- [ ] Frontend mis à jour avec URL Render

---

**Votre backend est maintenant déployé ! 🎉**

