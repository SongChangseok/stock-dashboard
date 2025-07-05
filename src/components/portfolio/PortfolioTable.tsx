import React from 'react';
import { Stock } from '../../types/portfolio';
import StockRow from '../stock/StockRow';
import EmptyState from '../common/EmptyState';

interface PortfolioTableProps {
  stocks: Stock[];
  onEditStock: (stock: Stock) => void;
  onDeleteStock: (id: number) => void;
  onAddStock: () => void;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({
  stocks,
  onEditStock,
  onDeleteStock,
  onAddStock,
}) => {
  return (
    <div className="glass-card-dark rounded-2xl overflow-hidden animate-slide-up">
      <div className="px-8 py-6 border-b border-white/10">
        <h2 className="text-2xl font-bold gradient-text-primary">
          Your Holdings
        </h2>
      </div>

      {stocks.length === 0 ? (
        <EmptyState
          title="No stocks in your portfolio yet"
          description="Start building your portfolio by adding your first stock"
          actionText="Add Your First Stock"
          onAction={onAddStock}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Ticker
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Buy Price
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Current Price
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Quantity
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Market Value
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  P&L
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  P&L %
                </th>
                <th className="text-left px-8 py-4 text-slate-300 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stocks.map(stock => (
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
      )}
    </div>
  );
};

export default PortfolioTable;
