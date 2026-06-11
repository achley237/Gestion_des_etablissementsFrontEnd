// src/app/components/admin/list-commentaire/list-commentaire.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../services/comment/comment.service';
import { AuthService } from '../../services/auth/auth.service';
import { Comment, CommentStatus } from '../../models/comment.model';

@Component({
  selector: 'app-list-commentaire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-commentaire.component.html',
  styleUrl: './list-commentaire.component.scss',
})
export class ListCommentaireComponent implements OnInit {
  private commentService = inject(CommentService);
  private authService = inject(AuthService);

  // ── État ──────────────────────────────────────────────────
  allComments = signal<Comment[]>([]);
  isLoading = signal(true);
  filterStatut = signal<CommentStatus | ''>('');
  searchQuery = signal('');

  // ── Actions en cours ──────────────────────────────────────
  processingIds = signal<Set<number>>(new Set());
  rejectModalComment = signal<Comment | null>(null);
  rejectMotif = signal('');
  rejectLoading = signal(false);
  rejectError = signal<string | null>(null);

  // ── Toast notifications ───────────────────────────────────
  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  private toastTimeout: any;

  // ── Computed ──────────────────────────────────────────────
  filteredComments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.allComments().filter((c) => {
      const matchQ =
        !q ||
        c.auteur_nom.toLowerCase().includes(q) ||
        c.etablissement_nom.toLowerCase().includes(q) ||
        c.contenu.toLowerCase().includes(q);
      return matchQ;
    });
  });

  pendingCount = computed(() => this.allComments().filter((c) => c.statut === 'en_attente').length);
  approvedCount = computed(() => this.allComments().filter((c) => c.statut === 'approuve').length);
  rejectedCount = computed(() => this.allComments().filter((c) => c.statut === 'rejete').length);

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadComments();
  }

  // ── Chargement ────────────────────────────────────────────
  loadComments(): void {
    this.isLoading.set(true);
    const params: any = {};
    if (this.filterStatut()) params.statut = this.filterStatut();

    this.commentService.getAllComments(params).subscribe({
      next: (list) => {
        this.allComments.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('error', 'Erreur lors du chargement des commentaires.');
      },
    });
  }

  onFilterChange(): void {
    this.loadComments();
  }

  // ── Actions ───────────────────────────────────────────────
  approve(comment: Comment): void {
    this.addProcessing(comment.id);
    this.commentService.approveComment(comment.id).subscribe({
      next: (updated) => {
        this.updateComment(updated);
        this.removeProcessing(comment.id);
        this.showToast('success', `Avis de ${updated.auteur_nom} approuvé.`);
      },
      error: () => {
        this.removeProcessing(comment.id);
        this.showToast('error', "Erreur lors de l'approbation.");
      },
    });
  }

  openRejectModal(comment: Comment): void {
    this.rejectModalComment.set(comment);
    this.rejectMotif.set('');
    this.rejectError.set(null);
  }

  closeRejectModal(): void {
    this.rejectModalComment.set(null);
    this.rejectMotif.set('');
    this.rejectError.set(null);
  }

  confirmReject(): void {
    const comment = this.rejectModalComment();
    const motif = this.rejectMotif().trim();
    if (!comment || !motif) {
      this.rejectError.set('Veuillez indiquer un motif de rejet.');
      return;
    }

    this.rejectLoading.set(true);
    this.rejectError.set(null);

    this.commentService.rejectComment(comment.id, motif).subscribe({
      next: (updated) => {
        this.updateComment(updated);
        this.rejectLoading.set(false);
        this.closeRejectModal();
        this.showToast('success', `Avis de ${updated.auteur_nom} rejeté.`);
      },
      error: (err) => {
        this.rejectLoading.set(false);
        const msg = err?.error?.motif_rejet?.[0] ?? err?.error?.detail ?? 'Erreur lors du rejet.';
        this.rejectError.set(msg);
      },
    });
  }

  delete(comment: Comment): void {
    if (!confirm(`Supprimer définitivement l'avis de ${comment.auteur_nom} ?`)) return;

    this.addProcessing(comment.id);
    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.allComments.update((list) => list.filter((c) => c.id !== comment.id));
        this.removeProcessing(comment.id);
        this.showToast('success', 'Commentaire supprimé.');
      },
      error: () => {
        this.removeProcessing(comment.id);
        this.showToast('error', 'Erreur lors de la suppression.');
      },
    });
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

  private updateComment(updated: Comment): void {
    this.allComments.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  isProcessing(id: number): boolean {
    return this.processingIds().has(id);
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));
  }

  getInitials(nom?: string): string {
    if (!nom) return '?';
    return nom
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatutLabel(statut: CommentStatus): string {
    const map: Record<CommentStatus, string> = {
      en_attente: 'En attente',
      approuve: 'Approuvé',
      rejete: 'Rejeté',
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: CommentStatus): string {
    const map: Record<CommentStatus, string> = {
      en_attente: 'badge-waiting',
      approuve: 'badge-approved',
      rejete: 'badge-rejected',
    };
    return map[statut] ?? '';
  }

  getStarsArray(note: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  private showToast(type: 'success' | 'error', message: string): void {
    this.toast.set({ type, message });
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 4000);
  }
}