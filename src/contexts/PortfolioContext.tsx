import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Stock, ExportData } from '../types/portfolio';
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateTotalValue,
  calculateTotalProfitLoss
} from '../utils/portfolioCalculations';
import { createStock, normalizeTickerSymbol, isValidStock } from '../utils/stockHelpers';
import { useToastContext } from './ToastContext';

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
  const toast = useToastContext();

  const addStock = (stockData: Omit<Stock, 'id'>) => {
    try {
      if (!isValidStock(stockData)) {
        toast.showError('주식 추가 실패', '유효하지 않은 주식 데이터입니다.');
        return;
      }

      const newStock = createStock(
        stockData.ticker,
        stockData.buyPrice,
        stockData.currentPrice,
        stockData.quantity
      );
      
      // 중복 티커 확인
      const existingStock = stocks.find(stock => stock.ticker === newStock.ticker);
      if (existingStock) {
        toast.showWarning('중복된 주식', `${newStock.ticker}는 이미 포트폴리오에 있습니다.`);
        return;
      }

      setStocks(prev => [...prev, newStock]);
      toast.showSuccess('주식 추가 완료', `${newStock.ticker}가 포트폴리오에 추가되었습니다.`);
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.showError('주식 추가 실패', '예상치 못한 오류가 발생했습니다.');
    }
  };

  const updateStock = (id: number, stockData: Omit<Stock, 'id'>) => {
    try {
      if (!isValidStock(stockData)) {
        toast.showError('주식 수정 실패', '유효하지 않은 주식 데이터입니다.');
        return;
      }

      const existingStock = stocks.find(stock => stock.id === id);
      if (!existingStock) {
        toast.showError('주식 수정 실패', '수정하려는 주식을 찾을 수 없습니다.');
        return;
      }

      setStocks(prev => 
        prev.map(stock => 
          stock.id === id 
            ? { 
                ...stockData, 
                id, 
                ticker: normalizeTickerSymbol(stockData.ticker),
                lastUpdated: new Date()
              }
            : stock
        )
      );
      
      toast.showSuccess('주식 수정 완료', `${stockData.ticker} 정보가 업데이트되었습니다.`);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.showError('주식 수정 실패', '예상치 못한 오류가 발생했습니다.');
    }
  };

  const deleteStock = (id: number) => {
    try {
      const stockToDelete = stocks.find(stock => stock.id === id);
      if (!stockToDelete) {
        toast.showError('주식 삭제 실패', '삭제하려는 주식을 찾을 수 없습니다.');
        return;
      }

      setStocks(prev => prev.filter(stock => stock.id !== id));
      toast.showSuccess('주식 삭제 완료', `${stockToDelete.ticker}가 포트폴리오에서 제거되었습니다.`);
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.showError('주식 삭제 실패', '예상치 못한 오류가 발생했습니다.');
    }
  };

  const importStocks = (importedStocks: Stock[]) => {
    try {
      if (!importedStocks || importedStocks.length === 0) {
        toast.showWarning('데이터 없음', '가져올 주식 데이터가 없습니다.');
        return;
      }

      const stocksWithNewIds = importedStocks.map((stock, index) => 
        createStock(
          stock.ticker,
          stock.buyPrice,
          stock.currentPrice,
          stock.quantity,
          Date.now() + index
        )
      );
      
      setStocks(stocksWithNewIds);
      toast.showSuccess('데이터 가져오기 완료', `${importedStocks.length}개의 주식을 성공적으로 가져왔습니다.`);
    } catch (error) {
      console.error('Error importing stocks:', error);
      toast.showError('데이터 가져오기 실패', '예상치 못한 오류가 발생했습니다.');
    }
  };

  const getTotalValue = (): number => {
    return calculateTotalValue(stocks);
  };

  const getProfitLoss = (stock: Stock): number => {
    return calculateProfitLoss(stock);
  };

  const getProfitLossPercent = (stock: Stock): number => {
    return calculateProfitLossPercent(stock);
  };

  const exportData = (): ExportData => {
    return {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: {
        totalValue: calculateTotalValue(stocks),
        totalPositions: stocks.length,
        totalProfitLoss: calculateTotalProfitLoss(stocks)
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
    calculateTotalValue: getTotalValue,
    calculateProfitLoss: getProfitLoss,
    calculateProfitLossPercent: getProfitLossPercent
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext;