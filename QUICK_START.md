# ⚡ Démarrage Rapide - Coach Assistant Basket

## 🎯 Objectif
Déployer le backend et donner l'accès au client pour tester en **30 minutes**.

---

## 📝 Étapes Rapides

### 1️⃣ Créer Supabase (5 min)

1. Allez sur **[supabase.com](https://supabase.com)** → Créez un compte gratuit
2. Créez un nouveau projet → Notez le **Project URL** et les **API Keys**
3. Dans **SQL Editor**, copiez-collez le contenu de `backend/database/schema.sql` → **Run**

### 2️⃣ Configurer Backend Local (5 min)

```bash
cd backend
npm install
```

Créez `backend/.env` :
```env
PORT=3000
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
JWT_SECRET=changez_cette_cle_secrete_123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8081
```

Testez :
```bash
npm run dev
# Ouvrez http://localhost:3000/health
```

### 3️⃣ Déployer sur Render (10 min)

1. **[render.com](https://render.com)** → Créez un compte gratuit
2. **New Web Service** → Connectez GitHub
3. Configuration :
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Ajoutez toutes les variables de `.env`
4. **Create** → Attendez le déploiement
5. Notez votre URL : `https://votre-app.onrender.com`

### 4️⃣ Configurer Expo (5 min)

Créez `frontend/config/api.js` :
```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://votre-app.onrender.com';  // Votre URL Render

export default API_URL;
```

### 5️⃣ Tester avec le Client (5 min)

**Option A - Expo Go (Recommandé) :**
```bash
cd frontend
npm start
# Scannez le QR code avec Expo Go
```

**Option B - Build de test :**
```bash
cd frontend
eas build --platform android --profile preview
# Partagez le lien de téléchargement
```

---

## 🔗 URLs Importantes

- **Backend Local:** `http://localhost:3000`
- **Backend Déployé:** `https://votre-app.onrender.com`
- **Supabase Dashboard:** `https://app.supabase.com`
- **Health Check:** `https://votre-app.onrender.com/health`

---

## ✅ Checklist

- [ ] Supabase créé et tables créées
- [ ] Backend local fonctionne (`/health`)
- [ ] Backend déployé sur Render
- [ ] Expo configuré avec URL Render
- [ ] Client peut tester avec Expo Go

---

## 🆘 Problèmes Courants

**Backend ne démarre pas ?**
- Vérifiez `.env` et les clés Supabase

**Erreur CORS ?**
- Vérifiez `FRONTEND_URL` dans Render

**Backend s'endort (Render gratuit) ?**
- Normal, premier appel = 30 secondes

---

**Besoin d'aide ?** Consultez `DEPLOYMENT_GUIDE.md` pour plus de détails.

