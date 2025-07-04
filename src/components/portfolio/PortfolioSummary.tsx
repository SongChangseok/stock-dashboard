import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Stock } from '../../types/portfolio';

interface PortfolioSummaryProps {
  stocks: Stock[];
  calculateTotalValue: () => number;
  calculateProfitLoss: (stock: Stock) => number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ stocks, calculateTotalValue, calculateProfitLoss }) => {
  const totalValue = calculateTotalValue();
  const totalProfitLoss = stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0);
  const totalProfitLossPercent = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalValue)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-spotify-green" />
        </div>
      </div>

      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totalProfitLoss)}
            </p>
          </div>
          {totalProfitLoss >= 0 ? (
            <TrendingUp className="h-8 w-8 text-green-400" />
          ) : (
            <TrendingDown className="h-8 w-8 text-red-400" />
          )}
        </div>
      </div>

      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total P&L %</p>
            <p className={`text-2xl font-bold mt-1 ${totalProfitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-spotify-green" />
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;