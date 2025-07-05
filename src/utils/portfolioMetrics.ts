// Basic portfolio metrics calculation for dashboard display
// Provides essential portfolio information like total value, P&L, and best/worst performers

import { Stock, PortfolioMetrics } from '../types/portfolio';
import {
  calculateTotalValue,
  calculateTotalInvestment,
  calculateTotalProfitLoss,
  calculateTotalProfitLossPercent,
  findBestPerformer,
  findWorstPerformer,
} from './portfolioCore';
import { AppError, logError } from './errorHandling';

export const calculatePortfolioMetrics = (
  stocks: Stock[]
): PortfolioMetrics => {
  try {
    // Validate input
    if (!Array.isArray(stocks)) {
      throw new AppError('Invalid stocks data: expected an array');
    }

    // Handle empty portfolio
    if (stocks.length === 0) {
      return {
        totalValue: 0,
        totalInvestment: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        bestPerformer: undefined,
        worstPerformer: undefined,
      };
    }

    // Validate stock data
    const invalidStocks = stocks.filter(
      stock =>
        !stock ||
        typeof stock.buyPrice !== 'number' ||
        typeof stock.currentPrice !== 'number' ||
        typeof stock.quantity !== 'number' ||
        stock.buyPrice < 0 ||
        stock.currentPrice < 0 ||
        stock.quantity <= 0
    );

    if (invalidStocks.length > 0) {
      logError(
        new AppError('Invalid stock data found'),
        `calculatePortfolioMetrics: ${invalidStocks.length} invalid stocks`
      );
      // Filter out invalid stocks and continue
      stocks = stocks.filter(stock => !invalidStocks.includes(stock));
    }

    const totalValue = calculateTotalValue(stocks);
    const totalProfitLoss = calculateTotalProfitLoss(stocks);
    const profitLossPercentage = calculateTotalProfitLossPercent(stocks);
    const totalInvestment = calculateTotalInvestment(stocks);

    const bestPerformer = findBestPerformer(stocks);
    const worstPerformer = findWorstPerformer(stocks);

    return {
      totalValue,
      totalInvestment,
      totalProfitLoss,
      profitLossPercentage,
      bestPerformer,
      worstPerformer,
    };
  } catch (error) {
    logError(error, 'calculatePortfolioMetrics');

    // Return safe defaults
    return {
      totalValue: 0,
      totalInvestment: 0,
      totalProfitLoss: 0,
      profitLossPercentage: 0,
      bestPerformer: undefined,
      worstPerformer: undefined,
    };
  }
};
