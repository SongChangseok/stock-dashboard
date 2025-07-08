import { useState, useCallback, useMemo } from 'react';
import { Stock } from '../../../types/portfolio';

export const useBulkOperations = (stocks: Stock[]) => {
  const [selectedStocks, setSelectedStocks] = useState<Set<number>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  const toggleSelectStock = useCallback((stockId: number) => {
    setSelectedStocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stockId)) {
        newSet.delete(stockId);
      } else {
        newSet.add(stockId);
      }
      return newSet;
    });
  }, []);

  const selectAllStocks = useCallback(() => {
    setSelectedStocks(new Set(stocks.map(stock => stock.id)));
  }, [stocks]);

  const deselectAllStocks = useCallback(() => {
    setSelectedStocks(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedStocks.size === stocks.length) {
      deselectAllStocks();
    } else {
      selectAllStocks();
    }
  }, [selectedStocks.size, stocks.length, selectAllStocks, deselectAllStocks]);

  const enterBulkMode = useCallback(() => {
    setBulkActionMode(true);
  }, []);

  const exitBulkMode = useCallback(() => {
    setBulkActionMode(false);
    deselectAllStocks();
  }, [deselectAllStocks]);

  const getSelectedStocks = useCallback(() => {
    return stocks.filter(stock => selectedStocks.has(stock.id));
  }, [stocks, selectedStocks]);

  const bulkDelete = useCallback((onDelete: (ids: number[]) => void) => {
    const selectedIds = Array.from(selectedStocks);
    onDelete(selectedIds);
    deselectAllStocks();
  }, [selectedStocks, deselectAllStocks]);

  const bulkExport = useCallback((onExport: (stocks: Stock[]) => void) => {
    const selected = getSelectedStocks();
    onExport(selected);
  }, [getSelectedStocks]);

  const bulkStats = useMemo(() => {
    const selectedStocksList = getSelectedStocks();
    const totalValue = selectedStocksList.reduce((sum, stock) => {
      return sum + (stock.currentPrice * stock.quantity);
    }, 0);

    return {
      count: selectedStocks.size,
      totalValue,
      allSelected: selectedStocks.size === stocks.length,
      noneSelected: selectedStocks.size === 0,
      percentage: stocks.length > 0 ? (selectedStocks.size / stocks.length) * 100 : 0,
    };
  }, [selectedStocks, stocks, getSelectedStocks]);

  return {
    // States
    selectedStocks,
    bulkActionMode,
    
    // Selection handlers
    toggleSelectStock,
    selectAllStocks,
    deselectAllStocks,
    toggleSelectAll,
    
    // Bulk mode handlers
    enterBulkMode,
    exitBulkMode,
    
    // Bulk operations
    bulkDelete,
    bulkExport,
    getSelectedStocks,
    
    // Computed values
    bulkStats,
  };
};