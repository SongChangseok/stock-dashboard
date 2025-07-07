import React, { Suspense } from 'react';
import { Stock } from '../../types/portfolio';
import { ChartType } from './ChartSelector';
import { getColorPalette } from '../../utils/portfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Lazy load chart components for better code splitting
const TreemapChart = React.lazy(() => import('../charts/TreemapChart').catch(() => ({ default: () => <div>Chart not available</div> })));
const HeatmapChart = React.lazy(() => import('../charts/HeatmapChart').catch(() => ({ default: () => <div>Chart not available</div> })));
const PortfolioHistoryChart = React.lazy(() => import('../charts/PortfolioHistoryChart').catch(() => ({ default: () => <div>Chart not available</div> })));

interface ChartContainerProps {
  chartType: ChartType;
  stocks: Stock[];
}

const LoadingSpinner = () => (
  <div className="h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
  </div>
);

const ChartContainer: React.FC<ChartContainerProps> = React.memo(({ chartType, stocks }) => {
  const colors = getColorPalette(stocks.length);

  const getPieChartData = () => {
    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: colors[index],
    }));
  };

  const getSectorData = () => {
    // Simplified sector classification
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Technology',
      'TSLA': 'Automotive', 'F': 'Automotive', 'GM': 'Automotive',
      'JPM': 'Financial', 'BAC': 'Financial', 'WFC': 'Financial',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare',
      'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy'
    };

    const sectorTotals: { [key: string]: number } = {};
    
    stocks.forEach(stock => {
      const sector = sectorMap[stock.ticker] || 'Other';
      const value = stock.currentPrice * stock.quantity;
      sectorTotals[sector] = (sectorTotals[sector] || 0) + value;
    });

    return Object.entries(sectorTotals).map(([sector, value], index) => ({
      sector,
      value,
      color: colors[index % colors.length]
    }));
  };

  const getProfitLossData = () => {
    return stocks.map((stock, index) => {
      const currentValue = stock.currentPrice * stock.quantity;
      const buyValue = stock.buyPrice * stock.quantity;
      const profitLoss = currentValue - buyValue;
      
      return {
        name: stock.ticker,
        profitLoss,
        profitLossPercent: ((profitLoss / buyValue) * 100),
        color: profitLoss >= 0 ? '#1DB954' : '#ef4444'
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-spotify-gray/90 backdrop-blur-sm p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? 
                entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        const pieData = getPieChartData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'sector':
        const sectorData = getSectorData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="sector" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#1DB954" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'profitloss':
        const plData = getProfitLossData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profitLoss">
                {plData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        return (
          <div className="h-96 flex items-center justify-center">
            <Suspense fallback={<LoadingSpinner />}>
              <HeatmapChart />
            </Suspense>
          </div>
        );

      case 'treemap':
        return (
          <div className="h-96 flex items-center justify-center">
            <Suspense fallback={<LoadingSpinner />}>
              <TreemapChart />
            </Suspense>
          </div>
        );

      case 'performance':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PortfolioHistoryChart height={400} />
          </Suspense>
        );

      default:
        return (
          <div className="h-96 flex items-center justify-center text-gray-400">
            Chart type not implemented yet
          </div>
        );
    }
  };

  const getChartTitle = () => {
    const titles = {
      pie: 'Asset Allocation',
      heatmap: 'Performance Heatmap',
      treemap: 'Portfolio Treemap',
      performance: 'Portfolio Performance',
      sector: 'Sector Analysis',
      profitloss: 'Profit & Loss Analysis'
    };
    return titles[chartType];
  };

  if (stocks.length === 0) {
    return (
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Add stocks to your portfolio to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6">{getChartTitle()}</h3>
      {renderChart()}
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;