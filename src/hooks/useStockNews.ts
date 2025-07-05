import { useState, useEffect, useCallback } from 'react';
import { NewsArticle, NewsFilters, StockNewsRequest } from '../types/news';
import { newsApiService } from '../services/newsApiService';

export interface UseStockNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  fetchStockNews: (ticker: string, limit?: number) => Promise<void>;
  fetchNews: (filters: NewsFilters) => Promise<void>;
  searchNews: (query: string) => Promise<void>;
  refreshNews: () => Promise<void>;
  clearNews: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useStockNews = (): UseStockNewsReturn => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleError = useCallback((err: any) => {
    console.error('News API Error:', err);
    setError(err.message || 'Failed to fetch news');
    setLoading(false);
  }, []);

  const fetchStockNews = useCallback(async (ticker: string, limit: number = 20) => {
    if (!ticker.trim()) {
      setError('Stock ticker is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const request: StockNewsRequest = {
        ticker: ticker.toUpperCase(),
        limit,
        fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 7 days
      };

      const newArticles = await newsApiService.getStockNews(request);
      setArticles(newArticles);
      setLastRequest({ type: 'stock', ticker, limit });
      setCurrentPage(1);
      setHasMore(newArticles.length >= limit);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchNews = useCallback(async (filters: NewsFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const newArticles = await newsApiService.searchNews(filters);
      setArticles(newArticles);
      setLastRequest({ type: 'search', filters });
      setCurrentPage(filters.page || 1);
      setHasMore(newArticles.length >= (filters.pageSize || 20));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchNews = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError('Search query is required');
      return;
    }

    const filters: NewsFilters = {
      query: query.trim(),
      sortBy: 'publishedAt',
      pageSize: 20,
      page: 1
    };

    await fetchNews(filters);
  }, [fetchNews]);

  const refreshNews = useCallback(async () => {
    if (!lastRequest) {
      setError('No previous request to refresh');
      return;
    }

    if (lastRequest.type === 'stock') {
      await fetchStockNews(lastRequest.ticker, lastRequest.limit);
    } else if (lastRequest.type === 'search') {
      await fetchNews(lastRequest.filters);
    }
  }, [lastRequest, fetchStockNews, fetchNews]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastRequest) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      let newArticles: NewsArticle[] = [];

      if (lastRequest.type === 'search') {
        const filters = {
          ...lastRequest.filters,
          page: nextPage
        };
        newArticles = await newsApiService.searchNews(filters);
      } else if (lastRequest.type === 'stock') {
        // For stock news, we don't have pagination, so we'll fetch more recent news
        const request: StockNewsRequest = {
          ticker: lastRequest.ticker,
          limit: 20,
          fromDate: new Date(Date.now() - (nextPage * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        newArticles = await newsApiService.getStockNews(request);
      }

      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastRequest, currentPage, handleError]);

  const clearNews = useCallback(() => {
    setArticles([]);
    setError(null);
    setLastRequest(null);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Auto-fetch business news on mount
  useEffect(() => {
    const fetchInitialNews = async () => {
      setLoading(true);
      try {
        const businessNews = await newsApiService.getTopBusinessNews(20);
        setArticles(businessNews);
        setLastRequest({ type: 'business' });
      } catch (err) {
        console.warn('Failed to fetch initial news:', err);
        // Don't show error for initial fetch failure
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNews();
  }, []);

  return {
    articles,
    loading,
    error,
    fetchStockNews,
    fetchNews,
    searchNews,
    refreshNews,
    clearNews,
    hasMore,
    loadMore
  };
};