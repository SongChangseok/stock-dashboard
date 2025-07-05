import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { usePortfolioHistory } from '../../contexts/PortfolioHistoryContext';
import { TimeframeOption, ChartDataPoint } from '../../types/history';
import { formatCurrency } from '../../utils/formatters';

interface PortfolioHistoryChartProps {
  height?: number;
  showBenchmark?: boolean;
}

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({ 
  height = 400, 
  showBenchmark = false 
}) => {
  const { state, getPerformanceForPeriod } = usePortfolioHistory();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1m');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const timeframeOptions: { value: TimeframeOption; label: string }[] = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' }
  ];

  const chartData: ChartDataPoint[] = useMemo(() => {
    const snapshots = getPerformanceForPeriod(selectedTimeframe);
    
    return snapshots.map(snapshot => ({
      date: snapshot.date,
      value: snapshot.totalValue,
      gainLoss: snapshot.totalGainLoss,
      gainLossPercent: snapshot.totalGainLossPercent,
      timestamp: snapshot.timestamp
    }));
  }, [getPerformanceForPeriod, selectedTimeframe]);

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    
    switch (selectedTimeframe) {
      case '1d':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1w':
      case '1m':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3m':
      case '6m':
      case '1y':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { year: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      
      return (
        <div className="bg-spotify-dark-gray p-4 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-semibold mb-2">
            {date.toLocaleDateString('en-US', { 
              weekday: 'short',
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Portfolio Value:</span> {formatCurrency(data.value)}
          </p>
          <p className={`${data.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span className="font-medium">Gain/Loss:</span> {formatCurrency(data.gainLoss)} ({data.gainLossPercent.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const getLineColor = () => {
    if (chartData.length < 2) return '#1DB954';
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    
    return lastValue >= firstValue ? '#10b981' : '#ef4444'; // green-500 or red-500
  };

  const getGradientColors = () => {
    const lineColor = getLineColor();
    return {
      start: lineColor === '#10b981' ? '#10b98180' : '#ef444480',
      end: lineColor === '#10b981' ? '#10b98110' : '#ef444410'
    };
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio history...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">No portfolio history available</p>
          <p className="text-sm text-gray-500">Add some stocks and take snapshots to see performance over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timeframe Selection */}
        <div className="flex items-center gap-2">
          {timeframeOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedTimeframe(value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === value
                  ? 'bg-spotify-green text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {chartType === 'line' ? 'Area Chart' : 'Line Chart'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-spotify-gray p-4 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height={height}>
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getGradientColors().start} />
                  <stop offset="95%" stopColor={getGradientColors().end} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={getLineColor()}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#4B5563' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getLineColor()}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: getLineColor() }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-spotify-gray p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Period Start</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(chartData[0].value)}
            </p>
          </div>
          <div className="bg-spotify-gray p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Period End</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(chartData[chartData.length - 1].value)}
            </p>
          </div>
          <div className="bg-spotify-gray p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Total Change</p>
            <p className={`text-sm font-semibold ${
              chartData[chartData.length - 1].value >= chartData[0].value 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {formatCurrency(chartData[chartData.length - 1].value - chartData[0].value)}
            </p>
          </div>
          <div className="bg-spotify-gray p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">% Change</p>
            <p className={`text-sm font-semibold ${
              chartData[chartData.length - 1].value >= chartData[0].value 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {(((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioHistoryChart;