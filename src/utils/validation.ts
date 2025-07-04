import { Stock } from '../types/portfolio';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateStock = (stock: Partial<Stock>): ValidationResult => {
  const errors: string[] = [];

  // Ticker validation
  if (!stock.ticker || typeof stock.ticker !== 'string') {
    errors.push('Ticker symbol is required');
  } else if (stock.ticker.trim().length === 0) {
    errors.push('Ticker symbol cannot be empty');
  } else if (stock.ticker.trim().length > 10) {
    errors.push('Ticker symbol cannot be more than 10 characters');
  } else if (!/^[A-Za-z]+$/.test(stock.ticker.trim())) {
    errors.push('Ticker symbol can only contain letters');
  }

  // Buy price validation
  if (stock.buyPrice === undefined || stock.buyPrice === null) {
    errors.push('Buy price is required');
  } else if (typeof stock.buyPrice !== 'number') {
    errors.push('Buy price must be a number');
  } else if (stock.buyPrice <= 0) {
    errors.push('Buy price must be greater than 0');
  } else if (stock.buyPrice > 1000000) {
    errors.push('Buy price cannot exceed $1,000,000');
  }

  // Current price validation
  if (stock.currentPrice === undefined || stock.currentPrice === null) {
    errors.push('Current price is required');
  } else if (typeof stock.currentPrice !== 'number') {
    errors.push('Current price must be a number');
  } else if (stock.currentPrice <= 0) {
    errors.push('Current price must be greater than 0');
  } else if (stock.currentPrice > 1000000) {
    errors.push('Current price cannot exceed $1,000,000');
  }

  // Quantity validation
  if (stock.quantity === undefined || stock.quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof stock.quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (stock.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  } else if (!Number.isInteger(stock.quantity)) {
    errors.push('Quantity must be a whole number');
  } else if (stock.quantity > 1000000) {
    errors.push('Quantity cannot exceed 1,000,000 shares');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStockData = (
  ticker: string,
  buyPrice: string,
  currentPrice: string,
  quantity: string
): ValidationResult => {
  const stock = {
    ticker: ticker?.trim(),
    buyPrice: parseFloat(buyPrice),
    currentPrice: parseFloat(currentPrice),
    quantity: parseInt(quantity)
  };

  return validateStock(stock);
};

export const validateImportData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON format');
    return { isValid: false, errors };
  }

  if (!data.stocks || !Array.isArray(data.stocks)) {
    errors.push('Missing or invalid stocks array');
    return { isValid: false, errors };
  }

  data.stocks.forEach((stock: any, index: number) => {
    const stockValidation = validateStock(stock);
    if (!stockValidation.isValid) {
      stockValidation.errors.forEach(error => {
        errors.push(`Stock ${index + 1}: ${error}`);
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFileType = (file: File, allowedTypes: string[]): ValidationResult => {
  const errors: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFileSize = (file: File, maxSizeInMB: number): ValidationResult => {
  const errors: string[] = [];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeInMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};