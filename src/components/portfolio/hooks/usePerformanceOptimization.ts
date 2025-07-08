import { useCallback, useMemo } from 'react';
import { Stock } from '../../../types/portfolio';
import { calculateMarketValue, calculateProfitLoss, isProfitable } from '../../../utils/stockHelpers';

export const usePerformanceOptimization = (stocks: Stock[]) => {
  // Memoized calculations for heavy computations
  const portfolioMetrics = useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return {
        totalValue: 0,
        totalInvestment: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        gainers: 0,
        losers: 0,
        averageGain: 0,
        averageLoss: 0,
      };
    }

    let totalValue = 0;
    let totalInvestment = 0;
    let totalProfitLoss = 0;
    let gainers = 0;
    let losers = 0;
    let totalGain = 0;
    let totalLoss = 0;

    stocks.forEach(stock => {
      const marketValue = calculateMarketValue(stock);
      const investment = stock.buyPrice * stock.quantity;
      const profitLoss = calculateProfitLoss(stock);
      const isProfit = isProfitable(stock);

      totalValue += marketValue;
      totalInvestment += investment;
      totalProfitLoss += profitLoss;

      if (isProfit) {
        gainers++;
        totalGain += profitLoss;
      } else {
        losers++;
        totalLoss += Math.abs(profitLoss);
      }
    });

    const profitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    const averageGain = gainers > 0 ? totalGain / gainers : 0;
    const averageLoss = losers > 0 ? totalLoss / losers : 0;

    return {
      totalValue,
      totalInvestment,
      totalProfitLoss,
      profitLossPercentage,
      gainers,
      losers,
      averageGain,
      averageLoss,
    };
  }, [stocks]);

  // Memoized stock calculations to avoid recalculation
  const stockCalculations = useMemo(() => {
    return new Map(
      stocks.map(stock => [
        stock.id,
        {
          marketValue: calculateMarketValue(stock),
          profitLoss: calculateProfitLoss(stock),
          isProfitable: isProfitable(stock),
        }
      ])
    );
  }, [stocks]);

  // Optimized getter functions
  const getStockCalculation = useCallback((stockId: number) => {
    return stockCalculations.get(stockId);
  }, [stockCalculations]);

  // Debounced search function
  const createDebouncedSearch = useCallback((delay: number = 300) => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string, callback: (term: string) => void) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(searchTerm), delay);
    };
  }, []);

  // Batch operations for better performance
  const batchStockOperations = useCallback((
    operations: Array<{ type: 'add' | 'update' | 'delete'; data: any }>
  ) => {
    // Group operations by type for batch processing
    const batched = operations.reduce((acc, op) => {
      if (!acc[op.type]) acc[op.type] = [];
      acc[op.type].push(op.data);
      return acc;
    }, {} as Record<string, any[]>);

    return batched;
  }, []);

  return {
    portfolioMetrics,
    stockCalculations,
    getStockCalculation,
    createDebouncedSearch,
    batchStockOperations,
  };
};