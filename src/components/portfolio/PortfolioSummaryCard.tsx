import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { Stock } from '../../types/portfolio';
import { calculateMarketValue, calculateProfitLoss, isProfitable } from '../../utils/stockHelpers';
import { formatPrice, formatPercentage } from '../../utils/formatters';

interface PortfolioSummaryCardProps {
  stocks: Stock[];
  className?: string;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = React.memo(({ 
  stocks, 
  className = '' 
}) => {
  const summaryData = useMemo(() => {
    const totalValue = stocks.reduce((sum, stock) => sum + calculateMarketValue(stock), 0);
    const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.buyPrice * stock.quantity), 0);
    const totalProfitLoss = stocks.reduce((sum, stock) => sum + calculateProfitLoss(stock), 0);
    const profitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    const gainers = stocks.filter(stock => isProfitable(stock)).length;
    const losers = stocks.filter(stock => !isProfitable(stock)).length;
    
    return {
      totalValue,
      totalInvestment,
      totalProfitLoss,
      profitLossPercentage,
      gainers,
      losers,
      totalPositions: stocks.length,
    };
  }, [stocks]);

  const isProfitablePortfolio = summaryData.totalProfitLoss >= 0;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Value */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
          <DollarSign className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {formatPrice(summaryData.totalValue)}
        </div>
        <div className="text-sm text-gray-400">
          Investment: {formatPrice(summaryData.totalInvestment)}
        </div>
      </div>

      {/* P&L */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">P&L</h3>
          {isProfitablePortfolio ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div className={`text-2xl font-bold ${isProfitablePortfolio ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPrice(summaryData.totalProfitLoss)}
        </div>
        <div className={`text-sm ${isProfitablePortfolio ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPercentage(summaryData.profitLossPercentage)}
        </div>
      </div>

      {/* Positions */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Positions</h3>
          <Package className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {summaryData.totalPositions}
        </div>
        <div className="text-sm text-gray-400">
          {summaryData.gainers} gainers, {summaryData.losers} losers
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Performance</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-400">Winners</span>
            <span className="text-sm font-medium text-emerald-400">
              {summaryData.gainers}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-400">Losers</span>
            <span className="text-sm font-medium text-red-400">
              {summaryData.losers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

PortfolioSummaryCard.displayName = 'PortfolioSummaryCard';

export default PortfolioSummaryCard;