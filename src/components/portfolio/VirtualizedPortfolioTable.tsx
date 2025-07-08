import React, { useRef } from 'react';
import { Stock } from '../../types/portfolio';
import StockRow from '../stock/StockRow';
import EmptyState from '../common/EmptyState';
import { useVirtualizedTable } from './hooks/useVirtualizedTable';

interface VirtualizedPortfolioTableProps {
  stocks: Stock[];
  onEditStock: (stock: Stock) => void;
  onDeleteStock: (id: number) => void;
  onAddStock: () => void;
  bulkMode?: boolean;
  selectedStocks?: Set<number>;
  onToggleSelect?: (stockId: number) => void;
  containerHeight?: number;
  itemHeight?: number;
}

const VirtualizedPortfolioTable: React.FC<VirtualizedPortfolioTableProps> = React.memo(({
  stocks,
  onEditStock,
  onDeleteStock,
  onAddStock,
  bulkMode = false,
  selectedStocks = new Set(),
  onToggleSelect,
  containerHeight = 600,
  itemHeight = 80
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    visibleItems,
    handleScroll,
    totalHeight,
    offsetY
  } = useVirtualizedTable(stocks, {
    itemHeight,
    containerHeight,
    overscan: 5
  });

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

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="bg-spotify-dark-gray/50 border-b border-gray-700">
        <table className="w-full">
          <thead>
            <tr>
              {bulkMode && (
                <th className="text-left px-6 py-4 text-gray-300 font-semibold w-12">
                  <input
                    type="checkbox"
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                </th>
              )}
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Ticker</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Buy Price</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Current Price</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Quantity</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Market Value</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">P&L</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">P&L %</th>
              <th className="text-left px-8 py-4 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized Table Body */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <table className="w-full">
              <tbody className="divide-y divide-gray-700">
                {visibleItems.items.map(stock => (
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
        </div>
      </div>

      {/* Results summary */}
      <div className="px-6 py-4 bg-spotify-dark-gray/50 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Showing {visibleItems.items.length} of {stocks.length} stocks
          {bulkMode && selectedStocks.size > 0 && (
            <span className="ml-2">• {selectedStocks.size} selected</span>
          )}
        </p>
      </div>
    </div>
  );
});

VirtualizedPortfolioTable.displayName = 'VirtualizedPortfolioTable';

export default VirtualizedPortfolioTable;