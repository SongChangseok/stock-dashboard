import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
  private static readonly COLLECTION_SHARES = 'portfolioShares';
  private static readonly COLLECTION_PUBLIC_PORTFOLIOS = 'publicPortfolios';

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

      await setDoc(doc(db, this.COLLECTION_SHARES, shareId), shareData);

      // If public, create public portfolio document
      if (settings.isPublic) {
        const shareablePortfolio = await this.createShareablePortfolio(
          portfolio, 
          settings, 
          shareId,
          userId
        );
        
        await setDoc(
          doc(db, this.COLLECTION_PUBLIC_PORTFOLIOS, shareId), 
          shareablePortfolio
        );
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

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
        displayName: settings.includePersonalInfo ? userData?.displayName : undefined,
        photoURL: settings.includePersonalInfo ? userData?.photoURL : undefined,
      },
    };
  }

  // Get shared portfolio by share ID
  static async getSharedPortfolio(shareId: string): Promise<ShareablePortfolio | null> {
    try {
      const shareDoc = await getDoc(doc(db, this.COLLECTION_SHARES, shareId));
      
      if (!shareDoc.exists()) {
        return null;
      }

      const shareData = shareDoc.data() as PortfolioShare;

      // Check if share is expired
      if (shareData.expiresAt && shareData.expiresAt.toDate() < new Date()) {
        return null;
      }

      // Increment view count
      await updateDoc(doc(db, this.COLLECTION_SHARES, shareId), {
        viewCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Get public portfolio data
      const publicDoc = await getDoc(doc(db, this.COLLECTION_PUBLIC_PORTFOLIOS, shareId));
      
      if (!publicDoc.exists()) {
        return null;
      }

      const portfolioData = publicDoc.data() as ShareablePortfolio;
      
      return {
        ...portfolioData,
        viewCount: shareData.viewCount + 1,
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
      const shareRef = doc(db, this.COLLECTION_SHARES, shareId);
      const shareDoc = await getDoc(shareRef);

      if (!shareDoc.exists()) {
        throw new Error('Share not found');
      }

      const shareData = shareDoc.data() as PortfolioShare;

      if (shareData.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(shareRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });

      // Update public portfolio if visibility changed
      if (settings.isPublic !== undefined) {
        const publicRef = doc(db, this.COLLECTION_PUBLIC_PORTFOLIOS, shareId);
        
        if (settings.isPublic) {
          // Make public - create/update public document
          // Implementation would need the original portfolio data
        } else {
          // Make private - delete public document
          await deleteDoc(publicRef);
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
      const shareRef = doc(db, this.COLLECTION_SHARES, shareId);
      const shareDoc = await getDoc(shareRef);

      if (!shareDoc.exists()) {
        throw new Error('Share not found');
      }

      const shareData = shareDoc.data() as PortfolioShare;

      if (shareData.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete both share and public portfolio documents
      await Promise.all([
        deleteDoc(shareRef),
        deleteDoc(doc(db, this.COLLECTION_PUBLIC_PORTFOLIOS, shareId)),
      ]);
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }

  // Get user's shares
  static async getUserShares(userId: string): Promise<PortfolioShare[]> {
    try {
      const sharesQuery = query(
        collection(db, this.COLLECTION_SHARES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(sharesQuery);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as PortfolioShare[];
    } catch (error) {
      console.error('Error getting user shares:', error);
      throw error;
    }
  }

  // Get popular public portfolios
  static async getPopularPortfolios(limitCount = 10): Promise<ShareablePortfolio[]> {
    try {
      const portfoliosQuery = query(
        collection(db, this.COLLECTION_PUBLIC_PORTFOLIOS),
        orderBy('viewCount', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(portfoliosQuery);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
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