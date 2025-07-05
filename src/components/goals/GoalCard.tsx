import React from 'react';
import { Edit, Trash2, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Goal } from '../../types/goals';
import { useGoals } from '../../contexts/GoalsContext';
import { formatCurrency } from '../../utils/formatters';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goalId: number) => void;
  onDelete: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const { calculateProgress } = useGoals();
  const progress = calculateProgress(goal.id);

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'retirement':
        return <TrendingUp className="text-blue-400" size={20} />;
      case 'house':
        return <Target className="text-green-400" size={20} />;
      case 'education':
        return <Target className="text-purple-400" size={20} />;
      case 'emergency':
        return <Target className="text-red-400" size={20} />;
      case 'vacation':
        return <Target className="text-cyan-400" size={20} />;
      case 'investment':
        return <TrendingUp className="text-yellow-400" size={20} />;
      default:
        return <Target className="text-gray-400" size={20} />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-spotify-green';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getGoalTypeIcon(goal.type)}
          <div>
            <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
            <p className="text-sm text-gray-400 capitalize">{goal.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(goal.id)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-gray-300 text-sm mb-4">{goal.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-semibold text-white">{progress.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.progress)}`}
            style={{ width: `${Math.min(progress.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Current</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(goal.currentAmount)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Target</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(goal.targetAmount)}
          </div>
        </div>
      </div>

      {/* Time Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Target Date</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatDate(goal.targetDate)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Days Left</span>
          </div>
          <div className={`text-sm font-semibold ${daysRemaining < 30 ? 'text-red-400' : 'text-white'}`}>
            {daysRemaining > 0 ? daysRemaining : 'Overdue'}
          </div>
        </div>
      </div>

      {/* Progress Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${progress.onTrack ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {progress.onTrack ? 'On Track' : 'Behind Schedule'}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Need: {formatCurrency(progress.monthlyRequired)}/mo
        </div>
      </div>

      {/* Category */}
      {goal.category && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <span className="text-xs text-gray-400">Category: </span>
          <span className="text-xs text-gray-300">{goal.category}</span>
        </div>
      )}
    </div>
  );
};

export default GoalCard;