import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SchoolListService, Establishment } from '../../services/Schools/schoolList.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-list-etablissement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-etablissement.component.html',
  styleUrl: './list-etablissement.component.scss'
})
export class ListEtablissementComponent implements OnInit {
  private schoolListService = inject(SchoolListService);
  private router = inject(Router);

  establishments = signal<Establishment[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  userRole = signal<string>('visiteur');

  // Filtres
  searchQuery = signal('');
  filterType = signal('');
  filterStatus = signal('');

  // Pagination
  currentPage = signal<number>(1);
  readonly PAGE_SIZE = 10;

  // ── Computed ──────────────────────────────────────────────
  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const type = this.filterType();
    const status = this.filterStatus();

    return this.establishments().filter(s => {

      const matchSearch =
        !q ||
        s.nom.toLowerCase().includes(q) ||
        s.ville.toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q);

      const matchType =
        !type ||
        s.type.toLowerCase() === type.toLowerCase();

      const matchStatus =
        !status ||
        s.statut.toLowerCase() === status.toLowerCase();

      return matchSearch && matchType && matchStatus;
    });
  });

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterType.set('');
    this.filterStatus.set('');
    this.currentPage.set(1);
  }

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.PAGE_SIZE))
  );

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filtered().slice(start, start + this.PAGE_SIZE);
  });

  paginationStart = computed(() =>
    this.filtered().length === 0
      ? 0
      : (this.currentPage() - 1) * this.PAGE_SIZE + 1
  );

  paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.PAGE_SIZE, this.filtered().length)
  );

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1);
  });

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.extractUserRole();
    this.loadSchools();
  }

  private extractUserRole(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role) this.userRole.set(decoded.role.toLowerCase());
    } catch { /* silent */ }
  }

  loadSchools(): void {
    this.isLoading.set(true);

    const request$ = this.userRole() === 'directeur'
      ? this.schoolListService.getMyEstablishments()
      : this.schoolListService.getEstablishments();

    request$.subscribe({
      next: (data) => {

        console.log(data);

        this.establishments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  // ── Filtres & pagination ───────────────────────────────────
  onSearch(): void { this.currentPage.set(1); }
  applyFilters(): void {
    console.log('Type :', this.filterType);
    console.log('Statut :', this.filterStatus);
    this.currentPage.set(1);
  }
  goToPage(p: number): void { this.currentPage.set(p); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  // ── Stats ─────────────────────────────────────────────────
  countByStatus(status: string): number {
    return this.establishments().filter(s => s.statut === status).length;
  }

  // ── Actions ───────────────────────────────────────────────
  onView(id: number): void {
    this.router.navigate(['/etablissements', id]);
  }

  // ✅ Correction : pointe vers la bonne route du formulaire d'édition
  onEdit(id: number): void {
    this.router.navigate(['/director/editSchools', id]);
  }

  onApprove(school: Establishment): void {
    if (!confirm(`Approuver "${school.nom}" ?`)) return;
    this.clearMessages();
    this.schoolListService.approveEstablishment(school.id).subscribe({
      next: () => {
        this.successMessage.set(`"${school.nom}" approuvé avec succès.`);
        this.loadSchools();
      },
      error: (err) => this.errorMessage.set(err.message ?? "Erreur lors de l'approbation.")
    });
  }

  onReject(school: Establishment): void {
    const motif = prompt(`Motif du rejet pour "${school.nom}" :`);
    if (motif === null || !motif.trim()) return;
    this.clearMessages();
    this.schoolListService.rejectEstablishment(school.id, motif.trim()).subscribe({
      next: () => {
        this.successMessage.set(`"${school.nom}" rejeté.`);
        this.loadSchools();
      },
      error: (err) => this.errorMessage.set(err.message ?? 'Erreur lors du rejet.')
    });
  }

  onDelete(school: Establishment): void {
    if (!confirm(`Supprimer définitivement "${school.nom}" ?`)) return;
    this.clearMessages();
    this.schoolListService.deleteEstablishment(school.id).subscribe({
      next: () => {
        this.successMessage.set(`"${school.nom}" supprimé.`);
        this.loadSchools();
      },
      error: (err) => this.errorMessage.set(err.message ?? 'Erreur lors de la suppression.')
    });
  }

  onArchive(school: Establishment): void {
    if (!confirm(`Archiver "${school.nom}" ?`)) return;
    this.clearMessages();
    this.schoolListService.archiveEstablishment(school.id).subscribe({
      next: () => {
        this.successMessage.set(`"${school.nom}" archivé.`);
        this.loadSchools();
      },
      error: (err) => this.errorMessage.set(err.message ?? "Erreur lors de l'archivage.")
    });
  }

  onSubmitForValidation(school: Establishment): void {
    if (!confirm(`Soumettre "${school.nom}" à validation ?`)) return;
    this.clearMessages();
    this.schoolListService.submitForValidation(school.id).subscribe({
      next: () => {
        this.successMessage.set(`"${school.nom}" soumis à validation.`);
        this.loadSchools();
      },
      error: (err) => this.errorMessage.set(err.message ?? 'Erreur lors de la soumission.')
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  // ── Helpers UI ────────────────────────────────────────────
  getInitials(nom: string): string {
    return nom.split(' ').slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      publie: 'pill-success',
      en_attente: 'pill-warning',
      rejete: 'pill-danger',
      archive: 'pill-secondary',
      brouillon: 'pill-secondary',
    };
    return map[status] ?? 'pill-secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      publie: 'Publié',
      en_attente: 'En attente',
      rejete: 'Rejeté',
      archive: 'Archivé',
      brouillon: 'Brouillon',
    };
    return map[status] ?? status;
  }
}