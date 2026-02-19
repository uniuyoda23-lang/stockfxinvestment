import { AssetAllocationChart } from './AssetAllocationChart';
import { MarketTrendsChart } from './MarketTrendsChart';
import { TopPerformersTable } from './TopPerformersTable';
import { PriceMovementCard } from './PriceMovementCard';
import { GainLossHeatmap } from './GainLossHeatmap';

export function VisualizationsShowcase() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Investment Visualizations</h1>
        <p className="text-emerald-100 text-lg">Advanced charting and analytics for your portfolio management</p>
      </div>

      {/* Section 1: Core Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Core Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MarketTrendsChart />
          <AssetAllocationChart />
        </div>
      </div>

      {/* Section 2: Market Overview */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Market Overview</h2>
        <div className="space-y-8">
          <GainLossHeatmap />
          <TopPerformersTable />
        </div>
      </div>

      {/* Section 3: Asset Details */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PriceMovementCard
            symbol="AAPL"
            name="Apple Inc."
            currentPrice={195.80}
            previousPrice={175.20}
            high={198.50}
            low={174.25}
            volume="45.2M" />
          <PriceMovementCard
            symbol="TSLA"
            name="Tesla Inc."
            currentPrice={245.30}
            previousPrice={220.50}
            high={248.75}
            low={215.20}
            volume="32.1M" />
          <PriceMovementCard
            symbol="MSFT"
            name="Microsoft"
            currentPrice={420.50}
            previousPrice={395.20}
            high={425.80}
            low={390.15}
            volume="28.5M" />
          <PriceMovementCard
            symbol="BTC"
            name="Bitcoin"
            currentPrice={34200.50}
            previousPrice={32150.00}
            high={35620.00}
            low={31800.00}
            volume="2.1B" />
        </div>
      </div>

      {/* Features Summary */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 mt-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Visualization Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Portfolio Chart',
              description: 'Time-range based portfolio performance with interactive selection',
              icon: '📊'
            },
            {
              title: 'Asset Allocation',
              description: 'Pie chart showing distribution across asset classes',
              icon: '🥧'
            },
            {
              title: 'Market Trends',
              description: '7-day market trends visualization with statistics',
              icon: '📈'
            },
            {
              title: 'Price Movements',
              description: 'Detailed price cards with 52-week range indicators',
              icon: '💹'
            },
            {
              title: 'Sector Heatmap',
              description: 'Interactive heatmap showing sector performance',
              icon: '🔥'
            },
            {
              title: 'Top Performers',
              description: 'Table showing best performing assets with metrics',
              icon: '⭐'
            }
          ].map((feature, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <p className="text-3xl mb-2">{feature.icon}</p>
              <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
