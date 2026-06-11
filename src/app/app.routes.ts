import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardAcceuilComponent } from './pages/dashboard-acceuil/dashboard-acceuil.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { DasboardAddSchoolsComponent } from './pages/dasboard-add-schools/dasboard-add-schools.component';
import { DasboardListEtablissementComponent } from './pages/dasboard-list-etablissement/dasboard-list-etablissement.component';
import { DashboardDetailEtablissementComponent } from './pages/dashboard-detail-etablissement/dashboard-detail-etablissement.component';
import { AcceuilEtudiantsComponent } from './components/acceuil-etudiants/acceuil-etudiants.component';
import { DashboardListCommentaireComponent } from './pages/dashboard-list-commentaire/dashboard-list-commentaire.component';
import { DashboardListUtilisateursComponent } from './pages/dashboard-list-utilisateurs/dashboard-list-utilisateurs.component';

export const routes: Routes = [

  // ── Publiques ─────────────────────────────────────────────
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'auth',
    component: AuthComponent,
    title: 'Authentification | Campus237'
  },
  {
    path: 'auth/connexion',
    component: AuthComponent,
    title: 'Connexion | Campus237'
  },
  {
    path: 'auth/inscription',
    component: AuthComponent,
    title: 'Inscription | Campus237'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription | Campus237'
  },
  // ── Protégées ─────────────────────────────────────────────
  {
    path: 'Admin/utilisateurs',
    component: DashboardListUtilisateursComponent,
    title: 'Fiche Utilisateurs | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'Admin/commentaires',
    component: DashboardListCommentaireComponent,
    title: 'Fiche établissement | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'utilisateur/accueil',
    component: AcceuilEtudiantsComponent,
    title: 'Fiche établissement | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'etablissements/:id',
    component: DashboardDetailEtablissementComponent,
    title: 'Fiche établissement | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'admin/accueil',
    component: DashboardAcceuilComponent,
    title: 'Accueil Admin | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'director/addSchools',
    component: DasboardAddSchoolsComponent,
    title: 'Ajouter un établissement | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'director/editSchools/:id',
    component: DasboardAddSchoolsComponent,
    title: 'Modifier un établissement | Campus237',
    canActivate: [authGuard]
  },
  {
    path: 'ListEtablissements',
    component: DasboardListEtablissementComponent,
    title: 'Liste des établissements | Campus237',
    canActivate: [authGuard]
  },

  // ── Joker ─────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'auth/connexion'
  }
];