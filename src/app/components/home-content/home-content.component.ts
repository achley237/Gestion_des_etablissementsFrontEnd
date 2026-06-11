import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SchoolListService } from '../../services/Schools/schoolList.service';
import { CommentService } from '../../services/comment/comment.service';
import { AdminUserService } from '../../services/admin/admin-user.service';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  route: string;
  color: string;
  roles: string[];
}

interface ActivityItem {
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.scss',
})
export class HomeContentComponent implements OnInit {
  private authService = inject(AuthService);
  private schoolService = inject(SchoolListService);
  private commentService = inject(CommentService);
  private adminUserService = inject(AdminUserService);
  private router = inject(Router);

  // ── Auth ──────────────────────────────────────────────────
  userInfo = this.authService.getUserInfo();
  userRole = signal<string>('');

  isAdmin = computed(() => this.userRole() === 'admin');
  isDirecteur = computed(() => this.userRole() === 'directeur');
  roleLabel = computed(() => {
    const map: Record<string, string> = {
      admin: 'Administrateur',
      directeur: 'Directeur d\'établissement',
    };
    return map[this.userRole()] ?? 'Utilisateur';
  });

  // ── Stats ─────────────────────────────────────────────────
  totalEtablissements = signal(0);
  totalUsers = signal(0);
  totalComments = signal(0);
  pendingComments = signal(0);
  pendingEstablishments = signal(0);
  activeUsers = signal(0);
  isLoadingStats = signal(true);

  // ── Établissements récents ────────────────────────────────
  recentEtabs = signal<any[]>([]);
  isLoadingEtabs = signal(true);

  // ── Commentaires récents ──────────────────────────────────
  recentComments = signal<any[]>([]);
  isLoadingComments = signal(true);

  // ── Actions rapides ───────────────────────────────────────
  quickActions = signal<QuickAction[]>([]);

  // ── Activités récentes ────────────────────────────────────
  recentActivities = signal<ActivityItem[]>([]);

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    const role = this.authService.getUserRole();
    if (!role || (role !== 'admin' && role !== 'directeur')) {
      this.router.navigate(['/auth/connexion']);
      return;
    }
    this.userRole.set(role);
    this.loadAll();
  }

  private loadAll(): void {
    this.buildQuickActions();
    this.buildRecentActivities();
    this.loadStats();
    this.loadRecentEstablishments();
    this.loadRecentComments();
  }

  // ── Stats ─────────────────────────────────────────────────
  private loadStats(): void {
    this.isLoadingStats.set(true);

    if (this.isAdmin()) {
      // Admin : charger toutes les stats globales
      this.adminUserService.getAllUsers().subscribe({
        next: (users) => {
          this.totalUsers.set(users.length);
          this.activeUsers.set(users.filter(u => u.statut === 'actif').length);
        },
        error: () => {},
      });

      this.schoolService.searchPublicEstablishments({}).subscribe({
        next: (resp) => {
          const etabs = resp.results ?? [];
          this.totalEtablissements.set(etabs.length);
          this.pendingEstablishments.set(
            etabs.filter((e: any) => e.statut === 'en_attente').length
          );
        },
        error: () => {},
      });

      this.commentService.getAllComments().subscribe({
        next: (comments) => {
          this.totalComments.set(comments.length);
          this.pendingComments.set(
            comments.filter(c => c.statut === 'en_attente').length
          );
          this.isLoadingStats.set(false);
        },
        error: () => this.isLoadingStats.set(false),
      });
    } else {
      // Directeur : stats limitées à son établissement
      this.schoolService.searchPublicEstablishments({}).subscribe({
        next: (resp) => {
          const etabs = resp.results ?? [];
          this.totalEtablissements.set(etabs.length);
          this.isLoadingStats.set(false);
        },
        error: () => this.isLoadingStats.set(false),
      });

      this.commentService.getAllComments().subscribe({
        next: (comments) => {
          this.totalComments.set(comments.length);
          this.pendingComments.set(
            comments.filter(c => c.statut === 'en_attente').length
          );
        },
        error: () => {},
      });
    }
  }

  private loadRecentEstablishments(): void {
    this.isLoadingEtabs.set(true);
    this.schoolService.searchPublicEstablishments({}).subscribe({
      next: (resp) => {
        this.recentEtabs.set((resp.results ?? []).slice(0, 4));
        this.isLoadingEtabs.set(false);
      },
      error: () => this.isLoadingEtabs.set(false),
    });
  }

  private loadRecentComments(): void {
    this.isLoadingComments.set(true);
    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        this.recentComments.set(comments.slice(0, 5));
        this.isLoadingComments.set(false);
      },
      error: () => this.isLoadingComments.set(false),
    });
  }

  // ── Actions rapides ───────────────────────────────────────
  private buildQuickActions(): void {
    const actions: QuickAction[] = [
      {
        icon: 'school',
        label: 'Établissements',
        description: 'Gérer l\'annuaire',
        route: '/ListEtablissements',
        color: '#00236f',
        roles: ['admin', 'directeur'],
      },
      {
        icon: 'group',
        label: 'Utilisateurs',
        description: 'Gérer les comptes',
        route: '/admin/utilisateurs',
        color: '#7c3aed',
        roles: ['admin'],
      },
      {
        icon: 'rate_review',
        label: 'Modération',
        description: 'Avis à valider',
        route: '/admin/commentaires',
        color: '#f59e0b',
        roles: ['admin'],
      },
      {
        icon: 'add_business',
        label: 'Nouvel établissement',
        description: 'Ajouter une fiche',
        route: '/director/addSchools',
        color: '#16a34a',
        roles: ['directeur'],
      },
      {
        icon: 'settings',
        label: 'Mon établissement',
        description: 'Modifier ma fiche',
        route: '/director/my-school',
        color: '#0369a1',
        roles: ['directeur'],
      },
    ];

    this.quickActions.set(
      actions.filter(a => a.roles.includes(this.userRole()))
    );
  }

  private buildRecentActivities(): void {
    const activities: ActivityItem[] = [
      {
        icon: 'person_add',
        title: 'Nouvel utilisateur inscrit',
        description: 'Un nouveau directeur a rejoint la plateforme',
        time: 'Il y a 2h',
        color: '#16a34a',
      },
      {
        icon: 'rate_review',
        title: 'Nouvel avis soumis',
        description: 'Un étudiant a laissé un avis sur un établissement',
        time: 'Il y a 4h',
        color: '#f59e0b',
      },
      {
        icon: 'verified',
        title: 'Établissement validé',
        description: 'La fiche d\'un lycée a été approuvée',
        time: 'Hier',
        color: '#00236f',
      },
      {
        icon: 'warning',
        title: 'Signalement reçu',
        description: 'Un commentaire a été signalé comme inapproprié',
        time: 'Il y a 2j',
        color: '#dc2626',
      },
    ];
    this.recentActivities.set(activities);
  }

  // ── Helpers ───────────────────────────────────────────────
  getInitials(): string {
    if (!this.userInfo) return '?';
    const p = this.userInfo.firstName?.[0] ?? '';
    const n = this.userInfo.lastName?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  getStatutColor(statut: string): string {
    const map: Record<string, string> = {
      publie: '#16a34a',
      en_attente: '#f59e0b',
      rejete: '#dc2626',
      actif: '#16a34a',
      suspendu: '#f59e0b',
      banni: '#dc2626',
      approuve: '#16a34a',
    };
    return map[statut] ?? '#6b7280';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      publie: 'Publié',
      en_attente: 'En attente',
      rejete: 'Rejeté',
      approuve: 'Approuvé',
      actif: 'Actif',
      suspendu: 'Suspendu',
      banni: 'Banni',
    };
    return map[statut] ?? statut;
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      primaire: 'Primaire',
      secondaire: 'Secondaire',
      lycee: 'Lycée',
      universite: 'Université',
    };
    return map[type?.toLowerCase()] ?? type ?? '—';
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      primaire: '#2d7a4f',
      secondaire: '#00236f',
      lycee: '#8b4513',
      universite: '#C8A84B',
    };
    return map[type?.toLowerCase()] ?? '#00236f';
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(d));
  }

  getInitialsFromName(nom?: string): string {
    if (!nom) return '?';
    return nom.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }
}