import { useState, useEffect, useCallback } from 'react';
import { stockApiService, StockQuote, ApiResponse } from '../services/stockApi';
import { useToastContext } from '../contexts/ToastContext';

interface UseStockPriceResult {
  quotes: Map<string, StockQuote>;
  loading: boolean;
  error: string | null;
  refreshQuote: (symbol: string) => Promise<void>;
  refreshAllQuotes: (symbols: string[]) => Promise<void>;
  isDemo: boolean;
}

export const useStockPrice = (symbols: string[] = []): UseStockPriceResult => {
  const [quotes, setQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToastContext();

  const refreshQuote = useCallback(async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stockApiService.getStockQuote(symbol);
      
      if (response.success && response.data) {
        setQuotes(prev => new Map(prev).set(symbol, response.data!));
      } else {
        setError(response.error || '주식 정보를 가져오는데 실패했습니다.');
        toast.showError('주식 정보 조회 실패', response.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = '주식 정보를 가져오는데 실패했습니다.';
      setError(errorMessage);
      toast.showError('네트워크 오류', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshAllQuotes = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const responses = await stockApiService.getMultipleQuotes(symbols);
      const newQuotes = new Map<string, StockQuote>();
      
      responses.forEach((response, symbol) => {
        if (response.success && response.data) {
          newQuotes.set(symbol, response.data);
        }
      });
      
      setQuotes(newQuotes);
      
      // 에러가 있는 경우 알림
      const errors = Array.from(responses.entries())
        .filter(([_, response]) => !response.success)
        .map(([symbol, response]) => `${symbol}: ${response.error}`);
      
      if (errors.length > 0) {
        toast.showWarning('일부 주식 정보 조회 실패', `${errors.length}개 주식의 정보를 가져오지 못했습니다.`);
      }
    } catch (error) {
      const errorMessage = '주식 정보를 가져오는데 실패했습니다.';
      setError(errorMessage);
      toast.showError('네트워크 오류', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 초기 로드 및 심볼 변경 시 자동 새로고침
  useEffect(() => {
    if (symbols.length > 0) {
      refreshAllQuotes(symbols);
    }
  }, [symbols, refreshAllQuotes]);

  return {
    quotes,
    loading,
    error,
    refreshQuote,
    refreshAllQuotes,
    isDemo: stockApiService.isDemo()
  };
};