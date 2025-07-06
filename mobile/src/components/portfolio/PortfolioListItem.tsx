import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../constants/theme';
import {formatCurrency, formatPercent} from '@shared/utils/formatters';
import {PortfolioSummary} from '@shared/types/portfolio';

interface PortfolioListItemProps {
  portfolio: PortfolioSummary;
  isActive: boolean;
  onPress: () => void;
}

const PortfolioListItem: React.FC<PortfolioListItemProps> = ({
  portfolio,
  isActive,
  onPress,
}) => {
  const isPositive = portfolio.totalProfitLoss >= 0;
  const changeColor = isPositive ? colors.success : colors.error;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Portfolio Info */}
        <View style={styles.portfolioInfo}>
          <View
            style={[
              styles.colorIndicator,
              {backgroundColor: portfolio.color},
            ]}
          />
          <View style={styles.details}>
            <Text style={styles.name}>{portfolio.name}</Text>
            <Text style={styles.subtitle}>
              {portfolio.stockCount} stocks
            </Text>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.performance}>
          <Text style={styles.value}>
            {formatCurrency(portfolio.totalValue)}
          </Text>
          <View style={styles.changeContainer}>
            <Icon
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={changeColor}
            />
            <Text style={[styles.changeText, {color: changeColor}]}>
              {formatPercent(Math.abs(portfolio.profitLossPercentage))}
            </Text>
          </View>
        </View>

        {/* Active Indicator */}
        {isActive && (
          <View style={styles.activeIndicator}>
            <Icon name=\"check-circle\" size={20} color={colors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeContainer: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  portfolioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  performance: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  value: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  activeIndicator: {
    marginLeft: spacing.sm,
  },
});

export default PortfolioListItem;