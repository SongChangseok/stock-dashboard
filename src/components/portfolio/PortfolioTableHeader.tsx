import React from 'react';
import { Search, Filter, Download, Upload, Plus, SortAsc, SortDesc } from 'lucide-react';

export type SortField = 'ticker' | 'buyPrice' | 'currentPrice' | 'quantity' | 'marketValue' | 'profitLoss' | 'profitLossPercent';
export type SortDirection = 'asc' | 'desc';

interface PortfolioTableHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddStock: () => void;
  onImport: () => void;
  onExport: () => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  totalStocks: number;
  totalValue: number;
}

const PortfolioTableHeader: React.FC<PortfolioTableHeaderProps> = React.memo(({
  searchTerm,
  onSearchChange,
  onAddStock,
  onImport,
  onExport,
  sortField,
  sortDirection,
  onSort,
  showFilters,
  onToggleFilters,
  totalStocks,
  totalValue
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />;
  };

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 mb-6">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Portfolio Management</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{totalStocks} positions</span>
              <span>•</span>
              <span>Total value: {formatCurrency(totalValue)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onAddStock}
              className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
            <button
              onClick={onImport}
              className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={onExport}
              className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks by ticker..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-spotify-dark-gray/50 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-spotify-green focus:outline-none transition-colors"
            />
          </div>
          
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters 
                ? 'bg-spotify-green text-white' 
                : 'bg-spotify-gray hover:bg-gray-600 text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-spotify-dark-gray/50">
            <tr>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('ticker')}
              >
                <div className="flex items-center gap-2">
                  Ticker
                  <SortIcon field="ticker" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('buyPrice')}
              >
                <div className="flex items-center gap-2">
                  Buy Price
                  <SortIcon field="buyPrice" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('currentPrice')}
              >
                <div className="flex items-center gap-2">
                  Current Price
                  <SortIcon field="currentPrice" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('quantity')}
              >
                <div className="flex items-center gap-2">
                  Quantity
                  <SortIcon field="quantity" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('marketValue')}
              >
                <div className="flex items-center gap-2">
                  Market Value
                  <SortIcon field="marketValue" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('profitLoss')}
              >
                <div className="flex items-center gap-2">
                  P&L
                  <SortIcon field="profitLoss" />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('profitLossPercent')}
              >
                <div className="flex items-center gap-2">
                  P&L %
                  <SortIcon field="profitLossPercent" />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-gray-300 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
});

PortfolioTableHeader.displayName = 'PortfolioTableHeader';

export default PortfolioTableHeader;