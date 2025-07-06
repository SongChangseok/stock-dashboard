import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockDashboard from './components/StockDashboard';
import GoalsPage from './components/goals/GoalsPage';
import NewsPage from './components/news/NewsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { MultiPortfolioProvider } from './contexts/MultiPortfolioContext';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StockPriceProvider } from './contexts/StockPriceContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { PortfolioHistoryProvider } from './contexts/PortfolioHistoryContext';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <ToastProvider>
          <SettingsProvider>
            <MultiPortfolioProvider>
              <PortfolioProvider>
                <StockPriceProvider>
                  <PortfolioHistoryProvider>
                    <GoalsProvider>
                      <Router>
                        <Routes>
                          <Route path="/" element={<StockDashboard />} />
                          <Route path="/goals" element={<GoalsPage />} />
                          <Route path="/news" element={<NewsPage />} />
                        </Routes>
                      </Router>
                    </GoalsProvider>
                  </PortfolioHistoryProvider>
                </StockPriceProvider>
              </PortfolioProvider>
            </MultiPortfolioProvider>
          </SettingsProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
