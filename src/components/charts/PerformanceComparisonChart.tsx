// 성과 비교 차트 컴포넌트 - 포트폴리오 vs 벤치마크

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface PerformanceComparisonChartProps {
  className?: string;
}

interface ComparisonDataPoint {
  date: string;
  portfolioValue: number;
  portfolioReturn: number;
  sp500Return: number;
  nasdaqReturn: number;
  timestamp: number;
}

interface BenchmarkData {
  name: string;
  key: keyof ComparisonDataPoint;
  color: string;
  icon: React.ElementType;
}

// 벤치마크 정보
const BENCHMARKS: BenchmarkData[] = [
  { name: 'Portfolio', key: 'portfolioReturn', color: '#1DB954', icon: Target },
  { name: 'S&P 500', key: 'sp500Return', color: '#06b6d4', icon: TrendingUp },
  { name: 'NASDAQ', key: 'nasdaqReturn', color: '#8b5cf6', icon: Activity },
];

// 임시 비교 데이터 생성
const generateComparisonData = (): ComparisonDataPoint[] => {
  const data: ComparisonDataPoint[] = [];
  const days = 90;
  const initialValue = 75000;

  let portfolioValue = initialValue;
  let portfolioReturn = 0;
  let sp500Return = 0;
  let nasdaqReturn = 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 포트폴리오 성과 시뮬레이션 (좀 더 변동성 있게)
    const portfolioChange = (-1 + Math.random() * 2) * 0.02; // ±2%
    portfolioValue *= 1 + portfolioChange;
    portfolioReturn += portfolioChange * 100;

    // S&P 500 성과 시뮬레이션 (좀 더 안정적)
    const sp500Change = (-0.5 + Math.random()) * 0.015; // ±1.5%
    sp500Return += sp500Change * 100;

    // NASDAQ 성과 시뮬레이션 (테크 중심, 좀 더 변동성)
    const nasdaqChange = (-0.8 + Math.random() * 1.6) * 0.018; // ±1.8%
    nasdaqReturn += nasdaqChange * 100;

    data.push({
      date: date.toISOString().split('T')[0],
      portfolioValue,
      portfolioReturn,
      sp500Return,
      nasdaqReturn,
      timestamp: date.getTime(),
    });
  }

  return data;
};

const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([
    'Portfolio',
    'S&P 500',
  ]);

  // 비교 데이터
  const comparisonData = useMemo(() => generateComparisonData(), []);

  // 시간 범위 필터링
  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - ranges[timeRange];
    return comparisonData.filter(point => point.timestamp >= cutoff);
  }, [comparisonData, timeRange]);

  // 성과 통계 계산
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const latest = filteredData[filteredData.length - 1];
    const earliest = filteredData[0];

    return BENCHMARKS.map(benchmark => {
      const latestValue = latest[benchmark.key] as number;
      const earliestValue = earliest[benchmark.key] as number;
      const periodReturn = latestValue - earliestValue;

      // 변동성 계산 (표준편차)
      const returns = filteredData.map(d => d[benchmark.key] as number);
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance =
        returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
        returns.length;
      const volatility = Math.sqrt(variance);

      // 최대 하락폭 계산
      let maxDrawdown = 0;
      let peak = returns[0];

      returns.forEach(ret => {
        if (ret > peak) peak = ret;
        const drawdown = peak - ret;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });

      return {
        name: benchmark.name,
        color: benchmark.color,
        icon: benchmark.icon,
        current: latestValue,
        periodReturn,
        volatility,
        maxDrawdown,
        sharpeRatio: volatility > 0 ? (latestValue - 2) / volatility : 0, // 가정: 무위험 수익률 2%
      };
    });
  }, [filteredData]);

  if (!stats) return null;

  // 벤치마크 토글
  const toggleBenchmark = (benchmarkName: string) => {
    setSelectedBenchmarks(prev =>
      prev.includes(benchmarkName)
        ? prev.filter(name => name !== benchmarkName)
        : [...prev, benchmarkName]
    );
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-2">
            {new Date(label).toLocaleDateString()}
          </h4>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} style={{ color: entry.color }}>
                {entry.name}: {formatPercentage(entry.value, 2)}
              </div>
            ))}
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
            Performance Comparison
          </h3>
          <p className="text-sm text-slate-400">
            Compare your portfolio performance against market benchmarks
          </p>
        </div>

        {/* 시간 범위 선택 */}
        <div className="flex gap-2">
          {(['30d', '90d', '1y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
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

      {/* 벤치마크 선택 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {BENCHMARKS.map(benchmark => (
          <button
            key={benchmark.name}
            onClick={() => toggleBenchmark(benchmark.name)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                selectedBenchmarks.includes(benchmark.name)
                  ? 'bg-white/20 text-white border-2'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
              }
            `}
            style={{
              borderColor: selectedBenchmarks.includes(benchmark.name)
                ? benchmark.color
                : 'transparent',
            }}
          >
            <benchmark.icon size={16} />
            {benchmark.name}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
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
              tickFormatter={value => formatPercentage(value, 1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {BENCHMARKS.map(
              benchmark =>
                selectedBenchmarks.includes(benchmark.name) && (
                  <Line
                    key={benchmark.name}
                    type="monotone"
                    dataKey={benchmark.key}
                    stroke={benchmark.color}
                    strokeWidth={2}
                    dot={false}
                    name={benchmark.name}
                    activeDot={{
                      r: 4,
                      stroke: benchmark.color,
                      strokeWidth: 2,
                    }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 성과 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div
            key={stat.name}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon size={20} style={{ color: stat.color }} />
              <h4 className="font-semibold text-white">{stat.name}</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Return</span>
                <span
                  className={`font-medium ${
                    stat.periodReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stat.periodReturn >= 0 ? '+' : ''}
                  {formatPercentage(stat.periodReturn, 2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Volatility</span>
                <span className="text-white">
                  {formatPercentage(stat.volatility, 2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Max Drawdown</span>
                <span className="text-red-400">
                  -{formatPercentage(stat.maxDrawdown, 2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Sharpe Ratio</span>
                <span className="text-white">
                  {stat.sharpeRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 성과 요약 */}
      <div className="mt-6 p-4 bg-spotify-green/10 border border-spotify-green/20 rounded-xl">
        <h4 className="text-white font-semibold mb-2">Performance Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {(() => {
            const portfolioStats = stats.find(s => s.name === 'Portfolio');
            const sp500Stats = stats.find(s => s.name === 'S&P 500');

            if (!portfolioStats || !sp500Stats) return null;

            const outperformance =
              portfolioStats.periodReturn - sp500Stats.periodReturn;
            const relativeVolatility =
              portfolioStats.volatility - sp500Stats.volatility;

            return (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">vs S&P 500</span>
                  <span
                    className={`font-medium ${
                      outperformance >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {outperformance >= 0 ? '+' : ''}
                    {formatPercentage(outperformance, 2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Relative Vol</span>
                  <span
                    className={`font-medium ${
                      relativeVolatility <= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {relativeVolatility >= 0 ? '+' : ''}
                    {formatPercentage(relativeVolatility, 2)}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceComparisonChart;
