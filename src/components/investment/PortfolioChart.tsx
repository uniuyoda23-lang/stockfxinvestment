import { useState } from 'react';
export function PortfolioChart({ totalBalance = 0 }: { totalBalance?: number }) {
  const [timeRange, setTimeRange] = useState('1M');
  const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Portfolio Performance
          </h3>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold text-slate-900">
              ${totalBalance.toFixed(2)}
            </span>
            <span className="ml-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +0%
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex bg-slate-100 p-1 rounded-lg">
          {ranges.map((range) =>
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`
                px-3 py-1 text-xs font-medium rounded-md transition-all
                ${timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
              `}>

              {range}
            </button>
          )}
        </div>
      </div>

      {/* Chart Placeholder - In a real app, use Recharts or Chart.js */}
      <div className="relative h-64 w-full bg-gradient-to-b from-emerald-50/50 to-transparent rounded-lg border-b border-l border-slate-200 overflow-hidden group">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          {[...Array(5)].map((_, i) =>
          <div
            key={i}
            className="w-full h-px bg-slate-100 border-t border-dashed border-slate-200">
          </div>
          )}
        </div>

        {/* Fake Data Line */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100">

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C10,75 20,85 30,60 C40,35 50,50 60,40 C70,30 80,35 90,20 L100,15 L100,100 L0,100 Z"
            fill="url(#gradient)" />

          <path
            d="M0,80 C10,75 20,85 30,60 C40,35 50,50 60,40 C70,30 80,35 90,20 L100,15"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-md" />


          {/* Interactive Point */}
          <circle
            cx="60"
            cy="40"
            r="3"
            fill="#10B981"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <line
            x1="60"
            y1="0"
            x2="60"
            y2="100"
            stroke="#10B981"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        </svg>

        {/* Tooltip Simulation */}
        <div className="absolute top-1/3 left-[60%] transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-slate-900 text-white text-xs rounded py-1 px-2 shadow-xl mb-2">
            ${Math.max(0, (totalBalance * 0.95)).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
        <span>Nov 1</span>
        <span>Nov 8</span>
        <span>Nov 15</span>
        <span>Nov 22</span>
        <span>Nov 29</span>
      </div>
    </div>);

}