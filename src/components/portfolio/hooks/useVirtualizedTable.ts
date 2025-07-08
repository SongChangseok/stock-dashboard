import { useState, useMemo, useCallback } from 'react';

interface VirtualizedTableConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualizedTable = <T>(
  items: T[],
  config: VirtualizedTableConfig
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = config;

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);
    const visibleEndIndex = endIndex;

    return {
      items: items.slice(visibleStartIndex, visibleEndIndex),
      startIndex: visibleStartIndex,
      endIndex: visibleEndIndex,
      totalHeight: items.length * itemHeight,
      offsetY: visibleStartIndex * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    visibleItems,
    handleScroll,
    scrollToIndex,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY,
  };
};