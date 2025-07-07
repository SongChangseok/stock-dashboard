import React from 'react';
import { TrendingUp, TrendingDown, Shield, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface AnalyticsMetrics {
  performanceMetrics: {
    totalReturn: number;
    totalReturnPercent: number;
  };
  riskMetrics: {
    sharpeRatio: number;
    portfolioVolatility: number;
  };
  diversificationMetrics: {
    effectiveNumberOfStocks: number;
  };
}

interface AnalyticsOverviewProps {
  analytics: AnalyticsMetrics;
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = React.memo(({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
}) => {
  const trendColors = {
    up: 'text-spotify-green',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-spotify-green/10 rounded-lg">
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`${trendColors[trend]}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
});

AnalyticsCard.displayName = 'AnalyticsCard';

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = React.memo(({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnalyticsCard
        title="Total Return"
        value={formatCurrency(analytics.performanceMetrics.totalReturn)}
        subtitle={formatPercent(analytics.performanceMetrics.totalReturnPercent)}
        icon={<TrendingUp className="w-6 h-6 text-spotify-green" />}
        trend={analytics.performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
      />
      
      <AnalyticsCard
        title="Sharpe Ratio"
        value={analytics.riskMetrics.sharpeRatio.toFixed(2)}
        subtitle="Risk-adjusted return"
        icon={<Shield className="w-6 h-6 text-blue-400" />}
        trend={
          analytics.riskMetrics.sharpeRatio > 1
            ? 'up'
            : analytics.riskMetrics.sharpeRatio < 0
              ? 'down'
              : 'neutral'
        }
      />
      
      <AnalyticsCard
        title="Portfolio Volatility"
        value={`${analytics.riskMetrics.portfolioVolatility.toFixed(1)}%`}
        subtitle="Risk measure"
        icon={<Activity className="w-6 h-6 text-orange-400" />}
        trend={
          analytics.riskMetrics.portfolioVolatility < 15
            ? 'up'
            : analytics.riskMetrics.portfolioVolatility > 25
              ? 'down'
              : 'neutral'
        }
      />
      
      <AnalyticsCard
        title="Diversification"
        value={`${analytics.diversificationMetrics.effectiveNumberOfStocks.toFixed(1)}`}
        subtitle="Effective positions"
        icon={<PieChartIcon className="w-6 h-6 text-purple-400" />}
        trend={
          analytics.diversificationMetrics.effectiveNumberOfStocks > 5
            ? 'up'
            : 'neutral'
        }
      />
    </div>
  );
});

AnalyticsOverview.displayName = 'AnalyticsOverview';

export default AnalyticsOverview;