import React, { useState } from 'react';
import { Stock } from '../../types/portfolio';
import { validateStockData } from '../../utils/validation';

export interface FormData {
  ticker: string;
  buyPrice: string;
  currentPrice: string;
  quantity: string;
}

interface StockFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  editingStock: Stock | null;
}

const StockForm: React.FC<StockFormProps> = ({ formData, setFormData, onSubmit, editingStock }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateStockData(
      formData.ticker,
      formData.buyPrice,
      formData.currentPrice,
      formData.quantity
    );
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setValidationErrors([]);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Stock Ticker
        </label>
        <input
          type="text"
          value={formData.ticker}
          onChange={(e) => handleInputChange('ticker', e.target.value)}
          className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          placeholder="e.g., AAPL"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Buy Price ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.buyPrice}
          onChange={(e) => handleInputChange('buyPrice', e.target.value)}
          className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Current Price ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={(e) => handleInputChange('currentPrice', e.target.value)}
          className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantity
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          className="w-full px-3 py-2 bg-spotify-dark-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          placeholder="0"
          required
        />
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3">
          <ul className="text-red-400 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-spotify-green text-white py-2 px-4 rounded-lg hover:bg-spotify-green-hover transition-colors font-medium"
        >
          {editingStock ? 'Update Stock' : 'Add Stock'}
        </button>
      </div>
    </form>
  );
};

export default StockForm;