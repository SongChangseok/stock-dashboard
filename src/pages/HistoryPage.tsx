import React, { useState, useCallback, lazy, Suspense } from 'react';
import { usePortfolioHistory } from '../contexts/PortfolioHistoryContext';
import { TimeframeOption } from '../types/history';
import HistoryOverview from '../components/history/HistoryOverview';
import PortfolioHistoryChart from '../components/history/PortfolioHistoryChart';
import SnapshotManager from '../components/history/SnapshotManager';

// Lazy load heavy analysis components
const TimeSeriesAnalysis = lazy(() => import('../components/history/TimeSeriesAnalysis'));
const HistoryDataExport = lazy(() => import('../components/history/HistoryDataExport'));

const HistoryPage: React.FC = () => {
  const { state } = usePortfolioHistory();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1m');

  const handleSnapshotTaken = useCallback(() => {
    // Refresh or update any dependent components
    // This callback is triggered when a new snapshot is taken
  }, []);

  const handleTimeframeChange = useCallback((timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
  }, []);

  const hasData = state.snapshots.length > 0;

  if (!hasData) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-gray-400">Portfolio performance tracking and historical analysis</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">No Historical Data</h3>
          <p className="text-gray-400 mb-6">
            Start taking portfolio snapshots to track your performance over time and access detailed analytics
          </p>
          
          {/* Snapshot Manager will show instructions for taking first snapshot */}
          <SnapshotManager onSnapshotTaken={handleSnapshotTaken} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-gray-400">Portfolio performance tracking and historical analysis</p>
      </div>

      {/* Performance Overview */}
      <HistoryOverview metrics={state.metrics} />

      {/* Portfolio Performance Chart */}
      <div className="mb-8">
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Performance</h2>
          <PortfolioHistoryChart height={400} showBenchmark={false} />
        </div>
      </div>

      {/* Data Export */}
      <Suspense fallback={<div className="bg-spotify-gray/50 rounded-lg p-6 border border-gray-700 animate-pulse">Loading export settings...</div>}>
        <HistoryDataExport
          isVisible={showExportSettings}
          onToggleVisibility={() => setShowExportSettings(!showExportSettings)}
        />
      </Suspense>

      {/* Analysis Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            showAnalysis
              ? 'bg-spotify-green text-white'
              : 'bg-spotify-gray hover:bg-gray-600 text-white'
          }`}
        >
          {showAnalysis ? 'Hide' : 'Show'} Advanced Analysis
        </button>
      </div>

      {/* Time Series Analysis */}
      {showAnalysis && (
        <div className="mb-8">
          <Suspense fallback={<div className="bg-spotify-gray/50 rounded-lg p-6 border border-gray-700 animate-pulse">Loading analysis tools...</div>}>
            <TimeSeriesAnalysis onTimeframeChange={handleTimeframeChange} />
          </Suspense>
        </div>
      )}

      {/* Snapshot Management */}
      <SnapshotManager onSnapshotTaken={handleSnapshotTaken} />
    </div>
  );
};

export default HistoryPage;