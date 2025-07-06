import React from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Text, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../constants/theme';
import Card from '../common/Card';

interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
}

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
  showPortfolioTag?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  showPortfolioTag = false,
}) => {
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSourceIcon = (sourceName: string): string => {
    const lowerSource = sourceName.toLowerCase();
    if (lowerSource.includes('reuters')) return 'article';
    if (lowerSource.includes('bloomberg')) return 'business';
    if (lowerSource.includes('cnbc')) return 'tv';
    if (lowerSource.includes('yahoo')) return 'language';
    if (lowerSource.includes('marketwatch')) return 'trending-up';
    return 'article';
  };

  return (
    <Card style={styles.container} variant=\"elevated\">
      <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.content}>
          {/* Image */}
          {article.urlToImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{uri: article.urlToImage}}
                style={styles.image}
                resizeMode=\"cover\"
              />
              {showPortfolioTag && (
                <View style={styles.portfolioTag}>
                  <Chip
                    icon=\"account-balance-wallet\"
                    style={styles.portfolioChip}
                    textStyle={styles.portfolioChipText}
                    compact
                  >
                    Portfolio
                  </Chip>
                </View>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.textContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.sourceInfo}>
                <Icon 
                  name={getSourceIcon(article.source.name)} 
                  size={14} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.sourceName} numberOfLines={1}>
                  {article.source.name}
                </Text>
              </View>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(article.publishedAt)}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={3}>
              {article.title}
            </Text>

            {/* Description */}
            {article.description && (
              <Text style={styles.description} numberOfLines={2}>
                {article.description}
              </Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              {showPortfolioTag && !article.urlToImage && (
                <Chip
                  icon=\"account-balance-wallet\"
                  style={styles.portfolioChip}
                  textStyle={styles.portfolioChipText}
                  compact
                >
                  Portfolio
                </Chip>
              )}
              
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Read more</Text>
                <Icon name=\"chevron-right\" size={16} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  portfolioTag: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  portfolioChip: {
    backgroundColor: colors.primary,
    height: 24,
  },
  portfolioChipText: {
    color: colors.onPrimary,
    fontSize: 10,
    marginVertical: 0,
  },
  textContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
  },
  timeAgo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  readMoreText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginRight: spacing.xs,
  },
});

export default NewsCard;