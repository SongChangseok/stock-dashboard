// Stock calculation and utility functions for individual stocks

import { Stock } from '../types/portfolio';

export const calculateProfitLoss = (stock: Stock): number => {
  return (stock.currentPrice - stock.buyPrice) * stock.quantity;
};

export const calculateProfitLossPercent = (stock: Stock): number => {
  if (stock.buyPrice === 0) return 0;
  return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
};

export const calculateMarketValue = (stock: Stock): number => {
  return stock.currentPrice * stock.quantity;
};

export const isProfitable = (stock: Stock): boolean => {
  return calculateProfitLoss(stock) > 0;
};