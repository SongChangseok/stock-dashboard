import { Stock, StockCalculation, PortfolioMetrics } from '../types/portfolio';

// 주식 관련 계산 함수들
export const calculateProfitLoss = (stock: Stock): number => {
  return (stock.currentPrice - stock.buyPrice) * stock.quantity;
};

export const calculateProfitLossPercent = (stock: Stock): number => {
  return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
};

export const calculateMarketValue = (stock: Stock): number => {
  return stock.currentPrice * stock.quantity;
};

export const calculateStockData = (stock: Stock): StockCalculation => {
  return {
    marketValue: calculateMarketValue(stock),
    profitLoss: calculateProfitLoss(stock),
    profitLossPercent: calculateProfitLossPercent(stock),
  };
};

export const calculateTotalValue = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + calculateMarketValue(stock), 0);
};

export const calculateTotalProfitLoss = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0);
};

export const calculateTotalProfitLossPercent = (stocks: Stock[]): number => {
  const totalInvestment = stocks.reduce((total, stock) => total + (stock.buyPrice * stock.quantity), 0);
  if (totalInvestment === 0) return 0;
  return (calculateTotalProfitLoss(stocks) / totalInvestment) * 100;
};

export const calculatePortfolioMetrics = (stocks: Stock[]): PortfolioMetrics => {
  const totalValue = calculateTotalValue(stocks);
  const totalProfitLoss = calculateTotalProfitLoss(stocks);
  const profitLossPercentage = calculateTotalProfitLossPercent(stocks);
  
  let bestPerformer: Stock | undefined;
  let worstPerformer: Stock | undefined;
  
  if (stocks.length > 0) {
    bestPerformer = stocks.reduce((best, current) => {
      const bestPercent = calculateProfitLossPercent(best);
      const currentPercent = calculateProfitLossPercent(current);
      return currentPercent > bestPercent ? current : best;
    });
    
    worstPerformer = stocks.reduce((worst, current) => {
      const worstPercent = calculateProfitLossPercent(worst);
      const currentPercent = calculateProfitLossPercent(current);
      return currentPercent < worstPercent ? current : worst;
    });
  }
  
  return {
    totalValue,
    totalProfitLoss,
    profitLossPercentage,
    bestPerformer,
    worstPerformer,
  };
};

// 포맷팅 유틸리티 함수들
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (percent: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// 데이터 검증 함수들
export const validateStockData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['ticker', 'buyPrice', 'currentPrice', 'quantity'];
  
  for (const field of requiredFields) {
    if (!(field in data)) return false;
  }
  
  if (typeof data.ticker !== 'string' || data.ticker.trim() === '') return false;
  if (typeof data.buyPrice !== 'number' || data.buyPrice <= 0) return false;
  if (typeof data.currentPrice !== 'number' || data.currentPrice <= 0) return false;
  if (typeof data.quantity !== 'number' || data.quantity <= 0) return false;
  
  return true;
};

export const validatePortfolioData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!data.stocks || !Array.isArray(data.stocks)) return false;
  
  return data.stocks.every(validateStockData);
};

// 배열 조작 유틸리티 함수들
export const sortStocks = (stocks: Stock[], key: keyof Stock, direction: 'asc' | 'desc'): Stock[] => {
  return [...stocks].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? -1 : 1;
    if (bValue == null) return direction === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterStocks = (stocks: Stock[], query: string): Stock[] => {
  if (!query.trim()) return stocks;
  
  const lowerQuery = query.toLowerCase();
  return stocks.filter(stock => 
    stock.ticker.toLowerCase().includes(lowerQuery)
  );
};

export const groupStocksByProfitLoss = (stocks: Stock[]): { profitable: Stock[]; unprofitable: Stock[] } => {
  const profitable: Stock[] = [];
  const unprofitable: Stock[] = [];
  
  stocks.forEach(stock => {
    if (calculateProfitLoss(stock) >= 0) {
      profitable.push(stock);
    } else {
      unprofitable.push(stock);
    }
  });
  
  return { profitable, unprofitable };
};

// 색상 관련 유틸리티 함수들
export const getColorPalette = (count: number): string[] => {
  const baseColors = [
    '#6366f1', '#8b5cf6', '#10b981', '#06b6d4', 
    '#f59e0b', '#ef4444', '#84cc16', '#ec4899',
    '#8b5cf6', '#f97316', '#06b6d4', '#10b981'
  ];
  
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

export const getProfitLossColor = (profitLoss: number): string => {
  return profitLoss >= 0 ? '#10b981' : '#ef4444';
};

export const getProfitLossClassName = (profitLoss: number): string => {
  return profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400';
};

// 로컬 스토리지 유틸리티 함수들
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T = any>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return null;
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// 쓰로틀 함수
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      func(...args);
      lastTime = now;
    }
  };
};

// 랜덤 ID 생성 함수
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 깊은 복사 함수
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// 객체 비교 함수
export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

// 배열에서 중복 제거 함수
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return array.filter((item, index) => array.indexOf(item) === index);
  }
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

// 배열 청크 함수
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// 범위 생성 함수
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

// 클래스명 조합 함수
export const classNames = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// 파일 크기 포맷 함수
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// URL 파라미터 파싱 함수
export const parseURLParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

// 객체를 URL 파라미터로 변환 함수
export const objectToURLParams = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  }
  
  return params.toString();
};
