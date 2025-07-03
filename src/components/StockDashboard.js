import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
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

  const COLORS = ['#1DB954', '#1ED760', '#535353', '#B3B3B3', '#FFFFFF'];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <BarChart3 size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Stock Portfolio</h1>
              <p className="text-gray-400">Track your investments like your playlists</p>
            </div>
          </div>
          <button
            onClick={handleAddStock}
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Stock</span>
          </button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${calculateTotalValue().toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Positions</p>
                <p className="text-2xl font-bold text-white">{stocks.length}</p>
              </div>
              <BarChart3 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0).toFixed(2)}
                </p>
              </div>
              {stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0) >= 0 ? 
                <TrendingUp className="text-green-500" size={24} /> : 
                <TrendingDown className="text-red-500" size={24} />
              }
            </div>
          </div>
        </div>

        {/* Portfolio Distribution Chart */}
        {stocks.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Portfolio Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">Your Holdings</h2>
          </div>
          
          {stocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">No stocks in your portfolio yet</p>
              <button
                onClick={handleAddStock}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-colors"
              >
                Add Your First Stock
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Ticker</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Buy Price</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Current Price</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Quantity</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Market Value</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">P&L</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">P&L %</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stocks.map((stock) => {
                    const profitLoss = calculateProfitLoss(stock);
                    const profitLossPercent = calculateProfitLossPercent(stock);
                    const isProfit = profitLoss >= 0;
                    
                    return (
                      <tr key={stock.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{stock.ticker}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">${stock.buyPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-300">${stock.currentPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-300">{stock.quantity}</td>
                        <td className="px-6 py-4 text-gray-300">${(stock.currentPrice * stock.quantity).toFixed(2)}</td>
                        <td className={`px-6 py-4 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                          ${profitLoss.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                          {profitLossPercent.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditStock(stock)}
                              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Edit2 size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.id)}
                              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingStock ? 'Edit Stock' : 'Add New Stock'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Buy Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="185.50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingStock ? 'Update' : 'Add'} Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;