import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SchoolListService, Establishment } from '../../services/Schools/schoolList.service';
import { CommentService } from '../../services/comment/comment.service';
import { AuthService } from '../../services/auth/auth.service';
import { Comment, EstablishmentRating, CreateCommentPayload } from '../../models/comment.model';

interface EtabWithRating extends Establishment {
  note_moyenne: number;
  total_commentaires: number;
}

@Component({
  selector: 'app-acceuil-etudiants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './acceuil-etudiants.component.html',
  styleUrl: './acceuil-etudiants.component.scss'
})
export class AcceuilEtudiantsComponent implements OnInit, OnDestroy {
  private schoolService = inject(SchoolListService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // ── Auth ──────────────────────────────────────────────────
  userInfo = this.authService.getUserInfo();
  userRole = this.authService.getUserRole();

  // ── État liste ────────────────────────────────────────────
  allEtabs = signal<EtabWithRating[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filterType = signal('');

  // ── Commentaires par établissement (cache) ────────────────
  etabComments = signal<Map<number, Comment[]>>(new Map());

  // ── Modal ─────────────────────────────────────────────────
  selectedEtab = signal<EtabWithRating | null>(null);
  modalComments = signal<Comment[]>([]);
  modalRating = signal<EstablishmentRating | null>(null);
  loadingComments = signal(false);
  activeTab = signal<'info' | 'avis'>('info');

  // ── Formulaire commentaire ────────────────────────────────
  commentText = '';
  commentNote = 0;
  hoverNote = 0;
  submitLoading = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  // ── Témoignages auto-défilement ────────────────────────────
  activeTestimonial = 0;
  private interval: any;

  testimonials = [
    { texte: "L'espace étudiant m'a permis de trouver l'université idéale en quelques minutes. Les avis des autres étudiants sont vraiment précieux.", auteur: 'Larissa Nkemdirim', role: 'Étudiante, Université de Yaoundé I', initiales: 'LN' },
    { texte: "J'ai pu comparer les lycées de ma région et faire un choix éclairé pour mon orientation. Merci CAMPUS237 !", auteur: 'Samuel Fotso', role: 'Bachelier, Région Centre', initiales: 'SF' },
    { texte: "Enfin une plateforme qui centralise toutes les infos sur les établissements camerounais. Je recommande à tous les étudiants.", auteur: 'Marlène Abanda', role: 'Étudiante en Master, ESSEC', initiales: 'MA' },
  ];

  // ── Types pour filtres ────────────────────────────────────
  types = [
    { value: '', label: 'Tous les types' },
    { value: 'primaire', label: 'Primaire' },
    { value: 'secondaire', label: 'Secondaire' },
    { value: 'lycee', label: 'Lycée' },
    { value: 'universite', label: 'Université' },
  ];

  // ── Computed ──────────────────────────────────────────────
  filteredEtabs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const type = this.filterType();
    return this.allEtabs()
      .filter(e => {
        const matchQ = !q || e.nom.toLowerCase().includes(q) || e.ville.toLowerCase().includes(q);
        const matchType = !type || e.type.toLowerCase() === type;
        return matchQ && matchType;
      })
      .sort((a, b) => b.note_moyenne - a.note_moyenne);
  });

  topTrois = computed(() => this.filteredEtabs().slice(0, 3));

  approvedComments = computed(() =>
    this.modalComments().filter(c => c.statut === 'approuve')
  );

  hasAlreadyCommented = computed(() => {
    if (!this.userInfo) return false;
    return this.modalComments().some(c => c.auteur_email === this.userInfo!.email);
  });

  /** Nombre total d'avis sur tous les établissements */
  totalAvisCount = computed(() =>
    this.allEtabs().reduce((sum, e) => sum + (e.total_commentaires || 0), 0)
  );

  /** Note moyenne globale */
  averageRating = computed(() => {
    const etabs = this.allEtabs().filter(e => e.note_moyenne > 0);
    if (etabs.length === 0) return '—';
    const avg = etabs.reduce((sum, e) => sum + e.note_moyenne, 0) / etabs.length;
    return avg.toFixed(1);
  });

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    if (this.userRole !== 'utilisateur') {
      this.router.navigate(['/']);
      return;
    }
    this.loadEtablissements();
    this.interval = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
    }, 4000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    document.body.style.overflow = '';
  }

  // ── Chargement données ────────────────────────────────────
  loadEtablissements(): void {
    this.isLoading.set(true);
    this.schoolService.searchPublicEstablishments({}).subscribe({
      next: async (resp) => {
        const etabs = resp.results ?? [];
        // Charger les notes en parallèle
        const withRatings = await Promise.all(
          etabs.map(e =>
            new Promise<EtabWithRating>(resolve => {
              this.commentService.getRating(e.id).subscribe({
                next: r => resolve({ ...e, note_moyenne: r.note_moyenne, total_commentaires: r.total_commentaires }),
                error: () => resolve({ ...e, note_moyenne: 0, total_commentaires: 0 }),
              });
            })
          )
        );
        this.allEtabs.set(withRatings);
        this.isLoading.set(false);

        // Charger les commentaires de chaque établissement (pour l'aperçu)
        this.loadAllCommentsPreview(withRatings);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** Charge les commentaires approuvés de tous les établissements */
  private loadAllCommentsPreview(etabs: EtabWithRating[]): void {
    const newMap = new Map<number, Comment[]>();
    etabs.forEach(e => {
      if (e.total_commentaires > 0) {
        this.commentService.getComments(e.id).subscribe({
          next: (comments) => {
            const approved = comments.filter(c => c.statut === 'approuve');
            newMap.set(e.id, approved);
            this.etabComments.set(new Map(newMap));
          },
          error: () => { /* silencieux */ }
        });
      }
    });
  }

  /** Récupère le dernier commentaire d'un établissement */
  getLatestComment(etabId: number): Comment | null {
    const comments = this.etabComments().get(etabId);
    return comments && comments.length > 0 ? comments[0] : null;
  }

  /** Récupère les N derniers commentaires d'un établissement */
  getLatestComments(etabId: number, count: number): Comment[] {
    const comments = this.etabComments().get(etabId);
    return comments ? comments.slice(0, count) : [];
  }

  // ── Modal ─────────────────────────────────────────────────
  openModal(etab: EtabWithRating): void {
    this.selectedEtab.set(etab);
    this.activeTab.set('info');
    this.resetForm();
    document.body.style.overflow = 'hidden';
    this.loadModalData(etab.id);
  }

  /** Ouvre le modal directement sur l'onglet avis */
  openModalOnAvis(etab: EtabWithRating, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedEtab.set(etab);
    this.activeTab.set('avis');
    this.resetForm();
    document.body.style.overflow = 'hidden';
    this.loadModalData(etab.id);
  }

  closeModal(): void {
    this.selectedEtab.set(null);
    document.body.style.overflow = '';
  }

  loadModalData(id: number): void {
    this.loadingComments.set(true);
    this.commentService.getComments(id).subscribe({
      next: (list) => { this.modalComments.set(list); this.loadingComments.set(false); },
      error: () => this.loadingComments.set(false),
    });
    this.commentService.getRating(id).subscribe({
      next: r => this.modalRating.set(r),
      error: () => { },
    });
  }

  setTab(tab: 'info' | 'avis'): void { this.activeTab.set(tab); }

  // ── Commentaire ───────────────────────────────────────────
  submitComment(): void {
    const etab = this.selectedEtab();
    if (!etab || this.commentNote < 1 || !this.commentText.trim()) return;

    this.submitLoading.set(true);
    this.submitError.set(null);

    const payload: CreateCommentPayload = {
      contenu: this.commentText.trim(),
      note: this.commentNote,
    };

    this.commentService.createComment(etab.id, payload).subscribe({
      next: (c) => {
        this.modalComments.update(list => [c, ...list]);
        this.submitSuccess.set(true);
        this.submitLoading.set(false);
        this.resetForm();
        this.commentService.getRating(etab.id).subscribe({ next: r => this.modalRating.set(r) });
        // Mettre à jour la note dans la liste principale
        this.allEtabs.update(list =>
          list.map(e => e.id === etab.id
            ? { ...e, note_moyenne: this.modalRating()?.note_moyenne ?? e.note_moyenne, total_commentaires: (e.total_commentaires || 0) + 1 }
            : e
          )
        );
      },
      error: (err) => {
        const msg = err?.error?.non_field_errors?.[0] ?? err?.error?.detail ?? 'Une erreur est survenue.';
        this.submitError.set(msg);
        this.submitLoading.set(false);
      },
    });
  }

  setNote(n: number): void { this.commentNote = n; }
  hoverStar(n: number): void { this.hoverNote = n; }
  clearHover(): void { this.hoverNote = 0; }

  displayNote(index: number): boolean {
    return index <= (this.hoverNote || this.commentNote);
  }

  private resetForm(): void {
    this.commentText = '';
    this.commentNote = 0;
    this.hoverNote = 0;
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }

  // ── Helpers ───────────────────────────────────────────────
  starsArray = [1, 2, 3, 4, 5];

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      primaire: 'Primaire', secondaire: 'Secondaire',
      lycee: 'Lycée', universite: 'Université',
    };
    return map[type?.toLowerCase()] ?? type;
  }

  getTypeAccent(type: string): string {
    const map: Record<string, string> = {
      primaire: '#2d7a4f', secondaire: '#0F2D6B',
      lycee: '#8b4513', universite: '#C8A84B',
    };
    return map[type?.toLowerCase()] ?? '#0F2D6B';
  }

  getImage(type: string): string {
    const map: Record<string, string> = {
      primaire: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
      secondaire: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
      lycee: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
      universite: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
    };
    return map[type?.toLowerCase()] ?? map['secondaire'];
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  }

  getInitials(nom?: string): string {
    if (!nom) return '?';
    return nom.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  noteLabel(n: number): string {
    return ['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent'][n] ?? '';
  }

  stopProp(e: MouseEvent): void { e.stopPropagation(); }
  logout(): void { this.authService.logout(); }
}