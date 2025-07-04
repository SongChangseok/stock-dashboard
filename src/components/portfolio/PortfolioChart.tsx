import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Stock } from '../../types/portfolio';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#84cc16', '#ec4899'];

interface PortfolioChartProps {
  stocks: Stock[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ stocks }) => {
  const getPieChartData = (): ChartData[] => {
    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: COLORS[index % COLORS.length]
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-spotify-dark-gray p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-spotify-green">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (stocks.length === 0) {
    return (
      <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No stocks to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={getPieChartData()}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {getPieChartData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioChart;