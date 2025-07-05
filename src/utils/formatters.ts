// Formatting utility functions for the stock dashboard
// Consolidated and standardized formatting functions

interface FormatOptions {
  locale?: string;
  decimals?: number;
  currency?: string;
}

// Main currency formatter - supports both USD display and localization
export const formatCurrency = (
  amount: number,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US', currency = 'USD' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Main percentage formatter - handles both raw values and percentages
export const formatPercent = (
  value: number,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US', decimals = 2 } = options;

  // Auto-detect if value is already a percentage (>= 1) or decimal (< 1)
  const percentValue = Math.abs(value) >= 1 ? value : value * 100;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percentValue / 100);
};

// Simplified number formatter
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Legacy support - these functions are deprecated but kept for backward compatibility
// @deprecated Use formatCurrency() instead
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

// @deprecated Use formatPercent() instead
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  return formatPercent(value, { decimals });
};
