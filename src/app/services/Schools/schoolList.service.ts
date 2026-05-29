import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Establishment {
  id: number;
  nom: string;
  type: 'primaire' | 'secondaire' | 'lycee' | 'universite' | 'autre';
  adresse: string;
  ville: string;
  region?: string;
  pays: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  niveaux_scolaires: string[];
  capacite?: number;
  annee_creation?: number;
  statut: 'brouillon' | 'en_attente' | 'publie' | 'rejete' | 'archive';
  motif_rejet?: string;
  date_creation: string;
  date_mise_a_jour: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolListService {
  private http = inject(HttpClient);
  private apiUrl = 'https://campus237-api.onrender.com/api/etablissements';

  /**
   * Récupère la liste de tous les établissements
   */
  getEstablishments(): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(`${this.apiUrl}/`);
  }

  /**
   * Approuve un établissement (Statut passe à 'publie')
   */
  approveEstablishment(id: number): Observable<Establishment> {
    return this.http.post<Establishment>(`${this.apiUrl}/${id}/approve/`, {});
  }

  /**
   * Rejette un établissement (Statut passe à 'rejete') avec un motif
   */
  rejectEstablishment(id: number, motifRejet: string): Observable<Establishment> {
    return this.http.post<Establishment>(`${this.apiUrl}/${id}/reject/`, { motif_rejet: motifRejet });
  }
}