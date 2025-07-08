// 섹터 분포 막대 차트 컴포넌트

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Stock } from '../../types/portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';

interface SectorBarChartProps {
  stocks: Stock[];
  title?: string;
  className?: string;
}

interface SectorData {
  sector: string;
  allocation: number;
  value: number;
  count: number;
  profitLoss: number;
  profitLossPercent: number;
  color: string;
}

// 섹터 매핑 (실제 구현에서는 API나 데이터베이스에서 가져올 수 있음)
const SECTOR_MAPPING: Record<string, { name: string; color: string }> = {
  AAPL: { name: 'Technology', color: '#6366f1' },
  GOOGL: { name: 'Technology', color: '#6366f1' },
  MSFT: { name: 'Technology', color: '#6366f1' },
  AMZN: { name: 'Consumer Discretionary', color: '#8b5cf6' },
  TSLA: { name: 'Consumer Discretionary', color: '#8b5cf6' },
  NFLX: { name: 'Consumer Discretionary', color: '#8b5cf6' },
  JPM: { name: 'Financial Services', color: '#10b981' },
  BAC: { name: 'Financial Services', color: '#10b981' },
  GS: { name: 'Financial Services', color: '#10b981' },
  JNJ: { name: 'Healthcare', color: '#06b6d4' },
  PFE: { name: 'Healthcare', color: '#06b6d4' },
  UNH: { name: 'Healthcare', color: '#06b6d4' },
  XOM: { name: 'Energy', color: '#f59e0b' },
  CVX: { name: 'Energy', color: '#f59e0b' },
  COP: { name: 'Energy', color: '#f59e0b' },
  PG: { name: 'Consumer Staples', color: '#ef4444' },
  KO: { name: 'Consumer Staples', color: '#ef4444' },
  WMT: { name: 'Consumer Staples', color: '#ef4444' },
};

const SectorBarChart: React.FC<SectorBarChartProps> = ({
  stocks,
  title = 'Sector Distribution',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'allocation' | 'performance'>(
    'allocation'
  );
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // 섹터별 데이터 계산
  const sectorData: SectorData[] = useMemo(() => {
    if (stocks.length === 0) return [];

    // 섹터별 그룹화
    const sectorGroups: Record<string, Stock[]> = {};
    stocks.forEach(stock => {
      const sectorInfo = SECTOR_MAPPING[stock.ticker];
      const sectorName = sectorInfo?.name || 'Other';

      if (!sectorGroups[sectorName]) {
        sectorGroups[sectorName] = [];
      }
      sectorGroups[sectorName].push(stock);
    });

    // 전체 포트폴리오 가치 계산
    const totalValue = stocks.reduce((sum, stock) => {
      return sum + stock.currentPrice * stock.quantity;
    }, 0);

    // 섹터별 데이터 생성
    return Object.entries(sectorGroups)
      .map(([sectorName, sectorStocks]) => {
        let sectorValue = 0;
        let sectorInvestment = 0;

        sectorStocks.forEach(stock => {
          sectorValue += stock.currentPrice * stock.quantity;
          sectorInvestment += stock.buyPrice * stock.quantity;
        });

        const allocation = (sectorValue / totalValue) * 100;
        const profitLoss = sectorValue - sectorInvestment;
        const profitLossPercent =
          sectorInvestment > 0 ? (profitLoss / sectorInvestment) * 100 : 0;

        // 대표 색상 선택 (첫 번째 주식의 섹터 색상)
        const representativeStock = sectorStocks[0];
        const color =
          SECTOR_MAPPING[representativeStock.ticker]?.color || '#64748b';

        return {
          sector: sectorName,
          allocation,
          value: sectorValue,
          count: sectorStocks.length,
          profitLoss,
          profitLossPercent,
          color,
        };
      })
      .sort((a, b) => b.allocation - a.allocation); // 할당률 순으로 정렬
  }, [stocks]);

  if (sectorData.length === 0) return null;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as SectorData;
      return (
        <div className="bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-2">{label}</h4>
          <div className="space-y-1 text-sm">
            <div className="text-slate-300">
              Value: {formatCurrency(data.value)}
            </div>
            <div className="text-slate-300">
              Allocation: {formatPercentage(data.allocation, 1)}
            </div>
            <div className="text-slate-300">Stocks: {data.count}</div>
            <div
              className={`${data.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              P&L: {formatCurrency(data.profitLoss)} (
              {formatPercentage(data.profitLossPercent, 2)})
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = sectorData;
  const dataKey =
    viewMode === 'allocation' ? 'allocation' : 'profitLossPercent';

  return (
    <div className={`glass-card-dark rounded-2xl p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>

        {/* 뷰 모드 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('allocation')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                viewMode === 'allocation'
                  ? 'bg-spotify-green text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }
            `}
          >
            <PieChart size={16} />
            Allocation
          </button>
          <button
            onClick={() => setViewMode('performance')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                viewMode === 'performance'
                  ? 'bg-spotify-green text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }
            `}
          >
            <BarChart3 size={16} />
            Performance
          </button>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="sector"
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={value =>
                viewMode === 'allocation'
                  ? `${value.toFixed(0)}%`
                  : `${value.toFixed(0)}%`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              radius={[4, 4, 0, 0]}
              onClick={data =>
                setSelectedSector(
                  selectedSector === data.sector ? null : data.sector
                )
              }
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    viewMode === 'performance'
                      ? entry.profitLossPercent >= 0
                        ? '#10b981'
                        : '#ef4444'
                      : entry.color
                  }
                  fillOpacity={
                    selectedSector && selectedSector !== entry.sector ? 0.3 : 1
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 섹터 상세 정보 */}
      {selectedSector && (
        <div className="mb-4 p-4 bg-spotify-green/10 border border-spotify-green/20 rounded-xl">
          {(() => {
            const sector = sectorData.find(s => s.sector === selectedSector)!;
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{sector.sector}</h4>
                  <button
                    onClick={() => setSelectedSector(null)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Value</div>
                    <div className="text-white font-medium">
                      {formatCurrency(sector.value)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Allocation</div>
                    <div className="text-white font-medium">
                      {formatPercentage(sector.allocation, 2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Stocks</div>
                    <div className="text-white font-medium">{sector.count}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">P&L</div>
                    <div
                      className={`font-medium flex items-center ${
                        sector.profitLoss >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {sector.profitLoss >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      <span className="ml-1">
                        {formatCurrency(sector.profitLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 섹터 요약 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Total Sectors</div>
          <div className="text-lg font-bold text-white">
            {sectorData.length}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Largest Sector</div>
          <div className="text-sm font-semibold text-white">
            {sectorData[0]?.sector || 'N/A'}
          </div>
          <div className="text-xs text-slate-400">
            {sectorData[0]
              ? formatPercentage(sectorData[0].allocation, 1)
              : '0%'}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Best Performing</div>
          {(() => {
            const bestSector = sectorData.reduce((best, current) =>
              current.profitLossPercent > best.profitLossPercent
                ? current
                : best
            );
            return (
              <>
                <div className="text-sm font-semibold text-emerald-400">
                  {bestSector.sector}
                </div>
                <div className="text-xs text-emerald-400">
                  {formatPercentage(bestSector.profitLossPercent, 1)}
                </div>
              </>
            );
          })()}
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Worst Performing</div>
          {(() => {
            const worstSector = sectorData.reduce((worst, current) =>
              current.profitLossPercent < worst.profitLossPercent
                ? current
                : worst
            );
            return (
              <>
                <div className="text-sm font-semibold text-red-400">
                  {worstSector.sector}
                </div>
                <div className="text-xs text-red-400">
                  {formatPercentage(worstSector.profitLossPercent, 1)}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default SectorBarChart;
