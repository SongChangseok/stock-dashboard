import React from 'react';
import {
  ExternalLink,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { NewsArticle } from '../../types/news';

interface NewsCardProps {
  article: NewsArticle;
  showStockTags?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  showStockTags = false,
  compact = false,
  onClick,
}) => {
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'negative':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-400';
      case 'negative':
        return 'border-l-red-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div
        className={`bg-spotify-gray p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer border-l-4 ${getSentimentColor(article.sentiment)}`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{article.source.name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {formatTimeAgo(article.publishedAt)}
              </div>
              {article.sentiment && (
                <>
                  <span>•</span>
                  {getSentimentIcon(article.sentiment)}
                </>
              )}
            </div>
          </div>
          {article.urlToImage && (
            <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-spotify-gray p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group border-l-4 ${getSentimentColor(article.sentiment)}`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium">{article.source.name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {formatTimeAgo(article.publishedAt)}
              </div>
              {article.sentiment && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(article.sentiment)}
                    <span className="capitalize">{article.sentiment}</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleExternalClick}
              className="p-1 text-gray-400 hover:text-white transition-colors group-hover:opacity-100 opacity-0"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-spotify-green transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {article.description}
            </p>
          )}

          {/* Tags and Author */}
          <div className="flex flex-wrap items-center gap-2">
            {showStockTags &&
              article.relatedStocks &&
              article.relatedStocks.length > 0 && (
                <div className="flex gap-1">
                  {article.relatedStocks.map((stock, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-spotify-green bg-opacity-20 text-spotify-green text-xs rounded-full font-medium"
                    >
                      {stock}
                    </span>
                  ))}
                </div>
              )}

            {article.author && (
              <span className="text-xs text-gray-500">by {article.author}</span>
            )}

            {article.relevanceScore && article.relevanceScore > 70 && (
              <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs rounded-full font-medium">
                High Relevance
              </span>
            )}
          </div>
        </div>

        {/* Image */}
        {article.urlToImage && (
          <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.parentElement?.remove();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
