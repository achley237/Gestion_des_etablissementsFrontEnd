# GestionEtablissement

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# Campus237 — Frontend Angular

Interface web de la plateforme de gestion des établissements scolaires au Cameroun, développée avec **Angular 17+** en architecture standalone.

> **Backend API :** [gestionetablissementbackend.onrender.com](https://gestionetablissementbackend.onrender.com/api/docs/)

---

## Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Routes de l'application](#routes-de-lapplication)
- [Fonctionnalités par rôle](#fonctionnalités-par-rôle)
- [Services Angular](#services-angular)
- [Modèles de données](#modèles-de-données)
- [Authentification JWT](#authentification-jwt)
- [Déploiement](#déploiement)

---

## Aperçu du projet

Campus237 est une plateforme permettant de :

- Consulter et rechercher des établissements scolaires au Cameroun
- Laisser des commentaires et notes sur les établissements
- Gérer les établissements (ajout, modification) en tant que directeur
- Administrer les comptes utilisateurs et modérer les contenus en tant qu'admin

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 17+ | Framework frontend |
| TypeScript | 5+ | Langage |
| RxJS | 7+ | Gestion des flux asynchrones |
| Angular Router | — | Navigation SPA |
| HttpClient | — | Appels API REST |
| jwt-decode | — | Décodage des tokens JWT |
| SCSS | — | Styles des composants |

---

## Architecture du projet

```
src/
└── app/
    ├── auth/                        # Page connexion / inscription
    ├── register/                    # Page d'inscription publique
    ├── home/                        # Page d'accueil publique
    │
    ├── components/
    │   ├── acceuil-etudiants/       # Dashboard utilisateur
    │   ├── establishment-detail-modal/  # Modal détail établissement
    │   ├── etablissement-detail/    # Page détail établissement
    │   ├── home-content/            # Contenu page d'accueil
    │   ├── list-etablissement/      # Liste des établissements
    │   ├── school-register/         # Formulaire ajout établissement
    │   └── sidebar/                 # Barre de navigation latérale
    │
    ├── pages/
    │   ├── dashboard-acceuil/           # Accueil admin
    │   ├── dasboard-add-schools/        # Ajouter / modifier un établissement
    │   ├── dasboard-list-etablissement/ # Liste des établissements (dashboard)
    │   └── dashboard-detail-etablissement/ # Détail établissement (dashboard)
    │
    ├── services/
    │   ├── auth/           # AuthService — login, register, logout, JWT
    │   ├── Schools/        # SchoolService — CRUD établissements
    │   └── comment/        # CommentService — commentaires et notes
    │
    ├── models/
    │   ├── school.model.ts     # Interface Establishment, EstablishmentFilters
    │   └── comment.model.ts    # Interface Comment, EstablishmentRating
    │
    ├── guards/
    │   └── auth.guard.ts       # Protection des routes authentifiées
    │
    ├── interceptors/
    │   └── auth.interceptor.ts # Injection automatique du token JWT
    │
    ├── environments/
    │   ├── environment.ts               # Production
    │   └── environment.development.ts   # Développement
    │
    ├── app.routes.ts       # Définition de toutes les routes
    └── app.config.ts       # Configuration principale (router, interceptor)
```

---

## Installation locale

### Prérequis

- Node.js 18+
- npm 9+
- Angular CLI : `npm install -g @angular/cli`

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/achley237/gestionEtablissement-frontend.git
cd gestionEtablissement-frontend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement de développement
# Éditer src/app/environments/environment.development.ts

# 4. Lancer le serveur de développement
ng serve
```

L'application sera disponible sur : `http://localhost:4200`

---

## Variables d'environnement

### Production — `environment.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://gestionetablissementbackend.onrender.com/api'
};
```

### Développement — `environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

---

## Routes de l'application

### Routes publiques (sans authentification)

| Route | Composant | Description |
|---|---|---|
| `/` | `HomeComponent` | Page d'accueil |
| `/auth` | `AuthComponent` | Page connexion / inscription |
| `/auth/connexion` | `AuthComponent` | Connexion |
| `/auth/inscription` | `AuthComponent` | Inscription |
| `/register` | `RegisterComponent` | Formulaire d'inscription complet |
| `/**` | — | Redirige vers `/auth/connexion` |

### Routes protégées (authentification requise — `authGuard`)

| Route | Composant | Rôle cible |
|---|---|---|
| `/utilisateur/accueil` | `AcceuilEtudiantsComponent` | Utilisateur |
| `/admin/accueil` | `DashboardAcceuilComponent` | Admin |
| `/director/addSchools` | `DasboardAddSchoolsComponent` | Directeur |
| `/director/editSchools/:id` | `DasboardAddSchoolsComponent` | Directeur |
| `/ListEtablissements` | `DasboardListEtablissementComponent` | Admin / Directeur |
| `/etablissements/:id` | `DashboardDetailEtablissementComponent` | Tous |

---

## Fonctionnalités par rôle

### Utilisateur

- Accès au dashboard utilisateur (`/utilisateur/accueil`)
- Consultation des établissements et de leurs détails
- Ajout de commentaires et notes sur les établissements
- Modification et suppression de ses propres commentaires

### Directeur

- Tout ce que l'utilisateur peut faire
- Ajout d'un nouvel établissement (`/director/addSchools`)
- Modification de ses établissements (`/director/editSchools/:id`)
- Accès à la liste des établissements (`/ListEtablissements`)

### Administrateur

- Accès au dashboard admin (`/admin/accueil`)
- Vue complète de tous les utilisateurs (directeurs + utilisateurs)
- Suspension ou bannissement de comptes utilisateurs
- Approbation ou rejet de commentaires
- Accès à la liste complète des établissements

### Sidebar — visibilité des menus par rôle

| Menu | Utilisateur | Directeur | Admin |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Ajouter Établissement | ❌ | ✅ | ❌ |
| Liste Établissements | ❌ | ✅ | ✅ |
| Utilisateurs | ❌ | ❌ | ✅ |

---

## Services Angular

### `AuthService`

Gère l'authentification, le stockage des tokens et le décodage JWT.

```typescript
// Inscription
register(payload: RegisterPayload): Observable<any>

// Connexion — stocke access_token et refresh_token dans localStorage
login(payload: LoginPayload): Observable<AuthResponse>

// Déconnexion — vide le localStorage et redirige
logout(): void

// Récupère le rôle depuis le JWT décodé
getUserRole(): string | null

// Récupère les infos (prénom, nom, email) depuis le JWT
getUserInfo(): { firstName, lastName, email } | null
```

**Payload d'inscription :**
```typescript
{
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'directeur' | 'utilisateur';  // automatiquement déduit du formulaire
  fonction: string;
}
```

---

### `SchoolService`

Gère les opérations CRUD sur les établissements.

```typescript
// Créer un établissement (directeur uniquement)
createSchool(payload: SchoolPayload): Observable<any>
```

**Payload établissement :**
```typescript
{
  nom: string;
  type: string;
  adresse: string;
  ville: string;
  region: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  niveaux_scolaires: string[];
  capacite: number | null;
  annee_creation: number | null;
}
```

---

### `CommentService`

Gère les commentaires et la notation des établissements.

```typescript
// Récupérer les commentaires d'un établissement
getComments(establishmentId: number): Observable<Comment[]>

// Récupérer la note moyenne d'un établissement
getRating(establishmentId: number): Observable<EstablishmentRating>

// Créer un commentaire
createComment(establishmentId: number, payload: CreateCommentPayload): Observable<Comment>

// Modifier un commentaire
updateComment(establishmentId, commentId, payload): Observable<Comment>

// Supprimer un commentaire
deleteComment(establishmentId: number, commentId: number): Observable<void>

// [Admin] Approuver un commentaire
approveComment(commentId: number): Observable<Comment>

// [Admin] Rejeter un commentaire
rejectComment(commentId: number, motifRejet: string): Observable<Comment>

// [Admin] Tous les commentaires avec filtres
getAllComments(params?: { statut?, etablissement? }): Observable<Comment[]>
```

---

## Modèles de données

### `Establishment`

```typescript
interface Establishment {
  id: number;
  nom: string;
  type: 'primaire' | 'secondaire' | 'lycee' | 'universite' | 'autre';
  adresse: string;
  ville: string;
  region?: string;
  pays: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  niveaux_scolaires: string[];
  capacite?: number;
  annee_creation?: number;
  statut: 'brouillon' | 'en_attente' | 'publie' | 'rejete' | 'archive';
  motif_rejet?: string;
  date_creation: string;
  date_mise_a_jour: string;
}
```

### `Comment`

```typescript
interface Comment {
  id: number;
  contenu: string;
  note: number;                    // Note de 1 à 5
  auteur: number;
  auteur_email: string;
  auteur_nom: string;
  etablissement: number;
  etablissement_nom: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  motif_rejet: string;
  date_publication: string;
  date_mise_a_jour: string;
}
```

### `EstablishmentRating`

```typescript
interface EstablishmentRating {
  etablissement: number;
  note_moyenne: number;
  total_commentaires: number;
}
```

---

## Authentification JWT

### Fonctionnement

1. L'utilisateur se connecte via `/auth/connexion`
2. Le backend retourne un `access_token` (30 min) et un `refresh_token` (1 jour)
3. Les tokens sont stockés dans le `localStorage`
4. L'intercepteur `authInterceptor` injecte automatiquement le token dans chaque requête HTTP :

```
Authorization: Bearer <access_token>
```

5. Si une requête retourne `401`, l'intercepteur vide le localStorage et redirige vers la page de connexion
6. Le `authGuard` bloque l'accès aux routes protégées si aucun token n'est présent

### Données décodées du JWT

Le backend injecte ces informations dans le token :

```json
{
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "directeur"
}
```

---

## Déploiement

### Build de production

```bash
ng build --configuration production
```

Les fichiers compilés sont générés dans `dist/`.

### Variables à vérifier avant déploiement

S'assurer que `src/app/environments/environment.ts` pointe bien vers l'URL de production :

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://gestionetablissementbackend.onrender.com/api'
};
```

---


## Licence

Projet académique — tous droits réservés © 2026 ISJ achley danielle.