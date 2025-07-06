import React, { useState } from 'react';
import { Upload, History, TrendingUp, BarChart3 } from 'lucide-react';
import { Stock, StockFormData } from '../types/portfolio';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMultiPortfolio } from '../contexts/MultiPortfolioContext';
import { usePortfolioSnapshot } from '../hooks/usePortfolioSnapshot';
import { getColorPalette } from '../utils/portfolio';
import Header from './layout/Header';
import PortfolioSelector from './portfolio/PortfolioSelector';
import PortfolioComparisonChart from './portfolio/PortfolioComparisonChart';
import PortfolioSummary from './portfolio/PortfolioSummary';
import PortfolioChart from './portfolio/PortfolioChart';
import PortfolioTable from './portfolio/PortfolioTable';
import PortfolioAnalytics from './portfolio/PortfolioAnalytics';
import PortfolioHistoryChart from './history/PortfolioHistoryChart';
import PerformanceMetrics from './history/PerformanceMetrics';
import PortfolioNewsSection from './news/PortfolioNewsSection';
import Modal from './common/Modal';
import StockForm from './stock/StockForm';

const StockDashboard: React.FC = () => {
  const {
    state,
    addStock,
    updateStock,
    deleteStock,
    importStocks,
    exportStocks,
    clearError,
  } = usePortfolio();
  const { stocks, metrics, loading, error } = state;
  
  const { 
    getActivePortfolio, 
    getPortfolioSummaries,
    addStockToPortfolio,
    updateStockInPortfolio,
    removeStockFromPortfolio 
  } = useMultiPortfolio();
  
  const { createSnapshot, canTakeSnapshot, lastSnapshotDate, snapshotCount } =
    usePortfolioSnapshot();
    
  const [showComparison, setShowComparison] = useState(false);
  
  const activePortfolio = getActivePortfolio();
  const portfolioSummaries = getPortfolioSummaries();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');

  const handleAddStock = (): void => {
    setEditingStockId(null);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  };

  const handleEditStock = (stock: Stock): void => {
    setEditingStockId(stock.id);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString(),
    });
    setShowModal(true);
  };

  const handleDeleteStock = (id: number): void => {
    deleteStock(id);
  };

  const handleSubmit = (): void => {
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
  };

  const getPieChartData = () => {
    const colors = getColorPalette(stocks.length);

    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: colors[index],
    }));
  };

  const handleExportData = (): void => {
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
  };

  const handleImportData = (file: File): void => {
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
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleImportData(file);
      } else {
        setImportError('Please select a valid JSON file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportData(file);
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  };

  const closeImportModal = (): void => {
    setShowImportModal(false);
    setImportError('');
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white font-sans relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Header
          onAddStock={handleAddStock}
          onImport={() => setShowImportModal(true)}
          onExport={handleExportData}
        />

        {/* Portfolio Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <PortfolioSelector 
              className="flex-1"
              showCreateButton={true}
              showStats={true}
            />
            
            {portfolioSummaries.length > 1 && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  showComparison
                    ? 'bg-spotify-green text-white'
                    : 'glass-card-dark text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 size={16} />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
            )}
          </div>
          
          {/* Portfolio Comparison Chart */}
          {showComparison && portfolioSummaries.length > 1 && (
            <PortfolioComparisonChart className="mb-6" />
          )}
        </div>

        <PortfolioSummary
          totalValue={metrics.totalValue}
          totalPositions={stocks.length}
          totalProfitLoss={metrics.totalProfitLoss}
        />

        <PortfolioChart data={getPieChartData()} />

        <PortfolioAnalytics />

        {/* Portfolio History Section */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="text-spotify-green" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Portfolio History
                </h2>
                <p className="text-gray-400">Performance tracking over time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="font-medium">{snapshotCount}</span> snapshots
                {lastSnapshotDate && (
                  <span className="ml-2">
                    • Last: {new Date(lastSnapshotDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={createSnapshot}
                disabled={!canTakeSnapshot}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  canTakeSnapshot
                    ? 'bg-spotify-green hover:bg-spotify-green-hover text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <TrendingUp size={16} />
                Take Snapshot
              </button>
            </div>
          </div>

          <PortfolioHistoryChart height={300} />

          <PerformanceMetrics />
        </div>

        {/* Portfolio News Section */}
        <PortfolioNewsSection maxArticles={4} compact={true} />

        <PortfolioTable
          stocks={stocks}
          onEditStock={handleEditStock}
          onDeleteStock={handleDeleteStock}
          onAddStock={handleAddStock}
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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={closeImportModal}
          title="Import Portfolio Data"
        >
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-primary-400 bg-primary-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-300 mb-4">
              Drag & drop your JSON file here, or{' '}
              <label className="text-primary-400 cursor-pointer hover:text-primary-300">
                browse files
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-slate-500">
              Supports JSON files exported from this application
            </p>
          </div>

          {(importError || error) && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{importError || error}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={closeImportModal}
              className="flex-1 glass-button text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StockDashboard;
