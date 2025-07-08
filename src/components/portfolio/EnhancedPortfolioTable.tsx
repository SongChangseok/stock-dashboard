import React, { useMemo } from 'react';
import { Stock } from '../../types/portfolio';
import StockRow from '../stock/StockRow';
import EmptyState from '../common/EmptyState';
import { SortField, SortDirection } from './PortfolioTableHeader';
import { FilterOptions } from './PortfolioFilters';
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateMarketValue,
  isProfitable,
} from '../../utils/stockHelpers';

interface EnhancedPortfolioTableProps {
  stocks: Stock[];
  onEditStock: (stock: Stock) => void;
  onDeleteStock: (id: number) => void;
  onAddStock: () => void;
  searchTerm: string;
  filters: FilterOptions;
  sortField: SortField | null;
  sortDirection: SortDirection;
  bulkMode?: boolean;
  selectedStocks?: Set<number>;
  onToggleSelect?: (stockId: number) => void;
}

const EnhancedPortfolioTable: React.FC<EnhancedPortfolioTableProps> = React.memo(({
  stocks,
  onEditStock,
  onDeleteStock,
  onAddStock,
  searchTerm,
  filters,
  sortField,
  sortDirection,
  bulkMode = false,
  selectedStocks = new Set(),
  onToggleSelect
}) => {
  // Since filtering is now handled by the parent component, we don't need to re-filter here
  const displayStocks = stocks;

  if (displayStocks.length === 0) {
    return (
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No stocks match your criteria</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search or filter settings</p>
          <button
            onClick={onAddStock}
            className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add New Stock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-gray-700">
            {displayStocks.map(stock => (
              <StockRow
                key={stock.id}
                stock={stock}
                onEdit={onEditStock}
                onDelete={onDeleteStock}
                bulkMode={bulkMode}
                isSelected={selectedStocks.has(stock.id)}
                onToggleSelect={() => onToggleSelect?.(stock.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Results summary */}
      <div className="px-6 py-4 bg-spotify-dark-gray/50 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Showing {displayStocks.length} stocks
          {bulkMode && selectedStocks.size > 0 && (
            <span className="ml-2">• {selectedStocks.size} selected</span>
          )}
        </p>
      </div>
    </div>
  );
});

EnhancedPortfolioTable.displayName = 'EnhancedPortfolioTable';

export default EnhancedPortfolioTable;