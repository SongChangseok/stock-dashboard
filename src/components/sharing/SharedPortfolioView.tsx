import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Share2, 
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { PortfolioSharingService } from '../../services/portfolioSharingService';
import { ShareablePortfolio } from '../../types/sharing';
import StockCard from '../portfolio/StockCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const SharedPortfolioView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [portfolio, setPortfolio] = useState<ShareablePortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!shareId) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const sharedPortfolio = await PortfolioSharingService.getSharedPortfolio(shareId);
        
        if (!sharedPortfolio) {
          setError('Portfolio not found or has expired');
        } else {
          setPortfolio(sharedPortfolio);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [shareId]);

  const handleCopyUrl = async () => {
    if (portfolio?.shareUrl) {
      const success = await PortfolioSharingService.copyToClipboard(portfolio.shareUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share && portfolio) {
      navigator.share({
        title: portfolio.name,
        text: portfolio.description || 'Check out this investment portfolio',
        url: portfolio.shareUrl,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spotify-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading shared portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || 'This portfolio may have been removed or the link has expired.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Main App
          </a>
        </div>
      </div>
    );
  }

  // Calculate portfolio metrics
  const isPositive = portfolio.dailyChange >= 0;
  const sectorData = portfolio.stocks.reduce((acc, stock) => {
    const sector = stock.sector || 'Other';
    const existing = acc.find(item => item.sector === sector);
    if (existing) {
      existing.value += stock.value;
      existing.count += 1;
    } else {
      acc.push({
        sector,
        value: stock.value,
        count: 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      });
    }
    return acc;
  }, [] as Array<{ sector: string; value: number; count: number; color: string }>);

  const topPerformers = [...portfolio.stocks]
    .sort((a, b) => b.gainPercent - a.gainPercent)
    .slice(0, 5);

  const COLORS = ['#1DB954', '#1ED760', '#0D7F34', '#0A5D26', '#064A1F'];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="bg-spotify-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{portfolio.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {portfolio.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {portfolio.viewCount} views
                    </div>
                  )}
                  {portfolio.sharedBy.displayName && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      by {portfolio.sharedBy.displayName}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(portfolio.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copied ? (
                  <>
                    <Copy className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-spotify-green/20 text-spotify-green rounded-xl hover:bg-spotify-green/30 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {portfolio.totalValue > 0 && (
            <div className="glass-card-dark p-6 rounded-2xl">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Value</h3>
              <p className="text-2xl font-bold text-white">
                ${portfolio.totalValue.toLocaleString()}
              </p>
            </div>
          )}
          
          <div className="glass-card-dark p-6 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Daily Change</h3>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%
              </span>
            </div>
            {portfolio.dailyChange !== 0 && (
              <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}${portfolio.dailyChange.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="glass-card-dark p-6 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Holdings</h3>
            <p className="text-2xl font-bold text-white">{portfolio.stocks.length}</p>
            <p className="text-gray-400 text-sm">Stocks</p>
          </div>
        </div>

        {/* Description */}
        {portfolio.description && (
          <div className="glass-card-dark p-6 rounded-2xl mb-8">
            <h3 className="text-white font-semibold mb-3">About This Portfolio</h3>
            <p className="text-gray-300 leading-relaxed">{portfolio.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Holdings List */}
          <div className="xl:col-span-2">
            <div className="glass-card-dark p-6 rounded-2xl">
              <h3 className="text-white font-semibold mb-6">Holdings</h3>
              
              {portfolio.stocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No stocks in this portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.stocks.map((stock, index) => (
                    <div key={`${stock.symbol}-${index}`} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-white">{stock.symbol}</h4>
                            <span className="text-gray-400 text-sm">{stock.name}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {stock.quantity > 0 && (
                              <div>
                                <p className="text-gray-400">Shares</p>
                                <p className="text-white font-medium">{stock.quantity}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-gray-400">Price</p>
                              <p className="text-white font-medium">${stock.currentPrice.toFixed(2)}</p>
                            </div>
                            
                            {stock.value > 0 && (
                              <div>
                                <p className="text-gray-400">Value</p>
                                <p className="text-white font-medium">${stock.value.toLocaleString()}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-gray-400">Return</p>
                              <p className={`font-medium ${stock.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stock.gainPercent >= 0 ? '+' : ''}{stock.gainPercent.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Charts & Analytics */}
          <div className="space-y-6">
            {/* Sector Allocation */}
            {sectorData.length > 0 && (
              <div className="glass-card-dark p-6 rounded-2xl">
                <h3 className="text-white font-semibold mb-4">Sector Allocation</h3>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        nameKey="sector"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value > 0 ? '$' + value.toLocaleString() : 'Hidden'}`, 'Value']}
                        contentStyle={{
                          backgroundColor: '#1E1E1E',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {sectorData.map((sector, index) => (
                    <div key={sector.sector} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300">{sector.sector}</span>
                      </div>
                      <span className="text-white">{sector.count} stocks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Performers */}
            {topPerformers.length > 0 && (
              <div className="glass-card-dark p-6 rounded-2xl">
                <h3 className="text-white font-semibold mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {topPerformers.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{stock.symbol}</p>
                        <p className="text-gray-400 text-sm">${stock.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${stock.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.gainPercent >= 0 ? '+' : ''}{stock.gainPercent.toFixed(2)}%
                        </p>
                        {stock.gain !== 0 && (
                          <p className={`text-sm ${stock.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.gain >= 0 ? '+' : ''}${stock.gain.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-gray-400 text-sm">Powered by</span>
            <a
              href="/"
              className="text-spotify-green font-semibold hover:text-spotify-green-hover transition-colors duration-200"
            >
              Stock Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPortfolioView;