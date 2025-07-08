import React, { useState, useMemo, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useMultiPortfolio } from '../contexts/MultiPortfolioContext';
import PortfolioSelector from '../components/portfolio/PortfolioSelector';
import PortfolioComparisonChart from '../components/portfolio/PortfolioComparisonChart';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import DashboardChart from '../components/dashboard/DashboardChart';
import QuickActions from '../components/dashboard/QuickActions';
import Modal from '../components/common/Modal';
import StockForm from '../components/stock/StockForm';
import { StockFormData } from '../types/portfolio';

const DashboardPage: React.FC = () => {
  const { state, addStock } = usePortfolio();
  const { stocks, metrics } = state;
  const { getPortfolioSummaries } = useMultiPortfolio();
  
  const [showComparison, setShowComparison] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });

  const portfolioSummaries = useMemo(() => getPortfolioSummaries(), [getPortfolioSummaries]);

  const handleAddStock = useCallback((): void => {
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback((): void => {
    if (
      !formData.ticker ||
      !formData.buyPrice ||
      !formData.currentPrice ||
      !formData.quantity
    ) {
      return;
    }

    addStock(formData);
    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, [formData, addStock]);

  const closeModal = useCallback((): void => {
    setShowModal(false);
    setFormData({ ticker: '', buyPrice: '', currentPrice: '', quantity: '' });
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Portfolio overview and key metrics</p>
      </div>
      
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
                  : 'bg-spotify-gray/50 text-slate-300 hover:text-white hover:bg-white/10'
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


      {/* Summary Cards */}
      <DashboardSummary
        totalValue={metrics.totalValue}
        totalPositions={stocks.length}
        totalProfitLoss={metrics.totalProfitLoss}
        dayChange={0} // This could be calculated from real-time data
      />

      {/* Quick Actions */}
      <QuickActions onAddStock={handleAddStock} />

      {/* Portfolio Chart */}
      <DashboardChart stocks={stocks} />

      {/* Stock Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Add New Stock"
      >
        <StockForm
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isEditing={false}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;