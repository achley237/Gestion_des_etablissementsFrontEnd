export type CommentStatus = 'en_attente' | 'approuve' | 'rejete';

export interface Comment {
  id: number;
  contenu: string;
  note: number;
  auteur: number;
  auteur_email: string;
  auteur_nom: string;
  etablissement: number;
  etablissement_nom: string;
  statut: CommentStatus;
  motif_rejet: string;
  date_publication: string;
  date_mise_a_jour: string;
}

export type AdminComment = Comment;

export interface EstablishmentRating {
  etablissement: number;
  note_moyenne: number;
  total_commentaires: number;
}

export interface CreateCommentPayload {
  contenu: string;
  note: number;
}