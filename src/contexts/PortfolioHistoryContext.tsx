import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  PortfolioSnapshot,
  PortfolioHistoryState,
  PortfolioHistoryContextType,
  PerformanceMetrics,
  DrawdownPeriod,
  TimeframeOption,
} from '../types/history';

const initialState: PortfolioHistoryState = {
  snapshots: [],
  metrics: null,
  drawdowns: [],
  loading: false,
  error: null,
  lastSnapshotDate: null,
};

type HistoryAction =
  | { type: 'ADD_SNAPSHOT'; payload: PortfolioSnapshot }
  | { type: 'SET_SNAPSHOTS'; payload: PortfolioSnapshot[] }
  | { type: 'UPDATE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_DRAWDOWNS'; payload: DrawdownPeriod[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_LAST_SNAPSHOT_DATE'; payload: string };

const historyReducer = (
  state: PortfolioHistoryState,
  action: HistoryAction
): PortfolioHistoryState => {
  switch (action.type) {
    case 'ADD_SNAPSHOT':
      return {
        ...state,
        snapshots: [...state.snapshots, action.payload].sort(
          (a, b) => a.timestamp - b.timestamp
        ),
        lastSnapshotDate: action.payload.date,
        error: null,
      };
    case 'SET_SNAPSHOTS':
      return {
        ...state,
        snapshots: action.payload.sort((a, b) => a.timestamp - b.timestamp),
        error: null,
      };
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: action.payload,
      };
    case 'SET_DRAWDOWNS':
      return {
        ...state,
        drawdowns: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_HISTORY':
      return {
        ...initialState,
      };
    case 'SET_LAST_SNAPSHOT_DATE':
      return {
        ...state,
        lastSnapshotDate: action.payload,
      };
    default:
      return state;
  }
};

const PortfolioHistoryContext = createContext<
  PortfolioHistoryContextType | undefined
>(undefined);

export const usePortfolioHistory = (): PortfolioHistoryContextType => {
  const context = useContext(PortfolioHistoryContext);
  if (!context) {
    throw new Error(
      'usePortfolioHistory must be used within a PortfolioHistoryProvider'
    );
  }
  return context;
};

interface PortfolioHistoryProviderProps {
  children: ReactNode;
}

export const PortfolioHistoryProvider: React.FC<
  PortfolioHistoryProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('portfolioHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        dispatch({ type: 'SET_SNAPSHOTS', payload: parsed });
      } catch (error) {
        console.error('Failed to load portfolio history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever snapshots change
  useEffect(() => {
    if (state.snapshots.length > 0) {
      localStorage.setItem('portfolioHistory', JSON.stringify(state.snapshots));
    }
  }, [state.snapshots]);

  const takeSnapshot = async (portfolioData: any): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const now = new Date();
      const dateString = now.toISOString().split('T')[0];

      // Check if snapshot already exists for today
      const existingSnapshot = state.snapshots.find(s => s.date === dateString);
      if (existingSnapshot) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Snapshot already exists for today',
        });
        return;
      }

      const snapshot: PortfolioSnapshot = {
        id: `snapshot_${now.getTime()}`,
        date: dateString,
        totalValue: portfolioData.totalValue || 0,
        totalGainLoss: portfolioData.totalGainLoss || 0,
        totalGainLossPercent: portfolioData.totalGainLossPercent || 0,
        stockSnapshots:
          portfolioData.stocks?.map((stock: any) => ({
            stockId: stock.id,
            ticker: stock.ticker,
            quantity: stock.quantity,
            price: stock.currentPrice,
            value: stock.currentPrice * stock.quantity,
            gainLoss: (stock.currentPrice - stock.buyPrice) * stock.quantity,
            gainLossPercent:
              ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100,
            buyPrice: stock.buyPrice,
          })) || [],
        timestamp: now.getTime(),
      };

      dispatch({ type: 'ADD_SNAPSHOT', payload: snapshot });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to take snapshot' });
    }
  };

  const getSnapshotsByDateRange = (
    startDate: string,
    endDate: string
  ): PortfolioSnapshot[] => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return state.snapshots.filter(snapshot => {
      const snapshotTime = snapshot.timestamp;
      return snapshotTime >= start && snapshotTime <= end;
    });
  };

  const calculateMetrics = (
    snapshots: PortfolioSnapshot[]
  ): PerformanceMetrics => {
    if (snapshots.length < 2) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        winRate: 0,
        averageGain: 0,
        averageLoss: 0,
        profitFactor: 0,
        sortino: 0,
        calmarRatio: 0,
      };
    }

    const sortedSnapshots = [...snapshots].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const firstSnapshot = sortedSnapshots[0];
    const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

    // Calculate daily returns
    const dailyReturns: number[] = [];
    for (let i = 1; i < sortedSnapshots.length; i++) {
      const prevValue = sortedSnapshots[i - 1].totalValue;
      const currentValue = sortedSnapshots[i].totalValue;
      if (prevValue > 0) {
        dailyReturns.push((currentValue - prevValue) / prevValue);
      }
    }

    // Total return
    const totalReturn = lastSnapshot.totalValue - firstSnapshot.totalValue;
    const totalReturnPercent =
      firstSnapshot.totalValue > 0
        ? (totalReturn / firstSnapshot.totalValue) * 100
        : 0;

    // Annualized return
    const daysDiff =
      (lastSnapshot.timestamp - firstSnapshot.timestamp) /
      (1000 * 60 * 60 * 24);
    const years = daysDiff / 365.25;
    const annualizedReturn =
      years > 0
        ? (Math.pow(
            lastSnapshot.totalValue / firstSnapshot.totalValue,
            1 / years
          ) -
            1) *
          100
        : 0;

    // Volatility (standard deviation of daily returns)
    const avgReturn =
      dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
      dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    // Sharpe ratio (assuming 2% risk-free rate)
    const riskFreeRate = 0.02;
    const sharpeRatio =
      volatility > 0
        ? (annualizedReturn / 100 - riskFreeRate) / (volatility / 100)
        : 0;

    // Max drawdown
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peak = sortedSnapshots[0].totalValue;

    for (const snapshot of sortedSnapshots) {
      if (snapshot.totalValue > peak) {
        peak = snapshot.totalValue;
      }
      const drawdown = peak - snapshot.totalValue;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    }

    // Win rate and profit metrics
    const gains = dailyReturns.filter(r => r > 0);
    const losses = dailyReturns.filter(r => r < 0);
    const winRate =
      dailyReturns.length > 0 ? (gains.length / dailyReturns.length) * 100 : 0;
    const averageGain =
      gains.length > 0
        ? (gains.reduce((sum, g) => sum + g, 0) / gains.length) * 100
        : 0;
    const averageLoss =
      losses.length > 0
        ? Math.abs(losses.reduce((sum, l) => sum + l, 0) / losses.length) * 100
        : 0;
    const profitFactor = averageLoss > 0 ? averageGain / averageLoss : 0;

    // Sortino ratio (downside deviation)
    const downsideReturns = dailyReturns.filter(r => r < avgReturn);
    const downsideVariance =
      downsideReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
      downsideReturns.length;
    const downsideDeviation =
      Math.sqrt(downsideVariance) * Math.sqrt(252) * 100;
    const sortino =
      downsideDeviation > 0
        ? (annualizedReturn / 100 - riskFreeRate) / (downsideDeviation / 100)
        : 0;

    // Calmar ratio
    const calmarRatio =
      maxDrawdownPercent > 0 ? annualizedReturn / maxDrawdownPercent : 0;

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      maxDrawdownPercent,
      winRate,
      averageGain,
      averageLoss,
      profitFactor,
      sortino,
      calmarRatio,
    };
  };

  const calculateDrawdowns = (
    snapshots: PortfolioSnapshot[]
  ): DrawdownPeriod[] => {
    if (snapshots.length < 2) return [];

    const sortedSnapshots = [...snapshots].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const drawdowns: DrawdownPeriod[] = [];

    let peak = sortedSnapshots[0].totalValue;
    let peakDate = sortedSnapshots[0].date;
    let inDrawdown = false;
    let drawdownStart = '';
    let trough = peak;
    let troughDate = peakDate;

    for (let i = 1; i < sortedSnapshots.length; i++) {
      const snapshot = sortedSnapshots[i];

      if (snapshot.totalValue > peak) {
        // End of drawdown period
        if (inDrawdown) {
          const daysDiff =
            (new Date(snapshot.date).getTime() -
              new Date(drawdownStart).getTime()) /
            (1000 * 60 * 60 * 24);
          drawdowns.push({
            startDate: drawdownStart,
            endDate: troughDate,
            peakValue: peak,
            troughValue: trough,
            drawdown: peak - trough,
            drawdownPercent: ((peak - trough) / peak) * 100,
            recovery: true,
            recoveryDate: snapshot.date,
            duration: daysDiff,
          });
          inDrawdown = false;
        }

        peak = snapshot.totalValue;
        peakDate = snapshot.date;
        trough = peak;
        troughDate = peakDate;
      } else {
        // In drawdown
        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStart = peakDate;
        }

        if (snapshot.totalValue < trough) {
          trough = snapshot.totalValue;
          troughDate = snapshot.date;
        }
      }
    }

    // Handle ongoing drawdown
    if (inDrawdown) {
      const daysDiff =
        (new Date(troughDate).getTime() - new Date(drawdownStart).getTime()) /
        (1000 * 60 * 60 * 24);
      drawdowns.push({
        startDate: drawdownStart,
        endDate: troughDate,
        peakValue: peak,
        troughValue: trough,
        drawdown: peak - trough,
        drawdownPercent: ((peak - trough) / peak) * 100,
        recovery: false,
        duration: daysDiff,
      });
    }

    return drawdowns;
  };

  const getPerformanceForPeriod = (
    period: TimeframeOption
  ): PortfolioSnapshot[] => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return state.snapshots;
    }

    return state.snapshots.filter(
      snapshot => snapshot.timestamp >= startDate.getTime()
    );
  };

  const clearHistory = (): void => {
    localStorage.removeItem('portfolioHistory');
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Auto-calculate metrics when snapshots change
  useEffect(() => {
    if (state.snapshots.length >= 2) {
      const metrics = calculateMetrics(state.snapshots);
      const drawdowns = calculateDrawdowns(state.snapshots);
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
      dispatch({ type: 'SET_DRAWDOWNS', payload: drawdowns });
    }
  }, [state.snapshots]);

  const value: PortfolioHistoryContextType = {
    state,
    takeSnapshot,
    getSnapshotsByDateRange,
    calculateMetrics,
    calculateDrawdowns,
    getPerformanceForPeriod,
    clearHistory,
    setError,
  };

  return (
    <PortfolioHistoryContext.Provider value={value}>
      {children}
    </PortfolioHistoryContext.Provider>
  );
};
