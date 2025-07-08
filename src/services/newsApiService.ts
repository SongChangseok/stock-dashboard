import {
  NewsApiResponse,
  NewsArticle,
  NewsFilters,
  StockNewsRequest,
  NewsApiConfig,
} from '../types/news';
import { env } from '../config/env';

class NewsApiService {
  private config: NewsApiConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.config = {
      apiKey: env.newsApi.apiKey,
      baseUrl: env.newsApi.baseUrl,
      defaultPageSize: 20,
      maxCacheAge: 10 * 60 * 1000, // 10 minutes
    };

    if (!this.config.apiKey) {
      console.warn(
        'News API key not found. Please set VITE_NEWS_API_KEY in your environment variables.'
      );
    }
  }

  private getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private async makeRequest(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error(
        'News API key is required. Please set VITE_NEWS_API_KEY environment variable.'
      );
    }

    const cacheKey = this.getCacheKey({ endpoint, params });
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);

    // Add API key and other params
    const searchParams = {
      apiKey: this.config.apiKey,
      ...params,
    };

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your News API key.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'API returned an error');
      }

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('News API request failed:', error);
      throw error;
    }
  }

  private processArticles(articles: any[]): NewsArticle[] {
    return articles
      .filter(article => article.title && article.title !== '[Removed]')
      .map((article, index) => ({
        id: `${article.url || index}_${Date.now()}`,
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source?.id || null,
          name: article.source?.name || 'Unknown Source',
        },
        content: article.content,
        author: article.author,
        sentiment: this.analyzeSentiment(
          article.title + ' ' + (article.description || '')
        ),
        relevanceScore: this.calculateRelevanceScore(article),
      }));
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'gain',
      'rise',
      'up',
      'bull',
      'profit',
      'growth',
      'surge',
      'rally',
      'boost',
      'strong',
    ];
    const negativeWords = [
      'fall',
      'drop',
      'down',
      'bear',
      'loss',
      'decline',
      'crash',
      'plunge',
      'weak',
      'sell',
    ];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word =>
      lowerText.includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word =>
      lowerText.includes(word)
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateRelevanceScore(article: any): number {
    let score = 50; // Base score

    // Boost score for financial sources
    const financialSources = [
      'reuters',
      'bloomberg',
      'cnbc',
      'marketwatch',
      'wsj',
    ];
    if (
      financialSources.some(
        source =>
          article.source?.name?.toLowerCase().includes(source) ||
          article.url?.toLowerCase().includes(source)
      )
    ) {
      score += 30;
    }

    // Boost score for recent articles
    const publishedDate = new Date(article.publishedAt);
    const hoursSincePublished =
      (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    if (hoursSincePublished < 6) score += 20;
    else if (hoursSincePublished < 24) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  async searchNews(filters: NewsFilters): Promise<NewsArticle[]> {
    const params: Record<string, any> = {
      q: filters.query || 'stock market',
      category: filters.category,
      sortBy: filters.sortBy || 'publishedAt',
      from: filters.from,
      to: filters.to,
      sources: filters.sources?.join(','),
      language: filters.language || 'en',
      pageSize: Math.min(filters.pageSize || this.config.defaultPageSize, 100),
      page: filters.page || 1,
    };

    const response: NewsApiResponse = await this.makeRequest(
      '/everything',
      params
    );
    return this.processArticles(response.articles || []);
  }

  async getStockNews(request: StockNewsRequest): Promise<NewsArticle[]> {
    const { ticker, limit = 20, fromDate, toDate } = request;

    // Create comprehensive search query for the stock
    const companyNames: Record<string, string> = {
      AAPL: 'Apple',
      GOOGL: 'Google Alphabet',
      MSFT: 'Microsoft',
      AMZN: 'Amazon',
      TSLA: 'Tesla',
      META: 'Meta Facebook',
      NVDA: 'NVIDIA',
      JPM: 'JPMorgan',
      JNJ: 'Johnson Johnson',
      V: 'Visa',
    };

    const companyName = companyNames[ticker.toUpperCase()] || ticker;
    const query = `${ticker} OR "${companyName}"`;

    const params: Record<string, any> = {
      q: query,
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: Math.min(limit, 100),
      from: fromDate,
      to: toDate,
    };

    const response: NewsApiResponse = await this.makeRequest(
      '/everything',
      params
    );
    const articles = this.processArticles(response.articles || []);

    // Add stock ticker to articles
    return articles.map(article => ({
      ...article,
      relatedStocks: [ticker.toUpperCase()],
    }));
  }

  async getTopBusinessNews(limit: number = 20): Promise<NewsArticle[]> {
    const params = {
      category: 'business',
      country: 'us',
      pageSize: Math.min(limit, 100),
      sortBy: 'publishedAt',
    };

    const response: NewsApiResponse = await this.makeRequest(
      '/top-headlines',
      params
    );
    return this.processArticles(response.articles || []);
  }

  async getNewsByCategory(
    category: string,
    limit: number = 20
  ): Promise<NewsArticle[]> {
    const params = {
      category,
      country: 'us',
      pageSize: Math.min(limit, 100),
      sortBy: 'publishedAt',
    };

    const response: NewsApiResponse = await this.makeRequest(
      '/top-headlines',
      params
    );
    return this.processArticles(response.articles || []);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const newsApiService = new NewsApiService();
