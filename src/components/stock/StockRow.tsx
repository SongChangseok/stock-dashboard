import React, { useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Stock } from '../../types/portfolio';
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateMarketValue,
  isProfitable,
} from '../../utils/stockHelpers';
import { formatPrice, formatPercentage } from '../../utils/formatters';

interface StockRowProps {
  stock: Stock;
  onEdit: (stock: Stock) => void;
  onDelete: (id: number) => void;
  bulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const StockRow: React.FC<StockRowProps> = ({ 
  stock, 
  onEdit, 
  onDelete, 
  bulkMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  // 사용자 입력 데이터 기반 계산
  const { profitLoss, profitLossPercent, marketValue, isProfit } = useMemo(() => {
    return {
      profitLoss: calculateProfitLoss(stock),
      profitLossPercent: calculateProfitLossPercent(stock),
      marketValue: calculateMarketValue(stock),
      isProfit: isProfitable(stock),
    };
  }, [stock]);

  return (
    <tr className={`hover:bg-white/5 transition-all duration-200 ${isSelected ? 'bg-spotify-green/10' : ''}`}>
      {bulkMode && (
        <td className="px-6 py-6">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
          />
        </td>
      )}
      <td className="px-8 py-6">
        <div className="font-bold text-white text-lg">{stock.ticker}</div>
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">
        {formatPrice(stock.buyPrice)}
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">
        {formatPrice(stock.currentPrice)}
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">{stock.quantity}</td>
      <td className="px-8 py-6 text-white font-semibold">
        {formatPrice(marketValue)}
      </td>
      <td
        className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {formatPrice(profitLoss)}
      </td>
      <td
        className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {formatPercentage(profitLossPercent)}
      </td>
      <td className="px-8 py-6">
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(stock)}
            className="p-3 hover:bg-primary-500/20 rounded-xl transition-all duration-200 group"
          >
            <Edit2
              size={18}
              className="text-slate-400 group-hover:text-primary-400"
            />
          </button>
          <button
            onClick={() => onDelete(stock.id)}
            className="p-3 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
          >
            <Trash2
              size={18}
              className="text-slate-400 group-hover:text-red-400"
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StockRow;
