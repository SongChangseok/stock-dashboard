// Advanced portfolio analytics for detailed analysis
// Provides comprehensive analytics including performance, risk, diversification, and sector analysis

import {
  Stock,
  PortfolioAnalytics,
  PerformanceMetrics,
  RiskMetrics,
  DiversificationMetrics,
  SectorAnalysis,
  SectorAllocation,
  SectorPerformance,
  SectorRisk,
} from '../types/portfolio';

import {
  calculateTotalValue,
  calculateTotalInvestment,
  calculateTotalProfitLoss,
  calculateStockReturnPercent,
  categorizeStocksByPerformance,
  calculatePortfolioWeights,
} from './portfolioCore';

// Mock sector mapping for demonstration
const SECTOR_MAPPING: Record<string, string> = {
  AAPL: 'Technology',
  GOOGL: 'Technology',
  MSFT: 'Technology',
  AMZN: 'Consumer Discretionary',
  TSLA: 'Consumer Discretionary',
  NFLX: 'Consumer Discretionary',
  JPM: 'Financial Services',
  BAC: 'Financial Services',
  GS: 'Financial Services',
  JNJ: 'Healthcare',
  PFE: 'Healthcare',
  UNH: 'Healthcare',
  XOM: 'Energy',
  CVX: 'Energy',
  COP: 'Energy',
  PG: 'Consumer Staples',
  KO: 'Consumer Staples',
  WMT: 'Consumer Staples',
};

// Performance Metrics Calculations
export const calculatePerformanceMetrics = (
  stocks: Stock[]
): PerformanceMetrics => {
  if (stocks.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      annualizedReturn: 0,
      bestPerformingStock: {} as Stock,
      worstPerformingStock: {} as Stock,
      winLossRatio: 0,
      averageGain: 0,
      averageLoss: 0,
    };
  }

  const totalInvestment = calculateTotalInvestment(stocks);
  const totalReturn = calculateTotalProfitLoss(stocks);
  const totalReturnPercent =
    totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

  // Use shared performance categorization
  const { stockPerformances, winLossRatio, averageGain, averageLoss } =
    categorizeStocksByPerformance(stocks);

  const bestPerforming = stockPerformances.reduce((best, current) =>
    current.returnPercent > best.returnPercent ? current : best
  );

  const worstPerforming = stockPerformances.reduce((worst, current) =>
    current.returnPercent < worst.returnPercent ? current : worst
  );

  // Simple annualized return calculation (assuming 1 year holding period)
  const annualizedReturn = totalReturnPercent;

  return {
    totalReturn,
    totalReturnPercent,
    annualizedReturn,
    bestPerformingStock: bestPerforming.stock,
    worstPerformingStock: worstPerforming.stock,
    winLossRatio,
    averageGain,
    averageLoss,
  };
};

// Risk Metrics Calculations
export const calculateRiskMetrics = (stocks: Stock[]): RiskMetrics => {
  if (stocks.length === 0) {
    return {
      portfolioVolatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      valueAtRisk: 0,
      beta: 0,
      alpha: 0,
    };
  }

  const returns = stocks.map(stock => calculateStockReturnPercent(stock));

  // Calculate portfolio volatility (standard deviation of returns)
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
    returns.length;
  const portfolioVolatility = Math.sqrt(variance);

  // Simplified Sharpe ratio calculation (assuming risk-free rate = 0)
  const sharpeRatio =
    portfolioVolatility > 0 ? meanReturn / portfolioVolatility : 0;

  // Simplified calculations for demonstration
  const maxDrawdown = Math.min(...returns.map(r => Math.min(0, r)));
  const valueAtRisk = portfolioVolatility * 1.65; // 95% confidence level
  const beta = 1.0; // Market beta assumption
  const alpha = meanReturn - beta * 10; // Assuming market return of 10%

  return {
    portfolioVolatility,
    sharpeRatio,
    maxDrawdown,
    valueAtRisk,
    beta,
    alpha,
  };
};

// Diversification Metrics Calculations
export const calculateDiversificationMetrics = (
  stocks: Stock[]
): DiversificationMetrics => {
  if (stocks.length === 0) {
    return {
      concentrationRisk: 0,
      herfindahlIndex: 0,
      diversificationRatio: 0,
      correlationMatrix: [],
      effectiveNumberOfStocks: 0,
    };
  }

  const weights = calculatePortfolioWeights(stocks);

  // Herfindahl Index (concentration measure)
  const herfindahlIndex = weights.reduce(
    (sum, weight) => sum + Math.pow(weight, 2),
    0
  );

  // Concentration risk (percentage of portfolio in top position)
  const concentrationRisk = Math.max(...weights) * 100;

  // Effective number of stocks
  const effectiveNumberOfStocks = herfindahlIndex > 0 ? 1 / herfindahlIndex : 0;

  // Simplified diversification ratio
  const diversificationRatio =
    stocks.length > 1 ? (1 - herfindahlIndex) / (1 - 1 / stocks.length) : 0;

  // Simplified correlation matrix (for demonstration)
  const correlationMatrix = stocks.map(
    () => stocks.map(() => Math.random() * 0.6 + 0.2) // Random correlations between 0.2 and 0.8
  );

  return {
    concentrationRisk,
    herfindahlIndex,
    diversificationRatio,
    correlationMatrix,
    effectiveNumberOfStocks,
  };
};

// Sector Analysis Calculations
export const calculateSectorAnalysis = (stocks: Stock[]): SectorAnalysis => {
  if (stocks.length === 0) {
    return {
      sectorAllocation: [],
      sectorPerformance: [],
      sectorRisk: [],
    };
  }

  const totalValue = calculateTotalValue(stocks);

  // Group stocks by sector
  const sectorGroups = stocks.reduce(
    (groups, stock) => {
      const sector = stock.sector || SECTOR_MAPPING[stock.ticker] || 'Unknown';
      if (!groups[sector]) {
        groups[sector] = [];
      }
      groups[sector].push(stock);
      return groups;
    },
    {} as Record<string, Stock[]>
  );

  // Calculate sector allocations
  const sectorAllocation: SectorAllocation[] = Object.entries(sectorGroups).map(
    ([sector, stocks]) => {
      const sectorValue = calculateTotalValue(stocks);
      return {
        sector,
        allocation: (sectorValue / totalValue) * 100,
        value: sectorValue,
      };
    }
  );

  // Calculate sector performance
  const sectorPerformance: SectorPerformance[] = Object.entries(
    sectorGroups
  ).map(([sector, stocks]) => {
    const sectorInvestment = calculateTotalInvestment(stocks);
    const sectorMarketValue = calculateTotalValue(stocks);
    const sectorReturn = sectorMarketValue - sectorInvestment;
    const sectorReturnPercent =
      sectorInvestment > 0 ? (sectorReturn / sectorInvestment) * 100 : 0;

    return {
      sector,
      return: sectorReturn,
      returnPercent: sectorReturnPercent,
    };
  });

  // Calculate sector risk
  const sectorRisk: SectorRisk[] = Object.entries(sectorGroups).map(
    ([sector, stocks]) => {
      const returns = stocks.map(stock => calculateStockReturnPercent(stock));
      const meanReturn =
        returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance =
        returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
        returns.length;
      const volatility = Math.sqrt(variance);

      return {
        sector,
        volatility,
        beta: 1.0, // Simplified beta assumption
      };
    }
  );

  return {
    sectorAllocation,
    sectorPerformance,
    sectorRisk,
  };
};

// Main analytics function
export const calculatePortfolioAnalytics = (
  stocks: Stock[]
): PortfolioAnalytics => {
  return {
    performanceMetrics: calculatePerformanceMetrics(stocks),
    riskMetrics: calculateRiskMetrics(stocks),
    diversificationMetrics: calculateDiversificationMetrics(stocks),
    sectorAnalysis: calculateSectorAnalysis(stocks),
  };
};

// Utility functions for analytics
export const getTopPerformers = (
  stocks: Stock[],
  count: number = 3
): Stock[] => {
  return stocks
    .map(stock => ({
      stock,
      performance: calculateStockReturnPercent(stock),
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, count)
    .map(item => item.stock);
};

export const getBottomPerformers = (
  stocks: Stock[],
  count: number = 3
): Stock[] => {
  return stocks
    .map(stock => ({
      stock,
      performance: calculateStockReturnPercent(stock),
    }))
    .sort((a, b) => a.performance - b.performance)
    .slice(0, count)
    .map(item => item.stock);
};

export const getHighestWeightedStocks = (
  stocks: Stock[],
  count: number = 5
): Stock[] => {
  const totalValue = calculateTotalValue(stocks);

  return stocks
    .map(stock => ({
      stock,
      weight: (stock.currentPrice * stock.quantity) / totalValue,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map(item => item.stock);
};

export const calculatePortfolioSummary = (stocks: Stock[]) => {
  const analytics = calculatePortfolioAnalytics(stocks);
  const topPerformers = getTopPerformers(stocks, 3);
  const bottomPerformers = getBottomPerformers(stocks, 3);
  const highestWeighted = getHighestWeightedStocks(stocks, 5);

  return {
    analytics,
    topPerformers,
    bottomPerformers,
    highestWeighted,
    totalStocks: stocks.length,
    totalSectors: Array.from(
      new Set(
        stocks.map(
          stock => stock.sector || SECTOR_MAPPING[stock.ticker] || 'Unknown'
        )
      )
    ).length,
  };
};
