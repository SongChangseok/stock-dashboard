// Alpha Vantage API 서비스

import { AlphaVantageResponse, StockQuote, ApiError } from '../types/api';
import {
  API_CONFIG,
  buildApiUrl,
  isValidApiResponse,
  parseApiError,
} from '../utils/apiConfig';
import { handleApiError, retryOperation } from '../utils/errorHandling';
import { env } from '../config/env';

class StockApiService {
  private rateLimitTracker: Map<string, number> = new Map();
  private cache: Map<string, { data: StockQuote; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // 단일 주식 실시간 가격 조회
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      // Mock 데이터 모드 체크
      if (env.alphaVantage.enableMockData) {
        return this.getMockQuote(symbol);
      }

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

      // API 키 제한 체크
      if (data.Information && data.Information.includes('rate limit')) {
        console.warn('Alpha Vantage API rate limit reached. Switching to mock data.');
        return this.getMockQuote(symbol);
      }

      if (!isValidApiResponse(data)) {
        const error = parseApiError(data);
        // API 제한인 경우 Mock 데이터 사용
        if (error.includes('rate limit') || error.includes('premium')) {
          console.warn(`API limit reached for ${symbol}. Using mock data.`);
          return this.getMockQuote(symbol);
        }
        throw new Error(error);
      }

      const quote = this.transformApiResponse(data);
      this.setCachedData(symbol, quote);
      this.updateRateLimit(symbol);

      return quote;
    } catch (error: any) {
      // API 제한 관련 에러인 경우 Mock 데이터 반환
      if (error.message?.includes('rate limit') || error.message?.includes('premium')) {
        console.warn(`API error for ${symbol}. Using mock data: ${error.message}`);
        return this.getMockQuote(symbol);
      }
      
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

  // Mock 데이터 생성
  private getMockQuote(symbol: string): StockQuote {
    // 기본 주식 데이터
    const baseData = {
      AAPL: { price: 175.50, name: 'Apple Inc.' },
      GOOGL: { price: 2750.30, name: 'Alphabet Inc.' },
      MSFT: { price: 420.15, name: 'Microsoft Corporation' },
      AMZN: { price: 3400.75, name: 'Amazon.com Inc.' },
      TSLA: { price: 850.25, name: 'Tesla Inc.' },
      META: { price: 485.60, name: 'Meta Platforms Inc.' },
      NVDA: { price: 875.40, name: 'NVIDIA Corporation' },
      JPM: { price: 165.80, name: 'JPMorgan Chase & Co.' },
      JNJ: { price: 170.25, name: 'Johnson & Johnson' },
      V: { price: 250.90, name: 'Visa Inc.' },
    };

    const data = baseData[symbol as keyof typeof baseData] || { price: 100, name: `${symbol} Corporation` };
    
    // 약간의 랜덤 변동 추가 (±3%)
    const variation = (Math.random() - 0.5) * 0.06;
    const price = data.price * (1 + variation);
    const previousClose = price * (1 - variation * 0.5);
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      price: Number(price.toFixed(2)),
      open: Number((price * 0.98).toFixed(2)),
      high: Number((price * 1.02).toFixed(2)),
      low: Number((price * 0.96).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      previousClose: Number(previousClose.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      lastTradingDay: new Date().toISOString().split('T')[0],
      lastUpdated: new Date(),
    };
  }
}

// 싱글톤 인스턴스
export const stockApiService = new StockApiService();
export default stockApiService;
