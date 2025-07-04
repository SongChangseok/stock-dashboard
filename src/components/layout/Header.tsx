import React from 'react';
import { Plus, BarChart3, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onAddStock: () => void;
  onImport: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddStock, onImport, onExport }) => {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary floating">
          <BarChart3 size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Portfolio Tracker</h1>
          <p className="text-slate-300 text-lg">Modern investment management dashboard</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onImport}
          className="glass-button bg-gradient-accent text-white font-semibold px-4 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
          title="Import Portfolio Data"
        >
          <Upload size={20} />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button
          onClick={onExport}
          className="glass-button bg-gradient-secondary text-white font-semibold px-4 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
          title="Export Portfolio Data"
        >
          <Download size={20} />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={onAddStock}
          className="glass-button bg-gradient-primary text-white font-semibold px-6 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
        >
          <Plus size={20} />
          <span>Add Stock</span>
        </button>
      </div>
    </div>
  );
};

export default Header;