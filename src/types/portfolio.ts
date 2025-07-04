export interface Stock {
  id: number;
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  lastUpdated?: Date;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  bestPerformer?: Stock;
  worstPerformer?: Stock;
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

export interface ImportData {
  stocks: Stock[];
  version?: string;
  metadata?: any;
}