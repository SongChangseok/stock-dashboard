// Heatmap 차트 컴포넌트 - 성과 시각화

import React, { useState, useMemo } from 'react';
import { Stock } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useStockPrices } from '../../contexts/StockPriceContext';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface HeatmapChartProps {
  stocks: Stock[];
  title?: string;
  className?: string;
}

interface HeatmapData {
  ticker: string;
  value: number;
  profitLoss: number;
  profitLossPercent: number;
  marketValue: number;
  weight: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  stocks,
  title = "Performance Heatmap",
  className = "",
}) => {
  const { stockPrices } = useStockPrices();
  const [selectedMetric, setSelectedMetric] = useState<'profitLoss' | 'profitLossPercent' | 'weight'>('profitLossPercent');
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  // 히트맵 데이터 계산
  const heatmapData: HeatmapData[] = useMemo(() => {
    if (stocks.length === 0) return [];

    const data = stocks.map(stock => {
      const realTimePrice = stockPrices.get(stock.ticker)?.price || stock.currentPrice;
      const marketValue = realTimePrice * stock.quantity;
      const profitLoss = (realTimePrice - stock.buyPrice) * stock.quantity;
      const profitLossPercent = ((realTimePrice - stock.buyPrice) / stock.buyPrice) * 100;

      return {
        ticker: stock.ticker,
        value: realTimePrice,
        profitLoss,
        profitLossPercent,
        marketValue,
        weight: 0, // 나중에 계산
      };
    });

    // 포트폴리오 가중치 계산
    const totalValue = data.reduce((sum, item) => sum + item.marketValue, 0);
    data.forEach(item => {
      item.weight = (item.marketValue / totalValue) * 100;
    });

    return data;
  }, [stocks, stockPrices]);

  if (heatmapData.length === 0) return null;

  // 선택된 메트릭의 최대/최소값 계산
  const metricValues = heatmapData.map(item => item[selectedMetric]);
  const maxValue = Math.max(...metricValues);
  const minValue = Math.min(...metricValues);
  const range = maxValue - minValue;

  // 색상 계산 함수
  const getColor = (value: number) => {
    if (range === 0) return 'rgb(100, 116, 139)'; // 중립 색상

    const normalized = (value - minValue) / range;
    
    if (selectedMetric === 'weight') {
      // 가중치는 blue 그라디언트
      const intensity = Math.round(normalized * 255);
      return `rgb(${255 - intensity}, ${255 - intensity * 0.3}, 255)`;
    } else {
      // 손익은 red-green 그라디언트
      if (value > 0) {
        // 양수: 초록색 (더 높을수록 진함)
        const intensity = Math.round(normalized * 180);
        return `rgb(${Math.max(16, 255 - intensity)}, ${Math.min(255, 185 + intensity)}, ${Math.max(16, 255 - intensity)})`;
      } else if (value < 0) {
        // 음수: 빨간색 (더 낮을수록 진함)
        const intensity = Math.round((1 - normalized) * 180);
        return `rgb(${Math.min(255, 185 + intensity)}, ${Math.max(16, 255 - intensity)}, ${Math.max(16, 255 - intensity)})`;
      } else {
        // 0: 회색
        return 'rgb(100, 116, 139)';
      }
    }
  };

  // 메트릭 옵션
  const metricOptions = [
    { key: 'profitLossPercent' as const, label: 'P&L %', format: (v: number) => formatPercentage(v, 2) },
    { key: 'profitLoss' as const, label: 'P&L Amount', format: (v: number) => formatCurrency(v) },
    { key: 'weight' as const, label: 'Portfolio Weight', format: (v: number) => formatPercentage(v, 1) },
  ];

  const currentMetric = metricOptions.find(opt => opt.key === selectedMetric)!;

  return (
    <div className={`glass-card-dark rounded-2xl p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        
        {/* 메트릭 선택 */}
        <div className="flex gap-2">
          {metricOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setSelectedMetric(option.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedMetric === option.key
                  ? 'bg-spotify-green text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 히트맵 그리드 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {heatmapData.map(stock => {
            const value = stock[selectedMetric];
            const color = getColor(value);
            const isHovered = hoveredStock === stock.ticker;

            return (
              <div
                key={stock.ticker}
                onMouseEnter={() => setHoveredStock(stock.ticker)}
                onMouseLeave={() => setHoveredStock(null)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${isHovered 
                    ? 'border-white/40 scale-105 z-10' 
                    : 'border-white/10 hover:border-white/20'
                  }
                `}
                style={{ backgroundColor: color }}
              >
                <div className="text-center">
                  <div className="text-white font-bold text-sm mb-1">
                    {stock.ticker}
                  </div>
                  <div className="text-white text-xs mb-1">
                    {currentMetric.format(value)}
                  </div>
                  <div className="text-white/80 text-xs">
                    {formatCurrency(stock.marketValue)}
                  </div>
                </div>

                {/* 호버 시 상세 정보 */}
                {isHovered && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-black/90 rounded-lg border border-white/20 backdrop-blur-sm min-w-48 z-20">
                    <div className="text-white text-sm space-y-1">
                      <div className="font-semibold">{stock.ticker}</div>
                      <div>Market Value: {formatCurrency(stock.marketValue)}</div>
                      <div>P&L: {formatCurrency(stock.profitLoss)}</div>
                      <div>P&L %: {formatPercentage(stock.profitLossPercent, 2)}</div>
                      <div>Weight: {formatPercentage(stock.weight, 2)}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">
            {selectedMetric === 'weight' ? 'Darker = Higher Weight' : 'Green = Profit, Red = Loss'}
          </span>
        </div>
        
        {/* 색상 범례 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {currentMetric.format(minValue)}
          </span>
          <div className="flex h-4 w-32 rounded">
            {Array.from({ length: 20 }).map((_, i) => {
              const value = minValue + (range * i / 19);
              return (
                <div
                  key={i}
                  className="flex-1 h-full first:rounded-l last:rounded-r"
                  style={{ backgroundColor: getColor(value) }}
                />
              );
            })}
          </div>
          <span className="text-xs text-slate-400">
            {currentMetric.format(maxValue)}
          </span>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Best</div>
          <div className="text-sm font-semibold text-emerald-400">
            {currentMetric.format(maxValue)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Worst</div>
          <div className="text-sm font-semibold text-red-400">
            {currentMetric.format(minValue)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Average</div>
          <div className="text-sm font-semibold text-white">
            {currentMetric.format(metricValues.reduce((a, b) => a + b, 0) / metricValues.length)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Range</div>
          <div className="text-sm font-semibold text-white">
            {currentMetric.format(range)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;