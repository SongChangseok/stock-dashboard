// 사용자 입력 기반 포트폴리오 가격 관리 컨텍스트

import React, {
  createContext,
  useContext,
  useCallback,
} from 'react';
import { usePortfolio } from './PortfolioContext';
import { useToast } from './ToastContext';

interface StockPriceContextType {
  getStockPrice: (ticker: string) => { price: number } | undefined;
  refreshPrices: () => Promise<void>;
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
}

const StockPriceContext = createContext<StockPriceContextType | undefined>(
  undefined
);

export const useStockPrices = (): StockPriceContextType => {
  const context = useContext(StockPriceContext);
  if (!context) {
    throw new Error('useStockPrices must be used within StockPriceProvider');
  }
  return context;
};

interface StockPriceProviderProps {
  children: React.ReactNode;
}

export const StockPriceProvider: React.FC<StockPriceProviderProps> = ({
  children,
}) => {
  const { state } = usePortfolio();
  const { info } = useToast();

  // 사용자 입력 데이터에서 주식 가격 조회
  const getStockPrice = useCallback(
    (ticker: string): { price: number } | undefined => {
      const stock = state.stocks.find(s => s.ticker.toUpperCase() === ticker.toUpperCase());
      return stock ? { price: stock.currentPrice } : undefined;
    },
    [state.stocks]
  );

  // 더미 새로고침 함수 (실제로는 아무것도 하지 않음)
  const refreshPrices = useCallback(async () => {
    info('Portfolio Updated', 'Using your input data for calculations.');
  }, [info]);

  // 실시간 업데이트는 항상 비활성화
  const toggleRealTime = useCallback(() => {
    info('Real-time Updates Disabled', 'This portfolio uses your input data only.');
  }, [info]);

  const value: StockPriceContextType = {
    getStockPrice,
    refreshPrices,
    isRealTimeEnabled: false,
    toggleRealTime,
  };

  return (
    <StockPriceContext.Provider value={value}>
      {children}
    </StockPriceContext.Provider>
  );
};
