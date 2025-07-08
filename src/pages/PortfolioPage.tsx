import React, { useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useStockPrices } from '../contexts/StockPriceContext';
import { Stock } from '../types/portfolio';
import PortfolioSummaryCard from '../components/portfolio/PortfolioSummaryCard';
import PortfolioActions from '../components/portfolio/PortfolioActions';
import PortfolioSearchBar from '../components/portfolio/PortfolioSearchBar';
import BulkOperationsBar from '../components/portfolio/BulkOperationsBar';
import PortfolioFilters from '../components/portfolio/PortfolioFilters';
import EnhancedPortfolioTable from '../components/portfolio/EnhancedPortfolioTable';
import ImportExportManager from '../components/portfolio/ImportExportManager';
import Modal from '../components/common/Modal';
import StockForm from '../components/stock/StockForm';
import ApiStatusBanner from '../components/common/ApiStatusBanner';
import { calculateMarketValue } from '../utils/stockHelpers';
import { usePortfolioActions } from '../components/portfolio/hooks/usePortfolioActions';
import { usePortfolioFilters } from '../components/portfolio/hooks/usePortfolioFilters';
import { useBulkOperations } from '../components/portfolio/hooks/useBulkOperations';

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
  const { stocks = [], metrics, error } = state || {};
  const { errors: stockPriceErrors } = useStockPrices();

  // Custom hooks - moved before any conditional returns
  const portfolioActions = usePortfolioActions({
    onAddStock: addStock,
    onUpdateStock: updateStock,
    onDeleteStock: deleteStock,
    onImportData: (file: File) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const result = e.target?.result;
          if (!result) {
            throw new Error('Failed to read file');
          }
          
          const data = JSON.parse(result as string);
          importStocks(data);
        } catch (error) {
          console.error('Import error:', error);
        }
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
      };
      
      reader.readAsText(file);
    },
    onExportData: () => {
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
    },
  });

  const portfolioFilters = usePortfolioFilters(stocks);
  
  const bulkOperations = useBulkOperations(stocks);

  // Computed values
  const totalValue = useMemo(() => {
    if (!stocks || stocks.length === 0) return 0;
    return stocks.reduce((sum, stock) => {
      try {
        return sum + calculateMarketValue(stock);
      } catch (error) {
        console.warn('Error calculating market value for stock:', stock, error);
        return sum;
      }
    }, 0);
  }, [stocks]);

  // Safety check for portfolio context - moved after hooks
  if (!state) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Bulk operations handlers
  const handleBulkDelete = () => {
    const selectedIds = Array.from(bulkOperations.selectedStocks);
    selectedIds.forEach(id => deleteStock(id));
    bulkOperations.exitBulkMode();
  };

  const handleBulkExport = () => {
    const selectedStocks = bulkOperations.getSelectedStocks();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      metadata: {
        totalPositions: selectedStocks.length,
        totalValue: selectedStocks.reduce((sum, stock) => sum + calculateMarketValue(stock), 0),
      },
      stocks: selectedStocks,
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_selected_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* API Status Banner */}
      <ApiStatusBanner errors={stockPriceErrors} />
      
      {/* Portfolio Summary */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Portfolio Management</h1>
        <PortfolioSummaryCard stocks={stocks} />
      </div>

      {/* Actions and Search */}
      <div className="space-y-4">
        {bulkOperations.bulkActionMode ? (
          <BulkOperationsBar
            selectedCount={bulkOperations.bulkStats.count}
            totalCount={stocks.length}
            onSelectAll={bulkOperations.selectAllStocks}
            onDeselectAll={bulkOperations.deselectAllStocks}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onExitBulkMode={bulkOperations.exitBulkMode}
          />
        ) : (
          <PortfolioActions
            onAddStock={portfolioActions.handleAddStock}
            onImport={portfolioActions.handleImport}
            onExport={portfolioActions.handleExport}
            onToggleBulkMode={bulkOperations.enterBulkMode}
            totalCount={stocks.length}
          />
        )}
        
        <PortfolioSearchBar
          searchTerm={portfolioFilters.searchTerm}
          onSearchChange={portfolioFilters.setSearchTerm}
          onClearSearch={portfolioFilters.handleClearFilters}
          showFilters={portfolioFilters.showFilters}
          onToggleFilters={portfolioFilters.toggleFilters}
          hasActiveFilters={portfolioFilters.hasActiveFilters}
        />
      </div>

      {/* Filters */}
      <PortfolioFilters
        filters={portfolioFilters.filters}
        onFilterChange={portfolioFilters.setFilters}
        onClearFilters={portfolioFilters.handleClearFilters}
        isVisible={portfolioFilters.showFilters}
      />

      {/* Enhanced Portfolio Table */}
      <EnhancedPortfolioTable
        stocks={portfolioFilters.filteredAndSortedStocks}
        onEditStock={portfolioActions.handleEditStock}
        onDeleteStock={portfolioActions.handleDeleteStock}
        onAddStock={portfolioActions.handleAddStock}
        searchTerm={portfolioFilters.searchTerm}
        filters={portfolioFilters.filters}
        sortField={portfolioFilters.sortField}
        sortDirection={portfolioFilters.sortDirection}
        bulkMode={bulkOperations.bulkActionMode}
        selectedStocks={bulkOperations.selectedStocks}
        onToggleSelect={bulkOperations.toggleSelectStock}
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
        isOpen={portfolioActions.showModal}
        onClose={portfolioActions.closeModal}
        title={portfolioActions.editingStockId ? 'Edit Stock' : 'Add New Stock'}
      >
        <StockForm
          formData={portfolioActions.formData}
          onFormChange={portfolioActions.setFormData}
          onSubmit={portfolioActions.handleSubmit}
          onCancel={portfolioActions.closeModal}
          isEditing={!!portfolioActions.editingStockId}
        />
      </Modal>

      {/* Import/Export Modal */}
      <ImportExportManager
        isImportModalOpen={portfolioActions.showImportModal}
        onCloseImportModal={portfolioActions.closeImportModal}
        onImportData={portfolioActions.handleImportFile}
        onExportData={portfolioActions.handleExport}
        importError=""
      />
    </div>
  );
};

export default PortfolioPage;