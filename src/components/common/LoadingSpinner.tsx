import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
      {message && <p className="text-slate-400 mt-4">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
