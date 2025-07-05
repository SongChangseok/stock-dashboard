import React from 'react';
import { DollarSign, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PortfolioSummaryProps {
  totalValue: number;
  totalPositions: number;
  totalProfitLoss: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  totalPositions, 
  totalProfitLoss 
}) => {
  const isProfit = totalProfitLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
      <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Total Portfolio Value</p>
            <p className="text-3xl font-bold gradient-text-secondary">{formatCurrency(totalValue)}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
            <DollarSign className="text-white" size={24} />
          </div>
        </div>
      </div>
      
      <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Total Positions</p>
            <p className="text-3xl font-bold text-white">{totalPositions}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
        </div>
      </div>
      
      <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(totalProfitLoss)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isProfit ? 'bg-gradient-secondary' : 'bg-gradient-accent'
          }`}>
            {isProfit ? 
              <TrendingUp className="text-white" size={24} /> : 
              <TrendingDown className="text-white" size={24} />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
