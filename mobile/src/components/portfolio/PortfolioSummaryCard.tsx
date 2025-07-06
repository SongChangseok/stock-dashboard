import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight} from '../../constants/theme';
import {formatCurrency, formatPercent} from '@shared/utils/formatters';
import Card from '../common/Card';
import PriceDisplay from '../common/PriceDisplay';

interface PortfolioSummaryCardProps {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stockCount: number;
  style?: ViewStyle;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  stockCount,
  style,
}) => {
  const isPositive = totalGainLoss >= 0;
  const changeColor = isPositive ? colors.success : colors.error;

  return (
    <Card style={[styles.container, style]} variant=\"elevated\">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name=\"account-balance-wallet\" size={24} color={colors.primary} />
          <Text style={styles.title}>Portfolio Value</Text>
        </View>
        <Text style={styles.stockCount}>{stockCount} stocks</Text>
      </View>

      {/* Main Value */}
      <View style={styles.valueSection}>
        <Text style={styles.totalValue}>
          {formatCurrency(totalValue)}
        </Text>
        
        {/* Change Display */}
        <View style={styles.changeContainer}>
          <Icon
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={20}
            color={changeColor}
          />
          <Text style={[styles.changeAmount, {color: changeColor}]}>
            {formatCurrency(Math.abs(totalGainLoss))}
          </Text>
          <Text style={[styles.changePercent, {color: changeColor}]}>
            ({formatPercent(Math.abs(totalGainLossPercent))})
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Invested</Text>
          <Text style={styles.statValue}>
            {formatCurrency(totalValue - totalGainLoss)}
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Day's Change</Text>
          <Text style={[styles.statValue, {color: changeColor}]}>
            {isPositive ? '+' : ''}{formatPercent(totalGainLossPercent)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  stockCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  valueSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeAmount: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  changePercent: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});

export default PortfolioSummaryCard;