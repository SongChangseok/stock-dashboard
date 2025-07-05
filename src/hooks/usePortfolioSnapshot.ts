import { useEffect, useCallback } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { usePortfolioHistory } from '../contexts/PortfolioHistoryContext';

export const usePortfolioSnapshot = () => {
  const { state: portfolioState } = usePortfolio();
  const { takeSnapshot, state: historyState } = usePortfolioHistory();

  const createSnapshot = useCallback(async () => {
    if (portfolioState.stocks.length === 0) {
      console.log('No stocks to snapshot');
      return;
    }

    try {
      await takeSnapshot({
        totalValue: portfolioState.metrics.totalValue,
        totalProfitLoss: portfolioState.metrics.totalProfitLoss,
        profitLossPercentage: portfolioState.metrics.profitLossPercentage,
        stocks: portfolioState.stocks,
      });

      console.log('Portfolio snapshot taken successfully');
    } catch (error) {
      console.error('Failed to take portfolio snapshot:', error);
    }
  }, [portfolioState, takeSnapshot]);

  const shouldTakeSnapshot = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];

    // Check if we already have a snapshot for today
    const hasSnapshotToday = historyState.snapshots.some(
      snapshot => snapshot.date === today
    );

    return !hasSnapshotToday && portfolioState.stocks.length > 0;
  }, [historyState.snapshots, portfolioState.stocks]);

  // Automatic snapshot on portfolio changes (debounced)
  useEffect(() => {
    if (!shouldTakeSnapshot()) return;

    const timer = setTimeout(() => {
      createSnapshot();
    }, 5000); // Wait 5 seconds after portfolio changes

    return () => clearTimeout(timer);
  }, [portfolioState.metrics.totalValue, shouldTakeSnapshot, createSnapshot]);

  // Daily snapshot check
  useEffect(() => {
    const checkDailySnapshot = () => {
      if (shouldTakeSnapshot()) {
        createSnapshot();
      }
    };

    // Check immediately
    checkDailySnapshot();

    // Set up daily check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 12:01 AM

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      checkDailySnapshot();

      // Set up daily interval
      const dailyInterval = setInterval(
        checkDailySnapshot,
        24 * 60 * 60 * 1000
      );

      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [shouldTakeSnapshot, createSnapshot]);

  return {
    createSnapshot,
    shouldTakeSnapshot,
    canTakeSnapshot: portfolioState.stocks.length > 0,
    lastSnapshotDate: historyState.lastSnapshotDate,
    snapshotCount: historyState.snapshots.length,
  };
};
