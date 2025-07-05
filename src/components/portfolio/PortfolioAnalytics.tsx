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
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  PieChart as PieChartIcon,
  Activity,
  Target,
  AlertTriangle,
  Award
} from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { calculatePortfolioAnalytics } from '../../utils/advancedAnalytics';
import { formatCurrency, formatPercent } from '../../utils/formatters';

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
  trend = 'neutral'
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div className={`backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`${trendColors[trend]}`}>
            {trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
        )}
      </div>
      <h3 className="text-gray-300 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {subtitle && (
        <p className="text-gray-400 text-sm">{subtitle}</p>
      )}
    </div>
  );
};

const PortfolioAnalytics: React.FC = () => {
  const { state } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'diversification' | 'sectors'>('overview');
  
  const analytics = calculatePortfolioAnalytics(state.stocks);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
    { id: 'risk', label: 'Risk', icon: <Shield size={16} /> },
    { id: 'diversification', label: 'Diversification', icon: <PieChartIcon size={16} /> },
    { id: 'sectors', label: 'Sectors', icon: <Target size={16} /> }
  ];

  // Chart colors
  const chartColors = [
    '#6366f1', '#8b5cf6', '#10b981', '#06b6d4', 
    '#f59e0b', '#ef4444', '#84cc16', '#ec4899'
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnalyticsCard
        title="Total Return"
        value={formatCurrency(analytics.performanceMetrics.totalReturn)}
        subtitle={formatPercent(analytics.performanceMetrics.totalReturnPercent)}
        icon={<TrendingUp size={20} className="text-indigo-400" />}
        trend={analytics.performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
      />
      <AnalyticsCard
        title="Sharpe Ratio"
        value={analytics.riskMetrics.sharpeRatio.toFixed(2)}
        subtitle="Risk-adjusted return"
        icon={<Shield size={20} className="text-purple-400" />}
        trend={analytics.riskMetrics.sharpeRatio > 1 ? 'up' : analytics.riskMetrics.sharpeRatio < 0 ? 'down' : 'neutral'}
      />
      <AnalyticsCard
        title="Portfolio Volatility"
        value={`${analytics.riskMetrics.portfolioVolatility.toFixed(1)}%`}
        subtitle="Risk measure"
        icon={<Activity size={20} className="text-emerald-400" />}
        trend={analytics.riskMetrics.portfolioVolatility < 15 ? 'up' : analytics.riskMetrics.portfolioVolatility > 25 ? 'down' : 'neutral'}
      />
      <AnalyticsCard
        title="Diversification"
        value={`${analytics.diversificationMetrics.effectiveNumberOfStocks.toFixed(1)}`}
        subtitle="Effective positions"
        icon={<PieChartIcon size={20} className="text-cyan-400" />}
        trend={analytics.diversificationMetrics.effectiveNumberOfStocks > 5 ? 'up' : 'neutral'}
      />
    </div>
  );

  const renderPerformance = () => {
    const performanceData = [
      { name: 'Best Performer', value: ((analytics.performanceMetrics.bestPerformingStock.currentPrice - analytics.performanceMetrics.bestPerformingStock.buyPrice) / analytics.performanceMetrics.bestPerformingStock.buyPrice * 100) || 0 },
      { name: 'Worst Performer', value: ((analytics.performanceMetrics.worstPerformingStock.currentPrice - analytics.performanceMetrics.worstPerformingStock.buyPrice) / analytics.performanceMetrics.worstPerformingStock.buyPrice * 100) || 0 },
      { name: 'Portfolio Average', value: analytics.performanceMetrics.totalReturnPercent }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Win/Loss Ratio"
            value={analytics.performanceMetrics.winLossRatio.toFixed(2)}
            subtitle="Winning vs losing positions"
            icon={<Award size={20} className="text-yellow-400" />}
            trend={analytics.performanceMetrics.winLossRatio > 1 ? 'up' : 'down'}
          />
          <AnalyticsCard
            title="Average Gain"
            value={formatCurrency(analytics.performanceMetrics.averageGain)}
            subtitle="Per winning position"
            icon={<TrendingUp size={20} className="text-green-400" />}
            trend="up"
          />
          <AnalyticsCard
            title="Average Loss"
            value={formatCurrency(analytics.performanceMetrics.averageLoss)}
            subtitle="Per losing position"
            icon={<TrendingDown size={20} className="text-red-400" />}
            trend="down"
          />
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
              />
              <Bar dataKey="value" fill="url(#performanceGradient)" />
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
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
      { subject: 'Volatility', A: Math.min(analytics.riskMetrics.portfolioVolatility, 50), fullMark: 50 },
      { subject: 'Beta', A: Math.min(analytics.riskMetrics.beta * 20, 50), fullMark: 50 },
      { subject: 'Max Drawdown', A: Math.min(Math.abs(analytics.riskMetrics.maxDrawdown), 50), fullMark: 50 },
      { subject: 'VaR', A: Math.min(analytics.riskMetrics.valueAtRisk, 50), fullMark: 50 },
      { subject: 'Concentration', A: Math.min(analytics.diversificationMetrics.concentrationRisk, 50), fullMark: 50 }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="Value at Risk (95%)"
            value={`${analytics.riskMetrics.valueAtRisk.toFixed(2)}%`}
            subtitle="Potential loss"
            icon={<AlertTriangle size={20} className="text-red-400" />}
            trend={analytics.riskMetrics.valueAtRisk < 10 ? 'up' : 'down'}
          />
          <AnalyticsCard
            title="Max Drawdown"
            value={`${analytics.riskMetrics.maxDrawdown.toFixed(2)}%`}
            subtitle="Peak to trough decline"
            icon={<TrendingDown size={20} className="text-red-400" />}
            trend={analytics.riskMetrics.maxDrawdown > -10 ? 'up' : 'down'}
          />
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Risk Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={riskData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              <Radar
                name="Risk Level"
                dataKey="A"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
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
      { name: 'Concentration Risk', value: analytics.diversificationMetrics.concentrationRisk },
      { name: 'Effective Stocks', value: analytics.diversificationMetrics.effectiveNumberOfStocks },
      { name: 'Herfindahl Index', value: analytics.diversificationMetrics.herfindahlIndex * 100 }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Concentration Risk"
            value={`${analytics.diversificationMetrics.concentrationRisk.toFixed(1)}%`}
            subtitle="Largest position"
            icon={<AlertTriangle size={20} className="text-yellow-400" />}
            trend={analytics.diversificationMetrics.concentrationRisk < 20 ? 'up' : analytics.diversificationMetrics.concentrationRisk > 40 ? 'down' : 'neutral'}
          />
          <AnalyticsCard
            title="Herfindahl Index"
            value={analytics.diversificationMetrics.herfindahlIndex.toFixed(3)}
            subtitle="Market concentration"
            icon={<PieChartIcon size={20} className="text-purple-400" />}
            trend={analytics.diversificationMetrics.herfindahlIndex < 0.2 ? 'up' : 'neutral'}
          />
          <AnalyticsCard
            title="Diversification Ratio"
            value={`${(analytics.diversificationMetrics.diversificationRatio * 100).toFixed(1)}%`}
            subtitle="Portfolio efficiency"
            icon={<Target size={20} className="text-indigo-400" />}
            trend={analytics.diversificationMetrics.diversificationRatio > 0.7 ? 'up' : 'neutral'}
          />
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Diversification Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diversificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="url(#diversificationGradient)" />
              <defs>
                <linearGradient id="diversificationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSectors = () => {
    const sectorData = analytics.sectorAnalysis.sectorAllocation.map((sector, index) => ({
      ...sector,
      color: chartColors[index % chartColors.length]
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, allocation }) => `${sector}: ${allocation.toFixed(1)}%`}
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
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">Sector Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.sectorAnalysis.sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sector" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                />
                <Bar dataKey="returnPercent" fill="url(#sectorGradient)" />
                <defs>
                  <linearGradient id="sectorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Sector Details</h3>
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
                {analytics.sectorAnalysis.sectorAllocation.map((allocation, index) => {
                  const performance = analytics.sectorAnalysis.sectorPerformance[index];
                  const risk = analytics.sectorAnalysis.sectorRisk[index];
                  return (
                    <tr key={allocation.sector} className="border-b border-white/10">
                      <td className="text-white p-2 font-medium">{allocation.sector}</td>
                      <td className="text-right text-gray-300 p-2">{allocation.allocation.toFixed(1)}%</td>
                      <td className="text-right text-gray-300 p-2">{formatCurrency(allocation.value)}</td>
                      <td className={`text-right p-2 ${performance?.returnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {performance?.returnPercent.toFixed(2) || '0.00'}%
                      </td>
                      <td className="text-right text-gray-300 p-2">{risk?.volatility.toFixed(1) || '0.0'}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
      default:
        return renderOverview();
    }
  };

  if (state.stocks.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 text-center">
        <Activity size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-gray-400">Add some stocks to your portfolio to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 backdrop-blur-md bg-white/10 rounded-lg border border-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default PortfolioAnalytics;