// 포트폴리오 가치 히스토리 라인 차트

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Calendar, BarChart } from 'lucide-react';

interface PortfolioHistoryChartProps {
  className?: string;
}

interface HistoryDataPoint {
  date: string;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  timestamp: number;
}

// 임시 히스토리 데이터 생성 (실제 구현에서는 백엔드에서 가져오거나 localStorage에서 관리)
const generateHistoryData = (): HistoryDataPoint[] => {
  const data: HistoryDataPoint[] = [];
  const baseValue = 75000;
  const days = 30;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 간단한 랜덤 변동 시뮬레이션
    const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% 변동
    const trendFactor = 1 + (days - i) * 0.002; // 약간의 상승 트렌드
    const totalValue = baseValue * randomFactor * trendFactor;
    const initialInvestment = 70000;
    const profitLoss = totalValue - initialInvestment;
    const profitLossPercent = (profitLoss / initialInvestment) * 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalValue,
      profitLoss,
      profitLossPercent,
      timestamp: date.getTime(),
    });
  }
  
  return data;
};

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({
  className = "",
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'totalValue' | 'profitLoss' | 'profitLossPercent'>('totalValue');

  // 히스토리 데이터
  const historyData = useMemo(() => generateHistoryData(), []);

  // 시간 범위 필터링
  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - ranges[timeRange];
    return historyData.filter(point => point.timestamp >= cutoff);
  }, [historyData, timeRange]);

  // 통계 계산
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const latest = filteredData[filteredData.length - 1];
    const earliest = filteredData[0];
    
    const totalChange = latest.totalValue - earliest.totalValue;
    const totalChangePercent = ((latest.totalValue - earliest.totalValue) / earliest.totalValue) * 100;
    
    const maxValue = Math.max(...filteredData.map(d => d.totalValue));
    const minValue = Math.min(...filteredData.map(d => d.totalValue));
    
    return {
      current: latest.totalValue,
      change: totalChange,
      changePercent: totalChangePercent,
      max: maxValue,
      min: minValue,
      profitLoss: latest.profitLoss,
      profitLossPercent: latest.profitLossPercent,
    };
  }, [filteredData]);

  if (!stats) return null;

  // 메트릭 옵션
  const metricOptions = [
    { 
      key: 'totalValue' as const, 
      label: 'Portfolio Value', 
      format: (v: number) => formatCurrency(v),
      color: '#1DB954'
    },
    { 
      key: 'profitLoss' as const, 
      label: 'Profit & Loss', 
      format: (v: number) => formatCurrency(v),
      color: '#10b981'
    },
    { 
      key: 'profitLossPercent' as const, 
      label: 'P&L Percentage', 
      format: (v: number) => formatPercentage(v, 2),
      color: '#06b6d4'
    },
  ];

  const currentMetric = metricOptions.find(opt => opt.key === selectedMetric)!;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HistoryDataPoint;
      return (
        <div className="bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-2">
            {new Date(data.date).toLocaleDateString()}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="text-slate-300">
              Portfolio Value: {formatCurrency(data.totalValue)}
            </div>
            <div className={`${data.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              P&L: {formatCurrency(data.profitLoss)} ({formatPercentage(data.profitLossPercent, 2)})
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
          <h3 className="text-xl font-bold text-white mb-2">Portfolio Performance</h3>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white">
              {currentMetric.format(stats.current)}
            </div>
            <div className={`flex items-center text-sm ${
              stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {stats.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">
                {currentMetric.format(Math.abs(stats.change))} ({formatPercentage(Math.abs(stats.changePercent), 2)})
              </span>
            </div>
          </div>
        </div>
        
        {/* 컨트롤 */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* 메트릭 선택 */}
          <div className="flex gap-1">
            {metricOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setSelectedMetric(option.key)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
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
          
          {/* 시간 범위 */}
          <div className="flex gap-1">
            {(['7d', '30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${timeRange === range
                    ? 'bg-spotify-green text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* 차트 타입 */}
          <div className="flex gap-1">
            <button
              onClick={() => setChartType('line')}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${chartType === 'line'
                  ? 'bg-spotify-green text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              <BarChart size={16} />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${chartType === 'area'
                  ? 'bg-spotify-green text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={currentMetric.format}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={currentMetric.color}
                strokeWidth={2}
                fill="url(#portfolioGradient)" 
              />
            </AreaChart>
          ) : (
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={currentMetric.format}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={currentMetric.color}
                strokeWidth={3}
                dot={{ fill: currentMetric.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: currentMetric.color, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Current</div>
          <div className="text-sm font-semibold text-white">
            {currentMetric.format(stats.current)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Period Change</div>
          <div className={`text-sm font-semibold ${
            stats.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.change >= 0 ? '+' : ''}{currentMetric.format(stats.change)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Period High</div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(stats.max)}
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Period Low</div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(stats.min)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHistoryChart;