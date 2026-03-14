// src/app/dashboard/fournisseurs/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Fournisseur } from '@/types';

export default function FournisseursPage() {
  const supabase = createClient();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', site_web: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('fournisseurs').select('*').order('nom');
    setFournisseurs(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.nom.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    const { error: err } = await supabase.from('fournisseurs').insert({
      nom: form.nom.trim(),
      site_web: form.site_web.trim() || null,
    });
    if (err) setError(err.message);
    else {
      setSuccess('Fournisseur ajouté.');
      setForm({ nom: '', site_web: '' });
      load();
    }
    setSaving(false);
  };

  const toggleActif = async (id: number, actif: boolean) => {
    await supabase.from('fournisseurs').update({ actif: !actif }).eq('id', id);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Fournisseurs</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez la liste des fournisseurs disponibles à la commande.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Liste des fournisseurs</h2>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="table-header">Nom</th>
                <th className="table-header">Site web</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={4} className="table-cell text-center text-slate-400 py-8">Chargement…</td></tr>
              )}
              {!loading && fournisseurs.length === 0 && (
                <tr><td colSpan={4} className="table-cell text-center text-slate-400 py-8">Aucun fournisseur.</td></tr>
              )}
              {fournisseurs.map(f => (
                <tr key={f.id} className={`hover:bg-slate-50 ${!f.actif ? 'opacity-50' : ''}`}>
                  <td className="table-cell font-medium text-slate-900">{f.nom}</td>
                  <td className="table-cell">
                    {f.site_web ? (
                      <a href={f.site_web} target="_blank" rel="noopener noreferrer"
                        className="text-cesi-600 hover:underline text-sm">Voir ↗</a>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${f.actif ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {f.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => toggleActif(f.id, f.actif)}
                      className="text-sm text-slate-500 hover:text-slate-800 underline"
                    >
                      {f.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulaire ajout */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Ajouter un fournisseur</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="form-label">Nom *</label>
              <input type="text" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                className="form-input" placeholder="Ex : Digi-Key" />
            </div>
            <div>
              <label className="form-label">Site web</label>
              <input type="url" value={form.site_web} onChange={e => setForm(p => ({ ...p, site_web: e.target.value }))}
                className="form-input" placeholder="https://…" />
            </div>
            {error && <p className="form-error">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
