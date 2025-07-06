import React, { useState, useMemo } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Activity,
  Info,
} from 'lucide-react';
import { useMultiPortfolio } from '../../contexts/MultiPortfolioContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface PortfolioComparisonChartProps {
  className?: string;
  showLegend?: boolean;
  height?: number;
}

type ChartType = 'bar' | 'pie' | 'radar' | 'line';

const PortfolioComparisonChart: React.FC<PortfolioComparisonChartProps> = ({
  className = '',
  showLegend = true,
  height = 400,
}) => {
  const { getPortfolioComparison } = useMultiPortfolio();
  const [activeChart, setActiveChart] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<
    'value' | 'profitLoss' | 'profitLossPercent'
  >('value');

  const comparisonData = getPortfolioComparison();

  const chartTabs = [
    { id: 'bar' as ChartType, label: 'Bar Chart', icon: <BarChart3 size={16} /> },
    { id: 'pie' as ChartType, label: 'Pie Chart', icon: <PieChartIcon size={16} /> },
    { id: 'radar' as ChartType, label: 'Radar', icon: <Target size={16} /> },
    { id: 'line' as ChartType, label: 'Trend', icon: <Activity size={16} /> },
  ];

  const metricOptions = [
    {
      key: 'value' as const,
      label: 'Total Value',
      format: (value: number) => formatCurrency(value),
      color: '#1DB954',
    },
    {
      key: 'profitLoss' as const,
      label: 'P&L Amount',
      format: (value: number) => formatCurrency(value),
      color: '#06B6D4',
    },
    {
      key: 'profitLossPercent' as const,
      label: 'P&L Percentage',
      format: (value: number) => formatPercent(value),
      color: '#8B5CF6',
    },
  ];

  const currentMetric = metricOptions.find(m => m.key === selectedMetric)!;

  // Prepare data for different chart types
  const chartData = useMemo(() => {
    return comparisonData.comparisonData.map((portfolio, index) => ({
      ...portfolio,
      color: comparisonData.portfolios[index]?.color || '#1DB954',
      displayValue: currentMetric.format(portfolio[selectedMetric]),
    }));
  }, [comparisonData, selectedMetric, currentMetric]);

  // Calculate totals and statistics
  const statistics = useMemo(() => {
    const values = chartData.map(d => d[selectedMetric]);
    const total = values.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = total / values.length;

    return {
      total,
      max,
      min,
      avg,
      count: values.length,
    };
  }, [chartData, selectedMetric]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card-dark rounded-lg p-3 border border-white/20">
          <p className="text-white font-medium mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Total Value:</span>
              <span className="text-white">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">P&L:</span>
              <span
                className={
                  data.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                }
              >
                {formatCurrency(data.profitLoss)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">P&L %:</span>
              <span
                className={
                  data.profitLossPercent >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }
              >
                {formatPercent(data.profitLossPercent)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render different chart types
  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={selectedMetric} fill={currentMetric.color}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={Math.min(height / 3, 120)}
                fill="#8884d8"
                dataKey={selectedMetric}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = chartData.map(portfolio => ({
          portfolio: portfolio.name,
          value: Math.abs(portfolio[selectedMetric]),
          normalizedValue: Math.abs(portfolio[selectedMetric]) / statistics.max * 100,
        }));

        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="portfolio" stroke="#9CA3AF" fontSize={12} />
              <PolarRadiusAxis stroke="#9CA3AF" fontSize={10} />
              <Radar
                name={currentMetric.label}
                dataKey="normalizedValue"
                stroke={currentMetric.color}
                fill={currentMetric.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  currentMetric.format(props.payload.value),
                  currentMetric.label,
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'line':
        // For line chart, we'll show a simple trend (this could be expanded with historical data)
        const lineData = chartData.map((portfolio, index) => ({
          index: index + 1,
          name: portfolio.name,
          value: portfolio[selectedMetric],
          color: portfolio.color,
        }));

        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={currentMetric.color}
                strokeWidth={3}
                dot={{ fill: currentMetric.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: currentMetric.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (chartData.length === 0) {
    return (
      <div className={`glass-card-dark rounded-2xl p-8 text-center ${className}`}>
        <PieChartIcon size={48} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">
          No Portfolios to Compare
        </h3>
        <p className="text-slate-400">
          Create multiple portfolios to see comparison charts.
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-card-dark rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">Portfolio Comparison</h3>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Metric Selector */}
          <div className="flex gap-2">
            {metricOptions.map(metric => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedMetric === metric.key
                    ? 'bg-spotify-green text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex gap-2">
            {chartTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeChart === tab.id
                    ? 'bg-spotify-green text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        {renderChart()}
      </div>

      {/* Statistics */}
      {showLegend && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Total</div>
            <div className="text-sm font-semibold text-white">
              {currentMetric.format(statistics.total)}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Average</div>
            <div className="text-sm font-semibold text-white">
              {currentMetric.format(statistics.avg)}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Highest</div>
            <div className="text-sm font-semibold text-emerald-400">
              {currentMetric.format(statistics.max)}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Lowest</div>
            <div className="text-sm font-semibold text-red-400">
              {currentMetric.format(statistics.min)}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio List */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Portfolio Overview</span>
        </div>
        {chartData.map(portfolio => (
          <div
            key={portfolio.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: portfolio.color }}
              />
              <span className="text-white font-medium">{portfolio.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                {formatCurrency(portfolio.value)}
              </span>
              <span
                className={`flex items-center gap-1 ${
                  portfolio.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {portfolio.profitLoss >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {formatPercent(portfolio.profitLossPercent)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioComparisonChart;