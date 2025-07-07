import React from 'react';
import { PieChart, BarChart3, Map, TrendingUp, LineChart, Grid } from 'lucide-react';

export type ChartType = 'pie' | 'heatmap' | 'treemap' | 'performance' | 'sector' | 'profitloss';

interface ChartOption {
  id: ChartType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ChartSelectorProps {
  selectedChart: ChartType;
  onChartChange: (chart: ChartType) => void;
}

const chartOptions: ChartOption[] = [
  {
    id: 'pie',
    label: 'Asset Allocation',
    description: 'Portfolio distribution by holdings',
    icon: PieChart
  },
  {
    id: 'heatmap',
    label: 'Performance Heatmap',
    description: 'Visual performance overview',
    icon: Grid
  },
  {
    id: 'treemap',
    label: 'Treemap View',
    description: 'Hierarchical portfolio composition',
    icon: Map
  },
  {
    id: 'performance',
    label: 'Performance Chart',
    description: 'Time series analysis',
    icon: TrendingUp
  },
  {
    id: 'sector',
    label: 'Sector Analysis',
    description: 'Industry breakdown',
    icon: BarChart3
  },
  {
    id: 'profitloss',
    label: 'P&L Chart',
    description: 'Profit and loss visualization',
    icon: LineChart
  }
];

const ChartSelector: React.FC<ChartSelectorProps> = React.memo(({ selectedChart, onChartChange }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Chart Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedChart === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onChartChange(option.id)}
              className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-spotify-green/10 border-spotify-green text-white'
                  : 'bg-spotify-gray/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent 
                  className={`w-5 h-5 ${isSelected ? 'text-spotify-green' : 'text-gray-400'}`} 
                />
                <span className="font-semibold">{option.label}</span>
              </div>
              <p className="text-sm text-gray-400">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
});

ChartSelector.displayName = 'ChartSelector';

export default ChartSelector;