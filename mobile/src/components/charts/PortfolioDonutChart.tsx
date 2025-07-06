import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {Text} from 'react-native-paper';
import {colors, spacing, fontSize, fontWeight} from '../../constants/theme';
import {Stock} from '@shared/types/portfolio';
import {formatCurrency} from '@shared/utils/formatters';

interface PortfolioDonutChartProps {
  data: Stock[];
  centerText?: string;
  centerValue?: number;
  showLegend?: boolean;
}

const PortfolioDonutChart: React.FC<PortfolioDonutChartProps> = ({
  data,
  centerText = 'Total Value',
  centerValue,
  showLegend = true,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 2;

  // Prepare chart data
  const chartData = data.map((stock, index) => {
    const value = stock.currentPrice * stock.quantity;
    return {
      name: stock.ticker,
      value: value,
      color: colors.chart[index % colors.chart.length],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    };
  });

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(29, 185, 84, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chart */}
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor=\"value\"
          backgroundColor=\"transparent\"
          paddingLeft=\"15\"
          center={[0, 0]}
          absolute={false}
          hasLegend={false}
        />
        
        {/* Center Text Overlay */}
        <View style={styles.centerTextContainer}>
          <Text style={styles.centerLabel}>{centerText}</Text>
          <Text style={styles.centerValue}>
            {formatCurrency(centerValue || totalValue)}
          </Text>
        </View>
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, {backgroundColor: item.color}]} />
              <Text style={styles.legendLabel}>{item.name}</Text>
              <Text style={styles.legendValue}>
                {formatCurrency(item.value)}
              </Text>
              <Text style={styles.legendPercent}>
                {((item.value / totalValue) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  centerValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  legendValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  legendPercent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'right',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
});

export default PortfolioDonutChart;