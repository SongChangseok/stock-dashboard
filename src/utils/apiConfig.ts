// API 설정 및 유틸리티
import { env } from '../config/env';

export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: env.alphaVantage.baseUrl,
    API_KEY: env.alphaVantage.apiKey,
    ENDPOINTS: {
      GLOBAL_QUOTE: 'GLOBAL_QUOTE',
      TIME_SERIES_INTRADAY: 'TIME_SERIES_INTRADAY',
    },
    RATE_LIMITS: {
      REQUESTS_PER_MINUTE: 5,
      REQUESTS_PER_DAY: 500,
    },
  },
  DEFAULT_UPDATE_INTERVAL: env.alphaVantage.updateInterval,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

export const buildApiUrl = (
  function_name: string,
  symbol: string,
  additionalParams?: Record<string, string>
): string => {
  const params = new URLSearchParams({
    function: function_name,
    symbol,
    apikey: API_CONFIG.ALPHA_VANTAGE.API_KEY,
    ...additionalParams,
  });

  return `${API_CONFIG.ALPHA_VANTAGE.BASE_URL}?${params.toString()}`;
};

// API 키 검증
export const isValidApiKey = (apiKey: string): boolean => {
  return Boolean(
    apiKey && 
    apiKey !== 'demo' && 
    apiKey.length > 10 &&
    !apiKey.includes('your_') &&
    !apiKey.includes('_here')
  );
};

// Rate limiting 체크
export const checkRateLimit = (
  lastRequestTime: number,
  minInterval: number
): boolean => {
  return Date.now() - lastRequestTime >= minInterval;
};

// 응답 데이터 파싱 및 검증
export const isValidApiResponse = (response: any): boolean => {
  return (
    response &&
    typeof response === 'object' &&
    !response['Error Message'] &&
    !response['Note']
  ); // Rate limit message
};

// Alpha Vantage 에러 메시지 파싱
export const parseApiError = (response: any): string => {
  if (response['Error Message']) {
    return response['Error Message'];
  }

  if (response['Note']) {
    return 'API rate limit exceeded. Please try again later.';
  }

  if (response['Information']) {
    return response['Information'];
  }

  return 'Unknown API error occurred';
};
