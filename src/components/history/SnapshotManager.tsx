import React, { useState } from 'react';
import { Camera, Calendar, TrendingUp, Download, Trash2, Eye } from 'lucide-react';
import { usePortfolioSnapshot } from '../../hooks/usePortfolioSnapshot';
import { usePortfolioHistory } from '../../contexts/PortfolioHistoryContext';
import { formatCurrency } from '../../utils/formatters';

interface SnapshotManagerProps {
  onSnapshotTaken?: () => void;
}

const SnapshotManager: React.FC<SnapshotManagerProps> = React.memo(({ onSnapshotTaken }) => {
  const { createSnapshot, canTakeSnapshot, lastSnapshotDate, snapshotCount } = usePortfolioSnapshot();
  const { state, deleteSnapshot, exportSnapshots } = usePortfolioHistory();
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  const handleTakeSnapshot = async () => {
    await createSnapshot();
    onSnapshotTaken?.();
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    deleteSnapshot(snapshotId);
    if (selectedSnapshot === snapshotId) {
      setSelectedSnapshot(null);
    }
  };

  const handleExportSnapshots = () => {
    const data = exportSnapshots();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-snapshots-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const recentSnapshots = state.snapshots
    .slice(-10)
    .reverse();

  return (
    <div className="space-y-6">
      {/* Snapshot Controls */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Portfolio Snapshots</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{snapshotCount} snapshots</span>
              {lastSnapshotDate && (
                <>
                  <span>•</span>
                  <span>Last: {new Date(lastSnapshotDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportSnapshots}
              className="px-4 py-2 bg-spotify-gray hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              disabled={state.snapshots.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={handleTakeSnapshot}
              disabled={!canTakeSnapshot}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                canTakeSnapshot
                  ? 'bg-spotify-green hover:bg-spotify-green-hover text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Camera className="w-4 h-4" />
              Take Snapshot
            </button>
          </div>
        </div>
        
        {!canTakeSnapshot && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              A snapshot for today already exists or no portfolio data is available.
            </p>
          </div>
        )}
      </div>

      {/* Recent Snapshots */}
      {recentSnapshots.length > 0 && (
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Recent Snapshots</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-spotify-dark-gray/50">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">Total Value</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">P&L</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">P&L %</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">Positions</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentSnapshots.map((snapshot) => (
                  <tr 
                    key={snapshot.id}
                    className={`hover:bg-spotify-gray/30 transition-colors ${
                      selectedSnapshot === snapshot.id ? 'bg-spotify-green/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(snapshot.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {formatCurrency(snapshot.totalValue)}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${
                      snapshot.totalGainLoss >= 0 ? 'text-spotify-green' : 'text-red-400'
                    }`}>
                      {formatCurrency(snapshot.totalGainLoss)}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${
                      snapshot.totalGainLossPercent >= 0 ? 'text-spotify-green' : 'text-red-400'
                    }`}>
                      {snapshot.totalGainLossPercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {snapshot.stocks.length}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedSnapshot(
                            selectedSnapshot === snapshot.id ? null : snapshot.id
                          )}
                          className="p-2 hover:bg-spotify-green/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-spotify-green" />
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                          title="Delete Snapshot"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Snapshot Details */}
          {selectedSnapshot && (
            <div className="border-t border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Snapshot Details</h4>
              {(() => {
                const snapshot = state.snapshots.find(s => s.id === selectedSnapshot);
                if (!snapshot) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {snapshot.stocks.map((stock, index) => (
                      <div 
                        key={index}
                        className="bg-spotify-dark-gray/50 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{stock.ticker}</span>
                          <span className="text-gray-300">{stock.quantity} shares</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Buy Price:</span>
                            <span className="text-gray-300">{formatCurrency(stock.buyPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Current:</span>
                            <span className="text-gray-300">{formatCurrency(stock.currentPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Value:</span>
                            <span className="text-white font-medium">
                              {formatCurrency(stock.currentPrice * stock.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {state.snapshots.length === 0 && (
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Snapshots Yet</h3>
          <p className="text-gray-400 mb-4">
            Take your first portfolio snapshot to start tracking performance over time
          </p>
        </div>
      )}
    </div>
  );
});

SnapshotManager.displayName = 'SnapshotManager';

export default SnapshotManager;