// Portfolio sharing types
export interface ShareablePortfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  stocks: ShareableStock[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareUrl?: string;
  shareId?: string;
  viewCount?: number;
  sharedBy: {
    displayName?: string;
    photoURL?: string;
  };
}

export interface ShareableStock {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
  sector?: string;
}

export interface PortfolioShare {
  id: string;
  portfolioId: string;
  userId: string;
  shareId: string;
  isPublic: boolean;
  allowComments: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  metadata: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  };
}

export interface ShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  includePersonalInfo: boolean;
  hideSensitiveData: boolean;
  customTitle?: string;
  customDescription?: string;
  expirationDays?: number;
}

export interface SocialShareOptions {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'telegram' | 'whatsapp' | 'copy';
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
}

export interface ShareStats {
  totalShares: number;
  totalViews: number;
  platformBreakdown: {
    [platform: string]: number;
  };
  viewHistory: {
    date: string;
    views: number;
  }[];
}

// Social sharing platforms configuration
export const SOCIAL_PLATFORMS = {
  twitter: {
    name: 'Twitter',
    icon: '𝕏',
    color: '#000000',
    baseUrl: 'https://twitter.com/intent/tweet',
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    baseUrl: 'https://www.linkedin.com/sharing/share-offsite/',
  },
  reddit: {
    name: 'Reddit',
    icon: '🔴',
    color: '#FF4500',
    baseUrl: 'https://reddit.com/submit',
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    baseUrl: 'https://t.me/share/url',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    baseUrl: 'https://api.whatsapp.com/send',
  },
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;