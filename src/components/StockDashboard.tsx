import React, { useState } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useToastContext } from '../contexts/ToastContext';
import { FormData } from './stock/StockForm';
import { Stock } from '../types/portfolio';
import Header from './layout/Header';
import PortfolioSummary from './portfolio/PortfolioSummary';
import PortfolioChart from './portfolio/PortfolioChart';
import PortfolioTable from './portfolio/PortfolioTable';
import Modal from './common/Modal';
import StockForm from './stock/StockForm';
import { Upload } from 'lucide-react';
import { validateImportData, validateFileType, validateFileSize } from '../utils/validation';

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
    calculateProfitLossPercent,
    refreshStockPrices,
    isLoadingPrices,
    isUsingRealTimeData
  } = usePortfolio();
  
  const toast = useToastContext();

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
    try {
      if (stocks.length === 0) {
        toast.showWarning('내보낼 데이터 없음', '포트폴리오에 주식이 없습니다.');
        return;
      }

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
      
      toast.showSuccess('데이터 내보내기 완료', '포트폴리오 데이터가 성공적으로 다운로드되었습니다.');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.showError('내보내기 실패', '데이터 내보내기 중 오류가 발생했습니다.');
    }
  };


  const handleImportData = (file: File) => {
    try {
      // 파일 크기 확인 (5MB 제한)
      const sizeValidation = validateFileSize(file, 5);
      if (!sizeValidation.isValid) {
        setImportError(sizeValidation.errors[0]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const validation = validateImportData(data);
          
          if (!validation.isValid) {
            setImportError(validation.errors.join(', '));
            toast.showError('데이터 검증 실패', validation.errors[0]);
            return;
          }
          
          importStocks(data.stocks);
          setShowImportModal(false);
          setImportError('');
        } catch (error) {
          const errorMessage = 'JSON 파일 형식이 올바르지 않습니다.';
          setImportError(errorMessage);
          toast.showError('파일 읽기 실패', errorMessage);
        }
      };
      
      reader.onerror = () => {
        const errorMessage = '파일을 읽는 도중 오류가 발생했습니다.';
        setImportError(errorMessage);
        toast.showError('파일 읽기 실패', errorMessage);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error handling import:', error);
      toast.showError('가져오기 실패', '예상치 못한 오류가 발생했습니다.');
    }
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
      const fileValidation = validateFileType(file, ['application/json']);
      
      if (!fileValidation.isValid && !file.name.endsWith('.json')) {
        const errorMessage = 'JSON 파일만 업로드 가능합니다.';
        setImportError(errorMessage);
        toast.showError('파일 형식 오류', errorMessage);
        return;
      }
      
      handleImportData(file);
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
          onRefreshPrices={refreshStockPrices}
          isLoadingPrices={isLoadingPrices}
          isUsingRealTimeData={isUsingRealTimeData}
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