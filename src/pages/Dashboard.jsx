import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, TrendingUp, Plus, Package, Trash2, FileDown } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import AddAssetModal from '../components/AddAssetModal';
import { generateBilanPdf } from '../services/exportPdf';

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAssets = useCallback(() => {
    api.get('/api/assets')
      .then((res) => setAssets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet actif ?')) return;
    await api.delete(`/api/assets/${id}`);
    fetchAssets();
  }

  const totalValue = assets.reduce((s, a) => s + a.quantity * a.current_value, 0);
  const totalPurchase = assets.reduce((s, a) => s + a.quantity * a.purchase_price, 0);
  const gain = totalPurchase > 0 ? totalValue - totalPurchase : 0;
  const gainPct = totalPurchase > 0 ? ((gain / totalPurchase) * 100).toFixed(1) : null;

  // Pie chart data — group by category_name (comes from JOIN)
  const categoryMap = {};
  const colorMap = {};
  for (const a of assets) {
    const val = a.quantity * a.current_value;
    categoryMap[a.category_name] = (categoryMap[a.category_name] || 0) + val;
    colorMap[a.category_name] = a.category_color;
  }
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: colorMap[name] || '#6b7280',
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Vue d'ensemble de votre patrimoine</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => generateBilanPdf(assets, user?.email)}
            disabled={assets.length === 0}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            title={assets.length === 0 ? 'Ajoutez des actifs pour generer un bilan' : ''}
          >
            <FileDown className="w-4 h-4" />
            Generer mon Bilan (PDF)
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un actif
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Wallet className="w-5 h-5 text-blue-400" />}
          label="Patrimoine total"
          value={formatEur(totalValue)}
          sub={`${assets.length} actif${assets.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          label="Plus-value"
          value={gainPct !== null ? `${gain >= 0 ? '+' : ''}${formatEur(gain)}` : '--'}
          sub={gainPct !== null ? `${gain >= 0 ? '+' : ''}${gainPct}%` : 'Aucun prix d\'achat renseigne'}
          className={gain >= 0 ? '' : '[&>p:first-of-type]:text-red-400'}
        />
        <StatCard
          icon={<Package className="w-5 h-5 text-amber-400" />}
          label="Categories"
          value={Object.keys(categoryMap).length}
          sub="types d'actifs"
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Repartition par categorie</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
                formatter={(value) => formatEur(value)}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
            Aucun actif — ajoutez-en un pour voir la repartition
          </div>
        )}
      </div>

      {/* Asset table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-base font-semibold text-white">Vos actifs</h2>
        </div>
        {assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                  <th className="px-6 py-3 font-medium">Nom</th>
                  <th className="px-6 py-3 font-medium">Categorie</th>
                  <th className="px-6 py-3 font-medium text-right">Qte</th>
                  <th className="px-6 py-3 font-medium text-right">Prix d'achat</th>
                  <th className="px-6 py-3 font-medium text-right">Valeur actuelle</th>
                  <th className="px-6 py-3 font-medium text-right">Plus-value</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => {
                  const pv = (a.current_value - a.purchase_price) * a.quantity;
                  const pvPct = a.purchase_price > 0
                    ? ((a.current_value - a.purchase_price) / a.purchase_price * 100).toFixed(1)
                    : null;
                  const isPositive = pv >= 0;

                  return (
                    <tr key={a.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{a.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.category_color }} />
                          <span className="text-slate-300">{a.category_name}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300">{a.quantity}</td>
                      <td className="px-6 py-4 text-right text-slate-300">{formatEur(a.purchase_price)}</td>
                      <td className="px-6 py-4 text-right text-white font-medium">{formatEur(a.current_value)}</td>
                      <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{formatEur(pv)}
                        {pvPct !== null && (
                          <span className="block text-xs opacity-70">
                            {isPositive ? '+' : ''}{pvPct}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-white font-semibold">
                        {formatEur(a.quantity * a.current_value)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Aucun actif pour le moment
          </div>
        )}
      </div>

      {showModal && <AddAssetModal onClose={() => setShowModal(false)} onCreated={fetchAssets} />}
    </div>
  );
}
