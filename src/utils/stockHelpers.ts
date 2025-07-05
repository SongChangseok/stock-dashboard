// Stock calculation and utility functions for individual stocks
// Note: Main calculation functions moved to portfolioCore.ts to avoid duplication

import { Stock } from '../types/portfolio';
import {
  calculateStockReturn,
  calculateStockReturnPercent,
} from './portfolioCore';

// Re-export core functions with consistent naming
export const calculateProfitLoss = calculateStockReturn;
export const calculateProfitLossPercent = calculateStockReturnPercent;

export const calculateMarketValue = (stock: Stock): number => {
  return stock.currentPrice * stock.quantity;
};

export const isProfitable = (stock: Stock): boolean => {
  return calculateProfitLoss(stock) > 0;
};
