import { Stock, PortfolioMetrics } from '../types/portfolio';

export const calculateProfitLoss = (stock: Stock): number => {
  return (stock.currentPrice - stock.buyPrice) * stock.quantity;
};

export const calculateProfitLossPercent = (stock: Stock): number => {
  return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
};

export const calculateTotalValue = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
};

export const calculateTotalProfitLoss = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0);
};

export const calculatePortfolioMetrics = (stocks: Stock[]): PortfolioMetrics => {
  const totalValue = calculateTotalValue(stocks);
  const totalProfitLoss = calculateTotalProfitLoss(stocks);
  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;
  
  // Find best and worst performers
  const performanceData = stocks.map(stock => ({
    stock,
    profitLossPercent: calculateProfitLossPercent(stock)
  }));
  
  const sortedByPerformance = performanceData.sort((a, b) => b.profitLossPercent - a.profitLossPercent);
  
  return {
    totalValue,
    totalProfitLoss,
    profitLossPercentage,
    bestPerformer: sortedByPerformance.length > 0 ? sortedByPerformance[0].stock : undefined,
    worstPerformer: sortedByPerformance.length > 0 ? sortedByPerformance[sortedByPerformance.length - 1].stock : undefined
  };
};

export const calculateMarketValue = (stock: Stock): number => {
  return stock.currentPrice * stock.quantity;
};

export const calculateCostBasis = (stock: Stock): number => {
  return stock.buyPrice * stock.quantity;
};

export const calculateAllocationPercentage = (stock: Stock, totalValue: number): number => {
  if (totalValue === 0) return 0;
  return (calculateMarketValue(stock) / totalValue) * 100;
};