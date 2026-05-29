import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardAcceuilComponent } from './pages/dashboard-acceuil/dashboard-acceuil.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { DasboardAddSchoolsComponent } from './pages/dasboard-add-schools/dasboard-add-schools.component';
import { DasboardListEtablissementComponent } from './pages/dasboard-list-etablissement/dasboard-list-etablissement.component';


export const routes: Routes = [
  // 1. Redirection par défaut (si l'utilisateur tape juste l'adresse racine)
  {
    path: '',
    component: HomeComponent
  },
  
  // 2. Routes publiques pour l'Authentification (pas de Guard ici)
  {
    path: 'auth',
    component: AuthComponent,
    title: 'Authentification | Campus237'
  },
  {
    path: 'register',
    component: RegisterComponent,
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

  // 3. Route protégée pour l'administration (Sidebar + Contenu principal lié)
  {
    path: 'admin/accueil',
    component: DashboardAcceuilComponent,
    title: 'Accueil Admin | Campus237',
    canActivate: [authGuard] // Bloque l'accès si le jeton JWT n'est pas valide/présent
  },
  {
    path: 'director/addSchools',
    component: DasboardAddSchoolsComponent,
    title: 'addSchools director | Campus237',
    canActivate: [authGuard] // Bloque l'accès si le jeton JWT n'est pas valide/présent
  },
  {
    path: 'ListEtablissements',
    component: DasboardListEtablissementComponent,
    title: 'List school director | Campus237',
    canActivate: [authGuard] // Bloque l'accès si le jeton JWT n'est pas valide/présent
  },

  // 4. Gestion des routes inconnues ou inexistantes (Joker)
  {
    path: '**',
    redirectTo: 'auth/connexion'
  }
];