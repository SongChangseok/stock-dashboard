import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { env } from '../../config/env';

interface ApiStatusBannerProps {
  errors: Map<string, any>;
  className?: string;
}

const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ errors, className = '' }) => {
  // API 제한 관련 에러가 있는지 확인
  const hasRateLimitError = Array.from(errors.values()).some(error => 
    error?.message?.includes('rate limit') || 
    error?.message?.includes('premium') ||
    error?.message?.includes('daily rate limit')
  );

  // Mock 데이터 모드인지 확인
  const isMockMode = env.alphaVantage.enableMockData;

  if (!hasRateLimitError && !isMockMode) {
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      {hasRateLimitError && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-amber-200 font-medium mb-1">
                API Rate Limit Reached
              </h4>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                Alpha Vantage free tier allows 25 requests per day. The limit has been reached.
                Stock prices are now using simulated data for demonstration purposes.
              </p>
              <a 
                href="https://www.alphavantage.co/premium/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-amber-200 hover:text-amber-100 text-sm underline"
              >
                Upgrade to Premium for unlimited requests →
              </a>
            </div>
          </div>
        </div>
      )}

      {isMockMode && !hasRateLimitError && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-blue-200 font-medium mb-1">
                Demo Mode Active
              </h4>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Stock prices are simulated for demonstration purposes. 
                Set VITE_ENABLE_MOCK_DATA=false in your environment to use real API data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatusBanner;