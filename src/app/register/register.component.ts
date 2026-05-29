import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signaux pour le contrôle d'état UI
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  // Formulaire réactif mappé sur les propriétés attendues par l'API
  registerForm = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirm: ['', [Validators.required]],
    proposeEtablissement: [false], // Utilisé uniquement pour déterminer le rôle
    fonction: ['Utilisateur'] // Valeur par défaut requise par l'API
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    const rawValues = this.registerForm.getRawValue();

    if (rawValues.password !== rawValues.password_confirm) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Attribution logique du rôle demandée
    const payload = {
      nom: rawValues.nom,
      prenom: rawValues.prenom,
      email: rawValues.email,
      password: rawValues.password,
      password_confirm: rawValues.password_confirm,
      role: rawValues.proposeEtablissement ? ('directeur' as const) : ('visiteur' as const),
      fonction: rawValues.fonction
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Redirection vers la page de connexion après succès
        this.router.navigate(['/auth/connexion']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/connexion']);
  }
}
