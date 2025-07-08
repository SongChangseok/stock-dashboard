import { supabase } from '../config/supabase';
import { 
  PortfolioShare, 
  ShareablePortfolio, 
  ShareSettings, 
  SocialShareOptions,
  SocialPlatform,
  SOCIAL_PLATFORMS 
} from '../types/sharing';
import { Portfolio } from '../types/portfolio';

export class PortfolioSharingService {
  private static readonly TABLE_SHARES = 'portfolio_shares';
  private static readonly TABLE_PUBLIC_PORTFOLIOS = 'public_portfolios';

  // Generate a unique share ID
  private static generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create a shareable portfolio
  static async createShare(
    userId: string,
    portfolio: Portfolio,
    settings: ShareSettings
  ): Promise<string> {
    try {
      const shareId = this.generateShareId();
      const now = new Date();
      const expiresAt = settings.expirationDays 
        ? new Date(now.getTime() + settings.expirationDays * 24 * 60 * 60 * 1000)
        : undefined;

      // Create portfolio share document
      const shareData: PortfolioShare = {
        id: shareId,
        portfolioId: portfolio.id,
        userId,
        shareId,
        isPublic: settings.isPublic,
        allowComments: settings.allowComments,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        metadata: {
          title: settings.customTitle || portfolio.name,
          description: settings.customDescription || portfolio.description,
        },
      };

      const { error: shareError } = await supabase
        .from(this.TABLE_SHARES)
        .insert({
          id: shareId,
          portfolio_id: portfolio.id,
          user_id: userId,
          share_id: shareId,
          is_public: settings.isPublic,
          allow_comments: settings.allowComments,
          expires_at: expiresAt?.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          view_count: 0,
          metadata: {
            title: settings.customTitle || portfolio.name,
            description: settings.customDescription || portfolio.description,
          },
        });

      if (shareError) throw shareError;

      // If public, create public portfolio document
      if (settings.isPublic) {
        const shareablePortfolio = await this.createShareablePortfolio(
          portfolio, 
          settings, 
          shareId,
          userId
        );
        
        const { error: publicError } = await supabase
          .from(this.TABLE_PUBLIC_PORTFOLIOS)
          .insert(shareablePortfolio);

        if (publicError) throw publicError;
      }

      return shareId;
    } catch (error) {
      console.error('Error creating portfolio share:', error);
      throw error;
    }
  }

  // Convert portfolio to shareable format
  private static async createShareablePortfolio(
    portfolio: Portfolio,
    settings: ShareSettings,
    shareId: string,
    userId: string
  ): Promise<ShareablePortfolio> {
    // Get user info for attribution
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return {
      id: shareId,
      name: settings.customTitle || portfolio.name,
      description: settings.customDescription || portfolio.description,
      totalValue: settings.hideSensitiveData ? 0 : portfolio.totalValue,
      dailyChange: settings.hideSensitiveData ? 0 : portfolio.dailyChange,
      dailyChangePercent: portfolio.dailyChangePercent,
      stocks: portfolio.stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        quantity: settings.hideSensitiveData ? 0 : stock.quantity,
        avgPrice: settings.hideSensitiveData ? 0 : stock.avgPrice,
        currentPrice: stock.currentPrice,
        value: settings.hideSensitiveData ? 0 : stock.value,
        gain: settings.hideSensitiveData ? 0 : stock.gain,
        gainPercent: stock.gainPercent,
        sector: stock.sector,
      })),
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
      isPublic: settings.isPublic,
      shareUrl: `${window.location.origin}/share/${shareId}`,
      shareId,
      viewCount: 0,
      sharedBy: {
        displayName: settings.includePersonalInfo ? userData?.display_name : undefined,
        photoURL: settings.includePersonalInfo ? userData?.photo_url : undefined,
      },
    };
  }

  // Get shared portfolio by share ID
  static async getSharedPortfolio(shareId: string): Promise<ShareablePortfolio | null> {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from(this.TABLE_SHARES)
        .select('*')
        .eq('share_id', shareId)
        .single();
      
      if (shareError || !shareData) {
        return null;
      }

      // Check if share is expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        return null;
      }

      // Increment view count
      await supabase
        .from(this.TABLE_SHARES)
        .update({
          view_count: shareData.view_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('share_id', shareId);

      // Get public portfolio data
      const { data: portfolioData, error: portfolioError } = await supabase
        .from(this.TABLE_PUBLIC_PORTFOLIOS)
        .select('*')
        .eq('share_id', shareId)
        .single();
      
      if (portfolioError || !portfolioData) {
        return null;
      }
      
      return {
        ...portfolioData,
        viewCount: shareData.view_count + 1,
        createdAt: new Date(portfolioData.created_at),
        updatedAt: new Date(portfolioData.updated_at),
      };
    } catch (error) {
      console.error('Error getting shared portfolio:', error);
      throw error;
    }
  }

  // Update share settings
  static async updateShare(
    shareId: string,
    userId: string,
    settings: Partial<ShareSettings>
  ): Promise<void> {
    try {
      const { data: shareData, error: fetchError } = await supabase
        .from(this.TABLE_SHARES)
        .select('*')
        .eq('share_id', shareId)
        .single();

      if (fetchError || !shareData) {
        throw new Error('Share not found');
      }

      if (shareData.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const { error: updateError } = await supabase
        .from(this.TABLE_SHARES)
        .update({
          is_public: settings.isPublic,
          allow_comments: settings.allowComments,
          updated_at: new Date().toISOString(),
        })
        .eq('share_id', shareId);

      if (updateError) throw updateError;

      // Update public portfolio if visibility changed
      if (settings.isPublic !== undefined) {
        if (settings.isPublic) {
          // Make public - create/update public document
          // Implementation would need the original portfolio data
        } else {
          // Make private - delete public document
          await supabase
            .from(this.TABLE_PUBLIC_PORTFOLIOS)
            .delete()
            .eq('share_id', shareId);
        }
      }
    } catch (error) {
      console.error('Error updating share:', error);
      throw error;
    }
  }

  // Delete share
  static async deleteShare(shareId: string, userId: string): Promise<void> {
    try {
      const { data: shareData, error: fetchError } = await supabase
        .from(this.TABLE_SHARES)
        .select('*')
        .eq('share_id', shareId)
        .single();

      if (fetchError || !shareData) {
        throw new Error('Share not found');
      }

      if (shareData.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete both share and public portfolio documents
      await Promise.all([
        supabase.from(this.TABLE_SHARES).delete().eq('share_id', shareId),
        supabase.from(this.TABLE_PUBLIC_PORTFOLIOS).delete().eq('share_id', shareId),
      ]);
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }

  // Get user's shares
  static async getUserShares(userId: string): Promise<PortfolioShare[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_SHARES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(share => ({
        id: share.id,
        portfolioId: share.portfolio_id,
        userId: share.user_id,
        shareId: share.share_id,
        isPublic: share.is_public,
        allowComments: share.allow_comments,
        expiresAt: share.expires_at ? new Date(share.expires_at) : undefined,
        createdAt: new Date(share.created_at),
        updatedAt: new Date(share.updated_at),
        viewCount: share.view_count,
        metadata: share.metadata,
      })) as PortfolioShare[];
    } catch (error) {
      console.error('Error getting user shares:', error);
      throw error;
    }
  }

  // Get popular public portfolios
  static async getPopularPortfolios(limitCount = 10): Promise<ShareablePortfolio[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_PUBLIC_PORTFOLIOS)
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limitCount);
      
      if (error) throw error;
      
      return (data || []).map(portfolio => ({
        ...portfolio,
        createdAt: new Date(portfolio.created_at),
        updatedAt: new Date(portfolio.updated_at),
        totalValue: portfolio.total_value,
        dailyChange: portfolio.daily_change,
        dailyChangePercent: portfolio.daily_change_percent,
        isPublic: portfolio.is_public,
        shareUrl: portfolio.share_url,
        shareId: portfolio.share_id,
        viewCount: portfolio.view_count,
        sharedBy: portfolio.shared_by,
      })) as ShareablePortfolio[];
    } catch (error) {
      console.error('Error getting popular portfolios:', error);
      throw error;
    }
  }

  // Generate social share URL
  static generateSocialShareUrl(
    platform: SocialPlatform,
    options: SocialShareOptions
  ): string {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    const params = new URLSearchParams();

    switch (platform) {
      case 'twitter':
        params.append('text', `${options.title}\n\n${options.description}`);
        params.append('url', options.url);
        if (options.hashtags) {
          params.append('hashtags', options.hashtags.join(','));
        }
        break;

      case 'facebook':
        params.append('u', options.url);
        break;

      case 'linkedin':
        params.append('url', options.url);
        params.append('title', options.title);
        params.append('summary', options.description);
        break;

      case 'reddit':
        params.append('url', options.url);
        params.append('title', options.title);
        break;

      case 'telegram':
        params.append('url', options.url);
        params.append('text', `${options.title}\n\n${options.description}`);
        break;

      case 'whatsapp':
        params.append('text', `${options.title}\n\n${options.description}\n\n${options.url}`);
        break;

      default:
        return options.url;
    }

    return `${platformConfig.baseUrl}?${params.toString()}`;
  }

  // Copy to clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Generate share metadata for SEO/social
  static generateShareMetadata(portfolio: ShareablePortfolio) {
    const gainText = portfolio.dailyChange >= 0 ? '+' : '';
    const performance = `${gainText}${portfolio.dailyChangePercent.toFixed(2)}%`;
    
    return {
      title: `${portfolio.name} - Stock Portfolio`,
      description: `Check out this investment portfolio with ${portfolio.stocks.length} stocks${portfolio.totalValue > 0 ? ` worth $${portfolio.totalValue.toLocaleString()}` : ''} (${performance} today)`,
      image: `/api/portfolio-thumbnail/${portfolio.shareId}`, // Would need implementation
      url: portfolio.shareUrl || '',
    };
  }
}