import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceMovementCardProps {
  symbol: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  high: number;
  low: number;
  volume?: string;
}

export function PriceMovementCard({
  symbol = 'AAPL',
  name = 'Apple Inc.',
  currentPrice = 195.80,
  previousPrice = 175.20,
  high = 198.50,
  low = 174.25,
  volume = '45.2M'
}: PriceMovementCardProps) {
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100);
  const isPositive = change >= 0;
  const priceRange = high - low;
  const pricePosition = ((currentPrice - low) / priceRange) * 100;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{symbol.substring(0, 1)}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{symbol}</h3>
              <p className="text-sm text-slate-500">{name}</p>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isPositive ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="mb-6 pb-6 border-b border-slate-200">
        <p className="text-3xl font-bold text-slate-900 mb-1">${currentPrice.toFixed(2)}</p>
        <p className={`text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${change.toFixed(2)} from previous close
        </p>
      </div>

      {/* Price Range Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-600">52-Week Range</span>
          <div className="text-right">
            <p className="text-xs text-slate-900 font-semibold">${low.toFixed(2)} — ${high.toFixed(2)}</p>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} rounded-full transition-all duration-300`}
            style={{ width: `${pricePosition}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Volume</p>
          <p className="font-semibold text-slate-900">{volume}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Change</p>
          <p className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}${change.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300">
        Trade {symbol}
      </button>
    </div>
  );
}
