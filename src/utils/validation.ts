// Validation functions for stock form data and portfolio data

import { StockFormData, ValidationError } from '../types/portfolio';

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

export const validateStockFormData = (formData: StockFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate ticker
  if (!formData.ticker.trim()) {
    errors.push({ field: 'ticker', message: 'Ticker symbol is required' });
  } else if (!/^[A-Za-z]+$/.test(formData.ticker.trim())) {
    errors.push({ field: 'ticker', message: 'Ticker must contain only letters' });
  }

  // Validate buy price
  const buyPrice = parseFloat(formData.buyPrice);
  if (!formData.buyPrice.trim()) {
    errors.push({ field: 'buyPrice', message: 'Buy price is required' });
  } else if (isNaN(buyPrice) || buyPrice <= 0) {
    errors.push({ field: 'buyPrice', message: 'Buy price must be a positive number' });
  }

  // Validate current price
  const currentPrice = parseFloat(formData.currentPrice);
  if (!formData.currentPrice.trim()) {
    errors.push({ field: 'currentPrice', message: 'Current price is required' });
  } else if (isNaN(currentPrice) || currentPrice <= 0) {
    errors.push({ field: 'currentPrice', message: 'Current price must be a positive number' });
  }

  // Validate quantity
  const quantity = parseInt(formData.quantity);
  if (!formData.quantity.trim()) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive integer' });
  }

  return errors;
};

export const validatePortfolioData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!data.stocks || !Array.isArray(data.stocks)) return false;
  
  return data.stocks.every(validateStockData);
};