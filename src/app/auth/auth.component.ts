import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export interface Role {
  value: string;
  label: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnDestroy {

  // ── Rôles ────────────────────────────────────────────────────────────────
  roles: Role[] = [
    { value: 'visiteur', label: 'Visiteur' },
    { value: 'directeur', label: 'Directeur' },
    { value: 'admin', label: 'Admin' },
  ];
  selectedRole = 'directeur';

  selectRole(value: string): void {
    this.selectedRole = value;
  }

  getRoleIcon(value: string): string {
    const icons: Record<string, string> = {
      visiteur: 'person_outline',
      directeur: 'badge',
      admin: 'admin_panel_settings',
    };
    return icons[value] ?? 'person_outline';
  }

  getRoleClass(value: string): string {
    const base = 'group flex flex-col items-center p-3 rounded-lg border transition-all ';
    return value === this.selectedRole
      ? base + 'bg-primary-container text-on-primary-container border-primary'
      : base + 'border-outline-variant hover:border-primary hover:bg-surface-container-low';
  }

  // ── Champs de saisie ─────────────────────────────────────────────────────
  loginEmail = '';
  loginPassword = '';
  showPassword = false;
  rememberMe = false;

  // ── Validations ──────────────────────────────────────────────────────────
  emailError = '';
  passwordError = '';

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = this.loginEmail && !emailRegex.test(this.loginEmail)
      ? 'Veuillez saisir une adresse e-mail valide.'
      : '';
  }

  validatePassword(): void {
    this.passwordError = this.loginPassword && this.loginPassword.length < 6
      ? 'Le mot de passe doit comporter au moins 6 caractères.'
      : '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Chargement & Notifications (Toast) ───────────────────────────────────
  isLoading = false;
  toastMessage = '';
  toastIsError = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(message: string, isError = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastIsError = isError;
    this.toastTimer = setTimeout(() => (this.toastMessage = ''), 4000);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  // ── Soumission du formulaire dans AuthComponent ─────────────────────────────
  onLogin(): void {
    this.validateEmail();
    this.validatePassword();

    if (this.emailError || this.passwordError) return;

    if (!this.loginEmail || !this.loginPassword) {
      this.showToast('Veuillez remplir tous les champs.', true);
      return;
    }

    this.isLoading = true;
    this.toastMessage = '';

    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast('Connexion réussie ! Analyse du profil...');

        setTimeout(() => {
          // Récupération automatique du rôle depuis le Token décodé
          const role = this.authService.getUserRole();

          console.log('Rôle détecté pour la redirection :', role);

          // Redirection dynamique selon le rôle inscrit dans la base de données
          if (role === 'admin' || role === 'ADMIN') {
            this.router.navigate(['/admin/accueil']);
          } else if (role === 'directeur' || role === 'director' || role === 'DIRECTEUR') {
            this.router.navigate(['/admin/accueil']);
          } else {
            // Rôle utilisateur simple ou inconnu
            this.showToast('Accès restreint : Rôle non autorisé.', true);
            // Optionnel : this.router.navigate(['/user/accueil']);
          }
        }, 1200);
      },
      error: (err: { message: string }) => {
        this.isLoading = false;
        this.showToast(err.message ?? 'Une erreur est survenue.', true);
      },
    });
  }

  // ── Mot de passe oublié ──────────────────────────────────────────────────
  forgotPassword(): void {
    if (!this.loginEmail) {
      this.showToast('Saisissez d\'abord votre adresse e-mail dans le formulaire.', true);
      return;
    }
    this.showToast(`Lien de réinitialisation envoyé à : ${this.loginEmail}`);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}