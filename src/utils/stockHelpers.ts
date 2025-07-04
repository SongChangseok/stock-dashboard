import { Stock } from '../types/portfolio';

export const normalizeTickerSymbol = (ticker: string): string => {
  return ticker.toUpperCase().trim();
};

export const generateStockId = (): number => {
  return Date.now();
};

export const createStock = (
  ticker: string,
  buyPrice: number,
  currentPrice: number,
  quantity: number,
  id?: number
): Stock => {
  return {
    id: id || generateStockId(),
    ticker: normalizeTickerSymbol(ticker),
    buyPrice,
    currentPrice,
    quantity,
    lastUpdated: new Date()
  };
};

export const updateStockPrice = (stock: Stock, newPrice: number): Stock => {
  return {
    ...stock,
    currentPrice: newPrice,
    lastUpdated: new Date()
  };
};

export const isValidStock = (stock: Partial<Stock>): boolean => {
  return !!(
    stock.ticker &&
    typeof stock.buyPrice === 'number' &&
    stock.buyPrice > 0 &&
    typeof stock.currentPrice === 'number' &&
    stock.currentPrice > 0 &&
    typeof stock.quantity === 'number' &&
    stock.quantity > 0
  );
};

export const findStockByTicker = (stocks: Stock[], ticker: string): Stock | undefined => {
  return stocks.find(stock => stock.ticker === normalizeTickerSymbol(ticker));
};

export const sortStocksByPerformance = (stocks: Stock[], ascending: boolean = false): Stock[] => {
  return [...stocks].sort((a, b) => {
    const aPerformance = ((a.currentPrice - a.buyPrice) / a.buyPrice) * 100;
    const bPerformance = ((b.currentPrice - b.buyPrice) / b.buyPrice) * 100;
    return ascending ? aPerformance - bPerformance : bPerformance - aPerformance;
  });
};

export const sortStocksByValue = (stocks: Stock[], ascending: boolean = false): Stock[] => {
  return [...stocks].sort((a, b) => {
    const aValue = a.currentPrice * a.quantity;
    const bValue = b.currentPrice * b.quantity;
    return ascending ? aValue - bValue : bValue - aValue;
  });
};

export const filterProfitableStocks = (stocks: Stock[]): Stock[] => {
  return stocks.filter(stock => stock.currentPrice > stock.buyPrice);
};

export const filterLosingStocks = (stocks: Stock[]): Stock[] => {
  return stocks.filter(stock => stock.currentPrice < stock.buyPrice);
};