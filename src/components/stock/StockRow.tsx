import React, { useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Stock } from '../../types/portfolio';
import { calculateProfitLoss, calculateProfitLossPercent, calculateMarketValue, isProfitable } from '../../utils/stockHelpers';
import { formatPrice, formatPercentage } from '../../utils/formatters';
import { useStockPrices } from '../../contexts/StockPriceContext';
import PriceChange from '../common/PriceChange';

interface StockRowProps {
  stock: Stock;
  onEdit: (stock: Stock) => void;
  onDelete: (id: number) => void;
}

const StockRow: React.FC<StockRowProps> = ({ stock, onEdit, onDelete }) => {
  const { getStockPrice, isLoading } = useStockPrices();
  
  // 실시간 가격 데이터 가져오기
  const realTimeQuote = getStockPrice(stock.ticker);
  
  // 현재 가격 (실시간 데이터가 있으면 사용, 없으면 기본 가격)
  const currentPrice = realTimeQuote?.price ?? stock.currentPrice;
  
  // 계산된 값들 (실시간 가격 기준)
  const { profitLoss, profitLossPercent, marketValue, isProfit } = useMemo(() => {
    const stockWithRealTimePrice = { ...stock, currentPrice };
    return {
      profitLoss: calculateProfitLoss(stockWithRealTimePrice),
      profitLossPercent: calculateProfitLossPercent(stockWithRealTimePrice),
      marketValue: calculateMarketValue(stockWithRealTimePrice),
      isProfit: isProfitable(stockWithRealTimePrice),
    };
  }, [stock, currentPrice]);

  return (
    <tr className="hover:bg-white/5 transition-all duration-200">
      <td className="px-8 py-6">
        <div className="font-bold text-white text-lg">{stock.ticker}</div>
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">{formatPrice(stock.buyPrice)}</td>
      <td className="px-8 py-6">
        <PriceChange
          currentPrice={currentPrice}
          previousPrice={stock.currentPrice}
          change={realTimeQuote?.change}
          changePercent={realTimeQuote?.changePercent}
          isLoading={isLoading}
          isStale={false}
          showAnimation={true}
          size="sm"
          showIcon={false}
          showPercent={false}
        />
      </td>
      <td className="px-8 py-6 text-slate-300 font-medium">{stock.quantity}</td>
      <td className="px-8 py-6 text-white font-semibold">{formatPrice(marketValue)}</td>
      <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {formatPrice(profitLoss)}
      </td>
      <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {formatPercentage(profitLossPercent)}
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
