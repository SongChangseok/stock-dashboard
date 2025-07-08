import { useState, useCallback, useMemo } from 'react';
import { Stock } from '../../../types/portfolio';

interface SearchOptions {
  searchIn: ('ticker' | 'name')[];
  caseSensitive: boolean;
  exactMatch: boolean;
}

export const usePortfolioSearch = (stocks: Stock[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    searchIn: ['ticker'],
    caseSensitive: false,
    exactMatch: false,
  });

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSearchOptionsChange = useCallback((options: Partial<SearchOptions>) => {
    setSearchOptions(prev => ({ ...prev, ...options }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const searchedStocks = useMemo(() => {
    if (!searchTerm.trim()) return stocks;

    const term = searchOptions.caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    return stocks.filter(stock => {
      const ticker = searchOptions.caseSensitive ? stock.ticker : stock.ticker.toLowerCase();
      
      if (searchOptions.exactMatch) {
        return searchOptions.searchIn.includes('ticker') && ticker === term;
      } else {
        return searchOptions.searchIn.includes('ticker') && ticker.includes(term);
      }
    });
  }, [stocks, searchTerm, searchOptions]);

  const searchStats = useMemo(() => {
    return {
      total: stocks.length,
      filtered: searchedStocks.length,
      hasSearchTerm: searchTerm.trim().length > 0,
    };
  }, [stocks.length, searchedStocks.length, searchTerm]);

  return {
    // States
    searchTerm,
    searchOptions,
    
    // Handlers
    handleSearchChange,
    handleSearchOptionsChange,
    clearSearch,
    
    // Computed values
    searchedStocks,
    searchStats,
  };
};