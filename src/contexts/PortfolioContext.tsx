import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Stock, ExportData } from '../types/portfolio';

interface PortfolioContextType {
  stocks: Stock[];
  addStock: (stock: Omit<Stock, 'id'>) => void;
  updateStock: (id: number, stock: Omit<Stock, 'id'>) => void;
  deleteStock: (id: number) => void;
  importStocks: (stocks: Stock[]) => void;
  exportData: () => ExportData;
  calculateTotalValue: () => number;
  calculateProfitLoss: (stock: Stock) => number;
  calculateProfitLossPercent: (stock: Stock) => number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([
    { id: 1, ticker: 'AAPL', buyPrice: 150.00, currentPrice: 185.50, quantity: 10 },
    { id: 2, ticker: 'GOOGL', buyPrice: 2500.00, currentPrice: 2650.00, quantity: 5 },
    { id: 3, ticker: 'TSLA', buyPrice: 800.00, currentPrice: 750.00, quantity: 8 },
  ]);

  const addStock = (stockData: Omit<Stock, 'id'>) => {
    const newStock: Stock = {
      ...stockData,
      id: Date.now(),
      ticker: stockData.ticker.toUpperCase()
    };
    setStocks(prev => [...prev, newStock]);
  };

  const updateStock = (id: number, stockData: Omit<Stock, 'id'>) => {
    setStocks(prev => 
      prev.map(stock => 
        stock.id === id 
          ? { ...stockData, id, ticker: stockData.ticker.toUpperCase() }
          : stock
      )
    );
  };

  const deleteStock = (id: number) => {
    setStocks(prev => prev.filter(stock => stock.id !== id));
  };

  const importStocks = (importedStocks: Stock[]) => {
    const stocksWithNewIds = importedStocks.map((stock, index) => ({
      ...stock,
      id: Date.now() + index,
      ticker: stock.ticker.toUpperCase()
    }));
    setStocks(stocksWithNewIds);
  };

  const calculateTotalValue = (): number => {
    return stocks.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
  };

  const calculateProfitLoss = (stock: Stock): number => {
    return (stock.currentPrice - stock.buyPrice) * stock.quantity;
  };

  const calculateProfitLossPercent = (stock: Stock): number => {
    return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
  };

  const exportData = (): ExportData => {
    return {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: {
        totalValue: calculateTotalValue(),
        totalPositions: stocks.length,
        totalProfitLoss: stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0)
      },
      stocks: stocks
    };
  };

  const value: PortfolioContextType = {
    stocks,
    addStock,
    updateStock,
    deleteStock,
    importStocks,
    exportData,
    calculateTotalValue,
    calculateProfitLoss,
    calculateProfitLossPercent
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext;