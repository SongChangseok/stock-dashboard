// 실시간 주식 가격 조회 커스텀 훅

import { useState, useEffect, useCallback, useRef } from 'react';
import { StockQuote, StockPriceHookReturn, StockPriceHookOptions } from '../types/api';
import { stockApiService } from '../services/stockApiService';
import { useToast } from '../contexts/ToastContext';
import { logError } from '../utils/errorHandling';

const DEFAULT_OPTIONS: Required<StockPriceHookOptions> = {
  interval: 60000, // 1 minute
  enabled: true,
  retryCount: 3,
  retryDelay: 2000,
};

export const useStockPrice = (
  ticker: string,
  options: StockPriceHookOptions = {}
): StockPriceHookReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { error: showError } = useToast();
  
  const [data, setData] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // 데이터 가져오기 함수
  const fetchStockPrice = useCallback(async () => {
    if (!ticker || !opts.enabled) return;

    try {
      setLoading(true);
      setError(null);
      
      const quote = await stockApiService.getStockQuote(ticker.toUpperCase());
      
      setData(quote);
      setIsStale(false);
      lastFetchRef.current = Date.now();
      retryCountRef.current = 0;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch stock price';
      setError({ message: errorMessage });
      
      logError(err, `useStockPrice: ${ticker}`);
      
      // Rate limit 에러가 아닌 경우에만 토스트 표시
      if (!errorMessage.includes('rate limit')) {
        showError('Stock Price Error', errorMessage);
      }
      
      // 재시도 로직
      if (retryCountRef.current < opts.retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchStockPrice();
        }, opts.retryDelay * retryCountRef.current);
      }
      
    } finally {
      setLoading(false);
    }
  }, [ticker, opts.enabled, opts.retryCount, opts.retryDelay, showError]);

  // 수동 refetch 함수
  const refetch = useCallback(async () => {
    await fetchStockPrice();
  }, [fetchStockPrice]);

  // 데이터 stale 상태 체크
  const checkStaleData = useCallback(() => {
    if (data && lastFetchRef.current) {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      setIsStale(timeSinceLastFetch > opts.interval);
    }
  }, [data, opts.interval]);

  // 초기 데이터 로드
  useEffect(() => {
    if (opts.enabled && ticker) {
      fetchStockPrice();
    }
  }, [fetchStockPrice, opts.enabled, ticker]);

  // 주기적 업데이트 설정
  useEffect(() => {
    if (!opts.enabled || !ticker) return;

    // 기존 인터벌 클리어
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새 인터벌 설정
    intervalRef.current = setInterval(() => {
      fetchStockPrice();
    }, opts.interval);

    // Stale 상태 체크를 위한 추가 인터벌
    const staleCheckInterval = setInterval(checkStaleData, 10000); // 10초마다 체크

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(staleCheckInterval);
    };
  }, [fetchStockPrice, opts.interval, opts.enabled, ticker, checkStaleData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
  };
};

// 여러 주식 가격을 동시에 관리하는 훅
export const useMultipleStockPrices = (
  tickers: string[],
  options: StockPriceHookOptions = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { error: showError } = useToast();
  
  const [data, setData] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Map<string, any>>(new Map());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchMultiplePrices = useCallback(async () => {
    if (!tickers.length || !opts.enabled) return;

    try {
      setLoading(true);
      
      const results = await stockApiService.getMultipleQuotes(tickers);
      
      const newData = new Map<string, StockQuote>();
      const newErrors = new Map<string, any>();
      
      results.forEach((result, ticker) => {
        if (result instanceof Error) {
          newErrors.set(ticker, { message: result.message });
        } else {
          newData.set(ticker, result);
        }
      });
      
      setData(newData);
      setErrors(newErrors);
      lastFetchRef.current = Date.now();
      
    } catch (err: any) {
      logError(err, 'useMultipleStockPrices');
      showError('Stock Prices Error', 'Failed to fetch multiple stock prices');
    } finally {
      setLoading(false);
    }
  }, [tickers, opts.enabled, showError]);

  const refetch = useCallback(async () => {
    await fetchMultiplePrices();
  }, [fetchMultiplePrices]);

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    if (opts.enabled && tickers.length > 0) {
      fetchMultiplePrices();
      
      intervalRef.current = setInterval(() => {
        fetchMultiplePrices();
      }, opts.interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMultiplePrices, opts.interval, opts.enabled, tickers]);

  return {
    data,
    loading,
    errors,
    refetch,
    isStale: lastFetchRef.current ? Date.now() - lastFetchRef.current > opts.interval : false,
  };
};