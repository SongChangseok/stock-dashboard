import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Stock } from '../../types/portfolio';

interface StockRowProps {
  stock: Stock;
  onEdit: (stock: Stock) => void;
  onDelete: (id: number) => void;
}

const StockRow: React.FC<StockRowProps> = ({ stock, onEdit, onDelete }) => {
  const calculateProfitLoss = (stock: Stock): number => {
    return (stock.currentPrice - stock.buyPrice) * stock.quantity;
  };

  const calculateProfitLossPercent = (stock: Stock): number => {
    return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
  };

  const profitLoss = calculateProfitLoss(stock);
  const profitLossPercent = calculateProfitLossPercent(stock);
  const isProfit = profitLoss >= 0;

  return (
    <tr className="hover:bg-white/5 transition-all duration-200">
      <td className="px-8 py-6">
        <div className="font-bold text-white text-lg">{stock.ticker}</div>
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">${stock.buyPrice.toFixed(2)}</td>
      <td className="px-8 py-6 text-slate-300 font-medium">${stock.currentPrice.toFixed(2)}</td>
      <td className="px-8 py-6 text-slate-300 font-medium">{stock.quantity}</td>
      <td className="px-8 py-6 text-white font-semibold">${(stock.currentPrice * stock.quantity).toFixed(2)}</td>
      <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        ${profitLoss.toFixed(2)}
      </td>
      <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {profitLossPercent.toFixed(2)}%
      </td>
      <td className="px-8 py-6">
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(stock)}
            className="p-3 hover:bg-primary-500/20 rounded-xl transition-all duration-200 group"
          >
            <Edit2 size={18} className="text-slate-400 group-hover:text-primary-400" />
          </button>
          <button
            onClick={() => onDelete(stock.id)}
            className="p-3 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
          >
            <Trash2 size={18} className="text-slate-400 group-hover:text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StockRow;
