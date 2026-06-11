import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentPayload, EstablishmentRating } from '../../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ── Côté utilisateur ────────────────────────────────────

  getComments(establishmentId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.baseUrl}/commentaires/etablissements/${establishmentId}/commentaires/`
    );
  }

  getRating(establishmentId: number): Observable<EstablishmentRating> {
    return this.http.get<EstablishmentRating>(
      `${this.baseUrl}/commentaires/etablissements/${establishmentId}/commentaires/rating/`
    );
  }

  createComment(establishmentId: number, payload: CreateCommentPayload): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/commentaires/etablissements/${establishmentId}/commentaires/`,
      payload
    );
  }


  updateComment(
    establishmentId: number,
    commentId: number,
    payload: Partial<CreateCommentPayload>
  ): Observable<Comment> {
    return this.http.patch<Comment>(
      `${this.baseUrl}/commentaires/etablissements/${establishmentId}/commentaires/${commentId}/`,
      payload
    );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/commentaires/${commentId}/`
    );
  }

  approveComment(commentId: number): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/commentaires/${commentId}/approve/`,
      {}
    );
  }


  rejectComment(commentId: number, motifRejet: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/commentaires/${commentId}/reject/`,
      { motif_rejet: motifRejet }
    );
  }

  getAllComments(params?: { statut?: string; etablissement?: number }): Observable<Comment[]> {
    let url = `${this.baseUrl}/commentaires/`;
    const queryParams: string[] = [];
    if (params?.statut) queryParams.push(`statut=${params.statut}`);
    if (params?.etablissement) queryParams.push(`etablissement=${params.etablissement}`);
    if (queryParams.length) url += `?${queryParams.join('&')}`;
    return this.http.get<Comment[]>(url);
  }
}