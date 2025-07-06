import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {Text} from 'react-native-paper';
import {colors, spacing, fontSize} from '../../constants/theme';
import {Stock} from '@shared/types/portfolio';

interface PortfolioOverviewChartProps {
  data: Stock[];
  width: number;
  height: number;
}

const PortfolioOverviewChart: React.FC<PortfolioOverviewChartProps> = ({
  data,
  width,
  height,
}) => {
  // Prepare chart data
  const chartData = data.map((stock, index) => ({
    name: stock.ticker,
    value: stock.currentPrice * stock.quantity,
    color: colors.chart[index % colors.chart.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

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
      <View style={[styles.emptyContainer, {height}]}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        accessor=\"value\"
        backgroundColor=\"transparent\"
        paddingLeft=\"15\"
        center={[10, 0]}
        absolute={false}
        hasLegend={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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

export default PortfolioOverviewChart;