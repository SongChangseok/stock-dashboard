import React, { useState } from 'react';
import { Search, X, Settings, Filter } from 'lucide-react';

interface PortfolioSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters?: boolean;
  placeholder?: string;
  className?: string;
}

const PortfolioSearchBar: React.FC<PortfolioSearchBarProps> = React.memo(({
  searchTerm,
  onSearchChange,
  onClearSearch,
  showFilters,
  onToggleFilters,
  hasActiveFilters = false,
  placeholder = "Search stocks by ticker...",
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
    onClearSearch();
  };

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'ring-2 ring-spotify-green' : ''
        }`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-spotify-dark-gray/50 text-white rounded-lg pl-10 pr-10 py-3 border border-gray-600 focus:border-spotify-green focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
        
        {/* Search Stats */}
        {searchTerm && (
          <div className="absolute top-full mt-1 left-0 text-xs text-gray-400">
            Search active
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className={`relative px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          showFilters 
            ? 'bg-spotify-green text-white' 
            : 'bg-spotify-gray hover:bg-gray-600 text-white'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-spotify-green rounded-full border-2 border-spotify-dark-gray"></div>
        )}
      </button>
    </div>
  );
});

PortfolioSearchBar.displayName = 'PortfolioSearchBar';

export default PortfolioSearchBar;