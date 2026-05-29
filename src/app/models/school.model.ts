export interface Establishment {
  id: number;
  nom: string;
  type: 'primaire' | 'secondaire' | 'lycee' | 'universite' | 'autre';
  adresse: string;
  ville: string;
  region?: string;
  pays: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  niveaux_scolaires: string[];
  capacite?: number;
  annee_creation?: number;
  statut: 'brouillon' | 'en_attente' | 'publie' | 'rejete' | 'archive';
  motif_rejet?: string;
  date_creation: string;
  date_mise_a_jour: string;
}

// Interface pour les filtres de recherche (optionnel)
export interface EstablishmentFilters {
  annee_creation_max?: number;
  annee_creation_min?: number;
  capacite_max?: number;
  capacite_min?: number;
  niveau?: string;
}