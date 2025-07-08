import { useState, useCallback } from 'react';
import { Stock, StockFormData } from '../../../types/portfolio';

interface UsePortfolioActionsProps {
  onAddStock: (formData: StockFormData) => void;
  onUpdateStock: (id: number, formData: StockFormData) => void;
  onDeleteStock: (id: number) => void;
  onImportData: (file: File) => void;
  onExportData: () => void;
}

export const usePortfolioActions = ({
  onAddStock,
  onUpdateStock,
  onDeleteStock,
  onImportData,
  onExportData,
}: UsePortfolioActionsProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });

  const handleAddStock = useCallback(() => {
    setEditingStockId(null);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  }, []);

  const handleEditStock = useCallback((stock: Stock) => {
    setEditingStockId(stock.id);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString(),
    });
    setShowModal(true);
  }, []);

  const handleDeleteStock = useCallback((id: number) => {
    onDeleteStock(id);
  }, [onDeleteStock]);

  const handleSubmit = useCallback(() => {
    if (
      !formData.ticker ||
      !formData.buyPrice ||
      !formData.currentPrice ||
      !formData.quantity
    ) {
      return;
    }

    if (editingStockId) {
      onUpdateStock(editingStockId, formData);
    } else {
      onAddStock(formData);
    }

    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, [formData, editingStockId, onUpdateStock, onAddStock]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, []);

  const handleImport = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleExport = useCallback(() => {
    onExportData();
  }, [onExportData]);

  const handleImportFile = useCallback((file: File) => {
    onImportData(file);
    setShowImportModal(false);
  }, [onImportData]);

  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  return {
    // Modal states
    showModal,
    showImportModal,
    editingStockId,
    formData,
    setFormData,
    
    // Handlers
    handleAddStock,
    handleEditStock,
    handleDeleteStock,
    handleSubmit,
    closeModal,
    handleImport,
    handleExport,
    handleImportFile,
    closeImportModal,
  };
};