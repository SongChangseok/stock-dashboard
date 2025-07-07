import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockDashboard from './components/StockDashboard';
import GoalsPage from './components/goals/GoalsPage';
import NewsPage from './components/news/NewsPage';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SharedPortfolioView from './components/sharing/SharedPortfolioView';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import { AuthProvider } from './contexts/AuthContext';
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
        <AuthProvider>
          <ToastProvider>
            <SettingsProvider>
              <MultiPortfolioProvider>
                <PortfolioProvider>
                  <StockPriceProvider>
                    <PortfolioHistoryProvider>
                      <GoalsProvider>
                        <Router>
                          <Routes>
                            <Route path="/" element={
                              <ProtectedRoute>
                                <Layout>
                                  <DashboardPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/portfolio" element={
                              <ProtectedRoute>
                                <Layout>
                                  <PortfolioPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/analytics" element={
                              <ProtectedRoute>
                                <Layout>
                                  <AnalyticsPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/history" element={
                              <ProtectedRoute>
                                <Layout>
                                  <HistoryPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/news" element={
                              <ProtectedRoute>
                                <Layout>
                                  <NewsPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/goals" element={
                              <ProtectedRoute>
                                <Layout>
                                  <GoalsPage />
                                </Layout>
                              </ProtectedRoute>
                            } />
                            <Route path="/legacy" element={
                              <ProtectedRoute>
                                <StockDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/share/:shareId" element={<SharedPortfolioView />} />
                          </Routes>
                        </Router>
                      </GoalsProvider>
                    </PortfolioHistoryProvider>
                  </StockPriceProvider>
                </PortfolioProvider>
              </MultiPortfolioProvider>
            </SettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
