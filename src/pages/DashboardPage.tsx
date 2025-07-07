import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Portfolio overview and key metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Total Value</h3>
          <p className="text-2xl font-bold text-white">$0.00</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Total Positions</h3>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Total P&L</h3>
          <p className="text-2xl font-bold text-white">$0.00</p>
        </div>
        
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Day Change</h3>
          <p className="text-2xl font-bold text-white">$0.00</p>
        </div>
      </div>
      
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Portfolio Overview</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Portfolio chart will be implemented here
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;