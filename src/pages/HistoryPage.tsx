import React from 'react';

const HistoryPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-gray-400">Portfolio performance tracking and historical analysis</p>
      </div>
      
      <div className="mb-6">
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Portfolio Performance</h2>
          <div className="h-80 flex items-center justify-center text-gray-400">
            Historical performance chart will be implemented here
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Sharpe Ratio</h3>
          <p className="text-2xl font-bold text-white">0.00</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Volatility</h3>
          <p className="text-2xl font-bold text-white">0.00%</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Max Drawdown</h3>
          <p className="text-2xl font-bold text-white">0.00%</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Total Return</h3>
          <p className="text-2xl font-bold text-white">0.00%</p>
        </div>
      </div>
      
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Snapshots</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Snapshot management will be implemented here
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;