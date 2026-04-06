export default function StatCard({ icon, label, value, sub, className = '' }) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
