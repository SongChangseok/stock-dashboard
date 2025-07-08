import React, { useCallback, useEffect, useRef } from 'react';

export const useAccessibility = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((
    event: React.KeyboardEvent,
    actions: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
    }
  ) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        actions.onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        actions.onSpace?.();
        break;
      case 'Escape':
        event.preventDefault();
        actions.onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        actions.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        actions.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        actions.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        actions.onArrowRight?.();
        break;
    }
  }, []);

  // Focus management
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, text: string) => {
    return {
      href: `#${targetId}`,
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-spotify-green text-white p-2 z-50',
      children: text,
      onFocus: () => announce(`Skip link: ${text}`, 'polite'),
    };
  }, [announce]);

  // Create announcement element ref
  const getAnnouncementRef = () => announcementRef;

  return {
    announce,
    handleKeyboardNavigation,
    trapFocus,
    createSkipLink,
    getAnnouncementRef,
  };
};