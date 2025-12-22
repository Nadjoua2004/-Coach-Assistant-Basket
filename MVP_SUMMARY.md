# 📋 MVP SUMMARY - COACH ASSISTANT BASKET

## 🎯 MVP SCOPE (9 semaines)

### ✅ INCLUS DANS MVP

| Module | Fonctionnalités | Priorité | Statut Actuel | Estimation |
|--------|----------------|----------|---------------|------------|
| **🔐 Authentification** | Login, Registration, Forget Password, JWT | 🔴 Critique | ✅ Login mock | 1 semaine |
| **👥 Gestion Athlètes** | CRUD complet, filtres, upload photo | 🔴 Critique | ❌ Non fait | 2 semaines |
| **🏥 Fiche Médicale** | Formulaire, upload PDF, alertes | 🟡 Important | ❌ Non fait | 1 semaine |
| **📅 Planning** | Calendrier, créneaux, assignation, publication | 🔴 Critique | ❌ Non fait | 2 semaines |
| **📝 Séances** | Création, exercices, historique, export PDF | 🔴 Critique | ✅ Partiel | 2 semaines |
| **💪 Exercices** | CRUD, catégories, upload vidéo | 🟡 Important | ✅ Partiel | 1 semaine |
| **✅ Appel/Présence** | Timesheet, statistiques assiduité | 🟡 Important | ❌ Non fait | 1.5 semaines |
| **📊 Dashboard** | Stats équipe, assiduité, charge | 🟡 Important | ✅ Basique | 1 semaine |
| **🔑 Rôles** | Permissions granulaires par rôle | 🔴 Critique | ✅ Basique | 1 semaine |

**Total MVP:** ~12.5 semaines (réduit à 9 avec parallélisation)

---

### ❌ EXCLUS DU MVP (Post-MVP)

| Module | Raison d'exclusion | Version cible |
|--------|-------------------|---------------|
| **📱 Offline complet** | Complexité élevée, peut fonctionner online pour MVP | v2.0 |
| **📤 Import/Export avancé** | Pas critique pour validation MVP | v2.0 |
| **🔒 RGPD complet** | Version simplifiée suffit pour MVP | v1.1 |
| **🔔 Push notifications** | Peut être basique pour MVP | v1.1 |
| **🌍 Multilingue** | FR uniquement pour MVP | v2.0 |
| **♿ Accessibilité complète** | Amélioration progressive | v1.1 |

---

## 📊 MATRICE PRIORITÉ/VALEUR

```
CRITIQUE (Do First)
├── Authentification complète
├── Gestion athlètes (CRUD)
├── Planning & Calendrier
├── Gestion séances (compléter)
└── Rôles & Permissions

IMPORTANT (Do Second)
├── Fiche médicale
├── Appel/Présence
├── Dashboard équipe
└── Gestion exercices (compléter)

NICE TO HAVE (Do Later)
├── Offline complet
├── Import/Export
├── RGPD complet
└── Push notifications avancées
```

---

## 🏗️ ARCHITECTURE MVP

### Backend (À créer)
```
Node.js/Express ou Python/FastAPI
├── API REST
├── PostgreSQL (production)
├── JWT Authentication
├── File Storage (AWS S3/OVH)
└── SQLite sync (mobile)
```

### Frontend (En cours)
```
React Native + Expo ✅
├── Navigation ✅
├── Auth Provider ✅
├── Screens (partiel) ✅
└── Backend Integration ❌
```

---

## 📅 PLANNING MVP (9 semaines)

### Sprint 1 (Semaines 1-3)
- ✅ Backend setup + API
- ✅ Authentification complète
- ✅ Gestion athlètes (CRUD)

### Sprint 2 (Semaines 4-6)
- ✅ Planning & Calendrier
- ✅ Gestion séances (compléter)
- ✅ Gestion exercices (compléter)

### Sprint 3 (Semaines 7-9)
- ✅ Appel/Présence
- ✅ Dashboard équipe
- ✅ Fiche médicale
- ✅ Rôles & Permissions
- ✅ Tests + Documentation

---

## 🎯 CRITÈRES DE SUCCÈS MVP

### Fonctionnels
- ✅ Coach peut créer et gérer des athlètes
- ✅ Coach peut créer un planning hebdomadaire
- ✅ Coach peut créer une séance avec exercices
- ✅ Coach peut faire l'appel
- ✅ Joueur peut voir son planning
- ✅ Admin peut gérer les utilisateurs

### Techniques
- ✅ Application fonctionne sur iOS 13+ et Android 9+
- ✅ Support tablettes 10"
- ✅ Temps de réponse < 200ms (online)
- ✅ Authentification sécurisée (JWT)

### Métier
- ✅ Workflow quotidien du coach couvert
- ✅ Valeur démontrable aux utilisateurs
- ✅ Base pour itérations futures

---

## 📝 NOTES

1. **Backend manquant:** Créer en parallèle du frontend
2. **Données mockées:** Acceptable pour démo MVP
3. **Design:** Bonne base, amélioration progressive
4. **Tests:** À prévoir dès le début
5. **Documentation:** API + utilisateur nécessaire

---

**Version:** 1.0  
**Date:** 13 novembre 2025

