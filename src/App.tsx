import React from 'react';
import StockDashboard from './components/StockDashboard';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import { useToast } from './hooks/useToast';
import './index.css';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="App">
      <StockDashboard />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PortfolioProvider>
          <AppContent />
        </PortfolioProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;