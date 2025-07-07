import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface DashboardSummaryProps {
  totalValue: number;
  totalPositions: number;
  totalProfitLoss: number;
  dayChange?: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = React.memo(({
  totalValue,
  totalPositions,
  totalProfitLoss,
  dayChange = 0
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const cards = [
    {
      title: 'Total Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Positions',
      value: totalPositions.toString(),
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Total P&L',
      value: formatCurrency(totalProfitLoss),
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      color: totalProfitLoss >= 0 ? 'text-spotify-green' : 'text-red-400',
      bgColor: totalProfitLoss >= 0 ? 'bg-spotify-green/10' : 'bg-red-500/10'
    },
    {
      title: 'Day Change',
      value: formatCurrency(dayChange),
      icon: dayChange >= 0 ? TrendingUp : TrendingDown,
      color: dayChange >= 0 ? 'text-spotify-green' : 'text-red-400',
      bgColor: dayChange >= 0 ? 'bg-spotify-green/10' : 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

DashboardSummary.displayName = 'DashboardSummary';

export default DashboardSummary;