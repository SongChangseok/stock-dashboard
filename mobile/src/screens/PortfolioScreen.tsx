import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {Text, FAB, Menu, Divider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useMultiPortfolio} from '@shared/contexts/MultiPortfolioContext';
import {usePortfolio} from '@shared/contexts/PortfolioContext';
import {colors, spacing, fontSize, fontWeight} from '../constants/theme';
import {RootStackParamList} from '../navigation/AppNavigator';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PortfolioListItem from '../components/portfolio/PortfolioListItem';
import StockListItem from '../components/portfolio/StockListItem';

type PortfolioScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

const PortfolioScreen: React.FC = () => {
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const {
    state: multiPortfolioState,
    getActivePortfolio,
    getPortfolioSummaries,
    setActivePortfolio,
  } = useMultiPortfolio();
  const {state: portfolioState} = usePortfolio();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const activePortfolio = getActivePortfolio();
  const portfolioSummaries = getPortfolioSummaries();
  const {stocks, loading} = portfolioState;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handlePortfolioSwitch = (portfolioId: string) => {
    setActivePortfolio(portfolioId);
    setMenuVisible(false);
  };

  const handleStockPress = (stockId: string, ticker: string) => {
    navigation.navigate('StockDetail', {
      stockId: stockId.toString(),
      ticker,
    });
  };

  const handleAddStock = () => {
    navigation.navigate('AddStock', {
      portfolioId: activePortfolio?.id,
    });
  };

  if (loading) {
    return (
      <LoadingSpinner
        message=\"Loading portfolios...\"
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
        {/* Portfolio Selector */}
        <Card style={styles.selectorCard} variant=\"glass\">
          <View style={styles.selectorHeader}>
            <View style={styles.selectorTitle}>
              <Icon name=\"account-balance-wallet\" size={20} color={colors.primary} />
              <Text style={styles.selectorTitleText}>Active Portfolio</Text>
            </View>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.portfolioSelector}
                  onPress={() => setMenuVisible(true)}
                >
                  <View style={styles.portfolioInfo}>
                    <View
                      style={[
                        styles.portfolioColor,
                        {backgroundColor: activePortfolio?.color || colors.primary},
                      ]}
                    />
                    <View style={styles.portfolioDetails}>
                      <Text style={styles.portfolioName}>
                        {activePortfolio?.name || 'No Portfolio'}
                      </Text>
                      <Text style={styles.portfolioSubtitle}>
                        {stocks.length} stocks
                      </Text>
                    </View>
                  </View>
                  <Icon name=\"keyboard-arrow-down\" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              {portfolioSummaries.map((portfolio) => (
                <Menu.Item
                  key={portfolio.id}
                  onPress={() => handlePortfolioSwitch(portfolio.id)}
                  title={portfolio.name}
                  leadingIcon={() => (
                    <View
                      style={[
                        styles.menuPortfolioColor,
                        {backgroundColor: portfolio.color},
                      ]}
                    />
                  )}
                />
              ))}
            </Menu>
          </View>
        </Card>

        {/* Portfolio Overview */}
        {portfolioSummaries.length > 1 && (
          <Card style={styles.overviewCard} variant=\"elevated\">
            <View style={styles.overviewHeader}>
              <Icon name=\"bar-chart\" size={20} color={colors.secondary} />
              <Text style={styles.overviewTitle}>All Portfolios</Text>
            </View>
            
            <View style={styles.portfoliosList}>
              {portfolioSummaries.map((portfolio) => (
                <PortfolioListItem
                  key={portfolio.id}
                  portfolio={portfolio}
                  isActive={portfolio.id === activePortfolio?.id}
                  onPress={() => handlePortfolioSwitch(portfolio.id)}
                />
              ))}
            </View>
          </Card>
        )}

        {/* Holdings */}
        <Card style={styles.holdingsCard} variant=\"elevated\">
          <View style={styles.holdingsHeader}>
            <View style={styles.holdingsTitle}>
              <Icon name=\"trending-up\" size={20} color={colors.success} />
              <Text style={styles.holdingsTitleText}>Holdings</Text>
            </View>
            <Text style={styles.holdingsCount}>{stocks.length} stocks</Text>
          </View>

          {stocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name=\"inbox\" size={48} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Holdings</Text>
              <Text style={styles.emptyStateMessage}>
                Add your first stock to start tracking
              </Text>
            </View>
          ) : (
            <View style={styles.stocksList}>
              {stocks.map((stock) => (
                <StockListItem
                  key={stock.id}
                  stock={stock}
                  onPress={() => handleStockPress(stock.id.toString(), stock.ticker)}
                />
              ))}
            </View>
          )}
        </Card>

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, {backgroundColor: colors.primary}]}
        icon=\"plus\"
        color={colors.onPrimary}
        onPress={handleAddStock}
      />
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
  selectorCard: {
    marginBottom: spacing.md,
  },
  selectorHeader: {
    padding: spacing.md,
  },
  selectorTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectorTitleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  portfolioSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  portfolioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  portfolioColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  portfolioDetails: {
    flex: 1,
  },
  portfolioName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  portfolioSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  menuPortfolioColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overviewCard: {
    marginBottom: spacing.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  overviewTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  portfoliosList: {
    paddingHorizontal: spacing.md,
  },
  holdingsCard: {
    marginBottom: spacing.md,
  },
  holdingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  holdingsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdingsTitleText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  holdingsCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  stocksList: {
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 80, // Space for FAB
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
});

export default PortfolioScreen;