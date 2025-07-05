import React, { useState, useEffect } from 'react';
import { GoalType, GoalFormData, Goal } from '../../types/goals';
import {
  Target,
  Home,
  GraduationCap,
  Shield,
  Plane,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (formData: GoalFormData) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    type: GoalType.OTHER,
    targetAmount: '',
    targetDate: '',
    monthlyContribution: '',
    category: '',
  });

  const [errors, setErrors] = useState<Partial<GoalFormData>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        type: goal.type,
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate,
        monthlyContribution: goal.monthlyContribution.toString(),
        category: goal.category,
      });
    }
  }, [goal]);

  const goalTypeOptions = [
    {
      value: GoalType.RETIREMENT,
      label: 'Retirement',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      value: GoalType.HOUSE,
      label: 'House Purchase',
      icon: Home,
      color: 'text-green-400',
    },
    {
      value: GoalType.EDUCATION,
      label: 'Education',
      icon: GraduationCap,
      color: 'text-purple-400',
    },
    {
      value: GoalType.EMERGENCY,
      label: 'Emergency Fund',
      icon: Shield,
      color: 'text-red-400',
    },
    {
      value: GoalType.VACATION,
      label: 'Vacation',
      icon: Plane,
      color: 'text-cyan-400',
    },
    {
      value: GoalType.INVESTMENT,
      label: 'Investment',
      icon: TrendingUp,
      color: 'text-yellow-400',
    },
    {
      value: GoalType.OTHER,
      label: 'Other',
      icon: MoreHorizontal,
      color: 'text-gray-400',
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof GoalFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GoalFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }

    if (
      !formData.monthlyContribution ||
      parseFloat(formData.monthlyContribution) < 0
    ) {
      newErrors.monthlyContribution =
        'Monthly contribution must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const selectedGoalType = goalTypeOptions.find(
    option => option.value === formData.type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Goal Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {goalTypeOptions.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: value }))}
              className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                formData.type === value
                  ? 'border-spotify-green bg-spotify-green bg-opacity-20 text-white'
                  : 'border-gray-600 bg-spotify-gray text-gray-300 hover:border-gray-500'
              }`}
            >
              <Icon size={18} className={color} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Goal Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-spotify-dark-gray border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green ${
            errors.title ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your goal title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Goal Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green"
          placeholder="Describe your goal..."
        />
      </div>

      {/* Target Amount */}
      <div>
        <label
          htmlFor="targetAmount"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Target Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">$</span>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`w-full pl-8 pr-4 py-3 bg-spotify-dark-gray border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green ${
              errors.targetAmount ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.targetAmount && (
          <p className="mt-1 text-sm text-red-400">{errors.targetAmount}</p>
        )}
      </div>

      {/* Target Date */}
      <div>
        <label
          htmlFor="targetDate"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Target Date
        </label>
        <input
          type="date"
          id="targetDate"
          name="targetDate"
          value={formData.targetDate}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-spotify-dark-gray border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green ${
            errors.targetDate ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.targetDate && (
          <p className="mt-1 text-sm text-red-400">{errors.targetDate}</p>
        )}
      </div>

      {/* Monthly Contribution */}
      <div>
        <label
          htmlFor="monthlyContribution"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Monthly Contribution
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">$</span>
          <input
            type="number"
            id="monthlyContribution"
            name="monthlyContribution"
            value={formData.monthlyContribution}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`w-full pl-8 pr-4 py-3 bg-spotify-dark-gray border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green ${
              errors.monthlyContribution ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.monthlyContribution && (
          <p className="mt-1 text-sm text-red-400">
            {errors.monthlyContribution}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Category (Optional)
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green"
          placeholder="e.g., Personal, Family, Business"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-spotify-green hover:bg-spotify-green-hover text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {goal ? 'Update Goal' : 'Create Goal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
