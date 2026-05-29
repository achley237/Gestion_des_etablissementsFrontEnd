import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolListService, Establishment } from '../../services/Schools/schoolList.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-list-etablissement',
  imports: [CommonModule],
  templateUrl: './list-etablissement.component.html',
  styleUrl: './list-etablissement.component.scss'
})

export class ListEtablissementComponent implements OnInit {
  private schoolListService = inject(SchoolListService);

  // States réactifs avec les Signals d'Angular 19
  establishments = signal<Establishment[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  userRole = signal<string>('visiteur');

  ngOnInit(): void {
    this.extractUserRole();
    this.loadSchools();
  }

  /**
   * Extrait le rôle de l'utilisateur pour adapter l'affichage (Admin vs Directeur)
   */
  private extractUserRole(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role) {
          this.userRole.set(decoded.role.toLowerCase());
        }
      } catch (error) {
        console.error('Erreur lors du décodage du jeton dans la liste', error);
      }
    }
  }

  /**
   * Charge la liste complète des établissements via le service
   */
  loadSchools(): void {
    this.isLoading.set(true);
    this.schoolListService.getEstablishments().subscribe({
      next: (data) => {
        this.establishments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur API brute:', err);
        this.errorMessage.set('Impossible de charger les établissements. Session expirée ou droits insuffisants.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Action d'approbation (Réservé Admin)
   */
  onApprove(school: Establishment): void {
    if (confirm(`Voulez-vous vraiment approuver l'établissement "${school.nom}" ?`)) {
      this.clearMessages();
      this.schoolListService.approveEstablishment(school.id).subscribe({
        next: () => {
          this.successMessage.set(`L'établissement "${school.nom}" a été approuvé avec succès.`);
          this.loadSchools();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set(`Erreur lors de l'approbation de l'établissement.`);
        }
      });
    }
  }

  /**
   * Action de rejet avec motif (Réservé Admin)
   */
  onReject(school: Establishment): void {
    const motif = prompt(`Saisissez le motif du rejet pour "${school.nom}" :`);
    if (motif === null) return;

    if (!motif.trim()) {
      alert('Un motif de rejet écrit est obligatoire.');
      return;
    }

    this.clearMessages();
    this.schoolListService.rejectEstablishment(school.id, motif.trim()).subscribe({
      next: () => {
        this.successMessage.set(`L'établissement "${school.nom}" a été refusé.`);
        this.loadSchools();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set(`Erreur lors du rejet de l'établissement.`);
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'publie': return 'badge-success';
      case 'en_attente': return 'badge-warning';
      case 'rejete': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}