// 토글 스위치 컴포넌트

import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6',
    },
  };

  // 색상별 스타일
  const colorStyles = {
    primary: 'bg-gradient-primary',
    secondary: 'bg-gradient-secondary',
    success: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const styles = sizeStyles[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 토글 스위치 */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out
          ${styles.switch}
          ${enabled 
            ? `${colorStyles[color]} shadow-lg` 
            : 'bg-slate-600 hover:bg-slate-500'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }
        `}
      >
        <span
          className={`
            ${styles.thumb}
            inline-block bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out
            ${enabled ? styles.translate : 'translate-x-0.5'}
          `}
          aria-hidden="true"
        />
      </button>

      {/* 라벨 및 설명 */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span 
              className={`text-sm font-medium ${
                disabled ? 'text-slate-500' : 'text-white'
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;