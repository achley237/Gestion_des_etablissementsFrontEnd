import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment/comment.service';
import { Comment, EstablishmentRating, CreateCommentPayload } from '../../models/comment.model';

@Component({
  selector: 'app-establishment-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './establishment-detail-modal.component.html',
  styleUrls: ['./establishment-detail-modal.component.scss'],
})
export class EstablishmentDetailModalComponent implements OnInit, OnChanges {
  @Input() establishment: any = null;
  @Output() closeModal = new EventEmitter<void>();

  comments = signal<Comment[]>([]);
  rating = signal<EstablishmentRating | null>(null);
  isLoadingComments = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Form fields
  newCommentContenu = '';
  newCommentNote = 5;
  hoveredStar = 0;

  // Edit state
  editingComment: Comment | null = null;
  editContenu = '';
  editNote = 0;

  activeTab: 'details' | 'comments' = 'details';

  constructor(private commentService: CommentService) { }

  ngOnInit(): void {
    if (this.establishment) {
      this.loadComments();
      this.loadRating();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['establishment'] && this.establishment) {
      this.loadComments();
      this.loadRating();
      this.resetForm();
    }
  }

  loadComments(): void {
    if (!this.establishment?.id) return;
    this.isLoadingComments.set(true);
    this.commentService.getComments(this.establishment.id).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoadingComments.set(false);
      },
      error: () => {
        this.isLoadingComments.set(false);
      },
    });
  }

  loadRating(): void {
    if (!this.establishment?.id) return;
    this.commentService.getRating(this.establishment.id).subscribe({
      next: (data) => this.rating.set(data),
      error: () => { },
    });
  }

  submitComment(): void {
    if (!this.newCommentContenu.trim() || !this.newCommentNote) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload: CreateCommentPayload = {
      contenu: this.newCommentContenu,
      note: this.newCommentNote,
    };

    this.commentService.createComment(this.establishment.id, payload).subscribe({
      next: () => {
        this.successMessage.set('Votre commentaire a été soumis et est en attente de modération.');
        this.resetForm();
        this.loadComments();
        this.loadRating();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.[0] ||
          err?.error?.non_field_errors?.[0] ||
          err?.error?.detail ||
          'Une erreur est survenue.';
        this.errorMessage.set(msg);
        this.isSubmitting.set(false);
      },
    });
  }

  startEdit(comment: Comment): void {
    this.editingComment = comment;
    this.editContenu = comment.contenu;
    this.editNote = comment.note;
  }

  cancelEdit(): void {
    this.editingComment = null;
  }

  saveEdit(): void {
    if (!this.editingComment) return;
    this.commentService
      .updateComment(this.establishment.id, this.editingComment.id, {
        contenu: this.editContenu,
        note: this.editNote,
      })
      .subscribe({
        next: () => {
          this.editingComment = null;
          this.loadComments();
          this.loadRating();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.detail || 'Erreur lors de la modification.'
          );
        },
      });
  }

  deleteComment(comment: Comment): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.loadComments();
        this.loadRating();
      },
    });
  }

  resetForm(): void {
    this.newCommentContenu = '';
    this.newCommentNote = 5;
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  setTab(tab: 'details' | 'comments'): void {
    this.activeTab = tab;
  }

  close(): void {
    this.closeModal.emit();
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      approuve: 'Approuvé',
      en_attente: 'En attente',
      rejete: 'Rejeté',
    };
    return labels[statut] ?? statut;
  }

  getStatusClass(statut: string): string {
    const classes: Record<string, string> = {
      approuve: 'badge-approved',
      en_attente: 'badge-pending',
      rejete: 'badge-rejected',
    };
    return classes[statut] ?? '';
  }
}