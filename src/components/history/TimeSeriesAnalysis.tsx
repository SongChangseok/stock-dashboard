import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3, LineChart } from 'lucide-react';
import { usePortfolioHistory } from '../../contexts/PortfolioHistoryContext';
import { TimeframeOption } from '../../types/history';

interface TimeSeriesAnalysisProps {
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
}

const TimeSeriesAnalysis: React.FC<TimeSeriesAnalysisProps> = React.memo(({ onTimeframeChange }) => {
  const { state, getPerformanceForPeriod } = usePortfolioHistory();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1m');
  const [analysisType, setAnalysisType] = useState<'returns' | 'volatility' | 'comparison'>('returns');

  const timeframeOptions: { value: TimeframeOption; label: string; description: string }[] = [
    { value: '1d', label: '1D', description: 'Last 24 hours' },
    { value: '1w', label: '1W', description: 'Last week' },
    { value: '1m', label: '1M', description: 'Last month' },
    { value: '3m', label: '3M', description: 'Last 3 months' },
    { value: '6m', label: '6M', description: 'Last 6 months' },
    { value: '1y', label: '1Y', description: 'Last year' },
    { value: 'all', label: 'All', description: 'All time' },
  ];

  const analysisTypes = [
    { value: 'returns', label: 'Returns Analysis', icon: TrendingUp },
    { value: 'volatility', label: 'Volatility Analysis', icon: BarChart3 },
    { value: 'comparison', label: 'Period Comparison', icon: LineChart },
  ];

  const performanceData = useMemo(() => {
    return getPerformanceForPeriod(selectedTimeframe);
  }, [getPerformanceForPeriod, selectedTimeframe]);

  const analysisResults = useMemo(() => {
    if (performanceData.length === 0) return null;

    const values = performanceData.map(p => p.totalValue);
    const returns = values.slice(1).map((value, i) => ((value - values[i]) / values[i]) * 100);
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    );
    
    const maxReturn = Math.max(...returns);
    const minReturn = Math.min(...returns);
    const positiveReturns = returns.filter(ret => ret > 0).length;
    const winRate = (positiveReturns / returns.length) * 100;

    return {
      avgReturn: avgReturn || 0,
      volatility: volatility || 0,
      maxReturn: maxReturn === -Infinity ? 0 : maxReturn,
      minReturn: minReturn === Infinity ? 0 : minReturn,
      winRate: winRate || 0,
      totalPeriods: returns.length,
      startValue: values[0] || 0,
      endValue: values[values.length - 1] || 0,
      totalReturn: values.length > 0 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0
    };
  }, [performanceData]);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  const renderAnalysisContent = () => {
    if (!analysisResults) {
      return (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No data available for the selected timeframe</p>
        </div>
      );
    }

    switch (analysisType) {
      case 'returns':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Average Return</h4>
              <p className={`text-xl font-bold ${
                analysisResults.avgReturn >= 0 ? 'text-spotify-green' : 'text-red-400'
              }`}>
                {analysisResults.avgReturn.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Best Day</h4>
              <p className="text-xl font-bold text-spotify-green">
                +{analysisResults.maxReturn.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Worst Day</h4>
              <p className="text-xl font-bold text-red-400">
                {analysisResults.minReturn.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Win Rate</h4>
              <p className="text-xl font-bold text-blue-400">
                {analysisResults.winRate.toFixed(1)}%
              </p>
            </div>
          </div>
        );

      case 'volatility':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Volatility</h4>
              <p className="text-xl font-bold text-blue-400">
                {analysisResults.volatility.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Standard deviation</p>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Risk Level</h4>
              <p className={`text-xl font-bold ${
                analysisResults.volatility < 2 ? 'text-spotify-green' :
                analysisResults.volatility < 5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {analysisResults.volatility < 2 ? 'Low' :
                 analysisResults.volatility < 5 ? 'Medium' : 'High'}
              </p>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-gray-400 text-sm mb-2">Data Points</h4>
              <p className="text-xl font-bold text-white">
                {analysisResults.totalPeriods}
              </p>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-4">Period Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Value:</span>
                  <span className="text-white font-semibold">
                    ${analysisResults.startValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Value:</span>
                  <span className="text-white font-semibold">
                    ${analysisResults.endValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Return:</span>
                  <span className={`font-semibold ${
                    analysisResults.totalReturn >= 0 ? 'text-spotify-green' : 'text-red-400'
                  }`}>
                    {analysisResults.totalReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-4">Risk Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Volatility:</span>
                  <span className="text-white font-semibold">
                    {analysisResults.volatility.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="text-white font-semibold">
                    {analysisResults.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown:</span>
                  <span className="text-red-400 font-semibold">
                    {analysisResults.minReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Time Series Analysis</h3>
        
        {/* Timeframe Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Timeframe</h4>
          <div className="flex flex-wrap gap-2">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeframeChange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTimeframe === option.value
                    ? 'bg-spotify-green text-white'
                    : 'bg-spotify-dark-gray/50 text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Type Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Analysis Type</h4>
          <div className="flex flex-wrap gap-2">
            {analysisTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setAnalysisType(type.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    analysisType === type.value
                      ? 'bg-spotify-green text-white'
                      : 'bg-spotify-dark-gray/50 text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">
          {analysisTypes.find(t => t.value === analysisType)?.label}
        </h4>
        {renderAnalysisContent()}
      </div>
    </div>
  );
});

TimeSeriesAnalysis.displayName = 'TimeSeriesAnalysis';

export default TimeSeriesAnalysis;