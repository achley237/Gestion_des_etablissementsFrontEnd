import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnDestroy {

  // ── Champs de saisie ─────────────────────────────────────
  loginEmail    = '';
  loginPassword = '';
  showPassword  = false;
  rememberMe    = false;

  // ── Validations ──────────────────────────────────────────
  emailError    = '';
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

  // ── État ─────────────────────────────────────────────────
  isLoading    = false;
  toastMessage = '';
  toastIsError = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(message: string, isError = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastIsError = isError;
    this.toastTimer   = setTimeout(() => (this.toastMessage = ''), 4000);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin(): void {
    this.validateEmail();
    this.validatePassword();

    if (this.emailError || this.passwordError) return;

    if (!this.loginEmail || !this.loginPassword) {
      this.showToast('Veuillez remplir tous les champs.', true);
      return;
    }

    this.isLoading    = true;
    this.toastMessage = '';

    this.authService.login({
      email:    this.loginEmail,
      password: this.loginPassword,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showToast('Connexion réussie ! Analyse du profil...');

        setTimeout(() => {
          if (response.redirect_to) {
            const redirectMap: Record<string, string> = {
              '/dashboard/admin':      '/admin/accueil',
              '/dashboard/directeur':  '/admin/accueil',
              '/dashboard/utilisateur': '/utilisateur/accueil',
            };
            const route = redirectMap[response.redirect_to] ?? '/';
            this.router.navigate([route]);
            return;
          }

          // Fallback sur le rôle JWT
          const role = this.authService.getUserRole();
          if (role === 'admin' || role === 'ADMIN') {
            this.router.navigate(['/admin/accueil']);
          } else if (role === 'directeur' || role === 'DIRECTEUR') {
            this.router.navigate(['/admin/accueil']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1200);
      },
      error: (err: { message: string }) => {
        this.isLoading = false;
        this.showToast(err.message ?? 'Une erreur est survenue.', true);
      },
    });
  }

  forgotPassword(): void {
    if (!this.loginEmail) {
      this.showToast("Saisissez d'abord votre adresse e-mail dans le formulaire.", true);
      return;
    }
    this.showToast(`Lien de réinitialisation envoyé à : ${this.loginEmail}`);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}