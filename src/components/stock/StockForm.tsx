import React, { useState } from 'react';
import { StockFormData, ValidationError } from '../../types/portfolio';
import { validateStockFormData } from '../../utils/validation';
import { useToast } from '../../contexts/ToastContext';

interface StockFormProps {
  formData: StockFormData;
  onFormChange: (formData: StockFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const StockForm: React.FC<StockFormProps> = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  onCancel, 
  isEditing 
}) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { error: showErrorToast } = useToast();

  const handleInputChange = (field: keyof StockFormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
    
    // Clear specific field error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleSubmit = () => {
    try {
      const validationErrors = validateStockFormData(formData);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        showErrorToast(
          'Validation Error',
          'Please check the form fields and correct any errors.'
        );
        return;
      }
      
      setErrors([]);
      onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
      showErrorToast(
        'Form Error',
        'An unexpected error occurred while processing the form.'
      );
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const hasError = (field: string): boolean => {
    return errors.some(error => error.field === field);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Ticker Symbol</label>
        <input
          type="text"
          value={formData.ticker}
          onChange={(e) => handleInputChange('ticker', e.target.value)}
          className={`w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError('ticker') ? 'focus:ring-red-500 border-red-500' : 'focus:ring-primary-500'
          }`}
          placeholder="AAPL"
        />
        {getFieldError('ticker') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('ticker')}</p>
        )}
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Buy Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.buyPrice}
          onChange={(e) => handleInputChange('buyPrice', e.target.value)}
          className={`w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError('buyPrice') ? 'focus:ring-red-500 border-red-500' : 'focus:ring-primary-500'
          }`}
          placeholder="150.00"
        />
        {getFieldError('buyPrice') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('buyPrice')}</p>
        )}
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Current Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={(e) => handleInputChange('currentPrice', e.target.value)}
          className={`w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError('currentPrice') ? 'focus:ring-red-500 border-red-500' : 'focus:ring-primary-500'
          }`}
          placeholder="185.50"
        />
        {getFieldError('currentPrice') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('currentPrice')}</p>
        )}
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          className={`w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError('quantity') ? 'focus:ring-red-500 border-red-500' : 'focus:ring-primary-500'
          }`}
          placeholder="10"
        />
        {getFieldError('quantity') && (
          <p className="text-red-400 text-sm mt-1">{getFieldError('quantity')}</p>
        )}
      </div>
      
      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
        >
          {isEditing ? 'Update' : 'Add'} Stock
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 glass-button text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default StockForm;
