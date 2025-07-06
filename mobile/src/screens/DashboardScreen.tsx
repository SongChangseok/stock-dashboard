import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {Text, FAB} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {usePortfolio} from '@shared/contexts/PortfolioContext';
import {useMultiPortfolio} from '@shared/contexts/MultiPortfolioContext';
import {colors, spacing, fontSize, fontWeight} from '../constants/theme';
import {RootStackParamList} from '../navigation/AppNavigator';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PriceDisplay from '../components/common/PriceDisplay';
import PortfolioSummaryCard from '../components/portfolio/PortfolioSummaryCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import PortfolioOverviewChart from '../components/charts/PortfolioOverviewChart';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const {state: portfolioState} = usePortfolio();
  const {getActivePortfolio, getPortfolioSummaries} = useMultiPortfolio();
  
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const activePortfolio = getActivePortfolio();
  const portfolioSummaries = getPortfolioSummaries();
  const {stocks, metrics, loading} = portfolioState;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleAddStock = () => {
    navigation.navigate('AddStock', {
      portfolioId: activePortfolio?.id,
    });
  };

  const handleViewGoals = () => {
    navigation.navigate('Goals');
  };

  if (loading) {
    return (
      <LoadingSpinner
        message=\"Loading your portfolio...\"
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
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.portfolioName}>
            {activePortfolio?.name || 'Your Portfolio'}
          </Text>
        </View>

        {/* Portfolio Summary */}
        <PortfolioSummaryCard
          totalValue={metrics.totalValue}
          totalGainLoss={metrics.totalProfitLoss}
          totalGainLossPercent={metrics.totalProfitLossPercent || 0}
          stockCount={stocks.length}
          style={styles.summaryCard}
        />

        {/* Quick Actions */}
        <QuickActionsCard
          onAddStock={handleAddStock}
          onViewGoals={handleViewGoals}
          onViewNews={() => navigation.navigate('Main')}
          style={styles.actionsCard}
        />

        {/* Portfolio Overview Chart */}
        {stocks.length > 0 && (
          <Card style={styles.chartCard} variant=\"glass\">
            <View style={styles.chartHeader}>
              <Icon name=\"pie-chart\" size={20} color={colors.primary} />
              <Text style={styles.chartTitle}>Portfolio Allocation</Text>
            </View>
            <PortfolioOverviewChart
              data={stocks}
              width={screenWidth - spacing.lg * 2}
              height={200}
            />
          </Card>
        )}

        {/* Recent Performance */}
        <Card style={styles.performanceCard} variant=\"elevated\">
          <View style={styles.sectionHeader}>
            <Icon name=\"trending-up\" size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>Performance Summary</Text>
          </View>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Today's Change</Text>
              <PriceDisplay
                value={metrics.totalProfitLoss}
                change={metrics.totalProfitLoss}
                changePercent={metrics.totalProfitLossPercent || 0}
                size=\"small\"
                showChange={false}
              />
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Total Invested</Text>
              <Text style={styles.performanceValue}>
                ${(metrics.totalValue - metrics.totalProfitLoss).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Best Performer</Text>
              <Text style={styles.performanceValue}>
                {stocks.length > 0 
                  ? stocks.reduce((best, stock) => 
                      (stock.currentPrice - stock.buyPrice) > 
                      (best.currentPrice - best.buyPrice) ? stock : best
                    ).ticker
                  : 'N/A'
                }
              </Text>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Holdings</Text>
              <Text style={styles.performanceValue}>
                {stocks.length} stocks
              </Text>
            </View>
          </View>
        </Card>

        {/* Empty State */}
        {stocks.length === 0 && (
          <Card style={styles.emptyStateCard} variant=\"glass\">
            <View style={styles.emptyState}>
              <Icon 
                name=\"account-balance-wallet\" 
                size={48} 
                color={colors.textMuted} 
              />
              <Text style={styles.emptyStateTitle}>Start Building Your Portfolio</Text>
              <Text style={styles.emptyStateMessage}>
                Add your first stock to begin tracking your investments
              </Text>
            </View>
          </Card>
        )}

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
  header: {
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  portfolioName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  performanceCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  performanceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  performanceValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  emptyStateCard: {
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
    lineHeight: 22,
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

export default DashboardScreen;