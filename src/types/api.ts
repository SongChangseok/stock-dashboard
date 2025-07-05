// API 관련 타입 정의

export interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: number;
  lastTradingDay: string;
  lastUpdated: Date;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  rateLimited?: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerDay: number;
  remainingRequests: number;
  resetTime: Date;
}

export interface StockPriceHookOptions {
  interval?: number; // Update interval in milliseconds
  enabled?: boolean; // Whether to fetch data
  retryCount?: number; // Number of retries on failure
  retryDelay?: number; // Delay between retries in milliseconds
}

export interface StockPriceHookReturn extends ApiResponse<StockQuote> {
  refetch: () => Promise<void>;
  isStale: boolean; // Whether data is older than interval
}
