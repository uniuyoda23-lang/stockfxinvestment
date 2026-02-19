interface Sector {
  name: string;
  value: number;
  size: number;
}

interface GainLossHeatmapProps {
  title?: string;
  sectors?: Sector[];
}

export function GainLossHeatmap({
  title = 'Market Heatmap',
  sectors = [
    { name: 'Technology', value: 18.5, size: 35 },
    { name: 'Healthcare', value: 12.3, size: 20 },
    { name: 'Financials', value: 8.7, size: 18 },
    { name: 'Industrials', value: -3.2, size: 15 },
    { name: 'Consumer', value: 5.4, size: 12 },
    { name: 'Energy', value: -1.8, size: 10 },
    { name: 'Materials', value: 2.1, size: 8 },
    { name: 'Utilities', value: -0.5, size: 6 },
  ]
}: GainLossHeatmapProps) {
  const getColorClass = (value: number) => {
    if (value >= 15) return 'bg-emerald-600';
    if (value >= 10) return 'bg-emerald-500';
    if (value >= 5) return 'bg-emerald-400';
    if (value >= 0) return 'bg-emerald-100';
    if (value >= -5) return 'bg-red-100';
    if (value >= -10) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getTextColor = (value: number) => {
    if (value >= 5 || value <= -5) return 'text-white';
    return 'text-slate-900';
  };

  const totalSize = sectors.reduce((sum, s) => sum + s.size, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">Sector Performance</span>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sectors.map((sector) => {
            const sizePercent = (sector.size / totalSize) * 100;
            return (
              <button
                key={sector.name}
                className={`${getColorClass(sector.value)} ${getTextColor(sector.value)} rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity duration-200`}
                style={{
                  aspectRatio: '1 / 1',
                  fontSize: sizePercent > 8 ? '0.875rem' : '0.75rem',
                }}
              >
                <p className="font-semibold text-center mb-1">{sector.name}</p>
                <p className="font-bold text-center">{sector.value > 0 ? '+' : ''}{sector.value.toFixed(1)}%</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-6 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-3 uppercase">Gain/Loss Scale</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-xs text-slate-600">&lt; -10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-xs text-slate-600">-10% to -5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-100 rounded"></div>
            <span className="text-xs text-slate-600">-5% to +5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-xs text-slate-600">+5% to +15%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded"></div>
            <span className="text-xs text-slate-600">&gt; +15%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
