// General portfolio utility functions

// Color palette for charts and visualization
export const getColorPalette = (count: number): string[] => {
  const baseColors = [
    '#6366f1',
    '#8b5cf6',
    '#10b981',
    '#06b6d4',
    '#f59e0b',
    '#ef4444',
    '#84cc16',
    '#ec4899',
    '#8b5cf6',
    '#f97316',
    '#06b6d4',
    '#10b981',
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
};

// Local storage utility functions
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T = any>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return null;
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};
