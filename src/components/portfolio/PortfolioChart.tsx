import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioData } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PortfolioChartProps {
  data: PortfolioData[];
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  const { state } = usePortfolio();
  const [selectedStock, setSelectedStock] = useState<PortfolioData | null>(
    null
  );

  if (data.length === 0) return null;

  // 전체 포트폴리오 가치 계산
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // 전체 손익 계산 (현재 가격 기준)
  const totalProfitLoss = state.stocks.reduce((sum, stock) => {
    const profitLoss = (stock.currentPrice - stock.buyPrice) * stock.quantity;
    return sum + profitLoss;
  }, 0);

  const isProfit = totalProfitLoss >= 0;

  // 차트 클릭 핸들러
  const handlePieClick = (data: any, index: number) => {
    const clickedStock = data.payload;
    setSelectedStock(
      selectedStock?.name === clickedStock.name ? null : clickedStock
    );
  };

  // 중앙 정보 패널 컴포넌트
  const CenterInfo = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {selectedStock ? (
          <>
            <div className="text-sm text-slate-400 mb-1">
              {selectedStock.name}
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {formatCurrency(selectedStock.value)}
            </div>
            <div className="text-sm text-slate-300">
              {formatPercentage((selectedStock.value / totalValue) * 100, 1)}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-2">
              <DollarSign size={20} className="text-spotify-green mr-1" />
              <span className="text-sm text-slate-400">Total Value</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(totalValue)}
            </div>
            <div
              className={`flex items-center justify-center text-sm ${
                isProfit ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{formatCurrency(totalProfitLoss)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="glass-card-dark rounded-2xl p-8 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold gradient-text-primary">
          Portfolio Distribution
        </h2>
        {selectedStock && (
          <button
            onClick={() => setSelectedStock(null)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Show Total
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 도넛 차트 */}
        <div className="lg:col-span-2 relative">
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={
                        selectedStock && selectedStock.name !== entry.name
                          ? 0.3
                          : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => [formatCurrency(Number(value)), 'Value']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <CenterInfo />
          </div>
        </div>

        {/* 상세 정보 패널 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Stock Details
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.map((stock, index) => {
              const percentage = (stock.value / totalValue) * 100;
              const isSelected = selectedStock?.name === stock.name;

              return (
                <div
                  key={stock.name}
                  onClick={() => setSelectedStock(isSelected ? null : stock)}
                  className={`
                    p-3 rounded-xl border cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? 'border-spotify-green bg-spotify-green/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stock.color }}
                      />
                      <span className="font-medium text-white text-sm">
                        {stock.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatPercentage(percentage, 1)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {formatCurrency(stock.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
