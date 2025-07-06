import {Dimensions, PixelRatio} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Screen dimensions
export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;

// Device type detection
export const isTablet = screenWidth >= 768;
export const isSmallDevice = screenWidth <= 375;

// Responsive sizing
export const wp = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Responsive font size
export const normalize = (size: number): number => {
  const scale = screenWidth / 320;
  const newSize = size * scale;
  
  if (isTablet) {
    return Math.max(size, PixelRatio.roundToNearestPixel(newSize * 0.9));
  }
  
  return Math.max(size, PixelRatio.roundToNearestPixel(newSize));
};

// Breakpoints
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Check if current screen width matches breakpoint
export const matchesBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  return screenWidth >= breakpoints[breakpoint];
};

// Safe area dimensions (for notched devices)
export const getSafeAreaDimensions = (safeAreaInsets: {
  top: number;
  bottom: number;
  left: number;
  right: number;
}) => {
  return {
    width: screenWidth - safeAreaInsets.left - safeAreaInsets.right,
    height: screenHeight - safeAreaInsets.top - safeAreaInsets.bottom,
  };
};