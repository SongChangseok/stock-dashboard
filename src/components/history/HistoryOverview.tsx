import React from 'react';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface HistoryMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
}

interface HistoryOverviewProps {
  metrics: HistoryMetrics | null;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = React.memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass
}) => {
  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-spotify-green/10 rounded-lg">
          <Icon className="w-6 h-6 text-spotify-green" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className={`text-2xl font-bold mb-1 ${colorClass}`}>{value}</p>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

const HistoryOverview: React.FC<HistoryOverviewProps> = React.memo(({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Performance Data Available</h3>
        <p className="text-gray-400 mb-4">Take portfolio snapshots to see performance metrics</p>
      </div>
    );
  }

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number): string => {
    return value.toFixed(2);
  };

  const getColorClass = (value: number, inverse: boolean = false): string => {
    if (value === 0) return 'text-gray-400';
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? 'text-spotify-green' : 'text-red-400';
  };

  const metricCards = [
    {
      title: 'Total Return',
      value: formatCurrency(metrics.totalReturn),
      subtitle: formatPercentage(metrics.totalReturnPercent),
      icon: TrendingUp,
      colorClass: getColorClass(metrics.totalReturn),
    },
    {
      title: 'Annualized Return',
      value: formatPercentage(metrics.annualizedReturn),
      subtitle: 'Per year',
      icon: BarChart3,
      colorClass: getColorClass(metrics.annualizedReturn),
    },
    {
      title: 'Volatility',
      value: formatPercentage(metrics.volatility),
      subtitle: 'Standard deviation',
      icon: Activity,
      colorClass: 'text-blue-400',
    },
    {
      title: 'Sharpe Ratio',
      value: formatRatio(metrics.sharpeRatio),
      subtitle: 'Risk-adjusted return',
      icon: Target,
      colorClass: getColorClass(metrics.sharpeRatio),
    },
    {
      title: 'Max Drawdown',
      value: formatCurrency(metrics.maxDrawdown),
      subtitle: formatPercentage(metrics.maxDrawdownPercent),
      icon: TrendingDown,
      colorClass: getColorClass(metrics.maxDrawdown, true),
    },
    {
      title: 'Win Rate',
      value: formatPercentage(metrics.winRate),
      subtitle: 'Positive days',
      icon: PieChart,
      colorClass: getColorClass(metrics.winRate),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metricCards.map((card, index) => (
        <MetricCard
          key={index}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          colorClass={card.colorClass}
        />
      ))}
    </div>
  );
});

HistoryOverview.displayName = 'HistoryOverview';

export default HistoryOverview;