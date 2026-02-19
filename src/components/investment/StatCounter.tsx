interface StatCounterProps {
  label: string;
  value: string;
  icon?: string;
  trend?: 'up' | 'down';
}

export function StatCounter({ label, value, icon, trend }: StatCounterProps) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        {icon && <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>}
        {trend && (
          <span className={`text-sm font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {Math.abs(Math.random() * 10).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-4xl font-black text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text mb-2">
        {value}
      </div>
      <p className="text-slate-300 text-sm group-hover:text-white transition">{label}</p>
    </div>
  );
}
