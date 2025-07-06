import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../constants/theme';
import {formatCurrency, formatPercent} from '@shared/utils/formatters';
import {Stock} from '@shared/types/portfolio';

interface StockListItemProps {
  stock: Stock;
  onPress: () => void;
}

const StockListItem: React.FC<StockListItemProps> = ({
  stock,
  onPress,
}) => {
  const totalValue = stock.currentPrice * stock.quantity;
  const totalCost = stock.buyPrice * stock.quantity;
  const gainLoss = totalValue - totalCost;
  const gainLossPercent = ((totalValue - totalCost) / totalCost) * 100;
  
  const isPositive = gainLoss >= 0;
  const changeColor = isPositive ? colors.success : colors.error;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <View style={styles.tickerContainer}>
            <Text style={styles.ticker}>{stock.ticker}</Text>
            <Text style={styles.quantity}>{stock.quantity} shares</Text>
          </View>
        </View>

        {/* Prices */}
        <View style={styles.pricesContainer}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Current</Text>
            <Text style={styles.currentPrice}>
              {formatCurrency(stock.currentPrice)}
            </Text>
          </View>
          
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.performance}>
          <View style={styles.changeContainer}>
            <Icon
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={changeColor}
            />
            <Text style={[styles.changeAmount, {color: changeColor}]}>
              {formatCurrency(Math.abs(gainLoss))}
            </Text>
          </View>
          <Text style={[styles.changePercent, {color: changeColor}]}>
            {isPositive ? '+' : ''}{formatPercent(gainLossPercent)}
          </Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrow}>
          <Icon name=\"chevron-right\" size={24} color={colors.textMuted} />
        </View>
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
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  stockInfo: {
    flex: 1.5,
  },
  tickerContainer: {
    marginRight: spacing.sm,
  },
  ticker: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quantity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  pricesContainer: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  currentPrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  performance: {
    flex: 1,
    alignItems: 'flex-end',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  changeAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  changePercent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});

export default StockListItem;