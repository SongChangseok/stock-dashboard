import React, { useState, useMemo, useCallback } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { Stock, StockFormData } from '../types/portfolio';
import PortfolioTableHeader, { SortField, SortDirection } from '../components/portfolio/PortfolioTableHeader';
import PortfolioFilters, { FilterOptions } from '../components/portfolio/PortfolioFilters';
import EnhancedPortfolioTable from '../components/portfolio/EnhancedPortfolioTable';
import ImportExportManager from '../components/portfolio/ImportExportManager';
import Modal from '../components/common/Modal';
import StockForm from '../components/stock/StockForm';
import { calculateMarketValue } from '../utils/stockHelpers';

const PortfolioPage: React.FC = () => {
  const {
    state,
    addStock,
    updateStock,
    deleteStock,
    importStocks,
    exportStocks,
    clearError,
  } = usePortfolio();
  const { stocks, metrics, error } = state;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });

  // Table states
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
  const [importError, setImportError] = useState('');

  // Computed values
  const totalValue = useMemo(() => {
    return stocks.reduce((sum, stock) => sum + calculateMarketValue(stock), 0);
  }, [stocks]);

  // Handlers
  const handleAddStock = useCallback((): void => {
    setEditingStockId(null);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  }, []);

  const handleEditStock = useCallback((stock: Stock): void => {
    setEditingStockId(stock.id);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString(),
    });
    setShowModal(true);
  }, []);

  const handleDeleteStock = useCallback((id: number): void => {
    deleteStock(id);
  }, [deleteStock]);

  const handleSubmit = useCallback((): void => {
    if (
      !formData.ticker ||
      !formData.buyPrice ||
      !formData.currentPrice ||
      !formData.quantity
    ) {
      return;
    }

    if (editingStockId) {
      updateStock(editingStockId, formData);
    } else {
      addStock(formData);
    }

    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, [formData, editingStockId, updateStock, addStock]);

  const closeModal = useCallback((): void => {
    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, []);

  const handleSort = useCallback((field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleClearFilters = useCallback((): void => {
    setFilters({
      profitOnly: false,
      lossOnly: false,
      minValue: '',
      maxValue: '',
      minQuantity: '',
      maxQuantity: '',
    });
  }, []);

  const handleExportData = useCallback((): void => {
    const exportData = exportStocks();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportStocks]);

  const handleImportData = useCallback((file: File): void => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importStocks(data);
        setShowImportModal(false);
        setImportError('');
      } catch (error) {
        setImportError((error as Error).message);
      }
    };
    reader.readAsText(file);
  }, [importStocks]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <PortfolioTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddStock={handleAddStock}
        onImport={() => setShowImportModal(true)}
        onExport={handleExportData}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        totalStocks={stocks.length}
        totalValue={totalValue}
      />

      {/* Filters */}
      <PortfolioFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        isVisible={showFilters}
      />

      {/* Enhanced Portfolio Table */}
      <EnhancedPortfolioTable
        stocks={stocks}
        onEditStock={handleEditStock}
        onDeleteStock={handleDeleteStock}
        onAddStock={handleAddStock}
        searchTerm={searchTerm}
        filters={filters}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/30 rounded-xl p-4 z-50 animate-slide-in-right">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stock Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingStockId ? 'Edit Stock' : 'Add New Stock'}
      >
        <StockForm
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isEditing={!!editingStockId}
        />
      </Modal>

      {/* Import/Export Modal */}
      <ImportExportManager
        isImportModalOpen={showImportModal}
        onCloseImportModal={() => setShowImportModal(false)}
        onImportData={handleImportData}
        onExportData={handleExportData}
        importError={importError}
      />
    </div>
  );
};

export default PortfolioPage;