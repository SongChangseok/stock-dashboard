export interface PortfolioSnapshot {
  id: string;
  date: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stockSnapshots: StockSnapshot[];
  benchmarkValue?: number;
  timestamp: number;
}

export interface StockSnapshot {
  stockId: number;
  ticker: string;
  quantity: number;
  price: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  buyPrice: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  averageGain: number;
  averageLoss: number;
  profitFactor: number;
  sortino: number;
  calmarRatio: number;
  benchmarkReturn?: number;
  alpha?: number;
  beta?: number;
}

export interface DrawdownPeriod {
  startDate: string;
  endDate: string;
  peakValue: number;
  troughValue: number;
  drawdown: number;
  drawdownPercent: number;
  recovery: boolean;
  recoveryDate?: string;
  duration: number;
}

export interface PortfolioHistoryState {
  snapshots: PortfolioSnapshot[];
  metrics: PerformanceMetrics | null;
  drawdowns: DrawdownPeriod[];
  loading: boolean;
  error: string | null;
  lastSnapshotDate: string | null;
}

export interface PortfolioHistoryContextType {
  state: PortfolioHistoryState;
  takeSnapshot: (portfolioData: any) => Promise<void>;
  getSnapshotsByDateRange: (startDate: string, endDate: string) => PortfolioSnapshot[];
  calculateMetrics: (snapshots: PortfolioSnapshot[]) => PerformanceMetrics;
  calculateDrawdowns: (snapshots: PortfolioSnapshot[]) => DrawdownPeriod[];
  getPerformanceForPeriod: (period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all') => PortfolioSnapshot[];
  clearHistory: () => void;
  setError: (error: string | null) => void;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  benchmark?: number;
  timestamp: number;
}

export interface BenchmarkData {
  symbol: string;
  name: string;
  data: Array<{
    date: string;
    value: number;
  }>;
}

export type TimeframeOption = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

export interface PortfolioPerformanceComparison {
  portfolio: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  benchmark?: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  outperformance?: {
    totalReturn: number;
    annualizedReturn: number;
    alpha: number;
    beta: number;
  };
}