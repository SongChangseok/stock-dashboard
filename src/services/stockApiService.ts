// Alpha Vantage API 서비스

import { AlphaVantageResponse, StockQuote, ApiError } from '../types/api';
import {
  API_CONFIG,
  buildApiUrl,
  isValidApiResponse,
  parseApiError,
} from '../utils/apiConfig';
import { handleApiError, retryOperation } from '../utils/errorHandling';

class StockApiService {
  private rateLimitTracker: Map<string, number> = new Map();
  private cache: Map<string, { data: StockQuote; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // 단일 주식 실시간 가격 조회
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      // 캐시 확인
      const cached = this.getCachedData(symbol);
      if (cached) {
        return cached;
      }

      // Rate limiting 체크
      this.checkRateLimit(symbol);

      const url = buildApiUrl(
        API_CONFIG.ALPHA_VANTAGE.ENDPOINTS.GLOBAL_QUOTE,
        symbol
      );

      const response = await retryOperation(
        () => this.fetchWithTimeout(url),
        API_CONFIG.MAX_RETRY_ATTEMPTS,
        API_CONFIG.RETRY_DELAY
      );

      const data = await response.json();

      if (!isValidApiResponse(data)) {
        throw new Error(parseApiError(data));
      }

      const quote = this.transformApiResponse(data);
      this.setCachedData(symbol, quote);
      this.updateRateLimit(symbol);

      return quote;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  // 여러 주식 가격 일괄 조회
  async getMultipleQuotes(
    symbols: string[]
  ): Promise<Map<string, StockQuote | Error>> {
    const results = new Map<string, StockQuote | Error>();

    // 병렬 처리를 위해 배치로 나누기 (Rate limit 고려)
    const batchSize = 3;
    const batches = this.createBatches(symbols, batchSize);

    for (const batch of batches) {
      const promises = batch.map(async symbol => {
        try {
          const quote = await this.getStockQuote(symbol);
          return { symbol, data: quote };
        } catch (error) {
          return { symbol, error: error as Error };
        }
      });

      const batchResults = await Promise.allSettled(promises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const { symbol, data, error } = result.value;
          results.set(symbol, error || data);
        } else {
          // 배치 전체가 실패한 경우는 개별 심볼에 대한 처리가 필요
        }
      });

      // 배치 간 딜레이 (Rate limiting)
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(1000);
      }
    }

    return results;
  }

  // API 응답을 StockQuote 형태로 변환
  private transformApiResponse(data: AlphaVantageResponse): StockQuote {
    const quote = data['Global Quote'];

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      lastTradingDay: quote['07. latest trading day'],
      lastUpdated: new Date(),
    };
  }

  // 캐시 데이터 조회
  private getCachedData(symbol: string): StockQuote | null {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // 캐시 데이터 저장
  private setCachedData(symbol: string, data: StockQuote): void {
    this.cache.set(symbol, { data, timestamp: Date.now() });
  }

  // Rate limiting 체크
  private checkRateLimit(symbol: string): void {
    const lastRequest = this.rateLimitTracker.get(symbol) || 0;
    const minInterval =
      60000 / API_CONFIG.ALPHA_VANTAGE.RATE_LIMITS.REQUESTS_PER_MINUTE;

    if (Date.now() - lastRequest < minInterval) {
      throw new Error(
        'Rate limit exceeded. Please wait before making another request.'
      );
    }
  }

  // Rate limit 업데이트
  private updateRateLimit(symbol: string): void {
    this.rateLimitTracker.set(symbol, Date.now());
  }

  // 배치 생성
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  // 딜레이 유틸리티
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 타임아웃이 있는 fetch
  private async fetchWithTimeout(
    url: string,
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 캐시 클리어
  public clearCache(): void {
    this.cache.clear();
  }

  // Rate limit 상태 조회
  public getRateLimitStatus(): Map<string, number> {
    return new Map(this.rateLimitTracker);
  }
}

// 싱글톤 인스턴스
export const stockApiService = new StockApiService();
export default stockApiService;
