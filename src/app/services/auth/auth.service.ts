import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export interface LoginPayload {
  email: string;
  password: string;
}

// Calqué exactement sur la capture Swagger du backend
export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'directeur' | 'visiteur'; // Géré dynamiquement selon la checkbox
  fonction: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'https://gestionetablissementbackend.onrender.com/api';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Inscription — POST https://gestionetablissementbackend.onrender.com/api/auth/register/
   */
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register/`, payload).pipe(
      catchError(this.handleError)
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login/`, payload).pipe(
      tap((response: AuthResponse) => {
        if (response.access) localStorage.setItem(this.TOKEN_KEY, response.access);
        if (response.refresh) localStorage.setItem(this.REFRESH_KEY, response.refresh);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/connexion']);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  hasToken(): boolean { return !!localStorage.getItem(this.TOKEN_KEY); }

  getUserRole(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || decoded.user_type || decoded.role_name || null;
    } catch (error) {
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur inattendue est survenue.';
    if (error.status === 400 || error.status === 401) {
      message = error.error?.detail || error.error?.message || 'Données invalides ou e-mail déjà utilisé.';
    } else if (error.status === 0) {
      message = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    } else if (error.status >= 500) {
      message = 'Erreur interne du serveur.';
    }
    return throwError(() => ({ message, status: error.status, raw: error.error }));
  }
}