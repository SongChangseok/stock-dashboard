import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, BarChart3, Download, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StockDashboard = () => {
  const [stocks, setStocks] = useState([
    { id: 1, ticker: 'AAPL', buyPrice: 150.00, currentPrice: 185.50, quantity: 10 },
    { id: 2, ticker: 'GOOGL', buyPrice: 2500.00, currentPrice: 2650.00, quantity: 5 },
    { id: 3, ticker: 'TSLA', buyPrice: 800.00, currentPrice: 750.00, quantity: 8 },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [formData, setFormData] = useState({
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

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setFormData({
      ticker: stock.ticker,
      buyPrice: stock.buyPrice.toString(),
      currentPrice: stock.currentPrice.toString(),
      quantity: stock.quantity.toString()
    });
    setShowModal(true);
  };

  const handleDeleteStock = (id) => {
    setStocks(stocks.filter(stock => stock.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.ticker || !formData.buyPrice || !formData.currentPrice || !formData.quantity) {
      return;
    }
    
    const newStock = {
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

  const calculateTotalValue = () => {
    return stocks.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
  };

  const calculateProfitLoss = (stock) => {
    return (stock.currentPrice - stock.buyPrice) * stock.quantity;
  };

  const calculateProfitLossPercent = (stock) => {
    return ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
  };

  const getPieChartData = () => {
    return stocks.map((stock, index) => ({
      name: stock.ticker,
      value: stock.currentPrice * stock.quantity,
      color: COLORS[index % COLORS.length]
    }));
  };

  const handleExportData = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: {
        totalValue: calculateTotalValue(),
        totalPositions: stocks.length,
        totalProfitLoss: stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0)
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

  const validateImportData = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON format');
    }
    
    if (!data.stocks || !Array.isArray(data.stocks)) {
      throw new Error('Missing or invalid stocks array');
    }
    
    data.stocks.forEach((stock, index) => {
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

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        validateImportData(data);
        
        const importedStocks = data.stocks.map((stock, index) => ({
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
        setImportError(error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImportData(file);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#84cc16', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-dark text-white font-sans relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary floating">
              <BarChart3 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text-primary">Portfolio Tracker</h1>
              <p className="text-slate-300 text-lg">Modern investment management dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="glass-button bg-gradient-accent text-white font-semibold px-4 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
              title="Import Portfolio Data"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={handleExportData}
              className="glass-button bg-gradient-secondary text-white font-semibold px-4 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
              title="Export Portfolio Data"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleAddStock}
              className="glass-button bg-gradient-primary text-white font-semibold px-6 py-3 rounded-xl flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Portfolio Value</p>
                <p className="text-3xl font-bold gradient-text-secondary">${calculateTotalValue().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Positions</p>
                <p className="text-3xl font-bold text-white">{stocks.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="glass-card-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total P&L</p>
                <p className={`text-3xl font-bold ${stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0).toFixed(2)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0) >= 0 ? 'bg-gradient-secondary' : 'bg-gradient-accent'}`}>
                {stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0) >= 0 ? 
                  <TrendingUp className="text-white" size={24} /> : 
                  <TrendingDown className="text-white" size={24} />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Distribution Chart */}
        {stocks.length > 0 && (
          <div className="glass-card-dark rounded-2xl p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Portfolio Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(16px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="glass-card-dark rounded-2xl overflow-hidden animate-slide-up">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-bold gradient-text-primary">Your Holdings</h2>
          </div>
          
          {stocks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                <BarChart3 size={28} className="text-white" />
              </div>
              <p className="text-slate-400 mb-6 text-lg">No stocks in your portfolio yet</p>
              <button
                onClick={handleAddStock}
                className="glass-button bg-gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                Add Your First Stock
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Ticker</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Buy Price</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Current Price</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Quantity</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Market Value</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">P&L</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">P&L %</th>
                    <th className="text-left px-8 py-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stocks.map((stock) => {
                    const profitLoss = calculateProfitLoss(stock);
                    const profitLossPercent = calculateProfitLossPercent(stock);
                    const isProfit = profitLoss >= 0;
                    
                    return (
                      <tr key={stock.id} className="hover:bg-white/5 transition-all duration-200">
                        <td className="px-8 py-6">
                          <div className="font-bold text-white text-lg">{stock.ticker}</div>
                        </td>
                        <td className="px-8 py-6 text-slate-300 font-medium">${stock.buyPrice.toFixed(2)}</td>
                        <td className="px-8 py-6 text-slate-300 font-medium">${stock.currentPrice.toFixed(2)}</td>
                        <td className="px-8 py-6 text-slate-300 font-medium">{stock.quantity}</td>
                        <td className="px-8 py-6 text-white font-semibold">${(stock.currentPrice * stock.quantity).toFixed(2)}</td>
                        <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          ${profitLoss.toFixed(2)}
                        </td>
                        <td className={`px-8 py-6 font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {profitLossPercent.toFixed(2)}%
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditStock(stock)}
                              className="p-3 hover:bg-primary-500/20 rounded-xl transition-all duration-200 group"
                            >
                              <Edit2 size={18} className="text-slate-400 group-hover:text-primary-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.id)}
                              className="p-3 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
                            >
                              <Trash2 size={18} className="text-slate-400 group-hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card-dark rounded-2xl p-8 w-full max-w-md mx-4 animate-slide-up">
              <h2 className="text-2xl font-bold gradient-text-primary mb-6">
                {editingStock ? 'Edit Stock' : 'Add New Stock'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Ticker Symbol</label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                    className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Buy Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
                    className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
                    className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    placeholder="185.50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full glass-card text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    placeholder="10"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    {editingStock ? 'Update' : 'Add'} Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 glass-button text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card-dark rounded-2xl p-8 w-full max-w-md mx-4 animate-slide-up">
              <h2 className="text-2xl font-bold gradient-text-primary mb-6">Import Portfolio Data</h2>
              
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
                  onClick={() => {
                    setShowImportModal(false);
                    setImportError('');
                  }}
                  className="flex-1 glass-button text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;