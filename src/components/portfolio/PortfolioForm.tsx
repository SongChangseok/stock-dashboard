import React, { useState, useEffect } from 'react';
import { Save, X, Palette } from 'lucide-react';
import { useMultiPortfolio } from '../../contexts/MultiPortfolioContext';
import { PortfolioFormData } from '../../types/portfolio';

interface PortfolioFormProps {
  portfolioId?: string | null;
  onClose: () => void;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({
  portfolioId,
  onClose,
}) => {
  const { state, createPortfolio, updatePortfolio } = useMultiPortfolio();
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    description: '',
    color: '#1DB954',
  });
  const [errors, setErrors] = useState<Partial<PortfolioFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(portfolioId);
  const existingPortfolio = portfolioId
    ? state.portfolios.find(p => p.id === portfolioId)
    : null;

  // Color options
  const colorOptions = [
    '#1DB954', // Spotify Green
    '#1ED760', // Light Green
    '#06B6D4', // Cyan
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#F43F5E', // Rose
  ];

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && existingPortfolio) {
      setFormData({
        name: existingPortfolio.name,
        description: existingPortfolio.description || '',
        color: existingPortfolio.color || '#1DB954',
      });
    }
  }, [isEditing, existingPortfolio]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof PortfolioFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PortfolioFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Portfolio name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Portfolio name must be less than 50 characters';
    }

    // Check for duplicate names (excluding current portfolio if editing)
    const isDuplicate = state.portfolios.some(
      p =>
        p.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        p.id !== portfolioId,
    );
    if (isDuplicate) {
      newErrors.name = 'A portfolio with this name already exists';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim(),
      };

      if (isEditing && portfolioId) {
        updatePortfolio(portfolioId, trimmedData);
      } else {
        createPortfolio(trimmedData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving portfolio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Portfolio Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Portfolio Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter portfolio name"
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all duration-200 ${
            errors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/20 hover:border-white/30'
          }`}
          maxLength={50}
          autoFocus
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Portfolio Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter a brief description (optional)"
          rows={3}
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all duration-200 resize-none ${
            errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/20 hover:border-white/30'
          }`}
          maxLength={200}
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-400">{errors.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {(formData.description || '').length}/200 characters
        </p>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <div className="flex items-center gap-2">
            <Palette size={16} />
            Portfolio Color
          </div>
        </label>
        <div className="grid grid-cols-6 gap-3">
          {colorOptions.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                formData.color === color
                  ? 'border-white shadow-lg scale-110'
                  : 'border-white/20 hover:border-white/40'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: formData.color }}
          />
          <span className="text-sm text-slate-400">
            Selected: {formData.color}
          </span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          disabled={isSubmitting}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Update Portfolio'
              : 'Create Portfolio'}
        </button>
      </div>
    </form>
  );
};

export default PortfolioForm;