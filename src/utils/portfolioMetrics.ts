// Basic portfolio metrics calculation for dashboard display
// Provides essential portfolio information like total value, P&L, and best/worst performers

import { Stock, PortfolioMetrics } from '../types/portfolio';
import { 
  calculateTotalValue,
  calculateTotalInvestment,
  calculateTotalProfitLoss,
  calculateTotalProfitLossPercent,
  findBestPerformer,
  findWorstPerformer
} from './portfolioCore';

export const calculatePortfolioMetrics = (stocks: Stock[]): PortfolioMetrics => {
  const totalValue = calculateTotalValue(stocks);
  const totalProfitLoss = calculateTotalProfitLoss(stocks);
  const profitLossPercentage = calculateTotalProfitLossPercent(stocks);
  const totalInvestment = calculateTotalInvestment(stocks);
  
  const bestPerformer = findBestPerformer(stocks);
  const worstPerformer = findWorstPerformer(stocks);
  
  return {
    totalValue,
    totalProfitLoss,
    profitLossPercentage,
    totalInvestment,
    totalMarketValue: totalValue,
    bestPerformer,
    worstPerformer,
  };
};