import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 에러 로깅 서비스에 전송 (예: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-spotify-black flex items-center justify-center p-4">
          <div className="bg-spotify-gray rounded-lg p-8 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white text-center mb-4">
              앗! 예상치 못한 오류가 발생했습니다
            </h2>
            
            <p className="text-gray-300 text-center mb-6">
              죄송합니다. 애플리케이션에 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-spotify-dark-gray rounded p-4">
                <summary className="text-red-400 cursor-pointer mb-2">개발자 정보</summary>
                <pre className="text-xs text-gray-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-spotify-green text-white py-2 px-4 rounded-lg hover:bg-spotify-green-hover transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>다시 시도</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-spotify-dark-gray text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium border border-gray-600"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;