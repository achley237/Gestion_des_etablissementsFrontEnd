import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SchoolListService, Establishment } from '../../services/Schools/schoolList.service';
import { AuthService } from '../../services/auth/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-etablissement-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './etablissement-detail.component.html',
  styleUrl: './etablissement-detail.component.scss'
})
export class EtablissementDetailComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private router            = inject(Router);
  private schoolListService = inject(SchoolListService);
  private authService       = inject(AuthService);

  // ── État établissement ────────────────────────────
  etablissement = signal<Establishment | null>(null);
  isLoading     = signal<boolean>(true);
  errorMessage  = signal<string | null>(null);
  userRole      = signal<string>('visiteur');

  isDirecteur = computed(() => this.userRole() === 'directeur');

  // ── Lifecycle ─────────────────────────────────────
  ngOnInit(): void {
    this.extractUserRole();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.loadDetail(id);
    } else {
      this.errorMessage.set("ID de l'établissement non trouvé.");
      this.isLoading.set(false);
    }
  }

  private extractUserRole(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role) this.userRole.set(decoded.role.toLowerCase());
    } catch { /* silent */ }
  }

  private loadDetail(id: number): void {
    this.isLoading.set(true);
    this.schoolListService.getEstablishmentById(id).subscribe({
      next:  (data) => { this.etablissement.set(data); this.isLoading.set(false); },
      error: ()     => {
        this.errorMessage.set('Impossible de charger les détails.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Navigation ────────────────────────────────────
  onEdit(): void {
    const id = this.etablissement()?.id;
    if (id) this.router.navigate(['/director/editSchools', id]);
  }

  goBack(): void {
    this.router.navigate(['/ListEtablissements']);
  }

  // ── Helpers UI ────────────────────────────────────
  getInitials(nom: string): string {
    return nom.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  getStatusPillClass(statut: string): string {
    const map: Record<string, string> = {
      publie:     'det-pill--ok',
      en_attente: 'det-pill--warn',
      rejete:     'det-pill--danger',
      archive:    'det-pill--gray',
      brouillon:  'det-pill--gray',
    };
    return map[statut] ?? 'det-pill--gray';
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      publie:     'Publié',
      en_attente: 'En attente',
      rejete:     'Rejeté',
      archive:    'Archivé',
      brouillon:  'Brouillon',
    };
    return map[statut] ?? statut;
  }

  getStatusTiIcon(statut: string): string {
    const map: Record<string, string> = {
      publie:     'circle-check',
      en_attente: 'clock',
      rejete:     'circle-x',
      archive:    'archive',
      brouillon:  'file-text',
    };
    return map[statut] ?? 'help-circle';
  }

  getStatusDescription(statut: string): string {
    const map: Record<string, string> = {
      publie:     "Visible dans l'annuaire public",
      en_attente: 'En cours de vérification par un administrateur',
      rejete:     'Voir le motif de rejet ci-dessous',
      archive:    "Retiré de l'annuaire public",
      brouillon:  'Non soumis à validation',
    };
    return map[statut] ?? '';
  }

  getFormattedDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}