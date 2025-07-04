export interface Stock {
  id: number;
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
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
