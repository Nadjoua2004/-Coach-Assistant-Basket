# ANALYSE MVP - COACH ASSISTANT BASKET
## Belouizdad Basket-Ball 2011

**Date:** 13 novembre 2025  
**Version:** 1.0

---

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ Ce qui est déjà implémenté

#### Frontend (React Native/Expo)
1. **Authentification**
   - ✅ Login screen (mock)
   - ✅ AuthProvider avec gestion des rôles
   - ✅ Logout fonctionnel
   - ⚠️ Pas de registration, forget password

2. **Navigation & Structure**
   - ✅ Bottom navigation par rôle
   - ✅ Routing basique (coach, admin, joueur, parent)
   - ✅ SafeAreaView et StatusBar

3. **Écrans Coach**
   - ✅ CoachHomeScreen (dashboard avec stats, séances à venir)
   - ✅ SessionsListScreen (liste des séances avec CRUD basique)
   - ✅ SessionCreationScreen (création de séance avec formulaire)
   - ✅ ExerciseSelectionModal (sélection d'exercices par catégorie/sous-catégorie)
   - ✅ Support pour exercices personnalisés

4. **Écrans Admin**
   - ✅ AdminDashboard (stats basiques, actions rapides)

5. **Écrans Joueur/Parent**
   - ✅ ReadOnlyScreen (planning et stats en lecture seule)

6. **Backend**
   - ⚠️ server.js vide (pas d'API implémentée)

---

## 🎯 DÉFINITION DU MVP

### Principe MVP
**Minimum Viable Product** = Fonctionnalités essentielles permettant de valider le concept avec les utilisateurs réels, en se concentrant sur la valeur métier principale.

### Critères de sélection MVP
1. ✅ Fonctionnalités critiques pour le workflow quotidien du coach
2. ✅ Permet de démontrer la valeur de l'application
3. ✅ Réalisable en 3 sprints (9 semaines)
4. ✅ Peut fonctionner avec des données mockées pour la démo

---

## 📋 MVP RECOMMANDÉ - FONCTIONNALITÉS ESSENTIELLES

### 🟢 PHASE 1 - MVP CORE (Sprint 1-2)

#### 1. AUTHENTIFICATION COMPLÈTE
**Priorité:** 🔴 CRITIQUE  
**User Stories:** US-Auth-1 à US-Auth-4

**À implémenter:**
- ✅ Login (déjà fait en mock)
- ❌ Registration (nouveau compte)
- ❌ Forget password / Reset password
- ❌ JWT authentication avec backend
- ❌ Token refresh

**Estimation:** 1 semaine

---

#### 2. GESTION DES ATHLÈTES (User Management)
**Priorité:** 🔴 CRITIQUE  
**User Stories:** US-1, US-3

**À implémenter:**
- ❌ CRUD complet des athlètes
  - Créer athlète (nom, prénom, sexe, date naissance, taille, poids, poste 1-5, photo, numéro licence, contact parent, groupe)
  - Modifier athlète
  - Supprimer athlète (avec permissions selon rôle)
  - Liste avec filtres (groupe, sexe, poste, blessé)
- ❌ Upload photo athlète
- ❌ Gestion des groupes

**Estimation:** 2 semaines

---

#### 3. FICHE MÉDICALE
**Priorité:** 🟡 IMPORTANT  
**User Stories:** US-2

**À implémenter:**
- ❌ Formulaire fiche médicale
  - Allergies
  - Blessures en cours
  - Antécédents
  - Date certificat médical
  - Upload PDF certificat
- ❌ Consultation fiche médicale
- ❌ Alertes médicales (blessures actives)

**Estimation:** 1 semaine

---

#### 4. PLANNING & CALENDRIER
**Priorité:** 🔴 CRITIQUE  
**User Stories:** US-4, US-5, US-6

**À implémenter:**
- ❌ Vue calendrier (semaine/mois)
- ❌ Création créneaux (date, heure, durée, lieu, thème)
- ❌ Duplication semaine type
- ❌ Assignation athlètes aux créneaux (auto/manuel)
- ❌ Publication planning
- ❌ Notification push (basique)
- ❌ Export agenda (iCal/Google Calendar)

**Estimation:** 2 semaines

---

#### 5. GESTION DES SÉANCES
**Priorité:** 🔴 CRITIQUE  
**User Stories:** US-9, US-10, US-11, US-12, US-13, US-15

**À implémenter:**
- ✅ Création séance (déjà fait partiellement)
- ❌ Sauvegarde réelle (backend)
- ✅ Sélection exercices (déjà fait)
- ✅ Exercices personnalisés (déjà fait)
- ❌ Drag & drop pour réordonner exercices
- ❌ Export PDF séance
- ❌ Historique séances
- ❌ Réutilisation séances passées

**Estimation:** 2 semaines (1 semaine pour compléter ce qui existe)

---

#### 6. GESTION DES EXERCICES (CMS)
**Priorité:** 🟡 IMPORTANT  
**User Stories:** US-10, US-11

**À implémenter:**
- ✅ Structure catégories/sous-catégories (déjà fait)
- ❌ CRUD exercices complet
- ❌ Upload vidéo exercice
- ❌ Description détaillée
- ❌ Gestion matériel nécessaire

**Estimation:** 1 semaine

---

### 🟡 PHASE 2 - MVP ENHANCED (Sprint 3)

#### 7. APPEL / PRÉSENCE (Timesheet)
**Priorité:** 🟡 IMPORTANT  
**User Stories:** US-7, US-8

**À implémenter:**
- ❌ Écran appel (présent/absent/retard/excusé)
- ❌ Timestamp GPS (optionnel pour MVP)
- ❌ Calcul taux assiduité par joueur
- ❌ Statistiques assiduité (groupe, mois)
- ❌ Export données présence

**Estimation:** 1.5 semaines

---

#### 8. TABLEAU DE BORD ÉQUIPE
**Priorité:** 🟡 IMPORTANT  
**User Stories:** US-16

**À implémenter:**
- ✅ Dashboard basique (déjà fait partiellement)
- ❌ Assiduité moyenne (nécessite US-7)
- ❌ Charge hebdomadaire
- ❌ Liste blessés
- ❌ Objectifs suivants
- ❌ Graphiques simples

**Estimation:** 1 semaine

---

#### 9. GESTION DES RÔLES & PERMISSIONS
**Priorité:** 🔴 CRITIQUE  
**User Stories:** US-Roles

**À implémenter:**
- ✅ Rôles définis (coach, adjoint, admin, joueur, parent)
- ❌ Permissions granulaires
  - Coach principal: CRUD complet
  - Coach adjoint: Lecture + édition (pas suppression)
  - Joueur: Lecture seule
  - Parent: Lecture seule enfant mineur
  - Admin: CRUD utilisateurs
- ❌ Middleware permissions backend

**Estimation:** 1 semaine

---

### 🔵 PHASE 3 - MVP COMPLETE (Post-Sprint 3)

#### 10. FONCTIONNEMENT OFFLINE
**Priorité:** 🟢 NICE TO HAVE  
**User Stories:** US-17

**À implémenter:**
- ❌ SQLite local (React Native)
- ❌ Synchronisation automatique
- ❌ Gestion conflits
- ❌ Indicateur statut sync

**Estimation:** 2 semaines

---

#### 11. IMPORT/EXPORT
**Priorité:** 🟢 NICE TO HAVE  
**User Stories:** US-Import-Export

**À implémenter:**
- ❌ Import CSV/Excel (athlètes)
- ❌ Export PDF (rapports, séances)
- ❌ Export CSV (statistiques)
- ❌ Validation données import

**Estimation:** 1 semaine

---

#### 12. RGPD ALGÉRIE
**Priorité:** 🟡 IMPORTANT (mais peut être simplifié pour MVP)  
**User Stories:** US-18

**À implémenter:**
- ❌ Export données personnelles
- ❌ Suppression définitive compte
- ❌ Politique de confidentialité
- ❌ Consentement utilisateur

**Estimation:** 1 semaine (version simplifiée)

---

#### 13. PUSH NOTIFICATIONS
**Priorité:** 🟢 NICE TO HAVE  
**User Stories:** US-6 (partie notification)

**À implémenter:**
- ❌ Configuration notifications
- ❌ Notifications planning
- ❌ Notifications alertes
- ❌ Gestion préférences

**Estimation:** 1 semaine

---

## 🎯 MVP FINAL RECOMMANDÉ

### ✅ INCLUS DANS MVP (9 semaines)

1. **Authentification complète** (1 semaine)
   - Login, Registration, Forget Password, JWT

2. **Gestion athlètes** (2 semaines)
   - CRUD complet avec filtres

3. **Fiche médicale** (1 semaine)
   - Formulaire + upload PDF

4. **Planning & Calendrier** (2 semaines)
   - Création, assignation, publication

5. **Gestion séances** (2 semaines)
   - Compléter ce qui existe + historique

6. **Gestion exercices** (1 semaine)
   - CRUD + upload vidéo

7. **Appel/Présence** (1.5 semaines)
   - Timesheet + statistiques

8. **Dashboard équipe** (1 semaine)
   - Stats complètes

9. **Rôles & Permissions** (1 semaine)
   - Permissions granulaires

**Total:** ~12.5 semaines (peut être réduit à 9 avec parallélisation)

---

### ❌ EXCLUS DU MVP (Post-MVP)

1. **Fonctionnement offline complet** → Version 2.0
2. **Import/Export avancé** → Version 2.0
3. **RGPD complet** → Version 1.1 (simplifié pour MVP)
4. **Push notifications avancées** → Version 1.1
5. **Multilingue** → Version 2.0 (FR uniquement pour MVP)
6. **Accessibilité complète** → Version 1.1

---

## 🏗️ ARCHITECTURE TECHNIQUE MVP

### Backend (À créer)
- **Framework:** Node.js + Express ou Python + FastAPI
- **Base de données:** PostgreSQL (production) + SQLite (local mobile)
- **Authentification:** JWT
- **API:** RESTful API
- **Stockage fichiers:** AWS S3 ou OVH Object Storage

### Frontend (Déjà en cours)
- **Framework:** React Native + Expo ✅
- **Navigation:** React Navigation ✅
- **State Management:** Context API (peut migrer vers Redux si nécessaire)
- **Base locale:** SQLite (pour offline)

---

## 📊 PRIORISATION PAR VALEUR MÉTIER

### 🔴 CRITIQUE (Do First)
1. Authentification complète
2. Gestion athlètes (CRUD)
3. Planning & Calendrier
4. Gestion séances (compléter)
5. Rôles & Permissions

### 🟡 IMPORTANT (Do Second)
6. Fiche médicale
7. Appel/Présence
8. Dashboard équipe
9. Gestion exercices (compléter)

### 🟢 NICE TO HAVE (Do Later)
10. Offline complet
11. Import/Export
12. RGPD complet
13. Push notifications avancées

---

## 🎯 RECOMMANDATION FINALE MVP

### MVP Minimal (6 semaines)
- Authentification
- Gestion athlètes (CRUD basique)
- Planning (création + assignation)
- Séances (création + exercices)
- Rôles basiques

### MVP Recommandé (9 semaines) ✅
- Tout le MVP Minimal +
- Fiche médicale
- Appel/Présence
- Dashboard équipe
- Rôles & Permissions complets

### MVP Complet (12 semaines)
- Tout le MVP Recommandé +
- Offline basique
- Import/Export basique
- RGPD simplifié

---

## 📝 NOTES IMPORTANTES

1. **Backend manquant:** Le backend doit être créé en parallèle du frontend
2. **Données mockées:** Pour la démo MVP, certaines données peuvent rester mockées
3. **Design:** Le design actuel est bon, peut être amélioré progressivement
4. **Tests:** Tests unitaires et d'intégration à prévoir dès le début
5. **Documentation:** Documentation API et utilisateur à prévoir

---

## ✅ PROCHAINES ÉTAPES RECOMMANDÉES

1. **Semaine 1-2:** Créer le backend (API REST + BDD)
2. **Semaine 2-3:** Compléter authentification (frontend + backend)
3. **Semaine 3-4:** Implémenter gestion athlètes
4. **Semaine 4-5:** Implémenter planning & calendrier
5. **Semaine 5-6:** Compléter gestion séances
6. **Semaine 6-7:** Implémenter appel/présence
7. **Semaine 7-8:** Dashboard équipe + fiche médicale
8. **Semaine 8-9:** Rôles & permissions + tests
9. **Semaine 9:** Finalisation + documentation

---

**Document créé le:** 13 novembre 2025  
**Dernière mise à jour:** 13 novembre 2025

