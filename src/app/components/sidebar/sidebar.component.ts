import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  active: boolean;
  visible: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  version = 'v2.1.0';
  userName = 'Utilisateur';
  userRole = 'Visiteur';
  userInitials = 'U';

  private readonly API_URL = environment.apiUrl;

  menus: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin/accueil', active: true, visible: true },
    { label: 'Ajouter Etablissement', icon: 'add', path: '/director/addSchools', active: false, visible: false },
    { label: 'List Etablissement', icon: 'school', path: '/ListEtablissements', active: false, visible: true },
    { label: 'Utilisateurs', icon: 'group', path: '/Admin/utilisateurs', active: false, visible: true },
    { label: 'Commentaires', icon: 'comment', path: '/Admin/commentaires', active: false, visible: true },
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.checkMenuVisibility();
  }

  loadUserData(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const firstName = decoded.first_name || '';
        const lastName = decoded.last_name || '';

        if (firstName || lastName) {
          this.userName = `${firstName} ${lastName}`.trim();
          const fInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
          const lInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
          this.userInitials = (fInitial + lInitial) || 'U';
        }

        if (decoded.role) {
          const rawRole = decoded.role.toLowerCase();
          this.userRole = rawRole === 'admin'
            ? 'Administrateur'
            : rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token dans la sidebar', error);
      }
    }
  }

  checkMenuVisibility(): void {
    const roleLower = this.userRole.toLowerCase();

    const isDirector = roleLower === 'directeur';
    const isAdmin = roleLower === 'administrateur' || roleLower === 'admin';

    this.menus = this.menus.map(item => {

      if (item.label === 'Ajouter Etablissement') {
        return {
          ...item,
          visible: isDirector
        };
      }

      if (item.label === 'List Etablissement') {
        return {
          ...item,
          visible: isAdmin || isDirector
        };
      }

      if (item.label === 'Utilisateurs') {
        return {
          ...item,
          visible: isAdmin
        };
      }

      return item;
    });
  }

  onLogout(): void {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      this.http.post(`${this.API_URL}/auth/logout/`, { refresh: refreshToken }).subscribe({
        next: () => this.clearSessionAndRedirect(),
        error: (err) => {
          console.error('Erreur lors de la déconnexion', err);
          this.clearSessionAndRedirect();
        }
      });
    } else {
      this.clearSessionAndRedirect();
    }
  }

  private clearSessionAndRedirect(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/connexion']);
  }
}