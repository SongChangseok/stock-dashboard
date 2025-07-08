// 실시간 주식 가격 관리 컨텍스트

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { StockQuote } from '../types/api';
import { useMultipleStockPrices } from '../hooks/useStockPrice';
import { usePortfolio } from './PortfolioContext';
import { useToast } from './ToastContext';
import { useSettings } from './SettingsContext';

interface StockPriceContextType {
  stockPrices: Map<string, StockQuote>;
  isLoading: boolean;
  errors: Map<string, any>;
  refreshPrices: () => Promise<void>;
  getStockPrice: (ticker: string) => StockQuote | undefined;
  isDataStale: boolean;
  lastUpdated: Date | null;
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
  const { settings, updateSetting } = useSettings();

  // 포트폴리오의 모든 주식 티커 추출
  const tickers = state.stocks.map(stock => stock.ticker);

  // 여러 주식 가격 동시 관리
  const {
    data: stockPrices,
    loading: isLoading,
    errors,
    refetch,
    isStale: isDataStale,
  } = useMultipleStockPrices(tickers, {
    interval: settings.updateInterval,
    enabled: settings.realTimePriceUpdates && tickers.length > 0,
    retryCount: 2,
    retryDelay: 3000,
  });

  // 마지막 업데이트 시간 추적
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  // 가격 데이터가 업데이트될 때마다 시간 기록
  useEffect(() => {
    if (stockPrices.size > 0) {
      setLastUpdated(new Date());
    }
  }, [stockPrices]);

  // 실시간 업데이트 토글 함수
  const toggleRealTime = useCallback(() => {
    const newValue = !settings.realTimePriceUpdates;
    updateSetting('realTimePriceUpdates', newValue);

    if (newValue) {
      info(
        'Real-time Updates Enabled',
        'Stock prices will update automatically.'
      );
    } else {
      info(
        'Real-time Updates Disabled',
        'Stock prices will not update automatically.'
      );
    }
  }, [settings.realTimePriceUpdates, updateSetting, info]);

  // 가격 새로고침 함수
  const refreshPrices = useCallback(async () => {
    try {
      await refetch();
      info('Prices Updated', 'Stock prices have been refreshed successfully.');
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  }, [refetch, info]);

  // 특정 주식 가격 조회 함수
  const getStockPrice = useCallback(
    (ticker: string): StockQuote | undefined => {
      return stockPrices.get(ticker.toUpperCase());
    },
    [stockPrices]
  );

  // 에러 알림 (과도한 알림 방지를 위해 제한적으로 표시)
  useEffect(() => {
    if (errors.size > 0) {
      const errorCount = errors.size;
      const totalStocks = tickers.length;

      // API 제한 경고 메시지
      const hasRateLimitError = Array.from(errors.values()).some(error => 
        error?.message?.includes('rate limit') || error?.message?.includes('premium')
      );

      if (hasRateLimitError) {
        console.warn(
          'Alpha Vantage API daily limit reached. Using mock data for stock prices. ' +
          'Consider upgrading to a premium plan for unlimited requests.'
        );
      } else if (errorCount / totalStocks >= 0.5) {
        console.warn(
          `Failed to fetch prices for ${errorCount} out of ${totalStocks} stocks`
        );
      }
    }
  }, [errors, tickers.length]);

  const value: StockPriceContextType = {
    stockPrices,
    isLoading,
    errors,
    refreshPrices,
    getStockPrice,
    isDataStale,
    lastUpdated,
    isRealTimeEnabled: settings.realTimePriceUpdates,
    toggleRealTime,
  };

  return (
    <StockPriceContext.Provider value={value}>
      {children}
    </StockPriceContext.Provider>
  );
};

// 개별 주식용 훅 (기존 포트폴리오와 별개)
export const useIndividualStockPrice = (ticker: string, options?: any) => {
  const { useStockPrice } = require('../hooks/useStockPrice');
  return useStockPrice(ticker, options);
};
