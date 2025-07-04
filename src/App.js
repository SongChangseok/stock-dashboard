import React from 'react';
import StockDashboard from './components/StockDashboard';
import { PortfolioProvider } from './contexts/PortfolioContext';
import './index.css';

function App() {
  return (
    <PortfolioProvider>
      <div className="App">
        <StockDashboard />
      </div>
    </PortfolioProvider>
  );
}

export default App;