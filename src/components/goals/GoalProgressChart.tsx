import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Goal } from '../../types/goals';
import { useGoals } from '../../contexts/GoalsContext';

interface GoalProgressChartProps {
  goals: Goal[];
}

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ goals }) => {
  const { calculateProgress } = useGoals();

  const chartData = goals.map(goal => {
    const progress = calculateProgress(goal.id);
    return {
      name:
        goal.title.length > 15
          ? goal.title.substring(0, 15) + '...'
          : goal.title,
      progress: Math.round(progress.progress),
      target: goal.targetAmount,
      current: goal.currentAmount,
      onTrack: progress.onTrack,
      type: goal.type,
    };
  });

  const getBarColor = (progress: number, onTrack: boolean) => {
    if (progress >= 100) return '#10b981'; // green-500
    if (progress >= 75) return '#1DB954'; // spotify-green
    if (progress >= 50) return '#eab308'; // yellow-500
    if (progress >= 25) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-spotify-dark-gray p-4 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          <p className="text-gray-300">
            <span className="font-medium">Progress:</span> {data.progress}%
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Current:</span> $
            {data.current.toLocaleString()}
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Target:</span> $
            {data.target.toLocaleString()}
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Status:</span>{' '}
            {data.onTrack ? 'On Track' : 'Behind Schedule'}
          </p>
          <p className="text-gray-300 capitalize">
            <span className="font-medium">Type:</span>{' '}
            {data.type.replace('_', ' ')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No goals to display</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
            domain={[0, 100]}
            label={{
              value: 'Progress (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#9CA3AF' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.progress, entry.onTrack)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalProgressChart;
