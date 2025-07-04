import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
      case 'info':
        return 'border-blue-400';
      default:
        return 'border-blue-400';
    }
  };

  return (
    <div className={`bg-spotify-gray border-l-4 ${getBorderColor()} rounded-r-lg p-4 shadow-lg`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-medium">{title}</h4>
          {message && (
            <p className="text-gray-300 text-sm mt-1">{message}</p>
          )}
        </div>
        
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;