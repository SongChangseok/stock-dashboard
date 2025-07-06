import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Edit2,
  Copy,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useMultiPortfolio } from '../../contexts/MultiPortfolioContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Modal from '../common/Modal';
import PortfolioForm from './PortfolioForm';

interface PortfolioSelectorProps {
  className?: string;
  showCreateButton?: boolean;
  showStats?: boolean;
}

const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  className = '',
  showCreateButton = true,
  showStats = true,
}) => {
  const {
    state,
    setActivePortfolio,
    deletePortfolio,
    duplicatePortfolio,
    getActivePortfolio,
    getPortfolioSummaries,
  } = useMultiPortfolio();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(
    null,
  );
  const [actionMenuPortfolioId, setActionMenuPortfolioId] = useState<
    string | null
  >(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const activePortfolio = getActivePortfolio();
  const portfolioSummaries = getPortfolioSummaries();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setActionMenuPortfolioId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePortfolioSelect = (portfolioId: string) => {
    setActivePortfolio(portfolioId);
    setIsDropdownOpen(false);
  };

  const handleEdit = (portfolioId: string) => {
    setEditingPortfolioId(portfolioId);
    setIsEditModalOpen(true);
    setActionMenuPortfolioId(null);
  };

  const handleDuplicate = (portfolioId: string) => {
    duplicatePortfolio(portfolioId);
    setActionMenuPortfolioId(null);
  };

  const handleDelete = (portfolioId: string) => {
    if (confirm('Are you sure you want to delete this portfolio?')) {
      deletePortfolio(portfolioId);
      setActionMenuPortfolioId(null);
    }
  };

  const handleActionMenuToggle = (
    portfolioId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setActionMenuPortfolioId(
      actionMenuPortfolioId === portfolioId ? null : portfolioId,
    );
  };

  if (!activePortfolio) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
        >
          <Plus size={16} />
          Create Portfolio
        </button>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Portfolio"
        >
          <PortfolioForm onClose={() => setIsCreateModalOpen(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-4">
        {/* Portfolio Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-3 glass-card-dark rounded-xl hover:bg-white/10 transition-all duration-300 min-w-[200px]"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activePortfolio.color }}
            />
            <div className="flex-1 text-left">
              <div className="text-white font-medium">
                {activePortfolio.name}
              </div>
              {showStats && (
                <div className="text-xs text-slate-400">
                  {activePortfolio.stocks.length} stocks
                </div>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] glass-card-dark rounded-xl border border-white/10 shadow-2xl z-50 max-h-80 overflow-y-auto">
              {/* Portfolio List */}
              <div className="p-2">
                {portfolioSummaries.map(portfolio => (
                  <div
                    key={portfolio.id}
                    className={`relative group flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all duration-200 ${
                      portfolio.id === activePortfolio.id
                        ? 'bg-white/10'
                        : ''
                    }`}
                    onClick={() => handlePortfolioSelect(portfolio.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: portfolio.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {portfolio.name}
                      </div>
                      {showStats && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{portfolio.stockCount} stocks</span>
                          <span>•</span>
                          <span>{formatCurrency(portfolio.totalValue)}</span>
                          <span
                            className={
                              portfolio.totalProfitLoss >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }
                          >
                            {portfolio.totalProfitLoss >= 0 ? (
                              <TrendingUp size={12} />
                            ) : (
                              <TrendingDown size={12} />
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Menu Button */}
                    <button
                      onClick={event =>
                        handleActionMenuToggle(portfolio.id, event)
                      }
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all duration-200"
                    >
                      <MoreHorizontal size={14} className="text-slate-400" />
                    </button>

                    {/* Action Menu */}
                    {actionMenuPortfolioId === portfolio.id && (
                      <div className="absolute right-0 top-0 mt-8 mr-2 glass-card-dark rounded-lg border border-white/20 shadow-xl z-60 min-w-[150px]">
                        <div className="p-1">
                          <button
                            onClick={() => handleEdit(portfolio.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(portfolio.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
                          >
                            <Copy size={14} />
                            Duplicate
                          </button>
                          {portfolioSummaries.length > 1 && (
                            <button
                              onClick={() => handleDelete(portfolio.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all duration-200"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Create New Portfolio Button */}
              {showCreateButton && (
                <div className="border-t border-white/10 p-2">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-spotify-green hover:text-spotify-green-hover hover:bg-spotify-green/10 rounded-lg transition-all duration-200"
                  >
                    <Plus size={14} />
                    Create New Portfolio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Portfolio Stats (if enabled) */}
        {showStats && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {formatCurrency(
                  portfolioSummaries.find(p => p.id === activePortfolio.id)
                    ?.totalValue || 0,
                )}
              </div>
              <div className="text-xs text-slate-400">Total Value</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-bold ${
                  (portfolioSummaries.find(p => p.id === activePortfolio.id)
                    ?.totalProfitLoss || 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {formatPercent(
                  portfolioSummaries.find(p => p.id === activePortfolio.id)
                    ?.profitLossPercentage || 0,
                )}
              </div>
              <div className="text-xs text-slate-400">P&L</div>
            </div>
          </div>
        )}

        {/* Quick Create Button */}
        {showCreateButton && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 glass-card-dark rounded-lg hover:bg-white/10 transition-all duration-300"
            title="Create New Portfolio"
          >
            <Plus size={16} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Portfolio"
      >
        <PortfolioForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPortfolioId(null);
        }}
        title="Edit Portfolio"
      >
        <PortfolioForm
          portfolioId={editingPortfolioId}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPortfolioId(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default PortfolioSelector;