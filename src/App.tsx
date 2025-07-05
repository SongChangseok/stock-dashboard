import React from 'react';
import StockDashboard from './components/StockDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <ToastProvider>
          <PortfolioProvider>
            <StockDashboard />
          </PortfolioProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
