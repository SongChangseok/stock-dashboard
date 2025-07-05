export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: NewsSource;
  content?: string;
  author?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevanceScore?: number;
  relatedStocks?: string[];
}

export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
}

export interface NewsFilters {
  query?: string;
  category?: NewsCategory;
  sortBy?: NewsSortBy;
  from?: string;
  to?: string;
  sources?: string[];
  language?: string;
  pageSize?: number;
  page?: number;
  stocks?: string[];
}

export type NewsCategory = 
  | 'business' 
  | 'entertainment' 
  | 'general' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology';

export type NewsSortBy = 
  | 'relevancy' 
  | 'popularity' 
  | 'publishedAt';

export interface StockNewsRequest {
  ticker: string;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

export interface NewsContextType {
  state: NewsState;
  fetchNews: (filters: NewsFilters) => Promise<void>;
  fetchStockNews: (request: StockNewsRequest) => Promise<void>;
  searchNews: (query: string) => Promise<void>;
  clearNews: () => void;
  setError: (error: string | null) => void;
  refreshNews: () => Promise<void>;
}

export interface NewsApiConfig {
  apiKey: string;
  baseUrl: string;
  defaultPageSize: number;
  maxCacheAge: number;
}

export interface CachedNewsData {
  data: NewsArticle[];
  timestamp: number;
  key: string;
  expiresAt: number;
}

export interface NewsMetrics {
  totalArticles: number;
  sourcesCount: number;
  averageSentiment: number;
  lastUpdateTime: string;
  cacheHitRate: number;
}