import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SchoolService, SchoolPayload } from '../../services/Schools/school.service';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-school-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './school-register.component.html',
  styleUrl: './school-register.component.scss'
})
export class SchoolRegisterComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private schoolService = inject(SchoolService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signaux d'état UI
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isAuthorized = signal<boolean>(true);

  // Formulaire adapté à 100% aux attentes du Swagger backend
  schoolForm = this.fb.group({
    nom: ['', [Validators.required]],
    type: ['primaire', [Validators.required]], // "primaire" par défaut selon l'exemple API
    adresse: ['', [Validators.required]],
    ville: ['', [Validators.required]],
    region: ['', [Validators.required]],
    pays: ['', [Validators.required]],
    telephone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    site_web: ['', [Validators.required]],
    niveaux_scolaires: ['', [Validators.required]],
    capacite: [null as any, [Validators.required, Validators.min(1)]],
    annee_creation: [null as any, [Validators.required, Validators.min(1800)]]
  });

  ngOnInit(): void {
    // Vérification du rôle au chargement du composant
    if (this.authService.getUserRole() !== 'directeur') {
      this.isAuthorized.set(false);
      this.errorMessage.set("Accès interdit : vous devez posséder le rôle Directeur.");
    }
  }
  onSubmit(): void {
    if (this.schoolForm.invalid) {
      this.errorMessage.set("Données invalides. Veuillez vérifier les champs du formulaire.");
      return;
    }

    this.isLoading.set(true);
    const rawData = this.schoolForm.getRawValue();

    // 1. Correction du Type pour correspondre à l'énumération Django
    let typeFormatte = rawData.type ? rawData.type.toLowerCase().trim() : 'primaire';
    if (typeFormatte === 'superieur' || typeFormatte === 'supérieur') {
      typeFormatte = 'universite'; // 'universite' est requis par votre modèle Django !
    } else if (typeFormatte === 'lycée') {
      typeFormatte = 'lycee';
    }

    // 2. Correction des Niveaux Scolaires : Conversion d'une String en un Array pour le JSONField
    let niveauxArray: string[] = [];
    if (rawData.niveaux_scolaires && rawData.niveaux_scolaires.trim() !== '') {
      // Si l'utilisateur saisit "Licence 1, Licence 2", on transforme en ["Licence 1", "Licence 2"]
      niveauxArray = rawData.niveaux_scolaires.split(',').map((n: string) => n.trim());
    }

    // 3. Nettoyage de l'URL du site Web
    let siteWebFormatte = rawData.site_web ? rawData.site_web.trim() : '';
    if (siteWebFormatte && !siteWebFormatte.startsWith('http://') && !siteWebFormatte.startsWith('https://')) {
      siteWebFormatte = 'https://' + siteWebFormatte;
    }

    // 4. Construction du Payload final parfaitement conforme à Django
    const schoolPayload = {
      nom: rawData.nom ? rawData.nom.trim() : '',
      type: typeFormatte, // 'primaire' | 'secondaire' | 'lycee' | 'universite' | 'autre'
      adresse: rawData.adresse ? rawData.adresse.trim() : '',
      ville: rawData.ville ? rawData.ville.trim() : '',
      region: rawData.region ? rawData.region.trim() : '',
      pays: rawData.pays ? rawData.pays.trim() : 'Cameroun',
      telephone: rawData.telephone ? rawData.telephone.trim() : '',
      email: rawData.email ? rawData.email.trim() : '',
      site_web: siteWebFormatte,
      niveaux_scolaires: niveauxArray, // Transmis sous forme de tableau [ "valeur1", "valeur2" ]

      // Forçage en type entier
      capacite: rawData.capacite ? parseInt(rawData.capacite as any, 10) : null,
      annee_creation: rawData.annee_creation ? parseInt(rawData.annee_creation as any, 10) : null
    };

    // 5. Envoi au service
    this.schoolService.createSchool(schoolPayload).subscribe({
      next: (response) => {
        this.successMessage.set('Établissement enregistré avec succès et en attente de validation !');
        this.errorMessage.set(null);
        this.isLoading.set(false);
        this.schoolForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.log('Détails complets de l\'erreur retournée par Django :', err);
        this.errorMessage.set("Une erreur est survenue lors de l'enregistrement (Code 400).");
      }
    });
  }
  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
