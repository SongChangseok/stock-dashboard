import React, { useState } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { FormData } from './stock/StockForm';
import { Stock } from '../types/portfolio';
import Header from './layout/Header';
import PortfolioSummary from './portfolio/PortfolioSummary';
import PortfolioChart from './portfolio/PortfolioChart';
import PortfolioTable from './portfolio/PortfolioTable';
import Modal from './common/Modal';
import StockForm from './stock/StockForm';
import { Upload } from 'lucide-react';

const StockDashboard: React.FC = () => {
  const {
    stocks,
    addStock,
    updateStock,
    deleteStock,
    importStocks,
    exportData,
    calculateTotalValue,
    calculateProfitLoss,
    calculateProfitLossPercent
  } = usePortfolio();

  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  const handleAddStock = () => {
    setEditingStock(null);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString()
    });
    setShowModal(true);
  };

  const handleDeleteStock = (id: number) => {
    deleteStock(id);
  };

  const handleSubmit = () => {
    if (!formData.ticker || !formData.buyPrice || !formData.currentPrice || !formData.quantity) {
      return;
    }
    
    const stockData = {
      ticker: formData.ticker,
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      quantity: parseInt(formData.quantity)
    };

    if (editingStock) {
      updateStock(editingStock.id, stockData);
    } else {
      addStock(stockData);
    }

    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  };

  const handleExportData = () => {
    const data = exportData();
    const dataStr = JSON.stringify(data, null, 2);
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

  const validateImportData = (data: any): boolean => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON format');
    }
    
    if (!data.stocks || !Array.isArray(data.stocks)) {
      throw new Error('Missing or invalid stocks array');
    }
    
    data.stocks.forEach((stock: any, index: number) => {
      if (!stock.ticker || typeof stock.ticker !== 'string') {
        throw new Error(`Invalid ticker at position ${index + 1}`);
      }
      if (typeof stock.buyPrice !== 'number' || stock.buyPrice <= 0) {
        throw new Error(`Invalid buy price at position ${index + 1}`);
      }
      if (typeof stock.currentPrice !== 'number' || stock.currentPrice <= 0) {
        throw new Error(`Invalid current price at position ${index + 1}`);
      }
      if (typeof stock.quantity !== 'number' || stock.quantity <= 0) {
        throw new Error(`Invalid quantity at position ${index + 1}`);
      }
    });
    
    return true;
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        validateImportData(data);
        importStocks(data.stocks);
        setShowImportModal(false);
        setImportError('');
      } catch (error) {
        setImportError((error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportData(file);
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header 
          onAddStock={handleAddStock}
          onExportData={handleExportData}
          onShowImportModal={() => setShowImportModal(true)}
        />

        <PortfolioSummary 
          stocks={stocks}
          calculateTotalValue={calculateTotalValue}
          calculateProfitLoss={calculateProfitLoss}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PortfolioChart stocks={stocks} />
        </div>

        <PortfolioTable 
          stocks={stocks}
          calculateProfitLoss={calculateProfitLoss}
          calculateProfitLossPercent={calculateProfitLossPercent}
          onEditStock={handleEditStock}
          onDeleteStock={handleDeleteStock}
          onAddStock={handleAddStock}
        />
      </div>

      {/* Stock Form Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editingStock ? 'Edit Stock' : 'Add New Stock'}
      >
        <StockForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          editingStock={editingStock}
        />
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Import Portfolio Data"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-spotify-green bg-spotify-green bg-opacity-10' : 'border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-2">Drag and drop your JSON file here, or</p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="bg-spotify-green text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-spotify-green-hover transition-colors inline-block"
            >
              Browse Files
            </label>
          </div>
          {importError && (
            <p className="text-red-400 text-sm mt-2">{importError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StockDashboard;