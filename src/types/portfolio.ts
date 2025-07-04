export interface Stock {
  id: number;
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  lastUpdated?: Date;
}

export interface StockFormData {
  ticker: string;
  buyPrice: string;
  currentPrice: string;
  quantity: string;
}

export interface PortfolioData {
  name: string;
  value: number;
  color: string;
}

export interface ExportData {
  version: string;
  exportDate: string;
  metadata: {
    totalValue: number;
    totalPositions: number;
    totalProfitLoss: number;
  };
  stocks: Stock[];
}

export interface PortfolioMetrics {
  totalValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  bestPerformer?: Stock;
  worstPerformer?: Stock;
}

export interface StockCalculation {
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}
