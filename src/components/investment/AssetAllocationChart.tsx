interface AssetAllocationChartProps {
  data?: Array<{ name: string; value: number; color: string; percentage: number }>;
}

export function AssetAllocationChart({ 
  data = [
    { name: 'Stocks', value: 15000, color: 'bg-blue-500', percentage: 50 },
    { name: 'Crypto', value: 6000, color: 'bg-orange-500', percentage: 20 },
    { name: 'Bonds', value: 6000, color: 'bg-green-500', percentage: 20 },
    { name: 'Cash', value: 3000, color: 'bg-purple-500', percentage: 10 }
  ]
}: AssetAllocationChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Asset Allocation</h3>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Pie Chart SVG */}
        <div className="flex-shrink-0">
          <svg className="w-48 h-48" viewBox="0 0 200 200">
            {data.reduce((acc, item, index) => {
              const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.percentage * 3.6), 0);
              const endAngle = startAngle + (item.percentage * 3.6);
              
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 100 + 80 * Math.cos(startRad);
              const y1 = 100 + 80 * Math.sin(startRad);
              const x2 = 100 + 80 * Math.cos(endRad);
              const y2 = 100 + 80 * Math.sin(endRad);
              
              const largeArc = item.percentage > 50 ? 1 : 0;
              
              const colors = ['#3b82f6', '#f97316', '#22c55e', '#a855f7'];
              
              return acc + `<path d="M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[index]}" stroke="white" strokeWidth="2" />`;
            }, '')}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          {data.map((item, index) => {
            const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500'];
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">${item.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Total Value: <span className="font-bold text-slate-900">${total.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
