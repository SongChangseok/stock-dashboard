import { useState, useCallback, useMemo } from 'react';
import { Stock } from '../../../types/portfolio';
import { FilterOptions } from '../PortfolioFilters';
import { SortField, SortDirection } from '../PortfolioTableHeader';
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateMarketValue,
  isProfitable,
} from '../../../utils/stockHelpers';

export const usePortfolioFilters = (stocks: Stock[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    profitOnly: false,
    lossOnly: false,
    minValue: '',
    maxValue: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      profitOnly: false,
      lossOnly: false,
      minValue: '',
      maxValue: '',
      minQuantity: '',
      maxQuantity: '',
    });
    setSearchTerm('');
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    filtered = filtered.filter(stock => {
      const marketValue = calculateMarketValue(stock);
      const isProfit = isProfitable(stock);

      // Profit/Loss filters
      if (filters.profitOnly && !isProfit) return false;
      if (filters.lossOnly && isProfit) return false;

      // Market value range
      if (filters.minValue && marketValue < parseFloat(filters.minValue)) return false;
      if (filters.maxValue && marketValue > parseFloat(filters.maxValue)) return false;

      // Quantity range
      if (filters.minQuantity && stock.quantity < parseInt(filters.minQuantity)) return false;
      if (filters.maxQuantity && stock.quantity > parseInt(filters.maxQuantity)) return false;

      return true;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case 'ticker':
            aValue = a.ticker;
            bValue = b.ticker;
            break;
          case 'buyPrice':
            aValue = a.buyPrice;
            bValue = b.buyPrice;
            break;
          case 'currentPrice':
            aValue = a.currentPrice;
            bValue = b.currentPrice;
            break;
          case 'quantity':
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          case 'marketValue':
            aValue = calculateMarketValue(a);
            bValue = calculateMarketValue(b);
            break;
          case 'profitLoss':
            aValue = calculateProfitLoss(a);
            bValue = calculateProfitLoss(b);
            break;
          case 'profitLossPercent':
            aValue = calculateProfitLossPercent(a);
            bValue = calculateProfitLossPercent(b);
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const comparison = (aValue as number) - (bValue as number);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [stocks, searchTerm, filters, sortField, sortDirection]);

  const hasActiveFilters = useMemo(() => {
    return filters.profitOnly || filters.lossOnly || 
           filters.minValue || filters.maxValue || 
           filters.minQuantity || filters.maxQuantity ||
           searchTerm !== '';
  }, [filters, searchTerm]);

  return {
    // States
    searchTerm,
    showFilters,
    sortField,
    sortDirection,
    filters,
    
    // Setters
    setSearchTerm,
    setFilters,
    
    // Handlers
    handleSort,
    handleClearFilters,
    toggleFilters,
    
    // Computed values
    filteredAndSortedStocks,
    hasActiveFilters,
  };
};