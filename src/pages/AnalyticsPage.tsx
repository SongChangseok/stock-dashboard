import React from 'react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Advanced portfolio analysis and insights</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Pie chart will be implemented here
          </div>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Heatmap</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Heatmap will be implemented here
          </div>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Sector Analysis</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Sector chart will be implemented here
          </div>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Risk analysis will be implemented here
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;