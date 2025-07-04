import React from 'react';
import StockDashboard from './components/StockDashboard';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <ToastProvider>
        <PortfolioProvider>
          <StockDashboard />
        </PortfolioProvider>
      </ToastProvider>
    </div>
  );
};

export default App;
