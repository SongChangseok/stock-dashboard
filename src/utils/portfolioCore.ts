// Core portfolio calculation functions shared between analytics and basic metrics

import { Stock } from '../types/portfolio';

// Basic portfolio calculations
export const calculateTotalValue = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
};

export const calculateTotalInvestment = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + (stock.buyPrice * stock.quantity), 0);
};

export const calculateTotalProfitLoss = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => {
    const profitLoss = (stock.currentPrice - stock.buyPrice) * stock.quantity;
    return total + profitLoss;
  }, 0);
};

export const calculateTotalProfitLossPercent = (stocks: Stock[]): number => {
  const totalInvestment = calculateTotalInvestment(stocks);
  if (totalInvestment === 0) return 0;
  return (calculateTotalProfitLoss(stocks) / totalInvestment) * 100;
};

// Individual stock calculations
export const calculateStockReturn = (stock: Stock): number => {
  return (stock.currentPrice - stock.buyPrice) * stock.quantity;
};

export const calculateStockReturnPercent = (stock: Stock): number => {
  if (stock.buyPrice === 0) return 0;
  return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
};

// Portfolio weight calculations
export const calculateStockWeight = (stock: Stock, totalValue: number): number => {
  if (totalValue === 0) return 0;
  return (stock.currentPrice * stock.quantity) / totalValue;
};

export const calculatePortfolioWeights = (stocks: Stock[]): number[] => {
  const totalValue = calculateTotalValue(stocks);
  return stocks.map(stock => calculateStockWeight(stock, totalValue));
};

// Performance analysis helpers
export const findBestPerformer = (stocks: Stock[]): Stock | undefined => {
  if (stocks.length === 0) return undefined;
  
  return stocks.reduce((best, current) => {
    const bestPercent = calculateStockReturnPercent(best);
    const currentPercent = calculateStockReturnPercent(current);
    return currentPercent > bestPercent ? current : best;
  });
};

export const findWorstPerformer = (stocks: Stock[]): Stock | undefined => {
  if (stocks.length === 0) return undefined;
  
  return stocks.reduce((worst, current) => {
    const worstPercent = calculateStockReturnPercent(worst);
    const currentPercent = calculateStockReturnPercent(current);
    return currentPercent < worstPercent ? current : worst;
  });
};

// Stock performance categorization
export const categorizeStocksByPerformance = (stocks: Stock[]) => {
  const stockPerformances = stocks.map(stock => ({
    stock,
    return: calculateStockReturn(stock),
    returnPercent: calculateStockReturnPercent(stock),
  }));

  const winners = stockPerformances.filter(p => p.return > 0);
  const losers = stockPerformances.filter(p => p.return < 0);

  return {
    stockPerformances,
    winners,
    losers,
    winLossRatio: losers.length > 0 ? winners.length / losers.length : winners.length,
    averageGain: winners.length > 0 ? winners.reduce((sum, w) => sum + w.return, 0) / winners.length : 0,
    averageLoss: losers.length > 0 ? Math.abs(losers.reduce((sum, l) => sum + l.return, 0)) / losers.length : 0,
  };
};