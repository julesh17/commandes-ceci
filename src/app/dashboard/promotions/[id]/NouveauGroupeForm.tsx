// src/app/dashboard/promotions/[id]/NouveauGroupeForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  promotionId: number;
}

export default function NouveauGroupeForm({ promotionId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: '',
    nom_compte: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nom.trim()) { setError('Le nom du groupe est requis.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Un email valide est requis pour le compte étudiant.'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }

    setLoading(true);

    const res = await fetch('/api/groupes/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promotion_id: promotionId,
        nom_groupe: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        nom_compte: form.nom_compte.trim() || form.nom.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue.');
    } else {
      setSuccess(`Groupe "${form.nom}" créé avec succès !`);
      setForm({ nom: '', email: '', password: '', nom_compte: '' });
      router.refresh();
    }

    setLoading(false);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Créer un groupe</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Nom du groupe *</label>
          <input type="text" value={form.nom} onChange={set('nom')}
            className="form-input" placeholder="Ex : Groupe A, Équipe 1…" />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Compte étudiant du groupe
          </p>
          <div className="space-y-3">
            <div>
              <label className="form-label">Nom affiché</label>
              <input type="text" value={form.nom_compte} onChange={set('nom_compte')}
                className="form-input" placeholder="Ex : Groupe A — Bachelor Info" />
            </div>
            <div>
              <label className="form-label">Email du compte *</label>
              <input type="email" value={form.email} onChange={set('email')}
                className="form-input" placeholder="groupe-a@exemple.fr" />
              <p className="text-xs text-slate-400 mt-1">Email utilisé pour la connexion du groupe.</p>
            </div>
            <div>
              <label className="form-label">Mot de passe *</label>
              <input type="text" value={form.password} onChange={set('password')}
                className="form-input" placeholder="Minimum 6 caractères" />
              <p className="text-xs text-slate-400 mt-1">
                Transmettez ce mot de passe au groupe. Il peut être simple et partageable.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Création…' : 'Créer le groupe'}
        </button>
      </form>
    </div>
  );
}
