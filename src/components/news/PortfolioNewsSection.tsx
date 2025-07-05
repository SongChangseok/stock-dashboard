import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStockNews } from '../../hooks/useStockNews';
import { usePortfolio } from '../../contexts/PortfolioContext';
import NewsCard from './NewsCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface PortfolioNewsSectionProps {
  maxArticles?: number;
  compact?: boolean;
}

const PortfolioNewsSection: React.FC<PortfolioNewsSectionProps> = ({ 
  maxArticles = 6, 
  compact = true 
}) => {
  const { state: portfolioState } = usePortfolio();
  const { articles, loading, error, fetchStockNews } = useStockNews();
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [loadingStockNews, setLoadingStockNews] = useState(false);

  // Get unique tickers from portfolio
  const portfolioTickers = portfolioState.stocks.map(stock => stock.ticker);

  // Filter articles for portfolio stocks
  const portfolioArticles = articles
    .filter(article => 
      !selectedStock || 
      (article.relatedStocks && article.relatedStocks.includes(selectedStock.toUpperCase()))
    )
    .slice(0, maxArticles);

  const handleStockSelect = async (ticker: string) => {
    setSelectedStock(ticker);
    if (ticker) {
      setLoadingStockNews(true);
      try {
        await fetchStockNews(ticker, 10);
      } finally {
        setLoadingStockNews(false);
      }
    }
  };

  // Auto-fetch news for the first stock in portfolio
  useEffect(() => {
    if (portfolioTickers.length > 0 && !selectedStock) {
      const firstTicker = portfolioTickers[0];
      setSelectedStock(firstTicker);
      handleStockSelect(firstTicker);
    }
  }, [portfolioTickers.length]);

  if (portfolioTickers.length === 0) {
    return (
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="text-spotify-green" size={24} />
          <h3 className="text-xl font-bold text-white">Portfolio News</h3>
        </div>
        <div className="text-center py-8">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No stocks in portfolio</p>
          <p className="text-sm text-gray-500">Add stocks to see related news</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="text-spotify-green" size={24} />
          <div>
            <h3 className="text-xl font-bold text-white">Portfolio News</h3>
            <p className="text-gray-400 text-sm">Latest news for your stocks</p>
          </div>
        </div>
        <Link
          to="/news"
          className="text-spotify-green hover:text-spotify-green-hover transition-colors flex items-center gap-1 text-sm font-medium"
        >
          View All
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Stock Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStock('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !selectedStock
                ? 'bg-spotify-green text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Stocks
          </button>
          {portfolioTickers.map((ticker) => (
            <button
              key={ticker}
              onClick={() => handleStockSelect(ticker)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedStock === ticker
                  ? 'bg-spotify-green text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {(loading || loadingStockNews) && portfolioArticles.length === 0 && (
        <LoadingSpinner message="Loading portfolio news..." />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Articles */}
      {portfolioArticles.length > 0 ? (
        <div className="space-y-3">
          {portfolioArticles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              compact={compact}
              showStockTags={true}
            />
          ))}
          
          {/* View More Link */}
          {portfolioArticles.length >= maxArticles && (
            <div className="text-center pt-4">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-spotify-green hover:text-spotify-green-hover transition-colors font-medium"
              >
                <TrendingUp size={16} />
                View More News
              </Link>
            </div>
          )}
        </div>
      ) : !loading && !loadingStockNews && (
        <div className="text-center py-8">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {selectedStock ? `No news found for ${selectedStock}` : 'No recent news available'}
          </p>
          <p className="text-sm text-gray-500">Try checking back later or view all news</p>
          <Link
            to="/news"
            className="inline-block mt-3 bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Browse All News
          </Link>
        </div>
      )}
    </div>
  );
};

export default PortfolioNewsSection;