// src/types/index.ts

export type UserRole = 'super_admin' | 'responsable_pedagogique' | 'assistante' | 'etudiant_groupe';

export type CommandeStatus =
  | 'en_attente'
  | 'refusee'
  | 'validee'
  | 'commandee'
  | 'non_commandable'
  | 'colis_arrive'
  | 'receptionnee';

export interface Profile {
  id: string;
  role: UserRole;
  nom: string | null;
}

export interface Fournisseur {
  id: number;
  nom: string;
  site_web: string | null;
  actif: boolean;
}

export interface Promotion {
  id: number;
  nom: string;
  annee_academique: string;
  budget_par_groupe: number;
  created_at: string;
}

export interface Groupe {
  id: number;
  promotion_id: number;
  nom: string;
  user_id: string | null;
  created_at: string;
  promotions?: Promotion;
}

export interface Commande {
  id: number;
  groupe_id: number;
  lien_produit: string;
  description: string;
  fournisseur_id: number | null;
  prix_estime: number;
  prix_reel: number | null;
  email_referent: string;
  statut: CommandeStatus;
  date_creation: string;
  date_validation: string | null;
  date_commande: string | null;
  date_colis_arrive: string | null;
  date_reception: string | null;
  date_mise_a_jour: string;
  validated_by: string | null;
  ordered_by: string | null;
  // Joined
  groupes?: Groupe & { promotions?: Promotion };
  fournisseurs?: Fournisseur;
}

export interface BudgetGroupe {
  groupe_id: number;
  groupe_nom: string;
  promotion_id: number;
  promotion_nom: string;
  budget_total: number;
  budget_consomme: number;
  budget_restant: number;
}

export const STATUS_LABELS: Record<CommandeStatus, string> = {
  en_attente: 'En attente de validation',
  refusee: 'Refusée',
  validee: 'Validée — en attente de commande',
  commandee: 'Commandée',
  non_commandable: 'Non commandable',
  colis_arrive: 'Colis arrivé',
  receptionnee: 'Réceptionnée',
};

export const STATUS_COLORS: Record<CommandeStatus, string> = {
  en_attente: 'bg-amber-100 text-amber-800 border-amber-200',
  refusee: 'bg-red-100 text-red-800 border-red-200',
  validee: 'bg-blue-100 text-blue-800 border-blue-200',
  commandee: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  non_commandable: 'bg-gray-100 text-gray-600 border-gray-200',
  colis_arrive: 'bg-purple-100 text-purple-800 border-purple-200',
  receptionnee: 'bg-green-100 text-green-800 border-green-200',
};
