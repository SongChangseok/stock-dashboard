import React from 'react';

interface AriaLiveRegionProps {
  message?: string;
  priority?: 'polite' | 'assertive';
}

const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({ 
  message = '', 
  priority = 'polite' 
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

export default AriaLiveRegion;