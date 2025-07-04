import React from 'react';
import { Plus, Download, Upload, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onAddStock: () => void;
  onExportData: () => void;
  onShowImportModal: () => void;
  onRefreshPrices: () => void;
  isLoadingPrices: boolean;
  isUsingRealTimeData: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onAddStock, 
  onExportData, 
  onShowImportModal, 
  onRefreshPrices, 
  isLoadingPrices, 
  isUsingRealTimeData 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Stock Portfolio Dashboard</h1>
        <p className="text-gray-400">
          Track and manage your investment portfolio
          {isUsingRealTimeData ? (
            <span className="text-spotify-green ml-2">• Real-time data</span>
          ) : (
            <span className="text-yellow-400 ml-2">• Demo mode</span>
          )}
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onRefreshPrices}
          disabled={isLoadingPrices}
          className="flex items-center space-x-2 bg-spotify-dark-gray text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={20} className={isLoadingPrices ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
        
        <button
          onClick={onShowImportModal}
          className="flex items-center space-x-2 bg-spotify-dark-gray text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
        >
          <Upload size={20} />
          <span>Import</span>
        </button>
        
        <button
          onClick={onExportData}
          className="flex items-center space-x-2 bg-spotify-dark-gray text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
        >
          <Download size={20} />
          <span>Export</span>
        </button>
        
        <button
          onClick={onAddStock}
          className="flex items-center space-x-2 bg-spotify-green text-white px-4 py-2 rounded-lg hover:bg-spotify-green-hover transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Add Stock</span>
        </button>
      </div>
    </div>
  );
};

export default Header;