import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // ✅ AJOUT de ActivatedRoute
import { SchoolService, SchoolPayload } from '../../services/Schools/school.service';
import { SchoolListService } from '../../services/Schools/schoolList.service'; // ✅ AJOUT pour le GET/UPDATE
import { AuthService } from '../../services/auth/auth.service';

interface Step {
  id: number;
  label: string;
  fields: string[];
}

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
  private schoolListService = inject(SchoolListService); 
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isAuthorized = signal<boolean>(true);
  currentStep = signal<number>(0);
  
  //  Signaux pour gérer le mode édition
  isEditMode = signal<boolean>(false);
  establishmentId = signal<number | null>(null);

  steps: Step[] = [
    { id: 0, label: 'Informations', fields: ['nom', 'type', 'ville', 'region', 'pays', 'adresse'] },
    { id: 1, label: 'Contact', fields: ['telephone', 'email', 'site_web', 'niveaux_scolaires'] },
    { id: 2, label: 'Détails', fields: ['capacite', 'annee_creation'] }
  ];

  schoolForm = this.fb.group({
    nom: ['', [Validators.required]],
    type: ['primaire', [Validators.required]],
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
    if (this.authService.getUserRole() !== 'directeur') {
      this.isAuthorized.set(false);
      this.errorMessage.set("Accès interdit : vous devez posséder le rôle Directeur.");
      return;
    }

    // Vérifier si on est en mode modification
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.establishmentId.set(+idParam);
      this.loadExistingEstablishment(+idParam);
    }
  }

  // Charger les données existantes pour pré-remplir le formulaire
  private loadExistingEstablishment(id: number): void {
    this.isLoading.set(true);
    this.schoolListService.getEstablishmentById(id).subscribe({
      next: (data) => {
        // On pré-remplit le formulaire avec les données du backend
        this.schoolForm.patchValue({
          nom: data.nom,
          type: data.type,
          adresse: data.adresse,
          ville: data.ville,
          region: data.region,
          pays: data.pays,
          telephone: data.telephone,
          email: data.email,
          site_web: data.site_web?.replace('https://', '').replace('http://', '') || '', 
          niveaux_scolaires: data.niveaux_scolaires ? data.niveaux_scolaires.join(', ') : '',
          capacite: data.capacite,
          annee_creation: data.annee_creation
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger les données de l\'établissement.');
        this.isLoading.set(false);
      }
    });
  }

  getProgress(): number {
    return ((this.currentStep() + 1) / this.steps.length) * 100;
  }

  nextStep(): void {
    const currentStepFields = this.steps[this.currentStep()].fields;
    let isValid = true;

    currentStepFields.forEach(field => {
      const control = this.schoolForm.get(field);
      if (control && control.invalid) {
        isValid = false;
        control.markAsTouched();
      }
    });

    if (!isValid) {
      this.errorMessage.set("Veuillez remplir tous les champs requis avant de continuer.");
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(step => step + 1);
      this.errorMessage.set(null);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(step => step - 1);
      this.errorMessage.set(null);
    }
  }

  onSubmit(): void {
    if (this.schoolForm.invalid) {
      this.errorMessage.set("Données invalides. Veuillez vérifier tous les champs du formulaire.");
      return;
    }

    this.isLoading.set(true);
    const rawData = this.schoolForm.getRawValue();

    let typeFormatte = rawData.type ? rawData.type.toLowerCase().trim() : 'primaire';
    if (typeFormatte === 'superieur' || typeFormatte === 'supérieur') typeFormatte = 'universite';
    else if (typeFormatte === 'lycée') typeFormatte = 'lycee';

    let niveauxArray: string[] = [];
    if (rawData.niveaux_scolaires && rawData.niveaux_scolaires.trim() !== '') {
      niveauxArray = rawData.niveaux_scolaires.split(',').map((n: string) => n.trim()).filter((n: string) => n.length > 0);
    }

    let siteWebFormatte = rawData.site_web ? rawData.site_web.trim() : '';
    if (siteWebFormatte && !siteWebFormatte.startsWith('http://') && !siteWebFormatte.startsWith('https://')) {
      siteWebFormatte = 'https://' + siteWebFormatte;
    }

    const schoolPayload: SchoolPayload = {
      nom: rawData.nom ? rawData.nom.trim() : '',
      type: typeFormatte,
      adresse: rawData.adresse ? rawData.adresse.trim() : '',
      ville: rawData.ville ? rawData.ville.trim() : '',
      region: rawData.region ? rawData.region.trim() : '',
      pays: rawData.pays ? rawData.pays.trim() : 'Cameroun',
      telephone: rawData.telephone ? rawData.telephone.trim() : '',
      email: rawData.email ? rawData.email.trim() : '',
      site_web: siteWebFormatte,
      niveaux_scolaires: niveauxArray,
      capacite: rawData.capacite ? parseInt(rawData.capacite as any, 10) : null,
      annee_creation: rawData.annee_creation ? parseInt(rawData.annee_creation as any, 10) : null
    };

    // Appel API dynamique selon le mode
    const request$ = this.isEditMode() 
      ? this.schoolListService.updateEstablishment(this.establishmentId()!, schoolPayload)
      : this.schoolService.createSchool(schoolPayload);

    request$.subscribe({
      next: () => {
        const msg = this.isEditMode() 
          ? 'Établissement modifié avec succès !' 
          : 'Établissement enregistré avec succès et en attente de validation !';
        
        this.successMessage.set(msg);
        this.errorMessage.set(null);
        this.isLoading.set(false);
        
        if (!this.isEditMode()) {
          this.schoolForm.reset({ type: 'primaire', pays: 'Cameroun' });
          this.currentStep.set(0);
        } else {
          setTimeout(() => this.router.navigate(['/ListEtablissements']), 1500);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Erreur retournée par le backend :', err);
        this.errorMessage.set(err.message || "Une erreur est survenue.");
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/ListEtablissements']);
  }
}