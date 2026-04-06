import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api';

export default function AddAssetModal({ onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    quantity: 1,
    purchase_price: '',
    current_value: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setForm((f) => ({ ...f, category_id: res.data[0].id }));
      }
    });
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/assets', {
        name: form.name,
        category_id: parseInt(form.category_id),
        quantity: parseFloat(form.quantity) || 1,
        purchase_price: parseFloat(form.purchase_price) || 0,
        current_value: parseFloat(form.current_value),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la creation');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Ajouter un actif</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom de l'actif</label>
            <input
              type="text"
              value={form.name}
              onChange={update('name')}
              required
              placeholder="ex: Appartement Paris, ETF World..."
              className={inputCls}
            />
          </div>

          {/* Category + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Categorie</label>
              <select value={form.category_id} onChange={update('category_id')} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantite</label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.quantity}
                onChange={update('quantity')}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prix d'achat (EUR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.purchase_price}
                onChange={update('purchase_price')}
                required
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Valeur actuelle (EUR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.current_value}
                onChange={update('current_value')}
                required
                placeholder="0.00"
                className={inputCls}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting ? '...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
