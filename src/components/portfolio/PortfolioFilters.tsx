import React from 'react';
import { X } from 'lucide-react';

export interface FilterOptions {
  profitOnly: boolean;
  lossOnly: boolean;
  minValue: string;
  maxValue: string;
  minQuantity: string;
  maxQuantity: string;
}

interface PortfolioFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isVisible: boolean;
}

const PortfolioFilters: React.FC<PortfolioFiltersProps> = React.memo(({
  filters,
  onFilterChange,
  onClearFilters,
  isVisible
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: boolean | string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.profitOnly || filters.lossOnly || 
    filters.minValue || filters.maxValue || filters.minQuantity || filters.maxQuantity;

  if (!isVisible) return null;

  return (
    <div className="bg-spotify-dark-gray/50 rounded-lg border border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* P&L Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Performance</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.profitOnly}
                onChange={(e) => handleFilterChange('profitOnly', e.target.checked)}
                className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
              />
              <span className="ml-2 text-gray-300">Profitable only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.lossOnly}
                onChange={(e) => handleFilterChange('lossOnly', e.target.checked)}
                className="rounded bg-spotify-gray border-gray-600 text-red-500 focus:ring-red-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-gray-300">Losses only</span>
            </label>
          </div>
        </div>

        {/* Market Value Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Market Value ($)</h4>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min value"
              value={filters.minValue}
              onChange={(e) => handleFilterChange('minValue', e.target.value)}
              className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max value"
              value={filters.maxValue}
              onChange={(e) => handleFilterChange('maxValue', e.target.value)}
              className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
            />
          </div>
        </div>

        {/* Quantity Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Quantity</h4>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min quantity"
              value={filters.minQuantity}
              onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
              className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max quantity"
              value={filters.maxQuantity}
              onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
              className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PortfolioFilters.displayName = 'PortfolioFilters';

export default PortfolioFilters;