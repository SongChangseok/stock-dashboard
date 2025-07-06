import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {Text, Searchbar, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useStockNews} from '@shared/hooks/useStockNews';
import {usePortfolio} from '@shared/contexts/PortfolioContext';
import {colors, spacing, fontSize, fontWeight} from '../constants/theme';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NewsCard from '../components/news/NewsCard';

const NewsScreen: React.FC = () => {
  const {state: portfolioState} = usePortfolio();
  const {stocks} = portfolioState;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Get unique tickers for news filtering
  const tickers = stocks.map(stock => stock.ticker);
  
  const {
    news,
    loading,
    error,
    loadNews,
    searchNews,
  } = useStockNews(tickers);

  const categories = [
    {id: 'all', label: 'All', icon: 'article'},
    {id: 'portfolio', label: 'Portfolio', icon: 'account-balance-wallet'},
    {id: 'market', label: 'Market', icon: 'trending-up'},
    {id: 'technology', label: 'Tech', icon: 'computer'},
    {id: 'business', label: 'Business', icon: 'business'},
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadNews();
    } catch (error) {
      console.error('Failed to refresh news:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadNews]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchNews(query);
    } else {
      loadNews();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Filter news based on category
    if (categoryId === 'portfolio') {
      // Show only news related to portfolio stocks
      loadNews(tickers);
    } else {
      loadNews();
    }
  };

  const handleNewsPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open article');
    }
  };

  const filteredNews = news.filter(article => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'portfolio') {
      return tickers.some(ticker => 
        article.title.toUpperCase().includes(ticker) ||
        article.description?.toUpperCase().includes(ticker)
      );
    }
    return article.category?.toLowerCase().includes(selectedCategory);
  });

  if (loading && !refreshing) {
    return (
      <LoadingSpinner
        message=\"Loading market news...\"
        overlay={false}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name=\"article\" size={24} color={colors.primary} />
            <Text style={styles.title}>Market News</Text>
          </View>
          <Text style={styles.subtitle}>
            Stay updated with the latest market trends
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder=\"Search news...\"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={colors.textSecondary}
            placeholderTextColor={colors.textSecondary}
            theme={{
              colors: {
                primary: colors.primary,
                onSurface: colors.textPrimary,
                surface: colors.surfaceVariant,
              },
            }}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.selectedCategoryChip,
                ]}
                textStyle={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
                icon={category.icon}
                mode={selectedCategory === category.id ? 'flat' : 'outlined'}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Portfolio Alert */}
        {stocks.length > 0 && selectedCategory === 'portfolio' && (
          <Card style={styles.alertCard} variant=\"glass\">
            <View style={styles.alertContent}>
              <Icon name=\"info\" size={20} color={colors.info} />
              <Text style={styles.alertText}>
                Showing news for your portfolio: {tickers.join(', ')}
              </Text>
            </View>
          </Card>
        )}

        {/* News List */}
        {error ? (
          <Card style={styles.errorCard} variant=\"elevated\">
            <View style={styles.errorContent}>
              <Icon name=\"error\" size={48} color={colors.error} />
              <Text style={styles.errorTitle}>Failed to Load News</Text>
              <Text style={styles.errorMessage}>
                Unable to fetch the latest news. Please check your connection and try again.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : filteredNews.length === 0 ? (
          <Card style={styles.emptyCard} variant=\"glass\">
            <View style={styles.emptyContent}>
              <Icon name=\"article\" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No News Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery 
                  ? `No articles found for \"${searchQuery}\"`
                  : 'No news articles available at the moment'
                }
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.newsList}>
            {filteredNews.map((article, index) => (
              <NewsCard
                key={`${article.url}-${index}`}
                article={article}
                onPress={() => handleNewsPress(article.url)}
                showPortfolioTag={
                  selectedCategory === 'all' &&
                  tickers.some(ticker => 
                    article.title.toUpperCase().includes(ticker) ||
                    article.description?.toUpperCase().includes(ticker)
                  )
                }
              />
            ))}
          </View>
        )}

        {/* News Count */}
        {filteredNews.length > 0 && (
          <View style={styles.newsCount}>
            <Text style={styles.newsCountText}>
              Showing {filteredNews.length} articles
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchbar: {
    backgroundColor: colors.surfaceVariant,
    elevation: 0,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  categoriesContainer: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingRight: spacing.md,
  },
  categoryChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.border,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
  },
  selectedCategoryText: {
    color: colors.onPrimary,
  },
  alertCard: {
    marginBottom: spacing.md,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  alertText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  newsList: {
    marginBottom: spacing.md,
  },
  errorCard: {
    marginVertical: spacing.xl,
  },
  errorContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.onPrimary,
    fontWeight: fontWeight.semibold,
  },
  emptyCard: {
    marginVertical: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  newsCount: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  newsCountText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default NewsScreen;