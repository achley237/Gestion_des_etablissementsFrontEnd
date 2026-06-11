import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Establishment {
  id: number;
  nom: string;
  ville: string;
  email?: string;
  type: string;
  statut: string;
  annee_creation?: number | null;
  capacite?: number | null;
  region?: string;
  telephone?: string;
  motif_rejet?: string;
  pays?: string;
  niveaux_scolaires?: string[];
  site_web?: string;
  adresse?: string;
  date_creation?: string;
  date_mise_a_jour?: string;
}

export interface EstablishmentFilters {
  annee_creation_max?: number;
  annee_creation_min?: number;
  capacite_max?: number;
  capacite_min?: number;
  niveau?: string;
}

// Réponse paginée du endpoint /search/
export interface SearchResponse {
  count: number;
  results: Establishment[];
  criteres: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class SchoolListService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/etablissements`;

  /** Récupère tous les établissements — admin/directeur (authentifié) */
  getEstablishments(): Observable<Establishment[]> {
    return this.http.get<Establishment[] | { results: Establishment[] }>(
      `${this.apiUrl}/`
    ).pipe(
      map((res: any) => Array.isArray(res) ? res : (res.results ?? []))
    );
  }

  /** Récupère uniquement les établissements du directeur connecté */
  getMyEstablishments(): Observable<Establishment[]> {
    return this.http.get<Establishment[] | { results: Establishment[] }>(
      `${this.apiUrl}/mine/`
    ).pipe(
      map((res: any) => Array.isArray(res) ? res : (res.results ?? []))
    );
  }

  /** Recherche publique — visiteurs non connectés */
  searchPublicEstablishments(
    params: { nom?: string; ville?: string; type?: string; q?: string } = {}
  ): Observable<SearchResponse> {
    let httpParams = new HttpParams();
    if (params.q)     httpParams = httpParams.set('q', params.q);
    if (params.nom)   httpParams = httpParams.set('nom', params.nom);
    if (params.ville) httpParams = httpParams.set('ville', params.ville);
    if (params.type)  httpParams = httpParams.set('type', params.type);
    return this.http.get<SearchResponse>(
      `${this.apiUrl}/search/`, { params: httpParams }
    );
  }

  /** Récupère le détail d'un établissement */
  getEstablishmentById(id: number): Observable<Establishment> {
    return this.http.get<Establishment>(`${this.apiUrl}/${id}/`);
  }

  /** Crée un établissement (Directeur) */
  createEstablishment(data: Partial<Establishment>): Observable<Establishment> {
    return this.http.post<Establishment>(`${this.apiUrl}/`, data);
  }

  /** Modifie complètement un établissement (PUT) */
  updateEstablishment(id: number, data: Partial<Establishment>): Observable<Establishment> {
    return this.http.put<Establishment>(`${this.apiUrl}/${id}/`, data);
  }

  /** Modifie partiellement un établissement (PATCH) */
  patchEstablishment(id: number, data: Partial<Establishment>): Observable<Establishment> {
    return this.http.patch<Establishment>(`${this.apiUrl}/${id}/`, data);
  }

  /** Approuve un établissement (Admin) */
  approveEstablishment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve/`, {});
  }

  /**
   * Rejette un établissement (Admin)
   * ✅ Correction : la clé envoyée est 'motif_rejet' (attendu par Django)
   */
  rejectEstablishment(id: number, motif: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject/`, { motif_rejet: motif });
  }

  /** Supprime définitivement un établissement (Admin) */
  deleteEstablishment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  /** Archive un établissement */
  archiveEstablishment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/archive/`, {});
  }

  /** Soumet à validation (Directeur) */
  submitForValidation(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit-for-validation/`, {});
  }
}