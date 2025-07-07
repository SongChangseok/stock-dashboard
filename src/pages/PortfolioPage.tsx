import React from 'react';

const PortfolioPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">Manage your portfolio positions</p>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <button className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Add Stock
        </button>
        <button className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Import Data
        </button>
        <button className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Export Data
        </button>
      </div>
      
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Portfolio Positions</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Portfolio table will be implemented here
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;