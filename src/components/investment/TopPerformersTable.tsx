import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface Performer {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  marketCap?: string;
}

interface TopPerformersTableProps {
  data?: Performer[];
  title?: string;
  limit?: number;
}

export function TopPerformersTable({
  data = [
    { symbol: 'NVDA', name: 'NVIDIA', price: 875.50, change: 125.50, changePercent: 16.74, volume: '$2.5B', marketCap: '$2.1T' },
    { symbol: 'TSLA', name: 'Tesla', price: 245.30, change: 45.30, changePercent: 22.58, volume: '$1.8B', marketCap: '$850B' },
    { symbol: 'MSFT', name: 'Microsoft', price: 420.50, change: 80.50, changePercent: 23.68, volume: '$2.2B', marketCap: '$3.1T' },
    { symbol: 'AAPL', name: 'Apple', price: 195.80, change: 25.80, changePercent: 15.18, volume: '$1.5B', marketCap: '$3.2T' },
    { symbol: 'META', name: 'Meta', price: 538.90, change: 88.90, changePercent: 19.77, volume: '$1.2B', marketCap: '$1.6T' },
  ],
  title = 'Top Performers',
  limit = 5
}: TopPerformersTableProps) {
  const displayData = data.slice(0, limit);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <TrendingUp className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Symbol</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Change</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">%</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Volume</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={item.symbol} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === displayData.length - 1 ? 'border-0' : ''}`}>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{item.symbol.substring(0, 1)}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.symbol}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-slate-700">{item.name}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-emerald-600">+${item.change.toFixed(2)}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-600">{item.changePercent.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-slate-600">{item.volume}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <button className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
          View All Performers
        </button>
      </div>
    </div>
  );
}
