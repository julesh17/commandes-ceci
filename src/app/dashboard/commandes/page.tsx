// src/app/dashboard/commandes/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Commande } from '@/types';

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ promotion?: string; groupe?: string; statut?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  const isAdmin = ['super_admin', 'responsable_pedagogique', 'assistante'].includes(profile.role);
  const isEtudiant = profile.role === 'etudiant_groupe';

  let query = supabase
    .from('commandes')
    .select(`
      *,
      groupes(id, nom, promotion_id, promotions(id, nom, annee_academique)),
      fournisseurs(id, nom)
    `)
    .order('date_creation', { ascending: false });

  if (isEtudiant) {
    // Étudiants voient seulement leurs commandes (RLS s'en charge aussi)
    const { data: groupe } = await supabase.from('groupes').select('id').eq('user_id', user.id).single();
    if (groupe) query = query.eq('groupe_id', groupe.id);
  }

  if (params.statut) query = query.eq('statut', params.statut);
  if (params.groupe) query = query.eq('groupe_id', params.groupe);

  const { data: commandes } = await query;

  // Filtres disponibles
  const { data: promotions } = await supabase.from('promotions').select('id, nom').order('nom');
  const { data: groupes } = await supabase.from('groupes').select('id, nom, promotion_id').order('nom');

  const groupesFiltres = params.promotion
    ? groupes?.filter(g => g.promotion_id === parseInt(params.promotion!))
    : groupes;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {commandes?.length || 0} commande{(commandes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        {(isEtudiant || isAdmin) && (
          <Link href="/dashboard/commandes/nouvelle" className="btn-primary">
            + Nouvelle commande
          </Link>
        )}
      </div>

      {/* Filtres admin */}
      {isAdmin && (
        <div className="card p-4 mb-5 flex flex-wrap gap-3">
          <form className="flex flex-wrap gap-3 w-full">
            {profile.role !== 'assistante' && (
              <select
                name="promotion"
                defaultValue={params.promotion || ''}
                className="form-input w-auto min-w-40"
                onChange={e => {
                  const url = new URL(window.location.href);
                  e.target.value ? url.searchParams.set('promotion', e.target.value) : url.searchParams.delete('promotion');
                  url.searchParams.delete('groupe');
                  window.location.href = url.toString();
                }}
              >
                <option value="">Toutes les promotions</option>
                {promotions?.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            )}
            <select
              name="groupe"
              defaultValue={params.groupe || ''}
              className="form-input w-auto min-w-40"
              onChange={e => {
                const url = new URL(window.location.href);
                e.target.value ? url.searchParams.set('groupe', e.target.value) : url.searchParams.delete('groupe');
                window.location.href = url.toString();
              }}
            >
              <option value="">Tous les groupes</option>
              {groupesFiltres?.map(g => (
                <option key={g.id} value={g.id}>{g.nom}</option>
              ))}
            </select>
            <select
              name="statut"
              defaultValue={params.statut || ''}
              className="form-input w-auto min-w-40"
              onChange={e => {
                const url = new URL(window.location.href);
                e.target.value ? url.searchParams.set('statut', e.target.value) : url.searchParams.delete('statut');
                window.location.href = url.toString();
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="refusee">Refusée</option>
              <option value="validee">Validée</option>
              <option value="commandee">Commandée</option>
              <option value="non_commandable">Non commandable</option>
              <option value="colis_arrive">Colis arrivé</option>
              <option value="receptionnee">Réceptionnée</option>
            </select>
            {(params.promotion || params.groupe || params.statut) && (
              <a href="/dashboard/commandes" className="btn-secondary text-xs">
                Réinitialiser
              </a>
            )}
          </form>
        </div>
      )}

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="table-header">N°</th>
                {isAdmin && <th className="table-header">Groupe</th>}
                <th className="table-header">Description</th>
                <th className="table-header">Fournisseur</th>
                <th className="table-header">Prix estimé</th>
                {isAdmin && <th className="table-header">Prix réel</th>}
                <th className="table-header">Statut</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commandes?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 7} className="table-cell text-center text-slate-400 py-10">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
              {commandes?.map((commande: Commande) => (
                <tr key={commande.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-slate-400 text-xs">#{commande.id}</td>
                  {isAdmin && (
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-slate-900">{commande.groupes?.nom}</p>
                        <p className="text-xs text-slate-400">{commande.groupes?.promotions?.nom}</p>
                      </div>
                    </td>
                  )}
                  <td className="table-cell max-w-48">
                    <a href={commande.lien_produit} target="_blank" rel="noopener noreferrer"
                      className="text-cesi-600 hover:underline font-medium line-clamp-1">
                      {commande.description}
                    </a>
                  </td>
                  <td className="table-cell text-slate-600">{commande.fournisseurs?.nom || '—'}</td>
                  <td className="table-cell font-medium">{Number(commande.prix_estime).toFixed(2)} €</td>
                  {isAdmin && (
                    <td className="table-cell text-slate-500">
                      {commande.prix_reel ? `${Number(commande.prix_reel).toFixed(2)} €` : '—'}
                    </td>
                  )}
                  <td className="table-cell">
                    <StatusBadge statut={commande.statut} />
                  </td>
                  <td className="table-cell text-slate-400 text-xs whitespace-nowrap">
                    {new Date(commande.date_creation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="table-cell">
                    <Link
                      href={`/dashboard/commandes/${commande.id}`}
                      className="text-cesi-600 hover:text-cesi-800 text-sm font-medium"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
