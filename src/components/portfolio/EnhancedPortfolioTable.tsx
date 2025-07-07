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
}

const EnhancedPortfolioTable: React.FC<EnhancedPortfolioTableProps> = React.memo(({
  stocks,
  onEditStock,
  onDeleteStock,
  onAddStock,
  searchTerm,
  filters,
  sortField,
  sortDirection
}) => {
  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    filtered = filtered.filter(stock => {
      const profitLoss = calculateProfitLoss(stock);
      const marketValue = calculateMarketValue(stock);
      const isProfit = isProfitable(stock);

      // Profit/Loss filters
      if (filters.profitOnly && !isProfit) return false;
      if (filters.lossOnly && isProfit) return false;

      // Market value range
      if (filters.minValue && marketValue < parseFloat(filters.minValue)) return false;
      if (filters.maxValue && marketValue > parseFloat(filters.maxValue)) return false;

      // Quantity range
      if (filters.minQuantity && stock.quantity < parseInt(filters.minQuantity)) return false;
      if (filters.maxQuantity && stock.quantity > parseInt(filters.maxQuantity)) return false;

      return true;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case 'ticker':
            aValue = a.ticker;
            bValue = b.ticker;
            break;
          case 'buyPrice':
            aValue = a.buyPrice;
            bValue = b.buyPrice;
            break;
          case 'currentPrice':
            aValue = a.currentPrice;
            bValue = b.currentPrice;
            break;
          case 'quantity':
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          case 'marketValue':
            aValue = calculateMarketValue(a);
            bValue = calculateMarketValue(b);
            break;
          case 'profitLoss':
            aValue = calculateProfitLoss(a);
            bValue = calculateProfitLoss(b);
            break;
          case 'profitLossPercent':
            aValue = calculateProfitLossPercent(a);
            bValue = calculateProfitLossPercent(b);
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const comparison = (aValue as number) - (bValue as number);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [stocks, searchTerm, filters, sortField, sortDirection]);

  if (stocks.length === 0) {
    return (
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8">
        <EmptyState
          title="No stocks in your portfolio yet"
          description="Start building your portfolio by adding your first stock"
          actionText="Add Your First Stock"
          onAction={onAddStock}
        />
      </div>
    );
  }

  if (filteredAndSortedStocks.length === 0) {
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
            {filteredAndSortedStocks.map(stock => (
              <StockRow
                key={stock.id}
                stock={stock}
                onEdit={onEditStock}
                onDelete={onDeleteStock}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Results summary */}
      <div className="px-6 py-4 bg-spotify-dark-gray/50 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Showing {filteredAndSortedStocks.length} of {stocks.length} stocks
        </p>
      </div>
    </div>
  );
});

EnhancedPortfolioTable.displayName = 'EnhancedPortfolioTable';

export default EnhancedPortfolioTable;