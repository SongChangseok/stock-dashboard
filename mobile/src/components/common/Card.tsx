import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';
import {colors, spacing, borderRadius} from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  variant?: 'default' | 'elevated' | 'glass';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  variant = 'default',
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    {padding: spacing[padding]},
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xs,
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default Card;