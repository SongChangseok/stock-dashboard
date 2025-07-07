import React from 'react';
import { AlertTriangle, Shield, TrendingDown, Activity } from 'lucide-react';

interface RiskMetrics {
  riskMetrics: {
    sharpeRatio: number;
    portfolioVolatility: number;
    maxDrawdown: number;
    beta: number;
    valueAtRisk: number;
  };
}

interface RiskAnalysisProps {
  analytics: RiskMetrics;
}

interface RiskCardProps {
  title: string;
  value: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

const RiskCard: React.FC<RiskCardProps> = React.memo(({
  title,
  value,
  description,
  riskLevel,
  icon
}) => {
  const riskColors = {
    low: 'border-spotify-green bg-spotify-green/10',
    medium: 'border-yellow-400 bg-yellow-400/10',
    high: 'border-red-400 bg-red-400/10'
  };

  const riskTextColors = {
    low: 'text-spotify-green',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };

  return (
    <div className={`p-6 rounded-lg border ${riskColors[riskLevel]} transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${riskColors[riskLevel]}`}>
          {icon}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${riskTextColors[riskLevel]} ${riskColors[riskLevel]}`}>
          {riskLevel.toUpperCase()}
        </div>
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
});

RiskCard.displayName = 'RiskCard';

const RiskAnalysis: React.FC<RiskAnalysisProps> = React.memo(({ analytics }) => {
  const { riskMetrics } = analytics;

  const getSharpeRiskLevel = (sharpe: number): 'low' | 'medium' | 'high' => {
    if (sharpe > 1) return 'low';
    if (sharpe > 0) return 'medium';
    return 'high';
  };

  const getVolatilityRiskLevel = (volatility: number): 'low' | 'medium' | 'high' => {
    if (volatility < 15) return 'low';
    if (volatility < 25) return 'medium';
    return 'high';
  };

  const getDrawdownRiskLevel = (drawdown: number): 'low' | 'medium' | 'high' => {
    if (Math.abs(drawdown) < 10) return 'low';
    if (Math.abs(drawdown) < 20) return 'medium';
    return 'high';
  };

  const getBetaRiskLevel = (beta: number): 'low' | 'medium' | 'high' => {
    if (beta < 0.8) return 'low';
    if (beta < 1.2) return 'medium';
    return 'high';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Risk Analysis</h2>
        <p className="text-gray-400">Comprehensive risk assessment of your portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskCard
          title="Sharpe Ratio"
          value={riskMetrics.sharpeRatio.toFixed(2)}
          description="Risk-adjusted return measure. Higher is better."
          riskLevel={getSharpeRiskLevel(riskMetrics.sharpeRatio)}
          icon={<Shield className="w-6 h-6" />}
        />

        <RiskCard
          title="Portfolio Volatility"
          value={`${riskMetrics.portfolioVolatility.toFixed(1)}%`}
          description="Standard deviation of returns. Lower is less risky."
          riskLevel={getVolatilityRiskLevel(riskMetrics.portfolioVolatility)}
          icon={<Activity className="w-6 h-6" />}
        />

        <RiskCard
          title="Maximum Drawdown"
          value={`${riskMetrics.maxDrawdown.toFixed(1)}%`}
          description="Largest peak-to-trough decline. Lower is better."
          riskLevel={getDrawdownRiskLevel(riskMetrics.maxDrawdown)}
          icon={<TrendingDown className="w-6 h-6" />}
        />

        <RiskCard
          title="Portfolio Beta"
          value={riskMetrics.beta.toFixed(2)}
          description="Sensitivity to market movements. 1.0 = market average."
          riskLevel={getBetaRiskLevel(riskMetrics.beta)}
          icon={<AlertTriangle className="w-6 h-6" />}
        />
      </div>

      {/* Risk Summary */}
      <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Overall Risk Level</span>
            <span className={`font-semibold ${
              riskMetrics.portfolioVolatility < 15 ? 'text-spotify-green' :
              riskMetrics.portfolioVolatility < 25 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {riskMetrics.portfolioVolatility < 15 ? 'Low' :
               riskMetrics.portfolioVolatility < 25 ? 'Medium' : 'High'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Risk-Adjusted Performance</span>
            <span className={`font-semibold ${
              riskMetrics.sharpeRatio > 1 ? 'text-spotify-green' :
              riskMetrics.sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {riskMetrics.sharpeRatio > 1 ? 'Excellent' :
               riskMetrics.sharpeRatio > 0 ? 'Good' : 'Poor'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Market Correlation</span>
            <span className={`font-semibold ${
              Math.abs(riskMetrics.beta - 1) < 0.2 ? 'text-yellow-400' :
              riskMetrics.beta < 1 ? 'text-spotify-green' : 'text-red-400'
            }`}>
              {Math.abs(riskMetrics.beta - 1) < 0.2 ? 'Market-like' :
               riskMetrics.beta < 1 ? 'Defensive' : 'Aggressive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

RiskAnalysis.displayName = 'RiskAnalysis';

export default RiskAnalysis;