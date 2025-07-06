import {DefaultTheme} from 'react-native-paper';

export const colors = {
  // Spotify-inspired dark theme
  background: '#000000',
  surface: '#121212',
  surfaceVariant: '#1E1E1E',
  primary: '#1DB954', // Spotify Green
  primaryVariant: '#1ED760', // Light Green
  secondary: '#06B6D4', // Cyan
  accent: '#8B5CF6', // Purple
  
  // Text colors
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#06B6D4', // Cyan
  
  // Text variations
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#6B7280',
  
  // Chart colors
  chart: [
    '#1DB954', '#1ED760', '#06B6D4', '#8B5CF6',
    '#F59E0B', '#EF4444', '#10B981', '#F97316',
    '#EC4899', '#6366F1', '#84CC16', '#F43F5E'
  ],
  
  // Border and divider
  border: '#374151',
  divider: '#2D3748',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};