# Cloudflare R2 Setup Guide

## 📦 Pourquoi Cloudflare R2 ?

- **Gratuit** : 10 GB de stockage + 1 million d'opérations par mois
- **Compatible S3** : Utilise l'API S3 standard
- **Pas de frais de sortie** : Contrairement à AWS S3
- **CDN intégré** : Distribution rapide des fichiers

## 🚀 Configuration

### 1. Créer un compte Cloudflare R2

1. Allez sur [cloudflare.com](https://cloudflare.com)
2. Créez un compte (gratuit)
3. Dans le dashboard, allez dans **R2** (menu de gauche)

### 2. Créer un bucket

1. Cliquez sur **"Create bucket"**
2. Nommez-le : `coach-assistant-basket`
3. Choisissez la localisation (Europe recommandé)
4. Cliquez sur **"Create bucket"**

### 3. Obtenir les credentials

1. Allez dans **Manage R2 API Tokens**
2. Cliquez sur **"Create API token"**
3. Configurez :
   - **Token name:** `coach-assistant-backend`
   - **Permissions:** Object Read & Write
   - **TTL:** No expiration (ou selon vos besoins)
4. Cliquez sur **"Create API Token"**
5. **Notez immédiatement** :
   - **Access Key ID**
   - **Secret Access Key**

⚠️ **Important:** Vous ne pourrez plus voir le Secret Access Key après !

### 4. Configurer le domaine public (optionnel mais recommandé)

1. Dans votre bucket, allez dans **Settings**
2. Activez **"Public Access"**
3. Configurez un **Custom Domain** ou utilisez le domaine R2 fourni
4. Notez l'URL publique (ex: `https://pub-xxxxx.r2.dev`)

### 5. Ajouter les variables d'environnement

Ajoutez dans votre `.env` :

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=votre_account_id
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=coach-assistant-basket
R2_ENDPOINT=https://votre_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 6. Pour Render (déploiement)

Dans Render Dashboard, ajoutez ces variables d'environnement :

```
R2_ACCOUNT_ID=votre_account_id
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=coach-assistant-basket
R2_ENDPOINT=https://votre_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## 📁 Structure des fichiers dans R2

```
coach-assistant-basket/
├── athletes/
│   └── photos/
│       └── {athlete-id}-{filename}.jpg
├── medical-records/
│   └── {athlete-id}-{timestamp}-{filename}.pdf
└── exercises/
    └── videos/
        └── {exercise-id}-{timestamp}-{filename}.mp4
```

## 🔧 Utilisation dans le code

Le code utilise déjà R2 via `config/storage.js`. Les controllers utilisent automatiquement R2 pour :

- **Photos d'athlètes** : Upload dans `athletes/photos/`
- **PDFs médicaux** : Upload dans `medical-records/`
- **Vidéos d'exercices** : Upload dans `exercises/videos/`

## ✅ Test

Pour tester l'upload :

```bash
# Test avec curl
curl -X POST http://localhost:3000/api/athletes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "nom=Test" \
  -F "prenom=Athlete" \
  -F "sexe=M" \
  -F "date_naissance=2000-01-01"
```

## 📊 Monitoring

Dans Cloudflare Dashboard → R2 → votre bucket :
- Voir l'utilisation du stockage
- Voir le nombre de fichiers
- Gérer les fichiers manuellement si nécessaire

## 🔒 Sécurité

- Les credentials sont stockés dans les variables d'environnement
- Les fichiers sont accessibles via l'URL publique (configurez CORS si nécessaire)
- Pour les fichiers privés, utilisez des signed URLs (à implémenter si nécessaire)

## 💰 Coûts

**Gratuit jusqu'à :**
- 10 GB de stockage
- 1 million d'opérations (read/write) par mois

Au-delà, les tarifs sont très raisonnables.

---

**Documentation officielle :** [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

