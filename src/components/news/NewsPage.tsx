import React, { useState, useEffect } from 'react';
import { Search, Newspaper, Filter, RefreshCw, TrendingUp, Calendar, Tag } from 'lucide-react';
import { useStockNews } from '../../hooks/useStockNews';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { NewsCategory, NewsSortBy } from '../../types/news';
import NewsCard from './NewsCard';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

const NewsPage: React.FC = () => {
  const { 
    articles, 
    loading, 
    error, 
    searchNews, 
    fetchStockNews, 
    refreshNews, 
    clearNews,
    hasMore,
    loadMore
  } = useStockNews();

  const { state: portfolioState } = usePortfolio();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('business');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [sortBy, setSortBy] = useState<NewsSortBy>('publishedAt');
  const [dateFilter, setDateFilter] = useState<string>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories: { value: NewsCategory | 'all'; label: string; icon: any }[] = [
    { value: 'all', label: 'All News', icon: Newspaper },
    { value: 'business', label: 'Business', icon: TrendingUp },
    { value: 'technology', label: 'Technology', icon: Tag },
    { value: 'general', label: 'General', icon: Newspaper }
  ];

  const sortOptions: { value: NewsSortBy; label: string }[] = [
    { value: 'publishedAt', label: 'Most Recent' },
    { value: 'relevancy', label: 'Most Relevant' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      await searchNews(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStockFilter = async (ticker: string) => {
    setSelectedStock(ticker);
    if (ticker === 'all') {
      // Fetch general business news
      await searchNews('stock market business');
    } else {
      await fetchStockNews(ticker, 20);
    }
  };

  const handleRefresh = async () => {
    await refreshNews();
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return {
      from: startDate.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0]
    };
  };

  const filteredArticles = articles.filter(article => {
    const matchesStock = selectedStock === 'all' || 
      (article.relatedStocks && article.relatedStocks.includes(selectedStock.toUpperCase()));
    
    const { from, to } = getDateRange(dateFilter);
    const articleDate = new Date(article.publishedAt).toISOString().split('T')[0];
    const matchesDate = articleDate >= from && articleDate <= to;
    
    return matchesStock && matchesDate;
  });

  useEffect(() => {
    // Initial load with business news
    if (articles.length === 0) {
      searchNews('stock market business');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Market News</h1>
          <p className="text-gray-400">Stay updated with the latest financial and stock market news</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-spotify-green text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            <Filter size={20} />
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for news, stocks, or companies..."
            className="w-full pl-10 pr-4 py-3 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Filter Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => handleStockFilter(e.target.value)}
                className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
              >
                <option value="all">All Stocks</option>
                {portfolioState.stocks.map(stock => (
                  <option key={stock.id} value={stock.ticker}>
                    {stock.ticker}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as NewsCategory | 'all')}
                className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as NewsSortBy)}
                className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-spotify-gray p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Articles</span>
            <Newspaper className="text-spotify-green" size={20} />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{filteredArticles.length}</div>
        </div>
        
        <div className="bg-spotify-gray p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Positive Sentiment</span>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {filteredArticles.filter(a => a.sentiment === 'positive').length}
          </div>
        </div>
        
        <div className="bg-spotify-gray p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Sources</span>
            <Tag className="text-blue-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {new Set(filteredArticles.map(a => a.source.name)).size}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading news</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && filteredArticles.length === 0 && (
        <LoadingSpinner message="Loading latest news..." />
      )}

      {/* Articles List */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              showStockTags={true}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-spotify-green hover:bg-spotify-green-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Articles'}
              </button>
            </div>
          )}
        </div>
      ) : !loading && (
        <EmptyState
          icon={Newspaper}
          title="No news found"
          description="Try adjusting your filters or search for different keywords"
          action={
            <button
              onClick={() => {
                clearNews();
                searchNews('stock market business');
              }}
              className="bg-spotify-green hover:bg-spotify-green-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
};

export default NewsPage;