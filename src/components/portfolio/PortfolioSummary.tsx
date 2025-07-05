import React, { useMemo } from 'react';
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wifi,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useStockPrices } from '../../contexts/StockPriceContext';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { calculatePortfolioMetrics } from '../../utils/portfolioMetrics';
import ToggleSwitch from '../common/ToggleSwitch';

interface PortfolioSummaryProps {
  totalValue: number;
  totalPositions: number;
  totalProfitLoss: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  totalPositions,
  totalProfitLoss,
}) => {
  const { state } = usePortfolio();
  const {
    stockPrices,
    isLoading,
    refreshPrices,
    isDataStale,
    lastUpdated,
    isRealTimeEnabled,
    toggleRealTime,
  } = useStockPrices();

  // 실시간 가격으로 포트폴리오 메트릭 재계산
  const realTimeMetrics = useMemo(() => {
    if (stockPrices.size === 0) {
      return { totalValue, totalProfitLoss };
    }

    // 실시간 가격으로 주식 데이터 업데이트
    const stocksWithRealTimePrices = state.stocks.map(stock => {
      const realTimeQuote = stockPrices.get(stock.ticker);
      return {
        ...stock,
        currentPrice: realTimeQuote?.price ?? stock.currentPrice,
      };
    });

    const metrics = calculatePortfolioMetrics(stocksWithRealTimePrices);
    return {
      totalValue: metrics.totalValue,
      totalProfitLoss: metrics.totalProfitLoss,
    };
  }, [stockPrices, state.stocks, totalValue, totalProfitLoss]);

  const isProfit = realTimeMetrics.totalProfitLoss >= 0;

  return (
    <div className="space-y-4 mb-8 animate-slide-up">
      {/* 실시간 업데이트 컨트롤 */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">Portfolio Overview</h2>

        <div className="flex items-center gap-4">
          {/* 실시간 업데이트 토글 */}
          <ToggleSwitch
            enabled={isRealTimeEnabled}
            onChange={toggleRealTime}
            label="Real-time Updates"
            description={
              isRealTimeEnabled ? 'Auto-updating prices' : 'Manual refresh only'
            }
            size="md"
            color="primary"
          />

          {/* 수동 새고침 버튼 */}
          <button
            onClick={refreshPrices}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">
                Total Portfolio Value
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold gradient-text-secondary">
                  {formatCurrency(realTimeMetrics.totalValue)}
                </p>
                {isLoading && (
                  <Wifi size={16} className="text-blue-400 animate-pulse" />
                )}
                {isDataStale && (
                  <RefreshCw size={16} className="text-yellow-400" />
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">
                Total Positions
              </p>
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
              <p className="text-slate-400 text-sm font-medium mb-2">
                Total P&L
              </p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {formatCurrency(realTimeMetrics.totalProfitLoss)}
                </p>
                {lastUpdated && (
                  <span className="text-xs text-slate-500">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isProfit ? 'bg-gradient-secondary' : 'bg-gradient-accent'
              }`}
            >
              {isProfit ? (
                <TrendingUp className="text-white" size={24} />
              ) : (
                <TrendingDown className="text-white" size={24} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
