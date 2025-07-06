import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight} from '../../constants/theme';
import {formatCurrency, formatPercent} from '@shared/utils/formatters';

interface PriceDisplayProps {
  value: number;
  change?: number;
  changePercent?: number;
  size?: 'small' | 'medium' | 'large';
  showChange?: boolean;
  prefix?: string;
  suffix?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  change,
  changePercent,
  size = 'medium',
  showChange = true,
  prefix = '$',
  suffix,
}) => {
  const isPositive = (change || 0) >= 0;
  const changeColor = isPositive ? colors.success : colors.error;
  const changeIcon = isPositive ? 'trending-up' : 'trending-down';

  const sizeStyles = {
    small: {fontSize: fontSize.sm, iconSize: 16},
    medium: {fontSize: fontSize.lg, iconSize: 20},
    large: {fontSize: fontSize['2xl'], iconSize: 24},
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.value, {fontSize: sizeStyles[size].fontSize}]}>
        {prefix}
        {formatCurrency(value, false)}
        {suffix}
      </Text>
      
      {showChange && change !== undefined && changePercent !== undefined && (
        <View style={styles.changeContainer}>
          <Icon
            name={changeIcon}
            size={sizeStyles[size].iconSize}
            color={changeColor}
          />
          <Text style={[styles.changeText, {color: changeColor}]}>
            {formatCurrency(Math.abs(change), false)} ({formatPercent(Math.abs(changePercent))})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  value: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
});

export default PriceDisplay;