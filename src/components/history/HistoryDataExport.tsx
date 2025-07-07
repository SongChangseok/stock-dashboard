import React, { useState } from 'react';
import { Download, FileText, Calendar, BarChart3, Settings } from 'lucide-react';
import { usePortfolioHistory } from '../../contexts/PortfolioHistoryContext';
import { TimeframeOption } from '../../types/history';

interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  includeSnapshots: boolean;
  includeMetrics: boolean;
  includeChartData: boolean;
  timeframe: TimeframeOption;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface HistoryDataExportProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const HistoryDataExport: React.FC<HistoryDataExportProps> = React.memo(({ 
  isVisible, 
  onToggleVisibility 
}) => {
  const { state, getPerformanceForPeriod, exportSnapshots } = usePortfolioHistory();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeSnapshots: true,
    includeMetrics: true,
    includeChartData: true,
    timeframe: 'all'
  });

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateExportData = () => {
    const data: any = {
      exportDate: new Date().toISOString(),
      timeframe: exportOptions.timeframe,
      portfolio: {
        totalSnapshots: state.snapshots.length,
        dateRange: {
          start: state.snapshots[0]?.date || null,
          end: state.snapshots[state.snapshots.length - 1]?.date || null
        }
      }
    };

    if (exportOptions.includeSnapshots) {
      data.snapshots = state.snapshots;
    }

    if (exportOptions.includeMetrics && state.metrics) {
      data.metrics = state.metrics;
    }

    if (exportOptions.includeChartData) {
      data.chartData = getPerformanceForPeriod(exportOptions.timeframe);
    }

    return data;
  };

  const handleExport = () => {
    const data = generateExportData();
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportOptions.format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `portfolio-history-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        // Convert to CSV format
        if (data.snapshots) {
          const headers = ['Date', 'Total Value', 'Total P&L', 'P&L %', 'Positions'];
          const rows = data.snapshots.map((snapshot: any) => [
            snapshot.date,
            snapshot.totalValue,
            snapshot.totalGainLoss,
            snapshot.totalGainLossPercent,
            snapshot.stocks.length
          ]);
          content = [headers, ...rows].map(row => row.join(',')).join('\n');
        } else {
          content = 'No snapshot data to export';
        }
        filename = `portfolio-history-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;

      case 'excel':
        // For Excel, we'll export as CSV with tab separation
        if (data.snapshots) {
          const headers = ['Date', 'Total Value', 'Total P&L', 'P&L %', 'Positions'];
          const rows = data.snapshots.map((snapshot: any) => [
            snapshot.date,
            snapshot.totalValue,
            snapshot.totalGainLoss,
            snapshot.totalGainLossPercent,
            snapshot.stocks.length
          ]);
          content = [headers, ...rows].map(row => row.join('\t')).join('\n');
        } else {
          content = 'No snapshot data to export';
        }
        filename = `portfolio-history-${new Date().toISOString().split('T')[0]}.xlsx`;
        mimeType = 'application/vnd.ms-excel';
        break;

      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSummary = () => {
    const data = generateExportData();
    const sizeEstimate = JSON.stringify(data).length;
    const sizeInKB = (sizeEstimate / 1024).toFixed(1);
    
    return {
      snapshots: exportOptions.includeSnapshots ? state.snapshots.length : 0,
      metrics: exportOptions.includeMetrics && state.metrics ? 1 : 0,
      chartData: exportOptions.includeChartData ? getPerformanceForPeriod(exportOptions.timeframe).length : 0,
      estimatedSize: `${sizeInKB} KB`
    };
  };

  const summary = exportSummary();

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Historical Data</h2>
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded-lg transition-colors ${
            isVisible 
              ? 'bg-spotify-green text-white' 
              : 'bg-spotify-gray hover:bg-gray-600 text-white'
          }`}
          title="Export Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Export Settings Panel */}
      {isVisible && (
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Export Format</h4>
              <div className="space-y-2">
                {[
                  { value: 'json', label: 'JSON', description: 'Complete data with metadata' },
                  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                  { value: 'excel', label: 'Excel', description: 'Microsoft Excel format' }
                ].map((format) => (
                  <label key={format.value} className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value={format.value}
                      checked={exportOptions.format === format.value}
                      onChange={(e) => handleOptionChange('format', e.target.value)}
                      className="text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                    />
                    <div className="ml-2">
                      <div className="text-gray-300">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Inclusion Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Include Data</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSnapshots}
                    onChange={(e) => handleOptionChange('includeSnapshots', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Portfolio Snapshots</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetrics}
                    onChange={(e) => handleOptionChange('includeMetrics', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Performance Metrics</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeChartData}
                    onChange={(e) => handleOptionChange('includeChartData', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Chart Data Points</span>
                </label>
              </div>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Timeframe</h4>
            <select
              value={exportOptions.timeframe}
              onChange={(e) => handleOptionChange('timeframe', e.target.value)}
              className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
            >
              <option value="1d">Last 24 hours</option>
              <option value="1w">Last week</option>
              <option value="1m">Last month</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Export Summary */}
          <div className="mt-6 p-4 bg-spotify-dark-gray/50 rounded-lg border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Export Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Snapshots:</span>
                <span className="ml-2 text-white font-medium">{summary.snapshots}</span>
              </div>
              <div>
                <span className="text-gray-400">Metrics:</span>
                <span className="ml-2 text-white font-medium">{summary.metrics}</span>
              </div>
              <div>
                <span className="text-gray-400">Chart Points:</span>
                <span className="ml-2 text-white font-medium">{summary.chartData}</span>
              </div>
              <div>
                <span className="text-gray-400">Size:</span>
                <span className="ml-2 text-white font-medium">{summary.estimatedSize}</span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleExport}
              disabled={state.snapshots.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                state.snapshots.length > 0
                  ? 'bg-spotify-green hover:bg-spotify-green-hover text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

HistoryDataExport.displayName = 'HistoryDataExport';

export default HistoryDataExport;