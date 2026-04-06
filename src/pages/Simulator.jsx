import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator } from 'lucide-react';

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function Simulator() {
  const [form, setForm] = useState({
    initial: 10000,
    monthly: 200,
    rate: 7,
    years: 20,
  });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const data = useMemo(() => {
    const monthlyRate = parseFloat(form.rate) / 100 / 12;
    const months = parseInt(form.years) * 12;
    const init = parseFloat(form.initial) || 0;
    const monthly = parseFloat(form.monthly) || 0;
    const points = [];

    let capital = init;
    let totalDeposits = init;

    for (let m = 0; m <= months; m++) {
      if (m % 12 === 0) {
        points.push({
          year: m / 12,
          capital: Math.round(capital),
          deposits: Math.round(totalDeposits),
          interests: Math.round(capital - totalDeposits),
        });
      }
      if (m < months) {
        capital = capital * (1 + monthlyRate) + monthly;
        totalDeposits += monthly;
      }
    }
    return points;
  }, [form.initial, form.monthly, form.rate, form.years]);

  const finalCapital = data.length > 0 ? data[data.length - 1].capital : 0;
  const finalDeposits = data.length > 0 ? data[data.length - 1].deposits : 0;
  const finalInterests = finalCapital - finalDeposits;

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Simulateur</h1>
        <p className="text-sm text-slate-400 mt-1">Projection de croissance par interets composes</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Parametres</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Montant initial (EUR)</label>
              <input type="number" min="0" step="100" value={form.initial} onChange={update('initial')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Versement mensuel (EUR)</label>
              <input type="number" min="0" step="50" value={form.monthly} onChange={update('monthly')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Taux d'interet annuel (%)</label>
              <input type="number" min="0" max="50" step="0.1" value={form.rate} onChange={update('rate')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Duree (annees)</label>
              <input type="number" min="1" max="50" step="1" value={form.years} onChange={update('years')} className={inputCls} />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total investi</span>
              <span className="text-white font-medium">{formatEur(finalDeposits)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Interets gagnes</span>
              <span className="text-emerald-400 font-medium">+{formatEur(finalInterests)}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-slate-700/50">
              <span className="text-slate-300 font-medium">Capital final</span>
              <span className="text-white font-bold text-lg">{formatEur(finalCapital)}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white mb-4">Evolution du capital</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => `${v} an${v > 1 ? 's' : ''}`}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
                formatter={(value, name) => [
                  formatEur(value),
                  name === 'capital' ? 'Capital total' : name === 'deposits' ? 'Total investi' : 'Interets',
                ]}
                labelFormatter={(v) => `Annee ${v}`}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#6b7280"
                strokeWidth={2}
                fill="url(#colorDeposits)"
                name="deposits"
              />
              <Area
                type="monotone"
                dataKey="capital"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCapital)"
                name="capital"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
