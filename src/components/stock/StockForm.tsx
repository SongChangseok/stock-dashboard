import React from 'react';
import { StockFormData } from '../../types/portfolio';

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
  const handleInputChange = (field: keyof StockFormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.ticker || !formData.buyPrice || !formData.currentPrice || !formData.quantity) {
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Ticker Symbol</label>
        <input
          type="text"
          value={formData.ticker}
          onChange={(e) => handleInputChange('ticker', e.target.value)}
          className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          placeholder="AAPL"
        />
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Buy Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.buyPrice}
          onChange={(e) => handleInputChange('buyPrice', e.target.value)}
          className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          placeholder="150.00"
        />
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Current Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={(e) => handleInputChange('currentPrice', e.target.value)}
          className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          placeholder="185.50"
        />
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          placeholder="10"
        />
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
