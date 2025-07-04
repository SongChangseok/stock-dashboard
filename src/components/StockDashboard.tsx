import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Stock, StockFormData, PortfolioData, ExportData } from '../types/portfolio';
import Header from './layout/Header';
import PortfolioSummary from './portfolio/PortfolioSummary';
import PortfolioChart from './portfolio/PortfolioChart';
import PortfolioTable from './portfolio/PortfolioTable';
import Modal from './common/Modal';
import StockForm from './stock/StockForm';

const StockDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([
    { id: 1, ticker: 'AAPL', buyPrice: 150.00, currentPrice: 185.50, quantity: 10 },
    { id: 2, ticker: 'GOOGL', buyPrice: 2500.00, currentPrice: 2650.00, quantity: 5 },
    { id: 3, ticker: 'TSLA', buyPrice: 800.00, currentPrice: 750.00, quantity: 8 },
  ]);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: ''
  });
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');

  const handleAddStock = (): void => {
    setEditingStock(null);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  };

  const handleEditStock = (stock: Stock): void => {
    setEditingStock(stock);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString()
    });
    setShowModal(true);
  };

  const handleDeleteStock = (id: number): void => {
    setStocks(stocks.filter(stock => stock.id !== id));
  };

  const handleSubmit = (): void => {
    if (!formData.ticker || !formData.buyPrice || !formData.currentPrice || !formData.quantity) {
      return;
    }
    
    const newStock: Stock = {
      id: editingStock ? editingStock.id : Date.now(),
      ticker: formData.ticker.toUpperCase(),
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      quantity: parseInt(formData.quantity)
    };

    if (editingStock) {
      setStocks(stocks.map(stock => stock.id === editingStock.id ? newStock : stock));
    } else {
      setStocks([...stocks, newStock]);
    }

    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  };

  const calculateTotalValue = (): number => {
    return stocks.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
  };

  const calculateProfitLoss = (stock: Stock): number => {
    return (stock.currentPrice - stock.buyPrice) * stock.quantity;
  };

  const calculateTotalProfitLoss = (): number => {
    return stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0);
  };

  const getPieChartData = (): PortfolioData[] => {
    const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#84cc16', '#ec4899'];
    
    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: COLORS[index % COLORS.length]
    }));
  };

  const handleExportData = (): void => {
    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: {
        totalValue: calculateTotalValue(),
        totalPositions: stocks.length,
        totalProfitLoss: calculateTotalProfitLoss()
      },
      stocks: stocks
    };

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

  const handleImportData = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        validateImportData(data);
        
        const importedStocks: Stock[] = data.stocks.map((stock: any, index: number) => ({
          id: Date.now() + index,
          ticker: stock.ticker.toUpperCase(),
          buyPrice: stock.buyPrice,
          currentPrice: stock.currentPrice,
          quantity: stock.quantity
        }));
        
        setStocks(importedStocks);
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

        <PortfolioSummary 
          totalValue={calculateTotalValue()}
          totalPositions={stocks.length}
          totalProfitLoss={calculateTotalProfitLoss()}
        />

        <PortfolioChart data={getPieChartData()} />

        <PortfolioTable 
          stocks={stocks}
          onEditStock={handleEditStock}
          onDeleteStock={handleDeleteStock}
          onAddStock={handleAddStock}
        />

        {/* Stock Form Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={closeModal}
          title={editingStock ? 'Edit Stock' : 'Add New Stock'}
        >
          <StockForm 
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isEditing={!!editingStock}
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
            <p className="text-sm text-slate-500">Supports JSON files exported from this application</p>
          </div>

          {importError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{importError}</p>
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
