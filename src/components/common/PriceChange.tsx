// 가격 변화 애니메이션 컴포넌트

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
  Pause,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useSettings } from '../../contexts/SettingsContext';

interface PriceChangeProps {
  currentPrice: number;
  previousPrice?: number;
  change?: number;
  changePercent?: number;
  isLoading?: boolean;
  isStale?: boolean;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPercent?: boolean;
  className?: string;
}

type PriceDirection = 'up' | 'down' | 'neutral';

const PriceChange: React.FC<PriceChangeProps> = ({
  currentPrice,
  previousPrice,
  change,
  changePercent,
  isLoading = false,
  isStale = false,
  showAnimation = true,
  size = 'md',
  showIcon = true,
  showPercent = true,
  className = '',
}) => {
  const { settings } = useSettings();
  const [direction, setDirection] = useState<PriceDirection>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastPrice, setLastPrice] = useState(currentPrice);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 애니메이션 활성화 여부 (설정에서 제어)
  const animationEnabled = showAnimation && settings.showPriceChangeAnimations;

  // 가격 변화 방향 계산
  useEffect(() => {
    if (previousPrice !== undefined) {
      if (currentPrice > previousPrice) {
        setDirection('up');
      } else if (currentPrice < previousPrice) {
        setDirection('down');
      } else {
        setDirection('neutral');
      }
    } else if (change !== undefined) {
      if (change > 0) {
        setDirection('up');
      } else if (change < 0) {
        setDirection('down');
      } else {
        setDirection('neutral');
      }
    }
  }, [currentPrice, previousPrice, change]);

  // 가격 변화 애니메이션
  useEffect(() => {
    if (animationEnabled && currentPrice !== lastPrice && !isLoading) {
      setIsAnimating(true);

      // 애니메이션 타임아웃 클리어
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // 애니메이션 종료
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      setLastPrice(currentPrice);
    }
  }, [currentPrice, lastPrice, animationEnabled, isLoading]);

  // 컴포넌트 언마운트 시 타임아웃 클리어
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      price: 'text-sm',
      change: 'text-xs',
      icon: 12,
    },
    md: {
      price: 'text-base',
      change: 'text-sm',
      icon: 16,
    },
    lg: {
      price: 'text-lg',
      change: 'text-base',
      icon: 20,
    },
  };

  // 방향별 색상
  const directionColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  // 방향별 배경색 (애니메이션용)
  const directionBgColors = {
    up: 'bg-emerald-400/20',
    down: 'bg-red-400/20',
    neutral: 'bg-slate-400/20',
  };

  // 아이콘 렌더링
  const renderIcon = () => {
    if (!showIcon) return null;

    const iconSize = sizeStyles[size].icon;

    if (direction === 'up') {
      return <TrendingUp size={iconSize} className="text-emerald-400" />;
    } else if (direction === 'down') {
      return <TrendingDown size={iconSize} className="text-red-400" />;
    } else {
      return <Minus size={iconSize} className="text-slate-400" />;
    }
  };

  // 연결 상태 아이콘
  const renderConnectionIcon = () => {
    if (isLoading) {
      return <Wifi size={12} className="text-blue-400 animate-pulse" />;
    } else if (isStale) {
      return <WifiOff size={12} className="text-yellow-400" />;
    } else if (!settings.realTimePriceUpdates) {
      return <Pause size={12} className="text-slate-400" />;
    }
    return null;
  };

  // 로딩 상태
  if (isLoading && !currentPrice) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-600 rounded"></div>
          <div className="w-16 h-4 bg-slate-600 rounded"></div>
          <div className="w-12 h-3 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-2 transition-all duration-300 rounded-lg px-2 py-1
        ${isAnimating && animationEnabled ? `${directionBgColors[direction]} scale-105` : ''}
        ${isStale || !settings.realTimePriceUpdates ? 'opacity-70' : ''}
        ${className}
      `}
    >
      {/* 가격 */}
      <div className="flex items-center gap-1">
        {renderIcon()}
        <span
          className={`font-semibold ${sizeStyles[size].price} ${directionColors[direction]}`}
        >
          {formatCurrency(currentPrice)}
        </span>
        {renderConnectionIcon()}
      </div>

      {/* 변화량 및 퍼센트 */}
      {(change !== undefined || changePercent !== undefined) && (
        <div className={`flex items-center gap-1 ${sizeStyles[size].change}`}>
          {change !== undefined && (
            <span className={directionColors[direction]}>
              {change >= 0 ? '+' : ''}
              {formatCurrency(change)}
            </span>
          )}

          {showPercent && changePercent !== undefined && (
            <span className={`${directionColors[direction]} font-medium`}>
              ({changePercent >= 0 ? '+' : ''}
              {formatPercent(changePercent)})
            </span>
          )}
        </div>
      )}

      {/* 상태 표시 */}
      {isStale && <span className="text-xs text-yellow-400">stale</span>}
      {!settings.realTimePriceUpdates && !isStale && (
        <span className="text-xs text-slate-400">paused</span>
      )}
    </div>
  );
};

export default PriceChange;
