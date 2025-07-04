import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Stock, StockFormData, PortfolioMetrics, ExportData } from '../types/portfolio';
import { 
  calculatePortfolioMetrics, 
  saveToLocalStorage, 
  loadFromLocalStorage,
  validatePortfolioData 
} from '../utils/portfolio';
import { useToast } from './ToastContext';

// Action types
type PortfolioAction =
  | { type: 'ADD_STOCK'; payload: Stock }
  | { type: 'UPDATE_STOCK'; payload: Stock }
  | { type: 'DELETE_STOCK'; payload: number }
  | { type: 'SET_STOCKS'; payload: Stock[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// State interface
interface PortfolioState {
  stocks: Stock[];
  metrics: PortfolioMetrics;
  loading: boolean;
  error: string | null;
}

// Context interface
interface PortfolioContextType {
  state: PortfolioState;
  addStock: (formData: StockFormData) => void;
  updateStock: (id: number, formData: StockFormData) => void;
  deleteStock: (id: number) => void;
  importStocks: (data: ExportData) => void;
  exportStocks: () => ExportData;
  clearError: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Initial state
const initialState: PortfolioState = {
  stocks: [
    { id: 1, ticker: 'AAPL', buyPrice: 150.00, currentPrice: 185.50, quantity: 10 },
    { id: 2, ticker: 'GOOGL', buyPrice: 2500.00, currentPrice: 2650.00, quantity: 5 },
    { id: 3, ticker: 'TSLA', buyPrice: 800.00, currentPrice: 750.00, quantity: 8 },
  ],
  metrics: {
    totalValue: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0,
  },
  loading: false,
  error: null,
};

// Update metrics helper
const updateMetrics = (stocks: Stock[]): PortfolioMetrics => {
  return calculatePortfolioMetrics(stocks);
};

// Reducer
const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case 'ADD_STOCK': {
      const newStocks = [...state.stocks, action.payload];
      return {
        ...state,
        stocks: newStocks,
        metrics: updateMetrics(newStocks),
      };
    }
    case 'UPDATE_STOCK': {
      const newStocks = state.stocks.map(stock =>
        stock.id === action.payload.id ? action.payload : stock
      );
      return {
        ...state,
        stocks: newStocks,
        metrics: updateMetrics(newStocks),
      };
    }
    case 'DELETE_STOCK': {
      const newStocks = state.stocks.filter(stock => stock.id !== action.payload);
      return {
        ...state,
        stocks: newStocks,
        metrics: updateMetrics(newStocks),
      };
    }
    case 'SET_STOCKS': {
      return {
        ...state,
        stocks: action.payload,
        metrics: updateMetrics(action.payload),
      };
    }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Provider component
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const { addToast } = useToast();

  // Initialize metrics on mount
  useEffect(() => {
    const metrics = updateMetrics(state.stocks);
    if (JSON.stringify(metrics) !== JSON.stringify(state.metrics)) {
      dispatch({ type: 'SET_STOCKS', payload: state.stocks });
    }
  }, []);

  // Add stock
  const addStock = useCallback((formData: StockFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newStock: Stock = {
        id: Date.now(),
        ticker: formData.ticker.toUpperCase(),
        buyPrice: parseFloat(formData.buyPrice),
        currentPrice: parseFloat(formData.currentPrice),
        quantity: parseInt(formData.quantity),
        lastUpdated: new Date(),
      };

      // Validate the new stock
      if (!newStock.ticker || newStock.buyPrice <= 0 || newStock.currentPrice <= 0 || newStock.quantity <= 0) {
        throw new Error('Invalid stock data');
      }

      dispatch({ type: 'ADD_STOCK', payload: newStock });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      addToast({
        type: 'success',
        title: 'Stock Added',
        message: `${newStock.ticker} has been added to your portfolio.`
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      addToast({
        type: 'error',
        title: 'Add Stock Failed',
        message: (error as Error).message
      });
    }
  }, [addToast]);

  // Update stock
  const updateStock = useCallback((id: number, formData: StockFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedStock: Stock = {
        id,
        ticker: formData.ticker.toUpperCase(),
        buyPrice: parseFloat(formData.buyPrice),
        currentPrice: parseFloat(formData.currentPrice),
        quantity: parseInt(formData.quantity),
        lastUpdated: new Date(),
      };

      // Validate the updated stock
      if (!updatedStock.ticker || updatedStock.buyPrice <= 0 || updatedStock.currentPrice <= 0 || updatedStock.quantity <= 0) {
        throw new Error('Invalid stock data');
      }

      dispatch({ type: 'UPDATE_STOCK', payload: updatedStock });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      addToast({
        type: 'success',
        title: 'Stock Updated',
        message: `${updatedStock.ticker} has been updated successfully.`
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      addToast({
        type: 'error',
        title: 'Update Stock Failed',
        message: (error as Error).message
      });
    }
  }, [addToast]);

  // Delete stock
  const deleteStock = useCallback((id: number) => {
    try {
      const stock = state.stocks.find(s => s.id === id);
      dispatch({ type: 'DELETE_STOCK', payload: id });
      
      if (stock) {
        addToast({
          type: 'success',
          title: 'Stock Removed',
          message: `${stock.ticker} has been removed from your portfolio.`
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.stocks, addToast]);

  // Import stocks
  const importStocks = useCallback((data: ExportData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!validatePortfolioData(data)) {
        throw new Error('Invalid portfolio data format');
      }

      const importedStocks: Stock[] = data.stocks.map((stock, index) => ({
        id: Date.now() + index,
        ticker: stock.ticker.toUpperCase(),
        buyPrice: stock.buyPrice,
        currentPrice: stock.currentPrice,
        quantity: stock.quantity,
        lastUpdated: new Date(),
      }));

      dispatch({ type: 'SET_STOCKS', payload: importedStocks });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      addToast({
        type: 'success',
        title: 'Data Imported',
        message: `Successfully imported ${importedStocks.length} stocks.`
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: (error as Error).message
      });
    }
  }, [addToast]);

  // Export stocks
  const exportStocks = useCallback((): ExportData => {
    return {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: {
        totalValue: state.metrics.totalValue,
        totalPositions: state.stocks.length,
        totalProfitLoss: state.metrics.totalProfitLoss,
      },
      stocks: state.stocks,
    };
  }, [state.stocks, state.metrics]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Load from storage
  const loadFromStorage = useCallback(() => {
    try {
      const savedData = loadFromLocalStorage<Stock[]>('portfolio-stocks');
      if (savedData && Array.isArray(savedData)) {
        dispatch({ type: 'SET_STOCKS', payload: savedData });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from storage' });
    }
  }, []);

  // Save to storage
  const saveToStorage = useCallback(() => {
    try {
      saveToLocalStorage('portfolio-stocks', state.stocks);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save data to storage' });
    }
  }, [state.stocks]);

  // Auto-save to storage whenever stocks change
  useEffect(() => {
    saveToStorage();
  }, [state.stocks, saveToStorage]);

  // Context value
  const value: PortfolioContextType = {
    state,
    addStock,
    updateStock,
    deleteStock,
    importStocks,
    exportStocks,
    clearError,
    loadFromStorage,
    saveToStorage,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Custom hook to use the portfolio context
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

// Export the context for testing purposes
export { PortfolioContext };
