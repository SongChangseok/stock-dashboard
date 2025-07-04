import React from 'react';
import StockDashboard from './components/StockDashboard';
import { PortfolioProvider } from './contexts/PortfolioContext';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <PortfolioProvider>
        <StockDashboard />
      </PortfolioProvider>
    </div>
  );
};

export default App;
