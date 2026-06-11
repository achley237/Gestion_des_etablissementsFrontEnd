import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SchoolListService, Establishment } from '../services/Schools/schoolList.service';
import { EstablishmentDetailModalComponent } from '../components/establishment-detail-modal/establishment-detail-modal.component';

interface EtablissementCard {
  id: number;
  nom: string;
  ville: string;
  pays: string;
  type: string;
  niveau: string;
  note: number;
  tag: string;
  image: string;
  couleur: string;
}

interface Categorie {
  nom: string;
  icone: string;
  couleur: string;
  count: number;
}

interface Stat {
  valeur: string;
  label: string;
  icone: string;
}

interface Temoignage {
  texte: string;
  auteur: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EstablishmentDetailModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private schoolListService = inject(SchoolListService);

  // ── Signaux de filtres ────────────────────────────────────
  searchNom      = signal('');
  searchLocation = signal('');
  searchNiveau   = signal('Tous niveaux');
  searchType     = signal('Tous types');

  mobileMenuOpen = false;
  activeTestimonial = 0;
  private testimonialInterval: any;

  // ── Données depuis l'API ──────────────────────────────────
  allEstablishments = signal<Establishment[]>([]);
  isLoadingSchools  = signal<boolean>(false);
  totalPublished    = signal<number>(0);

  // ── Modal ─────────────────────────────────────────────────
  selectedEstablishment = signal<Establishment | null>(null);

  niveaux: string[] = ['Tous niveaux', 'primaire', 'secondaire', 'lycee', 'universite'];

  // Les valeurs correspondent exactement aux types backend
  types: Array<{ label: string; value: string }> = [
    { label: 'Tous types',   value: 'Tous types'  },
    { label: 'Primaire',     value: 'primaire'    },
    { label: 'Secondaire',   value: 'secondaire'  },
    { label: 'Lycée',        value: 'lycee'       },
    { label: 'Université',   value: 'universite'  },
  ];

  // ── Computed : filtrage côté client ──────────────────────
  filteredEstablishments = computed(() => {
    let schools = [...this.allEstablishments()];

    // Filtre par nom
    const nom = this.searchNom().trim().toLowerCase();
    if (nom) {
      schools = schools.filter(s =>
        s.nom?.toLowerCase().includes(nom)
      );
    }

    // Filtre par ville / région
    const loc = this.searchLocation().trim().toLowerCase();
    if (loc) {
      schools = schools.filter(s =>
        s.ville?.toLowerCase().includes(loc) ||
        s.region?.toLowerCase().includes(loc)
      );
    }

    // Filtre par type (primaire / secondaire / lycee / universite)
    if (this.searchType() !== 'Tous types') {
      schools = schools.filter(s =>
        s.type?.toLowerCase() === this.searchType().toLowerCase()
      );
    }

    // Filtre par niveau scolaire
    if (this.searchNiveau() !== 'Tous niveaux') {
      schools = schools.filter(s =>
        s.niveaux_scolaires?.some(n =>
          n.toLowerCase().includes(this.searchNiveau().toLowerCase())
        )
      );
    }

    return schools;
  });

  // ── Computed : 6 premières cartes ────────────────────────
  etablissements = computed<EtablissementCard[]>(() =>
    this.filteredEstablishments()
      .slice(0, 6)
      .map(e => ({
        id:     e.id,
        nom:    e.nom,
        ville:  e.ville,
        pays:   e.pays ?? 'Cameroun',
        type:   e.type,
        niveau: e.niveaux_scolaires?.join(', ') ?? 'Non spécifié',
        note:   4.5,
        tag:    this.getTypeTag(e.type),
        image:  this.getSchoolImage(e),
        couleur: this.getTypeColor(e.type),
      }))
  );

  // ── Computed : stats dynamiques ───────────────────────────
  stats = computed<Stat[]>(() => [
    { valeur: `${this.totalPublished()}+`, label: 'Établissements', icone: '🏫' },
    { valeur: '10',                         label: 'Régions',         icone: '📍' },
    { valeur: '12K+',                       label: 'Avis publiés',    icone: '⭐' },
    { valeur: `${this.totalPublished()}`,   label: 'Directeurs actifs', icone: '👨‍💼' },
  ]);

  categories: Categorie[] = [
    { nom: 'Sciences',     icone: '🔬', couleur: '#e8f0fe', count: 142 },
    { nom: 'Arts & Design', icone: '🎨', couleur: '#fce8ff', count: 87  },
    { nom: 'Athlétisme',   icone: '⚽', couleur: '#e8fff0', count: 64  },
    { nom: 'Langues',      icone: '🌐', couleur: '#fff8e8', count: 210 },
    { nom: 'Littérature',  icone: '📖', couleur: '#ffe8e8', count: 98  },
    { nom: 'IT & Coding',  icone: '💻', couleur: '#e8f8ff', count: 175 },
  ];

  temoignages: Temoignage[] = [
    {
      texte: "Le CAMPUS237 m'a permis de trouver l'établissement idéal pour mon enfant en quelques minutes. Interface claire et complète.",
      auteur: 'Marie Kouam',
      role: "Parent d'élève",
      avatar: 'MK'
    },
    {
      texte: 'En tant que directeur, je peux mettre à jour les informations de mon établissement facilement et toucher plus de familles.',
      auteur: 'Dr. Paul Mbida',
      role: 'Directeur — Lycée Bilingue',
      avatar: 'PM'
    },
    {
      texte: "L'annuaire le plus complet du pays. Une vraie révolution dans la gestion scolaire nationale.",
      auteur: 'Inspecteur A. Ngo',
      role: "Inspecteur d'académie",
      avatar: 'AN'
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPublishedSchools();
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.temoignages.length;
    }, 4500);
  }

  ngOnDestroy(): void {
    clearInterval(this.testimonialInterval);
    document.body.style.overflow = '';
  }

  // ── Chargement initial ────────────────────────────────────
  loadPublishedSchools(): void {
    this.isLoadingSchools.set(true);
    this.schoolListService.searchPublicEstablishments({}).subscribe({
      next: (response) => {
        this.allEstablishments.set(response.results ?? []);
        this.totalPublished.set(response.count ?? 0);
        this.isLoadingSchools.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement établissements publics :', err);
        this.isLoadingSchools.set(false);
      }
    });
  }

  // ── Recherche via API (bouton Rechercher) ─────────────────
  onSearch(): void {
    this.isLoadingSchools.set(true);
    this.schoolListService.searchPublicEstablishments({
      nom:   this.searchNom().trim()      || undefined,
      ville: this.searchLocation().trim() || undefined,
      type:  this.searchType() !== 'Tous types' ? this.searchType() : undefined,
    }).subscribe({
      next: (response) => {
        this.allEstablishments.set(response.results ?? []);
        this.totalPublished.set(response.count ?? 0);
        this.isLoadingSchools.set(false);
      },
      error: (err) => {
        console.error('Erreur filtrage établissements :', err);
        this.isLoadingSchools.set(false);
      }
    });
  }

  // ── Réinitialiser les filtres ─────────────────────────────
  onReset(): void {
    this.searchNom.set('');
    this.searchLocation.set('');
    this.searchNiveau.set('Tous niveaux');
    this.searchType.set('Tous types');
    this.loadPublishedSchools();
  }

  // ── Modal ─────────────────────────────────────────────────
  openDetail(id: number): void {
    const found = this.allEstablishments().find(e => e.id === id) ?? null;
    this.selectedEstablishment.set(found);
    if (found) document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedEstablishment.set(null);
    document.body.style.overflow = '';
  }

  // ── Divers ────────────────────────────────────────────────
  setTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // ── Helpers visuels ───────────────────────────────────────
  getTypeTag(type: string): string {
    const tags: Record<string, string> = {
      primaire:   'Primaire',
      secondaire: 'Secondaire',
      universite: 'Supérieur',
      lycee:      'Lycée',
      autre:      'Autre',
    };
    return tags[type?.toLowerCase()] ?? type;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      primaire:   '#2d7a4f',
      secondaire: '#0F2D6B',
      universite: '#C8A84B',
      lycee:      '#8b4513',
      autre:      '#6b7280',
    };
    return colors[type?.toLowerCase()] ?? '#0F2D6B';
  }

  getSchoolImage(school: Establishment): string {
    const defaultImages: Record<string, string> = {
      primaire:   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
      secondaire: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&q=80',
      universite: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&q=80',
      lycee:      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&q=80',
    };
    return defaultImages[school.type?.toLowerCase()] ?? defaultImages['secondaire'];
  }
}