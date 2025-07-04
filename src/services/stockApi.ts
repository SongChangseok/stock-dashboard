export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface ApiResponse {
  success: boolean;
  data?: StockQuote;
  error?: string;
}

class StockApiService {
  private apiKey: string;
  private baseUrl: string;
  private requestQueue: Map<string, Promise<ApiResponse>>;
  private lastRequestTime: number;
  private requestDelay: number;

  constructor() {
    // 데모용 API 키 (실제 사용 시 환경변수에서 가져와야 함)
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.requestQueue = new Map();
    this.lastRequestTime = 0;
    this.requestDelay = 12000; // Alpha Vantage 무료 계정: 5 calls/minute
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getStockQuote(symbol: string): Promise<ApiResponse> {
    try {
      // 동일한 심볼에 대한 중복 요청 방지
      if (this.requestQueue.has(symbol)) {
        return await this.requestQueue.get(symbol)!;
      }

      const request = this.fetchStockQuote(symbol);
      this.requestQueue.set(symbol, request);

      const result = await request;
      this.requestQueue.delete(symbol);

      return result;
    } catch (error) {
      this.requestQueue.delete(symbol);
      console.error(`Error fetching quote for ${symbol}:`, error);
      return {
        success: false,
        error: '주식 정보를 가져오는데 실패했습니다.'
      };
    }
  }

  private async fetchStockQuote(symbol: string): Promise<ApiResponse> {
    await this.waitForRateLimit();

    // 데모 모드일 때는 Mock 데이터 반환
    if (this.apiKey === 'demo') {
      return this.getMockQuote(symbol);
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('function', 'GLOBAL_QUOTE');
      url.searchParams.append('symbol', symbol);
      url.searchParams.append('apikey', this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 에러 체크
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('유효하지 않은 주식 심볼입니다.');
      }

      return {
        success: true,
        data: {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          lastUpdated: quote['07. latest trading day']
        }
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  private getMockQuote(symbol: string): ApiResponse {
    // 데모용 Mock 데이터
    const basePrice = this.getBasePriceForSymbol(symbol);
    const change = (Math.random() - 0.5) * 10; // -5 ~ +5 변동
    const changePercent = (change / basePrice) * 100;

    return {
      success: true,
      data: {
        symbol,
        price: Math.round((basePrice + change) * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'AAPL': 175,
      'GOOGL': 2800,
      'TSLA': 800,
      'MSFT': 350,
      'AMZN': 3200,
      'META': 320,
      'NVDA': 450,
      'AMD': 110
    };
    
    return basePrices[symbol.toUpperCase()] || 100;
  }

  async getMultipleQuotes(symbols: string[]): Promise<Map<string, ApiResponse>> {
    const results = new Map<string, ApiResponse>();
    
    // 순차적으로 API 호출 (Rate limit 준수)
    for (const symbol of symbols) {
      const quote = await this.getStockQuote(symbol);
      results.set(symbol, quote);
    }
    
    return results;
  }

  isDemo(): boolean {
    return this.apiKey === 'demo';
  }
}

export const stockApiService = new StockApiService();