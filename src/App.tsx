import React from 'react';
import StockDashboard from './components/StockDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StockPriceProvider } from './contexts/StockPriceContext';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <ToastProvider>
          <SettingsProvider>
            <PortfolioProvider>
              <StockPriceProvider>
                <StockDashboard />
              </StockPriceProvider>
            </PortfolioProvider>
          </SettingsProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
