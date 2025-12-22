# 📁 Structure du Backend - Coach Assistant Basket

## Architecture MVC

```
backend/
├── server.js                 # Point d'entrée principal
├── package.json              # Dépendances
├── .env                      # Variables d'environnement (non versionné)
├── .env.example              # Template des variables d'environnement
│
├── config/                   # Configuration
│   ├── database.js          # Configuration Supabase
│   └── storage.js           # Configuration Cloudflare R2
│
├── controllers/             # Logique métier (MVC)
│   ├── authController.js
│   ├── athleteController.js
│   ├── medicalRecordController.js
│   ├── sessionController.js
│   ├── exerciseController.js
│   ├── planningController.js
│   ├── attendanceController.js
│   └── dashboardController.js
│
├── routes/                   # Routes API (MVC)
│   ├── auth.js
│   ├── athletes.js
│   ├── medicalRecords.js
│   ├── sessions.js
│   ├── exercises.js
│   ├── planning.js
│   ├── attendance.js
│   └── dashboard.js
│
├── middleware/               # Middleware Express
│   └── auth.js              # Authentification JWT
│
└── database/                 # Schémas de base de données
    └── schema.sql           # Schéma PostgreSQL pour Supabase
```

## 📍 Emplacement des fichiers

### `server.js`
- **Localisation:** `backend/server.js`
- **Rôle:** Point d'entrée, configuration Express, routes principales

### Controllers
- **Localisation:** `backend/controllers/`
- **Rôle:** Contient toute la logique métier
- **Fichiers:**
  - `authController.js` - Authentification
  - `athleteController.js` - Gestion des athlètes
  - `medicalRecordController.js` - Fiches médicales
  - `sessionController.js` - Gestion des séances
  - `exerciseController.js` - Gestion des exercices
  - `planningController.js` - Planning et calendrier
  - `attendanceController.js` - Présence/Appel
  - `dashboardController.js` - Statistiques dashboard

### Routes
- **Localisation:** `backend/routes/`
- **Rôle:** Définit les endpoints et appelle les controllers
- **Pattern:** Routes → Controllers → Supabase/R2

### Configuration
- **Localisation:** `backend/config/`
- **Fichiers:**
  - `database.js` - Client Supabase
  - `storage.js` - Client Cloudflare R2

## 🔄 Flux de requête

```
Client (Expo App)
    ↓
server.js (Express)
    ↓
routes/ (Définit endpoint + middleware)
    ↓
controllers/ (Logique métier)
    ↓
config/database.js (Supabase) OU config/storage.js (R2)
    ↓
Supabase PostgreSQL OU Cloudflare R2
```

## 📝 Exemple de flux complet

### 1. Requête HTTP
```javascript
POST /api/athletes
Headers: { Authorization: "Bearer JWT_TOKEN" }
Body: { nom: "Dupont", prenom: "Jean", ... }
File: photo.jpg
```

### 2. Route (`routes/athletes.js`)
```javascript
router.post('/',
  authenticateToken,           // Middleware auth
  authorizeRole('coach'),     // Middleware permissions
  upload.single('photo'),     // Middleware upload
  AthleteController.createAthlete  // Controller
);
```

### 3. Controller (`controllers/athleteController.js`)
```javascript
static async createAthlete(req, res) {
  // 1. Validation
  // 2. Upload photo vers R2
  // 3. Insert dans Supabase
  // 4. Retourne réponse
}
```

### 4. Storage (`config/storage.js`)
```javascript
// Upload vers Cloudflare R2
const photoUrl = await uploadToR2(buffer, path, mimetype);
```

### 5. Database (`config/database.js`)
```javascript
// Insert dans Supabase PostgreSQL
const { data } = await supabase.from('athletes').insert(...);
```

## 🗄️ Base de données

- **Type:** PostgreSQL (via Supabase)
- **Schéma:** `backend/database/schema.sql`
- **Client:** `@supabase/supabase-js`

## 📦 Stockage fichiers

- **Service:** Cloudflare R2
- **Configuration:** `backend/config/storage.js`
- **Client:** `@aws-sdk/client-s3` (compatible S3 API)

## 🔐 Authentification

- **Type:** JWT (JSON Web Tokens)
- **Middleware:** `backend/middleware/auth.js`
- **Secret:** Variable d'environnement `JWT_SECRET`

## 🚀 Déploiement

- **Plateforme:** Render (gratuit)
- **Build:** `npm install`
- **Start:** `npm start`
- **Variables:** Toutes dans `.env` (à configurer dans Render)

---

**Pour plus de détails, consultez:**
- `README.md` - Documentation API
- `DEPLOYMENT_GUIDE.md` - Guide de déploiement
- `CLOUDFLARE_R2_SETUP.md` - Configuration R2

