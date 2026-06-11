import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface SchoolPayload {
  nom: string;
  type: string;
  adresse: string;
  ville: string;
  region: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  niveaux_scolaires: string[];
  capacite: number | null;
  annee_creation: number | null;
}

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = environment.apiUrl;

  createSchool(payload: SchoolPayload): Observable<any> {
    const role = this.authService.getUserRole();

    if (role !== 'directeur') {
      return throwError(() => new Error(
        'Accès refusé. Uniquement un directeur peut ajouter un établissement.'
      ));
    }
    return this.http.post<any>(
      `${this.API_URL}/etablissements/`,
      payload
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = "Une erreur est survenue lors de l'ajout de l'établissement.";
    if (error.status === 400) {
      message = 'Données invalides. Veuillez vérifier les champs du formulaire.';
    } else if (error.status === 401 || error.status === 403) {
      message = "Vous n'êtes pas autorisé à effectuer cette action.";
    } else if (error.status === 0) {
      message = 'Impossible de joindre le serveur distant.';
    }
    return throwError(() => new Error(message));
  }
}