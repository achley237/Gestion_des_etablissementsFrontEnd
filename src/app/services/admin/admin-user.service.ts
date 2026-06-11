import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, StatutUpdatePayload } from '../../models/admin-user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Liste tous les comptes (directeurs + utilisateurs), exclut les admins */
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/auth/admin/users/`);
  }

  /** Détail d'un compte utilisateur */
  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/auth/admin/users/${id}/`);
  }

  /** Modifier le statut d'un utilisateur (actif/suspendu/banni) */
  updateStatut(id: number, payload: StatutUpdatePayload): Observable<AdminUser> {
    return this.http.patch<AdminUser>(
      `${this.baseUrl}/auth/admin/users/${id}/statut/`,
      payload
    );
  }
}