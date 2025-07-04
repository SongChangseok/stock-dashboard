import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Stock } from '../../types/portfolio';

interface StockRowProps {
  stock: Stock;
  calculateProfitLoss: (stock: Stock) => number;
  calculateProfitLossPercent: (stock: Stock) => number;
  onEdit: (stock: Stock) => void;
  onDelete: (id: number) => void;
}

const StockRow: React.FC<StockRowProps> = ({ stock, calculateProfitLoss, calculateProfitLossPercent, onEdit, onDelete }) => {
  const profitLoss = calculateProfitLoss(stock);
  const profitLossPercent = calculateProfitLossPercent(stock);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <tr className="border-t border-gray-700 hover:bg-spotify-dark-gray transition-colors">
      <td className="px-4 py-3 text-white font-medium">{stock.ticker}</td>
      <td className="px-4 py-3 text-gray-300">{formatCurrency(stock.buyPrice)}</td>
      <td className="px-4 py-3 text-gray-300">{formatCurrency(stock.currentPrice)}</td>
      <td className="px-4 py-3 text-gray-300">{stock.quantity}</td>
      <td className="px-4 py-3 text-gray-300">{formatCurrency(stock.currentPrice * stock.quantity)}</td>
      <td className={`px-4 py-3 font-medium ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
      </td>
      <td className={`px-4 py-3 font-medium ${profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(stock)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(stock.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StockRow;