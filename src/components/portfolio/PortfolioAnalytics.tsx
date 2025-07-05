import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  PieChart as PieChartIcon,
  Activity,
  Target,
  AlertTriangle,
  Award,
  Map,
  BarChart3,
  LineChart,
  Grid,
} from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { calculatePortfolioAnalytics } from '../../utils/advancedAnalytics';
import { formatCurrency, formatPercent } from '../../utils/formatters';

// Import new chart components
import PortfolioChart from './PortfolioChart';
import TreemapChart from '../charts/TreemapChart';
import HeatmapChart from '../charts/HeatmapChart';
import SectorBarChart from '../charts/SectorBarChart';
import PortfolioHistoryChart from '../charts/PortfolioHistoryChart';
import ProfitLossChart from '../charts/ProfitLossChart';
import PerformanceComparisonChart from '../charts/PerformanceComparisonChart';
import { calculatePortfolioData } from '../../utils/portfolioCalculations';
import { useStockPrices } from '../../contexts/StockPriceContext';

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  className = '',
  trend = 'neutral',
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <div
      className={`glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`${trendColors[trend]}`}>
            {trend === 'up' ? (
              <TrendingUp size={20} />
            ) : (
              <TrendingDown size={20} />
            )}
          </div>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
    </div>
  );
};

const PortfolioAnalytics: React.FC = () => {
  const { state } = usePortfolio();
  const { stockPrices } = useStockPrices();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'performance'
    | 'risk'
    | 'diversification'
    | 'sectors'
    | 'charts'
  >('overview');
  const [chartView, setChartView] = useState<
    | 'distribution'
    | 'treemap'
    | 'heatmap'
    | 'history'
    | 'profit-loss'
    | 'comparison'
  >('distribution');

  const analytics = calculatePortfolioAnalytics(state.stocks);
  const portfolioData = calculatePortfolioData(state.stocks, stockPrices);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
    { id: 'risk', label: 'Risk', icon: <Shield size={16} /> },
    {
      id: 'diversification',
      label: 'Diversification',
      icon: <PieChartIcon size={16} />,
    },
    { id: 'sectors', label: 'Sectors', icon: <Target size={16} /> },
    {
      id: 'charts',
      label: 'Interactive Charts',
      icon: <BarChart3 size={16} />,
    },
  ];

  // Chart colors matching Spotify design system
  const chartColors = [
    '#1DB954',
    '#1ED760',
    '#1AA34A',
    '#16803C',
    '#10B981',
    '#06B6D4',
    '#6366F1',
    '#8B5CF6',
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnalyticsCard
        title="Total Return"
        value={formatCurrency(analytics.performanceMetrics.totalReturn)}
        subtitle={formatPercent(
          analytics.performanceMetrics.totalReturnPercent
        )}
        icon={<TrendingUp size={20} className="text-white" />}
        trend={analytics.performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
      />
      <AnalyticsCard
        title="Sharpe Ratio"
        value={analytics.riskMetrics.sharpeRatio.toFixed(2)}
        subtitle="Risk-adjusted return"
        icon={<Shield size={20} className="text-white" />}
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
        icon={<Activity size={20} className="text-white" />}
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
        icon={<PieChartIcon size={20} className="text-white" />}
        trend={
          analytics.diversificationMetrics.effectiveNumberOfStocks > 5
            ? 'up'
            : 'neutral'
        }
      />
    </div>
  );

  const renderPerformance = () => {
    const performanceData = [
      {
        name: 'Best Performer',
        value:
          ((analytics.performanceMetrics.bestPerformingStock.currentPrice -
            analytics.performanceMetrics.bestPerformingStock.buyPrice) /
            analytics.performanceMetrics.bestPerformingStock.buyPrice) *
            100 || 0,
      },
      {
        name: 'Worst Performer',
        value:
          ((analytics.performanceMetrics.worstPerformingStock.currentPrice -
            analytics.performanceMetrics.worstPerformingStock.buyPrice) /
            analytics.performanceMetrics.worstPerformingStock.buyPrice) *
            100 || 0,
      },
      {
        name: 'Portfolio Average',
        value: analytics.performanceMetrics.totalReturnPercent,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Win/Loss Ratio"
            value={analytics.performanceMetrics.winLossRatio.toFixed(2)}
            subtitle="Winning vs losing positions"
            icon={<Award size={20} className="text-white" />}
            trend={
              analytics.performanceMetrics.winLossRatio > 1 ? 'up' : 'down'
            }
          />
          <AnalyticsCard
            title="Average Gain"
            value={formatCurrency(analytics.performanceMetrics.averageGain)}
            subtitle="Per winning position"
            icon={<TrendingUp size={20} className="text-white" />}
            trend="up"
          />
          <AnalyticsCard
            title="Average Loss"
            value={formatCurrency(analytics.performanceMetrics.averageLoss)}
            subtitle="Per losing position"
            icon={<TrendingDown size={20} className="text-white" />}
            trend="down"
          />
        </div>

        <div className="glass-card-dark rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">
            Performance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [
                  `${value.toFixed(2)}%`,
                  'Return',
                ]}
              />
              <Bar dataKey="value" fill="url(#performanceGradient)" />
              <defs>
                <linearGradient
                  id="performanceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1ED760" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRisk = () => {
    const riskData = [
      {
        subject: 'Volatility',
        A: Math.min(analytics.riskMetrics.portfolioVolatility, 50),
        fullMark: 50,
      },
      {
        subject: 'Beta',
        A: Math.min(analytics.riskMetrics.beta * 20, 50),
        fullMark: 50,
      },
      {
        subject: 'Max Drawdown',
        A: Math.min(Math.abs(analytics.riskMetrics.maxDrawdown), 50),
        fullMark: 50,
      },
      {
        subject: 'VaR',
        A: Math.min(analytics.riskMetrics.valueAtRisk, 50),
        fullMark: 50,
      },
      {
        subject: 'Concentration',
        A: Math.min(analytics.diversificationMetrics.concentrationRisk, 50),
        fullMark: 50,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="Value at Risk (95%)"
            value={`${analytics.riskMetrics.valueAtRisk.toFixed(2)}%`}
            subtitle="Potential loss"
            icon={<AlertTriangle size={20} className="text-white" />}
            trend={analytics.riskMetrics.valueAtRisk < 10 ? 'up' : 'down'}
          />
          <AnalyticsCard
            title="Max Drawdown"
            value={`${analytics.riskMetrics.maxDrawdown.toFixed(2)}%`}
            subtitle="Peak to trough decline"
            icon={<TrendingDown size={20} className="text-white" />}
            trend={analytics.riskMetrics.maxDrawdown > -10 ? 'up' : 'down'}
          />
        </div>

        <div className="glass-card-dark rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">
            Risk Profile
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={riskData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              <Radar
                name="Risk Level"
                dataKey="A"
                stroke="#1DB954"
                fill="#1DB954"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDiversification = () => {
    const diversificationData = [
      {
        name: 'Concentration Risk',
        value: analytics.diversificationMetrics.concentrationRisk,
      },
      {
        name: 'Effective Stocks',
        value: analytics.diversificationMetrics.effectiveNumberOfStocks,
      },
      {
        name: 'Herfindahl Index',
        value: analytics.diversificationMetrics.herfindahlIndex * 100,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Concentration Risk"
            value={`${analytics.diversificationMetrics.concentrationRisk.toFixed(1)}%`}
            subtitle="Largest position"
            icon={<AlertTriangle size={20} className="text-white" />}
            trend={
              analytics.diversificationMetrics.concentrationRisk < 20
                ? 'up'
                : analytics.diversificationMetrics.concentrationRisk > 40
                  ? 'down'
                  : 'neutral'
            }
          />
          <AnalyticsCard
            title="Herfindahl Index"
            value={analytics.diversificationMetrics.herfindahlIndex.toFixed(3)}
            subtitle="Market concentration"
            icon={<PieChartIcon size={20} className="text-white" />}
            trend={
              analytics.diversificationMetrics.herfindahlIndex < 0.2
                ? 'up'
                : 'neutral'
            }
          />
          <AnalyticsCard
            title="Diversification Ratio"
            value={`${(analytics.diversificationMetrics.diversificationRatio * 100).toFixed(1)}%`}
            subtitle="Portfolio efficiency"
            icon={<Target size={20} className="text-white" />}
            trend={
              analytics.diversificationMetrics.diversificationRatio > 0.7
                ? 'up'
                : 'neutral'
            }
          />
        </div>

        <div className="glass-card-dark rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">
            Diversification Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diversificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="url(#diversificationGradient)" />
              <defs>
                <linearGradient
                  id="diversificationGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1ED760" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSectors = () => {
    const sectorData = analytics.sectorAnalysis.sectorAllocation.map(
      (sector, index) => ({
        ...sector,
        color: chartColors[index % chartColors.length],
      })
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-dark rounded-2xl p-6">
            <h3 className="text-white text-lg font-semibold mb-4">
              Sector Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, allocation }) =>
                    `${sector}: ${allocation.toFixed(1)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="allocation"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(1)}%`,
                    'Allocation',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card-dark rounded-2xl p-6">
            <h3 className="text-white text-lg font-semibold mb-4">
              Sector Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.sectorAnalysis.sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sector" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    'Return',
                  ]}
                />
                <Bar dataKey="returnPercent" fill="url(#sectorGradient)" />
                <defs>
                  <linearGradient
                    id="sectorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1ED760" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card-dark rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">
            Sector Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-gray-300 p-2">Sector</th>
                  <th className="text-right text-gray-300 p-2">Allocation</th>
                  <th className="text-right text-gray-300 p-2">Value</th>
                  <th className="text-right text-gray-300 p-2">Return</th>
                  <th className="text-right text-gray-300 p-2">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sectorAnalysis.sectorAllocation.map(
                  (allocation, index) => {
                    const performance =
                      analytics.sectorAnalysis.sectorPerformance[index];
                    const risk = analytics.sectorAnalysis.sectorRisk[index];
                    return (
                      <tr
                        key={allocation.sector}
                        className="border-b border-white/10"
                      >
                        <td className="text-white p-2 font-medium">
                          {allocation.sector}
                        </td>
                        <td className="text-right text-gray-300 p-2">
                          {allocation.allocation.toFixed(1)}%
                        </td>
                        <td className="text-right text-gray-300 p-2">
                          {formatCurrency(allocation.value)}
                        </td>
                        <td
                          className={`text-right p-2 ${performance?.returnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {performance?.returnPercent.toFixed(2) || '0.00'}%
                        </td>
                        <td className="text-right text-gray-300 p-2">
                          {risk?.volatility.toFixed(1) || '0.0'}%
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    const chartTabs = [
      {
        id: 'distribution',
        label: 'Distribution',
        icon: <PieChartIcon size={16} />,
      },
      { id: 'treemap', label: 'Treemap', icon: <Map size={16} /> },
      { id: 'heatmap', label: 'Heatmap', icon: <Grid size={16} /> },
      { id: 'history', label: 'History', icon: <LineChart size={16} /> },
      { id: 'profit-loss', label: 'P&L', icon: <BarChart3 size={16} /> },
      { id: 'comparison', label: 'Benchmark', icon: <Target size={16} /> },
    ];

    return (
      <div className="space-y-6">
        {/* Chart Navigation */}
        <div className="glass-card-dark rounded-xl p-2">
          <div className="flex flex-wrap gap-2">
            {chartTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setChartView(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    chartView === tab.id
                      ? 'bg-spotify-green text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Content */}
        <div className="min-h-[500px]">
          {chartView === 'distribution' && (
            <PortfolioChart data={portfolioData} />
          )}
          {chartView === 'treemap' && <TreemapChart data={portfolioData} />}
          {chartView === 'heatmap' && <HeatmapChart stocks={state.stocks} />}
          {chartView === 'history' && <PortfolioHistoryChart />}
          {chartView === 'profit-loss' && <ProfitLossChart />}
          {chartView === 'comparison' && <PerformanceComparisonChart />}
        </div>

        {/* Additional Charts for Sectors */}
        {chartView === 'distribution' && (
          <SectorBarChart stocks={state.stocks} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformance();
      case 'risk':
        return renderRisk();
      case 'diversification':
        return renderDiversification();
      case 'sectors':
        return renderSectors();
      case 'charts':
        return renderCharts();
      default:
        return renderOverview();
    }
  };

  if (state.stocks.length === 0) {
    return (
      <div className="glass-card-dark rounded-2xl p-8 text-center">
        <Activity size={48} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">
          No Data Available
        </h3>
        <p className="text-slate-400">
          Add some stocks to your portfolio to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="glass-card-dark rounded-2xl p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-gradient-secondary/20 hover:scale-105'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default PortfolioAnalytics;
