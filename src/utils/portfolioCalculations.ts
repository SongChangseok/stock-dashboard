// Portfolio data calculation utilities

import { Stock, PortfolioData } from '../types/portfolio';
import { getColorPalette } from './portfolio';

export const calculatePortfolioData = (
  stocks: Stock[], 
  stockPrices?: Map<string, { price: number; change: number; changePercent: number }>
): PortfolioData[] => {
  if (stocks.length === 0) return [];

  const colors = getColorPalette(stocks.length);
  
  return stocks.map((stock, index) => {
    const realTimePrice = stockPrices?.get(stock.ticker)?.price || stock.currentPrice;
    const marketValue = realTimePrice * stock.quantity;
    
    return {
      name: stock.ticker,
      value: marketValue,
      color: colors[index],
      quantity: stock.quantity,
    };
  });
};

export const calculateTotalPortfolioValue = (portfolioData: PortfolioData[]): number => {
  return portfolioData.reduce((total, item) => total + item.value, 0);
};

export const calculatePortfolioAllocation = (portfolioData: PortfolioData[]): PortfolioData[] => {
  const totalValue = calculateTotalPortfolioValue(portfolioData);
  
  return portfolioData.map(item => ({
    ...item,
    allocation: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
  }));
};