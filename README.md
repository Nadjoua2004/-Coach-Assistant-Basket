# 🏀 Coach Assistant Basket - Belouizdad Basket-Ball 2011

Coach Assistant Basket est une application mobile puissante et intuitive conçue pour aider les entraîneurs de basketball à gérer efficacement leurs équipes, planifier leurs entraînements et suivre la progression des athlètes.

## 🚀 Fonctionnalités Clés

### 👔 Espace Entraîneur
- **Gestion des Séances** : Création de séances d'entraînement complètes avec sélection d'exercices.
- **Bibliothèque d'Exercices** : Accès à une base de données d'exercices catégorisés (Dribble, Tir, Défense, etc.).
- **Drag & Drop** : Réorganisez facilement l'ordre des exercices au sein d'une séance.
- **Export PDF** : Générez des fiches de séance professionnelles au format PDF.
- **Réutilisation** : Dupliquez et adaptez des séances passées en un clic.
- **Gestion des Athlètes** : Liste complète des joueurs avec filtres et fiches détaillées.
- **Prise d'Appel** : Suivi rigoureux de l'assiduité aux entraînements.

### 🛡️ Espace Administrateur
- **Tableau de Bord** : Statistiques globales sur l'assiduité et la charge d'entraînement.
- **Gestion des Vidéos** : Bibliothèque de supports visuels pour les exercices.
- **Gestion des Utilisateurs** : Contrôle des accès et des rôles (Coach, Adjoint, Joueur, Parent).

### 👥 Espace Joueur & Parent
- **Planning** : Consultation simplifiée des prochains entraînements et matchs.
- **Statistiques** : Suivi personnel de l'assiduité et de la progression.

## 🛠️ Stack Technique

- **Frontend** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/) (SDK 54)
- **Backend** : [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Base de Données** : [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Stockage Fichiers** : Cloud Storage pour les photos, vidéos et certificats médicaux.
- **Styling** : Native StyleSheet & Tailwind CSS (en cours d'intégration).

## 📥 Installation

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Expo Go sur votre appareil mobile

### Configuration du Backend
1. Naviguez dans le dossier backend :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` basé sur les variables de `QUICK_START.md`.
4. Lancez le serveur :
   ```bash
   npm run dev
   ```

### Configuration du Frontend
1. Naviguez dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez l'URL de l'API dans `config/api.js`.
4. Lancez l'application :
   ```bash
   npm start
   ```

## 📂 Structure du Projet

```
.
├── backend/            # API REST (Express + Supabase)
│   ├── routes/         # Définition des points d'entrée API
│   ├── services/       # Logique métier et integration Supabase
│   └── uploads/        # Dossier de stockage local (développement)
├── frontend/           # Application Mobile (Expo)
│   ├── assets/         # Images, icônes et polices
│   ├── components/     # Écrans et composants par domaine (Coach, Admin, Player)
│   ├── services/       # Client API et services frontend
│   └── config/         # Configuration globale (API URL)
└── docs/               # Documentation détaillée (MVP, Guides)
```

## 📅 Roadmap & Statut
L'application est actuellement dans sa phase MVP. Pour plus de détails sur l'avancement, veuillez consulter [CURRENT_STATUS.md](CURRENT_STATUS.md) et [MVP_SUMMARY.md](MVP_SUMMARY.md).

---
© 2026 Belouizdad Basket-Ball 2011. Développé pour l'excellence sportive.
