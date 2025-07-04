import React from 'react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  const typeStyles = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-xl border backdrop-blur-sm z-50 animate-slide-in-right ${typeStyles[type]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        <button 
          onClick={() => onClose(id)}
          className="ml-4 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
      <p className="text-sm opacity-90">{message}</p>
    </div>
  );
};

export default Toast;
