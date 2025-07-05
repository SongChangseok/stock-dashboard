import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { usePortfolioHistory } from '../../contexts/PortfolioHistoryContext';
import { formatCurrency } from '../../utils/formatters';

interface PerformanceMetricsProps {
  className?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  className = '',
}) => {
  const { state } = usePortfolioHistory();
  const { metrics } = state;

  if (!metrics) {
    return (
      <div
        className={`bg-spotify-gray p-6 rounded-lg border border-gray-700 ${className}`}
      >
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No performance data available</p>
          <p className="text-sm text-gray-500 mt-2">
            Take portfolio snapshots to see performance metrics
          </p>
        </div>
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
    return isPositive ? 'text-green-400' : 'text-red-400';
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

  const advancedMetrics = [
    {
      label: 'Sortino Ratio',
      value: formatRatio(metrics.sortino),
      description: 'Downside risk-adjusted return',
      colorClass: getColorClass(metrics.sortino),
    },
    {
      label: 'Calmar Ratio',
      value: formatRatio(metrics.calmarRatio),
      description: 'Return vs max drawdown',
      colorClass: getColorClass(metrics.calmarRatio),
    },
    {
      label: 'Profit Factor',
      value: formatRatio(metrics.profitFactor),
      description: 'Gross profit / gross loss',
      colorClass: getColorClass(metrics.profitFactor - 1),
    },
    {
      label: 'Average Gain',
      value: formatPercentage(metrics.averageGain),
      description: 'Mean positive return',
      colorClass: getColorClass(metrics.averageGain),
    },
    {
      label: 'Average Loss',
      value: formatPercentage(metrics.averageLoss),
      description: 'Mean negative return',
      colorClass: getColorClass(metrics.averageLoss, true),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={index}
              className="bg-spotify-gray p-4 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400">
                  {metric.title}
                </h3>
                <IconComponent size={20} className="text-gray-400" />
              </div>
              <div className="space-y-1">
                <div className={`text-xl font-bold ${metric.colorClass}`}>
                  {metric.value}
                </div>
                <div className="text-sm text-gray-500">{metric.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Metrics */}
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Advanced Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  {metric.label}
                </span>
                <span className={`text-sm font-semibold ${metric.colorClass}`}>
                  {metric.value}
                </span>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Metrics Summary */}
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {formatPercentage(metrics.volatility)}
            </div>
            <div className="text-sm text-gray-400 mb-1">Volatility</div>
            <div className="text-xs text-gray-500">
              {metrics.volatility < 15
                ? 'Low Risk'
                : metrics.volatility < 25
                  ? 'Medium Risk'
                  : 'High Risk'}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-2 ${getColorClass(metrics.sharpeRatio)}`}
            >
              {formatRatio(metrics.sharpeRatio)}
            </div>
            <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
            <div className="text-xs text-gray-500">
              {metrics.sharpeRatio > 2
                ? 'Excellent'
                : metrics.sharpeRatio > 1
                  ? 'Good'
                  : metrics.sharpeRatio > 0
                    ? 'Fair'
                    : 'Poor'}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-2 ${getColorClass(metrics.maxDrawdownPercent, true)}`}
            >
              {formatPercentage(metrics.maxDrawdownPercent)}
            </div>
            <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
            <div className="text-xs text-gray-500">
              {Math.abs(metrics.maxDrawdownPercent) < 10
                ? 'Low Drawdown'
                : Math.abs(metrics.maxDrawdownPercent) < 20
                  ? 'Moderate Drawdown'
                  : 'High Drawdown'}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Best Performing Period:</span>
            <span className="text-green-400 font-semibold">
              {metrics.winRate > 60
                ? 'Strong uptrend'
                : metrics.winRate > 50
                  ? 'Positive trend'
                  : 'Mixed performance'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Risk-Adjusted Performance:</span>
            <span
              className={`font-semibold ${getColorClass(metrics.sharpeRatio)}`}
            >
              {metrics.sharpeRatio > 1
                ? 'Above average'
                : metrics.sharpeRatio > 0
                  ? 'Average'
                  : 'Below average'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Consistency:</span>
            <span
              className={`font-semibold ${
                metrics.volatility < 15
                  ? 'text-green-400'
                  : metrics.volatility < 25
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {metrics.volatility < 15
                ? 'High'
                : metrics.volatility < 25
                  ? 'Medium'
                  : 'Low'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
