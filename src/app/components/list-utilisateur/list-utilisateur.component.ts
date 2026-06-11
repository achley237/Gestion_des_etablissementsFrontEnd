import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminUserService } from '../../services/admin/admin-user.service';
import { AdminUser, UserRole, UserStatus } from '../../models/admin-user.model';

@Component({
  selector: 'app-list-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-utilisateur.component.html',
  styleUrl: './list-utilisateur.component.scss',
})
export class ListUtilisateurComponent implements OnInit {
  private adminUserService = inject(AdminUserService);

  // ── État ──────────────────────────────────────────────────
  allUsers = signal<AdminUser[]>([]);
  isLoading = signal(true);
  filterRole = signal<UserRole | ''>('');
  filterStatut = signal<UserStatus | ''>('');
  searchQuery = signal('');

  // ── Actions en cours ──────────────────────────────────────
  processingIds = signal<Set<number>>(new Set());

  // ── Modal statut ──────────────────────────────────────────
  statutModalUser = signal<AdminUser | null>(null);
  newStatut = signal<UserStatus>('suspendu');
  raisonText = signal('');
  statutLoading = signal(false);
  statutError = signal<string | null>(null);

  // ── Modal détail ──────────────────────────────────────────
  detailUser = signal<AdminUser | null>(null);

  // ── Toast notifications ───────────────────────────────────
  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  private toastTimeout: any;

  // ── Computed ──────────────────────────────────────────────
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.filterRole();
    const statut = this.filterStatut();

    return this.allUsers().filter((u) => {
      const matchQ =
        !q ||
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.fonction && u.fonction.toLowerCase().includes(q));
      const matchRole = !role || u.role === role;
      const matchStatut = !statut || u.statut === statut;
      return matchQ && matchRole && matchStatut;
    });
  });

  activeCount = computed(() => this.allUsers().filter((u) => u.statut === 'actif').length);
  suspendedCount = computed(() => this.allUsers().filter((u) => u.statut === 'suspendu').length);
  bannedCount = computed(() => this.allUsers().filter((u) => u.statut === 'banni').length);
  directeurCount = computed(() => this.allUsers().filter((u) => u.role === 'directeur').length);
  utilisateurCount = computed(() => this.allUsers().filter((u) => u.role === 'utilisateur').length);

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Chargement ────────────────────────────────────────────
  loadUsers(): void {
    this.isLoading.set(true);
    this.adminUserService.getAllUsers().subscribe({
      next: (list) => {
        this.allUsers.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('error', 'Erreur lors du chargement des utilisateurs.');
      },
    });
  }

  onFilterChange(): void {
    // Le filtrage est réactif via computed, pas besoin de recharger
  }

  // ── Actions statut ────────────────────────────────────────
  openStatutModal(user: AdminUser, targetStatut: UserStatus): void {
    this.statutModalUser.set(user);
    this.newStatut.set(targetStatut);
    this.raisonText.set('');
    this.statutError.set(null);
  }

  closeStatutModal(): void {
    this.statutModalUser.set(null);
    this.raisonText.set('');
    this.statutError.set(null);
  }

  confirmStatutChange(): void {
    const user = this.statutModalUser();
    const statut = this.newStatut();
    const raison = this.raisonText().trim();

    if (!user) return;

    // Si on suspend ou bannit, la raison est recommandée (mais pas obligatoire côté API)
    if ((statut === 'suspendu' || statut === 'banni') && !raison) {
      this.statutError.set(
        'Veuillez indiquer une raison pour la suspension ou le bannissement.'
      );
      return;
    }

    this.statutLoading.set(true);
    this.statutError.set(null);
    this.addProcessing(user.id);

    const payload = { statut, raison: raison || undefined };

    this.adminUserService.updateStatut(user.id, payload).subscribe({
      next: (updated) => {
        this.updateUser(updated);
        this.statutLoading.set(false);
        this.removeProcessing(user.id);
        this.closeStatutModal();

        const action =
          statut === 'actif'
            ? 'réactivé'
            : statut === 'suspendu'
            ? 'suspendu'
            : 'banni';
        this.showToast('success', `${updated.prenom} ${updated.nom} a été ${action}.`);
      },
      error: (err) => {
        this.statutLoading.set(false);
        this.removeProcessing(user.id);
        const msg =
          err?.error?.raison?.[0] ??
          err?.error?.statut?.[0] ??
          err?.error?.detail ??
          'Erreur lors de la mise à jour du statut.';
        this.statutError.set(msg);
      },
    });
  }

  /** Réactiver rapidement (sans modal) */
  quickActivate(user: AdminUser): void {
    this.addProcessing(user.id);
    this.adminUserService.updateStatut(user.id, { statut: 'actif' }).subscribe({
      next: (updated) => {
        this.updateUser(updated);
        this.removeProcessing(user.id);
        this.showToast('success', `${updated.prenom} ${updated.nom} a été réactivé.`);
      },
      error: () => {
        this.removeProcessing(user.id);
        this.showToast('error', 'Erreur lors de la réactivation.');
      },
    });
  }

  // ── Détail ────────────────────────────────────────────────
  openDetail(user: AdminUser): void {
    this.detailUser.set(user);
  }

  closeDetail(): void {
    this.detailUser.set(null);
  }

  // ── Helpers ───────────────────────────────────────────────
  private addProcessing(id: number): void {
    this.processingIds.update((set) => new Set(set).add(id));
  }

  private removeProcessing(id: number): void {
    this.processingIds.update((set) => {
      const newSet = new Set(set);
      newSet.delete(id);
      return newSet;
    });
  }

  private updateUser(updated: AdminUser): void {
    this.allUsers.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
  }

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(d));
  }

  formatDateTime(d: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));
  }

  getInitials(prenom?: string, nom?: string): string {
    const p = prenom?.[0] ?? '';
    const n = nom?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  getRoleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      utilisateur: 'Utilisateur',
      directeur: 'Directeur',
      admin: 'Administrateur',
    };
    return map[role] ?? role;
  }

  getRoleClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      utilisateur: 'role-utilisateur',
      directeur: 'role-directeur',
      admin: 'role-admin',
    };
    return map[role] ?? '';
  }

  getStatutLabel(statut: UserStatus): string {
    const map: Record<UserStatus, string> = {
      actif: 'Actif',
      suspendu: 'Suspendu',
      banni: 'Banni',
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: UserStatus): string {
    const map: Record<UserStatus, string> = {
      actif: 'badge-active',
      suspendu: 'badge-suspended',
      banni: 'badge-banned',
    };
    return map[statut] ?? '';
  }

  getStatutIcon(statut: UserStatus): string {
    const map: Record<UserStatus, string> = {
      actif: '✓',
      suspendu: '⏸',
      banni: '⛔',
    };
    return map[statut] ?? '?';
  }

  private showToast(type: 'success' | 'error', message: string): void {
    this.toast.set({ type, message });
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 4000);
  }
}