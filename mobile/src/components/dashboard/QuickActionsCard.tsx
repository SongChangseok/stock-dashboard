import React from 'react';
import {View, StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../constants/theme';
import Card from '../common/Card';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsCardProps {
  onAddStock: () => void;
  onViewGoals: () => void;
  onViewNews: () => void;
  style?: ViewStyle;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddStock,
  onViewGoals,
  onViewNews,
  style,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'add-stock',
      title: 'Add Stock',
      subtitle: 'Buy new position',
      icon: 'add-circle',
      color: colors.primary,
      onPress: onAddStock,
    },
    {
      id: 'view-goals',
      title: 'Goals',
      subtitle: 'Track progress',
      icon: 'flag',
      color: colors.secondary,
      onPress: onViewGoals,
    },
    {
      id: 'market-news',
      title: 'News',
      subtitle: 'Market updates',
      icon: 'article',
      color: colors.accent,
      onPress: onViewNews,
    },
  ];

  const renderActionButton = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.actionButton, {borderColor: action.color}]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, {backgroundColor: `${action.color}20`}]}>
        <Icon name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <Card style={[styles.container, style]} variant=\"glass\">
      <View style={styles.header}>
        <Icon name=\"flash-on\" size={20} color={colors.warning} />
        <Text style={styles.title}>Quick Actions</Text>
      </View>
      
      <View style={styles.actionsGrid}>
        {actions.map(renderActionButton)}
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: colors.surfaceVariant,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default QuickActionsCard;