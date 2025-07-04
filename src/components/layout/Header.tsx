import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onAddStock: () => void;
  onExportData: () => void;
  onShowImportModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddStock, onExportData, onShowImportModal }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Stock Portfolio Dashboard</h1>
        <p className="text-gray-400">Track and manage your investment portfolio</p>
      </div>
      
      <div className="flex space-x-3">
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