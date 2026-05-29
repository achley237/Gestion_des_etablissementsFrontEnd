import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Etablissement {
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  searchLocation: string = '';
  searchNiveau: string = 'Tous niveaux';
  searchType: string = 'Tous types';
  mobileMenuOpen: boolean = false;
  activeTestimonial: number = 0;
  private testimonialInterval: any;

  niveaux: string[] = ['Tous niveaux', 'Primaire', 'Secondaire', 'Lycée', 'Université', 'Formation Pro'];
  types: string[] = ['Tous types', 'Public', 'Privé', 'Mixte', 'International'];

  stats: Stat[] = [
    { valeur: '1 240+', label: 'Établissements', icone: '' },
    { valeur: '48',     label: 'Régions',         icone: '' },
    { valeur: '12K+',   label: 'Avis publiés',    icone: '' },
    { valeur: '320',    label: 'Directeurs actifs', icone: '' },
  ];

  etablissements: Etablissement[] = [
    {
      id: 1,
      nom: 'Lycée Général Leclerc',
      ville: 'Yaoundé', pays: 'Cameroun',
      type: 'Public', niveau: 'Lycée', note: 4.8,
      tag: 'Excellence',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&q=80',
      couleur: '#0F2D6B'
    },
    {
      id: 2,
      nom: 'Collège La Retraite',
      ville: 'Douala', pays: 'Cameroun',
      type: 'Privé', niveau: 'Secondaire', note: 4.6,
      tag: 'Catholique',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&q=80',
      couleur: '#C8A84B'
    },
    {
      id: 3,
      nom: 'École Bilingue de Bafoussam',
      ville: 'Bafoussam', pays: 'Cameroun',
      type: 'Bilingue', niveau: 'Primaire', note: 4.5,
      tag: 'Bilingue',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
      couleur: '#2d7a4f'
    },
  ];

  categories: Categorie[] = [
    { nom: 'Sciences',    icone: '🔬', couleur: '#e8f0fe', count: 142 },
    { nom: 'Arts & Design', icone: '🎨', couleur: '#fce8ff', count: 87 },
    { nom: 'Athlétisme', icone: '⚽', couleur: '#e8fff0', count: 64 },
    { nom: 'Langues',    icone: '🌐', couleur: '#fff8e8', count: 210 },
    { nom: 'Littérature', icone: '📖', couleur: '#ffe8e8', count: 98 },
    { nom: 'IT & Coding', icone: '💻', couleur: '#e8f8ff', count: 175 },
  ];

  temoignages: Temoignage[] = [
    {
      texte: 'Le CAMPUS237 m\'a permis de trouver l\'établissement idéal pour mon enfant en quelques minutes. Interface claire et complète.',
      auteur: 'Marie Kouam', role: 'Parent d\'élève', avatar: 'MK'
    },
    {
      texte: 'En tant que directeur, je peux mettre à jour les informations de mon établissement facilement et toucher plus de familles.',
      auteur: 'Dr. Paul Mbida', role: 'Directeur — Lycée Bilingue', avatar: 'PM'
    },
    {
      texte: 'L\'annuaire le plus complet du pays. Une vraie révolution dans la gestion scolaire nationale.',
      auteur: 'Inspecteur A. Ngo', role: 'Inspecteur d\'académie', avatar: 'AN'
    }
  ];

  ngOnInit(): void {
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.temoignages.length;
    }, 4500);
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  onSearch(): void {
    console.log('Recherche :', {
      location: this.searchLocation,
      niveau: this.searchNiveau,
      type: this.searchType
    });
    // TODO: router.navigate(['/etablissements'], { queryParams: { ... } })
  }

  setTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}