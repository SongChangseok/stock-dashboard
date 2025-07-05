import React from 'react';
import {
  Plus,
  BarChart3,
  Download,
  Upload,
  Target,
  Newspaper,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onAddStock: () => void;
  onImport: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddStock, onImport, onExport }) => {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary floating">
          <BarChart3 size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">
            Portfolio Tracker
          </h1>
          <p className="text-slate-300 text-lg">
            Modern investment management dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-6">
        <nav className="flex items-center space-x-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              location.pathname === '/'
                ? 'bg-spotify-green text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <BarChart3 size={18} />
            Portfolio
          </Link>
          <Link
            to="/goals"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              location.pathname === '/goals'
                ? 'bg-spotify-green text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Target size={18} />
            Goals
          </Link>
          <Link
            to="/news"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              location.pathname === '/news'
                ? 'bg-spotify-green text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Newspaper size={18} />
            News
          </Link>
        </nav>

        {/* Action Buttons */}
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
    </div>
  );
};

export default Header;
