import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Stock } from '../../types/portfolio';
import { getColorPalette } from '../../utils/portfolio';

interface DashboardChartProps {
  stocks: Stock[];
}

const DashboardChart: React.FC<DashboardChartProps> = React.memo(({ stocks }) => {
  const getPieChartData = () => {
    const colors = getColorPalette(stocks.length);
    
    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: colors[index],
      percentage: 0 // Will be calculated in the render
    }));
  };

  const data = getPieChartData();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-spotify-gray/90 backdrop-blur-sm p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-spotify-green">
            ${data.value.toLocaleString()} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (stocks.length === 0) {
    return (
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Portfolio Overview</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No stocks in portfolio</div>
            <p className="text-gray-500">Add stocks to see your portfolio distribution</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Portfolio Distribution</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

DashboardChart.displayName = 'DashboardChart';

export default DashboardChart;