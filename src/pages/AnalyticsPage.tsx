import React, { useState, useMemo, useCallback } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { calculatePortfolioAnalytics } from '../utils/advancedAnalytics';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import ChartSelector, { ChartType } from '../components/analytics/ChartSelector';
import ChartContainer from '../components/analytics/ChartContainer';
import RiskAnalysis from '../components/analytics/RiskAnalysis';
import ChartCustomization, { ChartSettings } from '../components/analytics/ChartCustomization';

const AnalyticsPage: React.FC = () => {
  const { state } = usePortfolio();
  const { stocks } = state;

  // Chart state
  const [selectedChart, setSelectedChart] = useState<ChartType>('pie');
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    showGrid: true,
    showLegend: true,
    animationEnabled: true,
    colorScheme: 'default',
    chartSize: 'medium'
  });

  // Analytics data
  const analytics = useMemo(() => {
    if (stocks.length === 0) {
      return {
        performanceMetrics: {
          totalReturn: 0,
          totalReturnPercent: 0
        },
        riskMetrics: {
          sharpeRatio: 0,
          portfolioVolatility: 0,
          maxDrawdown: 0,
          beta: 1,
          valueAtRisk: 0
        },
        diversificationMetrics: {
          effectiveNumberOfStocks: 0
        }
      };
    }
    return calculatePortfolioAnalytics(stocks);
  }, [stocks]);

  // Handlers
  const handleChartChange = useCallback((chart: ChartType) => {
    setSelectedChart(chart);
  }, []);

  const handleSettingsChange = useCallback((settings: ChartSettings) => {
    setChartSettings(settings);
  }, []);

  const handleExportChart = useCallback(() => {
    // Implementation for exporting chart
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${selectedChart}-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, [selectedChart]);

  const handleRefreshData = useCallback(() => {
    // Trigger data refresh - this could call a context method
    window.location.reload();
  }, []);

  if (stocks.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Advanced portfolio analysis and insights</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">No Data Available</h3>
          <p className="text-gray-400 mb-6">
            Add stocks to your portfolio to access advanced analytics and insights
          </p>
          <button 
            onClick={() => window.location.href = '/portfolio'}
            className="bg-spotify-green hover:bg-spotify-green-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Advanced portfolio analysis and insights</p>
      </div>

      {/* Analytics Overview */}
      <AnalyticsOverview analytics={analytics} />

      {/* Chart Customization Controls */}
      <ChartCustomization
        settings={chartSettings}
        onSettingsChange={handleSettingsChange}
        onExportChart={handleExportChart}
        onRefreshData={handleRefreshData}
        isVisible={showCustomization}
        onToggleVisibility={() => setShowCustomization(!showCustomization)}
      />

      {/* Chart Selector */}
      <ChartSelector
        selectedChart={selectedChart}
        onChartChange={handleChartChange}
      />

      {/* Main Chart Container */}
      <div className="mb-8">
        <ChartContainer
          chartType={selectedChart}
          stocks={stocks}
        />
      </div>

      {/* Risk Analysis Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowRiskAnalysis(!showRiskAnalysis)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            showRiskAnalysis
              ? 'bg-spotify-green text-white'
              : 'bg-spotify-gray hover:bg-gray-600 text-white'
          }`}
        >
          {showRiskAnalysis ? 'Hide' : 'Show'} Risk Analysis
        </button>
      </div>

      {/* Risk Analysis Section */}
      {showRiskAnalysis && (
        <RiskAnalysis analytics={analytics} />
      )}
    </div>
  );
};

export default AnalyticsPage;