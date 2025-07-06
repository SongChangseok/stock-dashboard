import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {Text} from 'react-native-paper';
import {colors, spacing, fontSize} from '../../constants/theme';
import {Stock} from '@shared/types/portfolio';
import {formatCurrency, formatPercent} from '@shared/utils/formatters';

interface PerformanceBarChartProps {
  data: Stock[];
  metric: 'value' | 'gainLoss' | 'gainLossPercent';
  height?: number;
}

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({
  data,
  metric,
  height = 220,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 2;

  // Prepare chart data based on metric
  const prepareChartData = () => {
    const labels = data.slice(0, 8).map(stock => stock.ticker); // Limit to 8 for readability
    const datasets = [{
      data: data.slice(0, 8).map(stock => {
        const totalValue = stock.currentPrice * stock.quantity;
        const totalCost = stock.buyPrice * stock.quantity;
        const gainLoss = totalValue - totalCost;
        const gainLossPercent = ((totalValue - totalCost) / totalCost) * 100;

        switch (metric) {
          case 'value':
            return totalValue;
          case 'gainLoss':
            return gainLoss;
          case 'gainLossPercent':
            return gainLossPercent;
          default:
            return totalValue;
        }
      }),
      color: (opacity = 1) => `rgba(29, 185, 84, ${opacity})`,
      strokeWidth: 2,
    }];

    return { labels, datasets };
  };

  const chartData = prepareChartData();

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: metric === 'gainLossPercent' ? 1 : 0,
    color: (opacity = 1) => {
      if (metric === 'gainLoss') {
        // Use different colors for positive/negative values
        return `rgba(29, 185, 84, ${opacity})`;
      }
      return `rgba(29, 185, 84, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(179, 179, 179, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: \"4\",
      strokeWidth: \"2\",
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: \"3,3\",
      stroke: colors.border,
      strokeWidth: 1,
    },
    formatYLabel: (value: string) => {
      const numValue = parseFloat(value);
      if (metric === 'value' || metric === 'gainLoss') {
        if (Math.abs(numValue) >= 1000) {
          return `$${(numValue / 1000).toFixed(1)}k`;
        }
        return `$${numValue.toFixed(0)}`;
      } else {
        return `${numValue.toFixed(1)}%`;
      }
    },
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'value':
        return 'Portfolio Value by Stock';
      case 'gainLoss':
        return 'Gain/Loss by Stock';
      case 'gainLossPercent':
        return 'Performance (%) by Stock';
      default:
        return 'Portfolio Performance';
    }
  };

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, {height}]}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getMetricTitle()}</Text>
      
      <BarChart
        data={chartData}
        width={chartWidth}
        height={height}
        chartConfig={chartConfig}
        style={styles.chart}
        verticalLabelRotation={data.length > 6 ? 30 : 0}
        showBarTops={false}
        fromZero={metric === 'value'}
        showValuesOnTopOfBars={false}
      />

      {/* Data Summary */}
      <View style={styles.summaryContainer}>
        {data.slice(0, 3).map((stock, index) => {
          const totalValue = stock.currentPrice * stock.quantity;
          const totalCost = stock.buyPrice * stock.quantity;
          const gainLoss = totalValue - totalCost;
          const gainLossPercent = ((totalValue - totalCost) / totalCost) * 100;

          let displayValue: string;
          let isPositive = true;

          switch (metric) {
            case 'value':
              displayValue = formatCurrency(totalValue);
              break;
            case 'gainLoss':
              displayValue = formatCurrency(Math.abs(gainLoss));
              isPositive = gainLoss >= 0;
              break;
            case 'gainLossPercent':
              displayValue = formatPercent(Math.abs(gainLossPercent));
              isPositive = gainLossPercent >= 0;
              break;
            default:
              displayValue = formatCurrency(totalValue);
          }

          return (
            <View key={stock.id} style={styles.summaryItem}>
              <View style={styles.summaryHeader}>
                <View
                  style={[
                    styles.summaryColor,
                    {backgroundColor: colors.chart[index % colors.chart.length]},
                  ]}
                />
                <Text style={styles.summaryTicker}>{stock.ticker}</Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: metric === 'value' 
                      ? colors.textPrimary 
                      : isPositive 
                        ? colors.success 
                        : colors.error
                  },
                ]}
              >
                {metric !== 'value' && !isPositive ? '-' : ''}
                {displayValue}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  summaryTicker: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
});

export default PerformanceBarChart;