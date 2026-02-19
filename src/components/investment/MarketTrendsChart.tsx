interface DataPoint {
  date: string;
  value: number;
}

interface MarketTrendsChartProps {
  title?: string;
  data?: DataPoint[];
}

export function MarketTrendsChart({ 
  title = 'Market Trends (7D)',
  data = [
    { date: '6 days ago', value: 28000 },
    { date: '5 days ago', value: 28500 },
    { date: '4 days ago', value: 27800 },
    { date: '3 days ago', value: 29200 },
    { date: '2 days ago', value: 29800 },
    { date: 'Yesterday', value: 29500 },
    { date: 'Today', value: 30000 },
  ]
}: MarketTrendsChartProps) {
  if (!data || data.length === 0) return null;

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const range = maxValue - minValue;
  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  const change = endValue - startValue;
  const changePercent = ((change / startValue) * 100).toFixed(2);

  // Create SVG path
  const width = 600;
  const height = 200;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + ((maxValue - d.value) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {data[0].date} → {data[data.length - 1].date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">${endValue.toLocaleString()}</p>
          <p className={`text-sm font-medium ${change >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full inline-block mt-1`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent}%)
          </p>
        </div>
      </div>

      <svg width="100%" height="250" viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '250px' }}>
        {/* Background gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={change >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={change >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h-${i}`} x1={padding} y1={padding + (i * chartHeight / 4)} x2={width - padding} y2={padding + (i * chartHeight / 4)} stroke="#e2e8f0" strokeDasharray="4" />
        ))}

        {/* Area fill */}
        <path d={fillPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={pathD} stroke={change >= 0 ? '#10b981' : '#ef4444'} strokeWidth="3" fill="none" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="4" fill={change >= 0 ? '#10b981' : '#ef4444'} />
        ))}
      </svg>

      <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Highest</p>
          <p className="font-bold text-slate-900">${maxValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Lowest</p>
          <p className="font-bold text-slate-900">${minValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Average</p>
          <p className="font-bold text-slate-900">${Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
