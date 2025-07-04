import React from 'react';
import StockRow from '../stock/StockRow';
import EmptyState from '../common/EmptyState';
import { Stock } from '../../types/portfolio';

interface PortfolioTableProps {
  stocks: Stock[];
  calculateProfitLoss: (stock: Stock) => number;
  calculateProfitLossPercent: (stock: Stock) => number;
  onEditStock: (stock: Stock) => void;
  onDeleteStock: (id: number) => void;
  onAddStock: () => void;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ stocks, calculateProfitLoss, calculateProfitLossPercent, onEditStock, onDeleteStock, onAddStock }) => {
  if (stocks.length === 0) {
    return (
      <div className="bg-spotify-gray rounded-lg border border-gray-700 backdrop-blur-sm p-6">
        <EmptyState
          title="No stocks in your portfolio"
          description="Start building your portfolio by adding your first stock position."
          onAction={onAddStock}
          actionText="Add Your First Stock"
        />
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray rounded-lg border border-gray-700 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Your Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Buy Price</th>
              <th className="px-4 py-3">Current Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Market Value</th>
              <th className="px-4 py-3">P&L</th>
              <th className="px-4 py-3">P&L %</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <StockRow
                key={stock.id}
                stock={stock}
                calculateProfitLoss={calculateProfitLoss}
                calculateProfitLossPercent={calculateProfitLossPercent}
                onEdit={onEditStock}
                onDelete={onDeleteStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;