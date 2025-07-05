import React, { useState } from 'react';
import { Target, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useGoals } from '../../contexts/GoalsContext';
import { GoalType, GoalFormData } from '../../types/goals';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../common/Modal';
import GoalForm from './GoalForm';
import GoalCard from './GoalCard';
import GoalProgressChart from './GoalProgressChart';
import EmptyState from '../common/EmptyState';

const GoalsPage: React.FC = () => {
  const { state, addGoal, updateGoal, deleteGoal } = useGoals();
  const { goals, metrics, loading, error } = state;
  
  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<GoalType | 'all'>('all');

  const handleAddGoal = () => {
    setEditingGoalId(null);
    setShowModal(true);
  };

  const handleEditGoal = (goalId: number) => {
    setEditingGoalId(goalId);
    setShowModal(true);
  };

  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
    }
  };

  const handleSubmitGoal = (formData: GoalFormData) => {
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        monthlyContribution: parseFloat(formData.monthlyContribution),
        category: formData.category
      });
    } else {
      addGoal({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        targetDate: formData.targetDate,
        isActive: true,
        monthlyContribution: parseFloat(formData.monthlyContribution),
        category: formData.category
      });
    }
    setShowModal(false);
  };

  const filteredGoals = selectedType === 'all' 
    ? goals 
    : goals.filter(goal => goal.type === selectedType);

  const goalTypeOptions = [
    { value: 'all', label: 'All Goals', icon: Target },
    { value: GoalType.RETIREMENT, label: 'Retirement', icon: TrendingUp },
    { value: GoalType.HOUSE, label: 'House Purchase', icon: Target },
    { value: GoalType.EDUCATION, label: 'Education', icon: Target },
    { value: GoalType.EMERGENCY, label: 'Emergency Fund', icon: Target },
    { value: GoalType.VACATION, label: 'Vacation', icon: Target },
    { value: GoalType.INVESTMENT, label: 'Investment', icon: TrendingUp },
    { value: GoalType.OTHER, label: 'Other', icon: Target }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Goals</h1>
          <p className="text-gray-400">Track your progress towards your financial objectives</p>
        </div>
        <button
          onClick={handleAddGoal}
          className="bg-spotify-green hover:bg-spotify-green-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Goals</h3>
            <Target className="text-spotify-green" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalGoals}</div>
        </div>

        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Active Goals</h3>
            <TrendingUp className="text-blue-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.activeGoals}</div>
        </div>

        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Target Amount</h3>
            <DollarSign className="text-yellow-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalTargetAmount)}</div>
        </div>

        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Overall Progress</h3>
            <Calendar className="text-purple-400" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.overallProgress.toFixed(1)}%</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {goalTypeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSelectedType(value as GoalType | 'all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedType === value
                ? 'bg-spotify-green text-white'
                : 'bg-spotify-gray text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create your first financial goal to start tracking your progress"
          action={
            <button
              onClick={handleAddGoal}
              className="bg-spotify-green hover:bg-spotify-green-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Goal
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Progress Chart */}
      {goals.length > 0 && (
        <div className="bg-spotify-gray p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Goals Progress Overview</h3>
          <GoalProgressChart goals={goals} />
        </div>
      )}

      {/* Goal Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGoalId ? 'Edit Goal' : 'Add New Goal'}
      >
        <GoalForm
          goal={editingGoalId ? goals.find(g => g.id === editingGoalId) : undefined}
          onSubmit={handleSubmitGoal}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;