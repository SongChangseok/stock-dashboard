export interface Stock {
  id: number;
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  lastUpdated?: Date;
  sector?: string;
  industry?: string;
  marketCap?: number;
  dividend?: number;
  beta?: number;
  pe?: number;
  eps?: number;
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
  quantity?: number;
  allocation?: number;
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
  // Core metrics
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  bestPerformer?: Stock;
  worstPerformer?: Stock;
  // Advanced analytics
  sharpeRatio?: number;
  volatility?: number;
  maxDrawdown?: number;
  diversificationIndex?: number;
  averageReturn?: number;
  riskAdjustedReturn?: number;
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

export interface PortfolioAnalytics {
  performanceMetrics: PerformanceMetrics;
  riskMetrics: RiskMetrics;
  diversificationMetrics: DiversificationMetrics;
  sectorAnalysis: SectorAnalysis;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  bestPerformingStock: Stock;
  worstPerformingStock: Stock;
  winLossRatio: number;
  averageGain: number;
  averageLoss: number;
}

export interface RiskMetrics {
  portfolioVolatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  beta: number;
  alpha: number;
}

export interface DiversificationMetrics {
  concentrationRisk: number;
  herfindahlIndex: number;
  diversificationRatio: number;
  correlationMatrix: number[][];
  effectiveNumberOfStocks: number;
}

export interface SectorAnalysis {
  sectorAllocation: SectorAllocation[];
  sectorPerformance: SectorPerformance[];
  sectorRisk: SectorRisk[];
}

export interface SectorAllocation {
  sector: string;
  allocation: number;
  value: number;
}

export interface SectorPerformance {
  sector: string;
  return: number;
  returnPercent: number;
}

export interface SectorRisk {
  sector: string;
  volatility: number;
  beta: number;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  stocks: Stock[];
}

export interface PerformanceHistory {
  snapshots: PortfolioSnapshot[];
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}
