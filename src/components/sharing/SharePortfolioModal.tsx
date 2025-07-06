import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Calendar,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PortfolioSharingService } from '../../services/portfolioSharingService';
import { Portfolio } from '../../types/portfolio';
import { ShareSettings, SocialPlatform, SOCIAL_PLATFORMS } from '../../types/sharing';

interface SharePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
}

const SharePortfolioModal: React.FC<SharePortfolioModalProps> = ({ 
  isOpen, 
  onClose, 
  portfolio 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'settings' | 'share'>('settings');
  
  const [settings, setSettings] = useState<ShareSettings>({
    isPublic: true,
    allowComments: false,
    includePersonalInfo: true,
    hideSensitiveData: false,
    customTitle: portfolio.name,
    customDescription: portfolio.description || '',
    expirationDays: undefined,
  });

  const handleCreateShare = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const shareId = await PortfolioSharingService.createShare(
        user.id,
        portfolio,
        settings
      );
      
      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);
      setStep('share');
    } catch (err: any) {
      setError(err.message || 'Failed to create share');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    const success = await PortfolioSharingService.copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: SocialPlatform) => {
    const shareOptions = {
      platform,
      title: settings.customTitle || portfolio.name,
      description: settings.customDescription || `Check out my investment portfolio with ${portfolio.stocks.length} stocks`,
      url: shareUrl,
      hashtags: ['investing', 'portfolio', 'stocks'],
    };

    const socialUrl = PortfolioSharingService.generateSocialShareUrl(platform, shareOptions);
    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  const resetModal = () => {
    setStep('settings');
    setShareUrl('');
    setCopied(false);
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-spotify-dark-gray rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-spotify-green" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Share Portfolio
              </h2>
              <p className="text-gray-400 text-sm">
                {portfolio.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 'settings' ? (
            /* Share Settings */
            <div className="space-y-6">
              {/* Basic Settings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Share Settings</h3>
                
                <div className="space-y-4">
                  {/* Public/Private */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {settings.isPublic ? (
                        <Eye className="w-5 h-5 text-spotify-green" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {settings.isPublic ? 'Public' : 'Private'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {settings.isPublic 
                            ? 'Anyone with the link can view this portfolio'
                            : 'Only people with the direct link can view'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        settings.isPublic ? 'bg-spotify-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.isPublic ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Hide Sensitive Data */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Hide Financial Details</p>
                      <p className="text-gray-400 text-sm">
                        Hide specific amounts and values (percentages still shown)
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, hideSensitiveData: !prev.hideSensitiveData }))}
                      className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        settings.hideSensitiveData ? 'bg-spotify-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.hideSensitiveData ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Include Personal Info */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Include Your Name</p>
                      <p className="text-gray-400 text-sm">
                        Show your display name with the shared portfolio
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, includePersonalInfo: !prev.includePersonalInfo }))}
                      className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        settings.includePersonalInfo ? 'bg-spotify-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.includePersonalInfo ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Title & Description */}
              <div>
                <h4 className="text-white font-medium mb-3">Customize Share</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={settings.customTitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, customTitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                      placeholder="Portfolio title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={settings.customDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, customDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent resize-none"
                      placeholder="Optional description for your shared portfolio"
                    />
                  </div>
                </div>
              </div>

              {/* Expiration */}
              <div>
                <h4 className="text-white font-medium mb-3">Expiration (Optional)</h4>
                <select
                  value={settings.expirationDays || ''}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    expirationDays: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                >
                  <option value="">Never expires</option>
                  <option value="1">1 day</option>
                  <option value="7">1 week</option>
                  <option value="30">1 month</option>
                  <option value="90">3 months</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              {/* Create Share Button */}
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Share...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Create Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Share URL & Social Sharing */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Portfolio Shared Successfully!
                </h3>
                <p className="text-gray-400">
                  Your portfolio is now available at the link below
                </p>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      copied 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-spotify-green/20 text-spotify-green border-spotify-green/30 hover:bg-spotify-green/30'
                    } border`}
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Social Sharing */}
              <div>
                <h4 className="text-white font-medium mb-3">Share on Social Media</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">𝕏</span>
                    <span className="text-white text-sm font-medium">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">📘</span>
                    <span className="text-white text-sm font-medium">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialShare('linkedin')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">💼</span>
                    <span className="text-white text-sm font-medium">LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialShare('reddit')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">🔴</span>
                    <span className="text-white text-sm font-medium">Reddit</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialShare('telegram')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">✈️</span>
                    <span className="text-white text-sm font-medium">Telegram</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialShare('whatsapp')}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-white text-sm font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                >
                  Create Another
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePortfolioModal;