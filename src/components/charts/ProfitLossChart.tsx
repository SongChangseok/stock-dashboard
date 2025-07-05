// 손익 히스토리 차트 컴포넌트

import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, BarChart, LineChart } from 'lucide-react';

interface ProfitLossChartProps {
  className?: string;
}

interface ProfitLossDataPoint {
  date: string;
  dailyProfitLoss: number;
  cumulativeProfitLoss: number;
  profitLossPercent: number;
  totalValue: number;
  timestamp: number;
}

// 임시 손익 히스토리 데이터 생성
const generateProfitLossData = (): ProfitLossDataPoint[] => {
  const data: ProfitLossDataPoint[] = [];
  const baseValue = 70000; // 초기 투자금
  const days = 30;
  let cumulativeProfitLoss = 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 일일 손익 시뮬레이션 (-2% ~ +3% 범위)
    const dailyChangePercent = -2 + Math.random() * 5;
    const dailyProfitLoss = baseValue * (dailyChangePercent / 100);
    cumulativeProfitLoss += dailyProfitLoss;

    const totalValue = baseValue + cumulativeProfitLoss;
    const profitLossPercent = (cumulativeProfitLoss / baseValue) * 100;

    data.push({
      date: date.toISOString().split('T')[0],
      dailyProfitLoss,
      cumulativeProfitLoss,
      profitLossPercent,
      totalValue,
      timestamp: date.getTime(),
    });
  }

  return data;
};

const ProfitLossChart: React.FC<ProfitLossChartProps> = ({
  className = '',
}) => {
  const [chartType, setChartType] = useState<
    'combined' | 'daily' | 'cumulative'
  >('combined');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // 손익 히스토리 데이터
  const profitLossData = useMemo(() => generateProfitLossData(), []);

  // 시간 범위 필터링
  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - ranges[timeRange];
    return profitLossData.filter(point => point.timestamp >= cutoff);
  }, [profitLossData, timeRange]);

  // 통계 계산
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const latest = filteredData[filteredData.length - 1];
    const totalDays = filteredData.length;
    const profitableDays = filteredData.filter(
      d => d.dailyProfitLoss > 0
    ).length;
    const lossDays = filteredData.filter(d => d.dailyProfitLoss < 0).length;

    const maxDaily = Math.max(...filteredData.map(d => d.dailyProfitLoss));
    const minDaily = Math.min(...filteredData.map(d => d.dailyProfitLoss));
    const avgDaily =
      filteredData.reduce((sum, d) => sum + d.dailyProfitLoss, 0) / totalDays;

    const maxCumulative = Math.max(
      ...filteredData.map(d => d.cumulativeProfitLoss)
    );
    const minCumulative = Math.min(
      ...filteredData.map(d => d.cumulativeProfitLoss)
    );

    return {
      current: latest.cumulativeProfitLoss,
      currentPercent: latest.profitLossPercent,
      totalDays,
      profitableDays,
      lossDays,
      winRate: (profitableDays / totalDays) * 100,
      maxDaily,
      minDaily,
      avgDaily,
      maxCumulative,
      minCumulative,
    };
  }, [filteredData]);

  if (!stats) return null;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ProfitLossDataPoint;
      return (
        <div className="bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-2">
            {new Date(data.date).toLocaleDateString()}
          </h4>
          <div className="space-y-1 text-sm">
            <div
              className={`${data.dailyProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              Daily P&L: {formatCurrency(data.dailyProfitLoss)}
            </div>
            <div
              className={`${data.cumulativeProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              Total P&L: {formatCurrency(data.cumulativeProfitLoss)}
            </div>
            <div className="text-slate-300">
              Portfolio Value: {formatCurrency(data.totalValue)}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`glass-card-dark rounded-2xl p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Profit & Loss History
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={`text-2xl font-bold ${
                stats.current >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {stats.current >= 0 ? '+' : ''}
              {formatCurrency(stats.current)}
            </div>
            <div
              className={`flex items-center text-sm ${
                stats.current >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {stats.current >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="ml-1">
                {stats.currentPercent >= 0 ? '+' : ''}
                {formatPercentage(stats.currentPercent, 2)}
              </span>
            </div>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* 차트 타입 선택 */}
          <div className="flex gap-1">
            {[
              { key: 'combined' as const, label: 'Combined', icon: BarChart },
              { key: 'daily' as const, label: 'Daily', icon: BarChart },
              {
                key: 'cumulative' as const,
                label: 'Cumulative',
                icon: LineChart,
              },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                className={`
                  flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    chartType === key
                      ? 'bg-spotify-green text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* 시간 범위 */}
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    timeRange === range
                      ? 'bg-spotify-green text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'combined' ? (
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={value =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis
                yAxisId="left"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
              <Bar
                yAxisId="left"
                dataKey="dailyProfitLoss"
                fill="#1DB954"
                fillOpacity={0.8}
                name="Daily P&L"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeProfitLoss"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                name="Cumulative P&L"
              />
            </ComposedChart>
          ) : chartType === 'daily' ? (
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={value =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
              <Bar dataKey="dailyProfitLoss" name="Daily P&L">
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.dailyProfitLoss >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          ) : (
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={value =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="cumulativeProfitLoss"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                name="Cumulative P&L"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Win Rate</div>
          <div className="text-sm font-semibold text-emerald-400">
            {formatPercentage(stats.winRate, 1)}
          </div>
          <div className="text-xs text-slate-400">
            {stats.profitableDays}/{stats.totalDays} days
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Best Day</div>
          <div className="text-sm font-semibold text-emerald-400">
            {formatCurrency(stats.maxDaily)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Worst Day</div>
          <div className="text-sm font-semibold text-red-400">
            {formatCurrency(stats.minDaily)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Avg Daily</div>
          <div
            className={`text-sm font-semibold ${
              stats.avgDaily >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(stats.avgDaily)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossChart;
