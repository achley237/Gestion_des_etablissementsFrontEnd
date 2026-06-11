export type UserRole = 'utilisateur' | 'directeur' | 'admin';
export type UserStatus = 'actif' | 'suspendu' | 'banni';

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  statut: UserStatus;
  fonction: string;
  niveau_acces: number;
  date_inscription: string;
  is_active: boolean;
  redirect_to: string;
}

export interface StatutUpdatePayload {
  statut: UserStatus;
  raison?: string;
}