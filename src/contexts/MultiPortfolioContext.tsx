import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import {
  Portfolio,
  PortfolioSummary,
  PortfolioComparison,
  MultiPortfolioState,
  PortfolioFormData,
  Stock,
} from '../types/portfolio';
import { calculatePortfolioMetrics } from '../utils/portfolioMetrics';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/portfolio';
import { useToast } from './ToastContext';

// Action types
type MultiPortfolioAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PORTFOLIOS'; payload: Portfolio[] }
  | { type: 'ADD_PORTFOLIO'; payload: Portfolio }
  | { type: 'UPDATE_PORTFOLIO'; payload: Portfolio }
  | { type: 'DELETE_PORTFOLIO'; payload: string }
  | { type: 'SET_ACTIVE_PORTFOLIO'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Context type
interface MultiPortfolioContextType {
  state: MultiPortfolioState;
  // Portfolio management
  createPortfolio: (data: PortfolioFormData) => void;
  updatePortfolio: (id: string, data: PortfolioFormData) => void;
  deletePortfolio: (id: string) => void;
  duplicatePortfolio: (id: string, newName?: string) => void;
  setActivePortfolio: (id: string) => void;
  // Stock management within portfolios
  addStockToPortfolio: (portfolioId: string, stock: Stock) => void;
  updateStockInPortfolio: (
    portfolioId: string,
    stockId: number,
    stock: Stock,
  ) => void;
  removeStockFromPortfolio: (portfolioId: string, stockId: number) => void;
  // Data operations
  getPortfolioSummaries: () => PortfolioSummary[];
  getPortfolioComparison: () => PortfolioComparison;
  getActivePortfolio: () => Portfolio | null;
  clearError: () => void;
}

// Initial state
const initialState: MultiPortfolioState = {
  portfolios: [],
  activePortfolioId: null,
  loading: false,
  error: null,
};

// Utility functions
const generatePortfolioId = (): string => {
  return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDefaultPortfolioColor = (index: number): string => {
  const colors = [
    '#1DB954', // Spotify green
    '#1ED760',
    '#06B6D4', // Cyan
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F97316', // Orange
  ];
  return colors[index % colors.length];
};

// Reducer
const multiPortfolioReducer = (
  state: MultiPortfolioState,
  action: MultiPortfolioAction,
): MultiPortfolioState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_PORTFOLIOS':
      return {
        ...state,
        portfolios: action.payload,
        activePortfolioId:
          action.payload.length > 0
            ? action.payload.find(p => p.isDefault)?.id ||
              action.payload[0].id
            : null,
      };

    case 'ADD_PORTFOLIO':
      return {
        ...state,
        portfolios: [...state.portfolios, action.payload],
        activePortfolioId: action.payload.id,
      };

    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolios: state.portfolios.map(p =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };

    case 'DELETE_PORTFOLIO': {
      const updatedPortfolios = state.portfolios.filter(
        p => p.id !== action.payload,
      );
      const newActiveId =
        state.activePortfolioId === action.payload
          ? updatedPortfolios.length > 0
            ? updatedPortfolios[0].id
            : null
          : state.activePortfolioId;

      return {
        ...state,
        portfolios: updatedPortfolios,
        activePortfolioId: newActiveId,
      };
    }

    case 'SET_ACTIVE_PORTFOLIO':
      return { ...state, activePortfolioId: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

// Create context
const MultiPortfolioContext = createContext<
  MultiPortfolioContextType | undefined
>(undefined);

// Provider component
export const MultiPortfolioProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(multiPortfolioReducer, initialState);
  const { addToast } = useToast();

  // Load portfolios from localStorage on mount
  useEffect(() => {
    const loadPortfolios = () => {
      try {
        const savedPortfolios = loadFromLocalStorage<Portfolio[]>(
          'multi-portfolios',
        );
        if (savedPortfolios && Array.isArray(savedPortfolios)) {
          // Ensure dates are properly converted
          const portfolios = savedPortfolios.map(p => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          dispatch({ type: 'SET_PORTFOLIOS', payload: portfolios });
        } else {
          // Create default portfolio if none exist
          createDefaultPortfolio();
        }
      } catch (error) {
        console.error('Failed to load portfolios:', error);
        createDefaultPortfolio();
      }
    };

    loadPortfolios();
  }, []);

  // Save portfolios to localStorage whenever they change
  useEffect(() => {
    if (state.portfolios.length > 0) {
      saveToLocalStorage('multi-portfolios', state.portfolios);
    }
  }, [state.portfolios]);

  // Create default portfolio
  const createDefaultPortfolio = useCallback(() => {
    const defaultPortfolio: Portfolio = {
      id: generatePortfolioId(),
      name: 'My Portfolio',
      description: 'Default portfolio',
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      color: getDefaultPortfolioColor(0),
      isDefault: true,
    };

    dispatch({ type: 'ADD_PORTFOLIO', payload: defaultPortfolio });
  }, []);

  // Create new portfolio
  const createPortfolio = useCallback(
    (data: PortfolioFormData) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const newPortfolio: Portfolio = {
          id: generatePortfolioId(),
          name: data.name,
          description: data.description,
          stocks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          color: data.color || getDefaultPortfolioColor(state.portfolios.length),
          isDefault: false,
        };

        dispatch({ type: 'ADD_PORTFOLIO', payload: newPortfolio });
        dispatch({ type: 'SET_LOADING', payload: false });

        addToast({
          type: 'success',
          title: 'Portfolio Created',
          message: `"${newPortfolio.name}" has been created successfully.`,
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        addToast({
          type: 'error',
          title: 'Create Failed',
          message: (error as Error).message,
        });
      }
    },
    [state.portfolios.length, addToast],
  );

  // Update portfolio
  const updatePortfolio = useCallback(
    (id: string, data: PortfolioFormData) => {
      try {
        const portfolio = state.portfolios.find(p => p.id === id);
        if (!portfolio) {
          throw new Error('Portfolio not found');
        }

        const updatedPortfolio: Portfolio = {
          ...portfolio,
          name: data.name,
          description: data.description,
          color: data.color || portfolio.color,
          updatedAt: new Date(),
        };

        dispatch({ type: 'UPDATE_PORTFOLIO', payload: updatedPortfolio });

        addToast({
          type: 'success',
          title: 'Portfolio Updated',
          message: `"${updatedPortfolio.name}" has been updated successfully.`,
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: (error as Error).message,
        });
      }
    },
    [state.portfolios, addToast],
  );

  // Delete portfolio
  const deletePortfolio = useCallback(
    (id: string) => {
      try {
        const portfolio = state.portfolios.find(p => p.id === id);
        if (!portfolio) {
          throw new Error('Portfolio not found');
        }

        if (state.portfolios.length === 1) {
          throw new Error('Cannot delete the last portfolio');
        }

        dispatch({ type: 'DELETE_PORTFOLIO', payload: id });

        addToast({
          type: 'success',
          title: 'Portfolio Deleted',
          message: `"${portfolio.name}" has been deleted.`,
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: (error as Error).message,
        });
      }
    },
    [state.portfolios, addToast],
  );

  // Duplicate portfolio
  const duplicatePortfolio = useCallback(
    (id: string, newName?: string) => {
      try {
        const originalPortfolio = state.portfolios.find(p => p.id === id);
        if (!originalPortfolio) {
          throw new Error('Portfolio not found');
        }

        const duplicatedPortfolio: Portfolio = {
          ...originalPortfolio,
          id: generatePortfolioId(),
          name: newName || `${originalPortfolio.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
          stocks: originalPortfolio.stocks.map(stock => ({
            ...stock,
            id: Date.now() + Math.random(), // Generate new stock ID
          })),
        };

        dispatch({ type: 'ADD_PORTFOLIO', payload: duplicatedPortfolio });

        addToast({
          type: 'success',
          title: 'Portfolio Duplicated',
          message: `"${duplicatedPortfolio.name}" has been created.`,
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
        addToast({
          type: 'error',
          title: 'Duplicate Failed',
          message: (error as Error).message,
        });
      }
    },
    [state.portfolios, addToast],
  );

  // Set active portfolio
  const setActivePortfolio = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_PORTFOLIO', payload: id });
  }, []);

  // Stock management functions
  const addStockToPortfolio = useCallback(
    (portfolioId: string, stock: Stock) => {
      const portfolio = state.portfolios.find(p => p.id === portfolioId);
      if (!portfolio) return;

      const updatedPortfolio: Portfolio = {
        ...portfolio,
        stocks: [...portfolio.stocks, stock],
        updatedAt: new Date(),
      };

      dispatch({ type: 'UPDATE_PORTFOLIO', payload: updatedPortfolio });
    },
    [state.portfolios],
  );

  const updateStockInPortfolio = useCallback(
    (portfolioId: string, stockId: number, stock: Stock) => {
      const portfolio = state.portfolios.find(p => p.id === portfolioId);
      if (!portfolio) return;

      const updatedPortfolio: Portfolio = {
        ...portfolio,
        stocks: portfolio.stocks.map(s => (s.id === stockId ? stock : s)),
        updatedAt: new Date(),
      };

      dispatch({ type: 'UPDATE_PORTFOLIO', payload: updatedPortfolio });
    },
    [state.portfolios],
  );

  const removeStockFromPortfolio = useCallback(
    (portfolioId: string, stockId: number) => {
      const portfolio = state.portfolios.find(p => p.id === portfolioId);
      if (!portfolio) return;

      const updatedPortfolio: Portfolio = {
        ...portfolio,
        stocks: portfolio.stocks.filter(s => s.id !== stockId),
        updatedAt: new Date(),
      };

      dispatch({ type: 'UPDATE_PORTFOLIO', payload: updatedPortfolio });
    },
    [state.portfolios],
  );

  // Get portfolio summaries
  const getPortfolioSummaries = useCallback((): PortfolioSummary[] => {
    return state.portfolios.map(portfolio => {
      const metrics = calculatePortfolioMetrics(portfolio.stocks);
      return {
        id: portfolio.id,
        name: portfolio.name,
        totalValue: metrics.totalValue,
        totalProfitLoss: metrics.totalProfitLoss,
        profitLossPercentage: metrics.profitLossPercentage,
        stockCount: portfolio.stocks.length,
        color: portfolio.color,
        lastUpdated: portfolio.updatedAt,
      };
    });
  }, [state.portfolios]);

  // Get portfolio comparison data
  const getPortfolioComparison = useCallback((): PortfolioComparison => {
    const summaries = getPortfolioSummaries();
    const comparisonData = summaries.map(summary => ({
      id: summary.id,
      name: summary.name,
      value: summary.totalValue,
      profitLoss: summary.totalProfitLoss,
      profitLossPercent: summary.profitLossPercentage,
      sharpeRatio: 0, // TODO: Calculate from advanced analytics
      volatility: 0, // TODO: Calculate from advanced analytics
    }));

    return {
      portfolios: summaries,
      comparisonData,
    };
  }, [getPortfolioSummaries]);

  // Get active portfolio
  const getActivePortfolio = useCallback((): Portfolio | null => {
    if (!state.activePortfolioId) return null;
    return (
      state.portfolios.find(p => p.id === state.activePortfolioId) || null
    );
  }, [state.portfolios, state.activePortfolioId]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: MultiPortfolioContextType = {
    state,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    duplicatePortfolio,
    setActivePortfolio,
    addStockToPortfolio,
    updateStockInPortfolio,
    removeStockFromPortfolio,
    getPortfolioSummaries,
    getPortfolioComparison,
    getActivePortfolio,
    clearError,
  };

  return (
    <MultiPortfolioContext.Provider value={value}>
      {children}
    </MultiPortfolioContext.Provider>
  );
};

// Hook to use the context
export const useMultiPortfolio = (): MultiPortfolioContextType => {
  const context = useContext(MultiPortfolioContext);
  if (!context) {
    throw new Error(
      'useMultiPortfolio must be used within a MultiPortfolioProvider',
    );
  }
  return context;
};

// Export default for convenience
export default MultiPortfolioContext;