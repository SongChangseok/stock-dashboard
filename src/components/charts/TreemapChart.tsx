// Treemap 차트 컴포넌트 - 포트폴리오 할당 시각화

import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioData } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TreemapChartProps {
  data: PortfolioData[];
  title?: string;
  className?: string;
}

interface TreemapData extends PortfolioData {
  profitLoss?: number;
  profitLossPercent?: number;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title = 'Portfolio Allocation',
  className = '',
}) => {
  const [selectedStock, setSelectedStock] = useState<TreemapData | null>(null);

  if (data.length === 0) return null;

  // 데이터에 손익 정보 추가 (현재 가격 기준)
  const enhancedData: TreemapData[] = data.map(stock => {
    const quantity = stock.quantity || 1;
    const originalPrice = stock.value / quantity;

    // 기본적으로 손익 정보는 0으로 설정 (실제 주식 데이터에서 계산해야 함)
    const profitLoss = 0;
    const profitLossPercent = 0;

    return {
      ...stock,
      profitLoss,
      profitLossPercent,
    };
  });

  const totalValue = enhancedData.reduce((sum, item) => sum + item.value, 0);

  // 커스텀 셀 렌더러
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value, color } =
      props;
    const stockData = enhancedData[index];
    const percentage = (value / totalValue) * 100;
    const isProfit = (stockData?.profitLoss || 0) >= 0;

    // 최소 크기 확인 (텍스트 표시 가능 여부)
    const showText = width > 60 && height > 40;
    const showDetails = width > 100 && height > 60;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: 'rgba(255, 255, 255, 0.2)',
            strokeWidth: 2,
            opacity: selectedStock && selectedStock.name !== name ? 0.5 : 1,
          }}
          className="cursor-pointer transition-opacity duration-200"
          onClick={() =>
            setSelectedStock(selectedStock?.name === name ? null : stockData)
          }
        />

        {showText && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (showDetails ? 10 : 0)}
            textAnchor="middle"
            fill="white"
            fontSize={Math.min(width / 8, height / 6, 14)}
            fontWeight="bold"
          >
            {name}
          </text>
        )}

        {showDetails && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 + 5}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.9)"
              fontSize={Math.min(width / 12, height / 8, 12)}
            >
              {formatPercentage(percentage, 1)}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 20}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.8)"
              fontSize={Math.min(width / 14, height / 10, 10)}
            >
              {formatCurrency(value)}
            </text>
            {stockData?.profitLoss !== undefined && (
              <text
                x={x + width / 2}
                y={y + height / 2 + 35}
                textAnchor="middle"
                fill={isProfit ? '#10b981' : '#ef4444'}
                fontSize={Math.min(width / 16, height / 12, 10)}
              >
                {isProfit ? '+' : ''}
                {formatCurrency(stockData.profitLoss)}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`glass-card-dark rounded-2xl p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {selectedStock && (
          <button
            onClick={() => setSelectedStock(null)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* 선택된 주식 정보 */}
      {selectedStock && (
        <div className="mb-4 p-4 bg-spotify-green/10 border border-spotify-green/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">{selectedStock.name}</h4>
              <p className="text-slate-300 text-sm">
                {formatCurrency(selectedStock.value)} •{' '}
                {formatPercentage((selectedStock.value / totalValue) * 100, 2)}
              </p>
            </div>
            {selectedStock.profitLoss !== undefined && (
              <div
                className={`flex items-center ${
                  selectedStock.profitLoss >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {selectedStock.profitLoss >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span className="ml-1 font-semibold">
                  {formatCurrency(selectedStock.profitLoss)}
                </span>
                {selectedStock.profitLossPercent !== undefined && (
                  <span className="ml-1 text-sm">
                    ({selectedStock.profitLossPercent >= 0 ? '+' : ''}
                    {formatPercentage(selectedStock.profitLossPercent, 2)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treemap 차트 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={enhancedData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="rgba(255, 255, 255, 0.2)"
            content={<CustomizedContent />}
          />
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {enhancedData.map((stock, index) => (
          <div
            key={stock.name}
            onClick={() =>
              setSelectedStock(
                selectedStock?.name === stock.name ? null : stock
              )
            }
            className={`
              flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
              ${
                selectedStock?.name === stock.name
                  ? 'bg-spotify-green/20 border border-spotify-green/40'
                  : 'hover:bg-white/5'
              }
            `}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: stock.color }}
            />
            <span className="text-xs text-slate-300 truncate">
              {stock.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreemapChart;
